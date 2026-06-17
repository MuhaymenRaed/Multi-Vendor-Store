"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { getDiscounts } from "@/app/_lib/data-services/discount-service";
import type {
  DerivedDiscountStatus,
  DiscountWithTarget,
} from "@/app/_lib/types/discount";
import { resolveDiscountStatus } from "@/app/_lib/utils/discount-pricing";

export type DiscountStatusFilter = "all" | DerivedDiscountStatus;
export type DiscountSortField = "name" | "start_date" | "end_date" | "created_at";
export type SortDir = "asc" | "desc";

/** A discount row enriched with its date-aware derived status. */
export interface EnrichedDiscount extends DiscountWithTarget {
  derivedStatus: DerivedDiscountStatus;
}

export interface DiscountStats {
  total: number;
  active: number;
  scheduled: number;
  expired: number;
  inactive: number;
}

const PAGE_SIZE = 8;

export function useDiscounts() {
  const [raw, setRaw] = useState<DiscountWithTarget[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Table controls
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<DiscountStatusFilter>("all");
  const [sortField, setSortField] = useState<DiscountSortField>("created_at");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [page, setPage] = useState(1);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getDiscounts();
      setRaw(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "فشل تحميل الخصومات");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Enrich with derived status once per data change.
  const enriched = useMemo<EnrichedDiscount[]>(
    () =>
      raw.map((d) => ({
        ...d,
        derivedStatus: resolveDiscountStatus(d),
      })),
    [raw],
  );

  const stats = useMemo<DiscountStats>(() => {
    const s: DiscountStats = {
      total: enriched.length,
      active: 0,
      scheduled: 0,
      expired: 0,
      inactive: 0,
    };
    for (const d of enriched) s[d.derivedStatus] += 1;
    return s;
  }, [enriched]);

  // Filter → search → sort
  const filtered = useMemo(() => {
    let list = enriched;

    if (statusFilter !== "all") {
      list = list.filter((d) => d.derivedStatus === statusFilter);
    }

    const q = search.trim().toLowerCase();
    if (q) list = list.filter((d) => d.name.toLowerCase().includes(q));

    const dir = sortDir === "asc" ? 1 : -1;
    list = [...list].sort((a, b) => {
      if (sortField === "name") {
        return a.name.localeCompare(b.name) * dir;
      }
      const av = a[sortField] ? new Date(a[sortField] as string).getTime() : 0;
      const bv = b[sortField] ? new Date(b[sortField] as string).getTime() : 0;
      return (av - bv) * dir;
    });

    return list;
  }, [enriched, statusFilter, search, sortField, sortDir]);

  // Reset to first page whenever the result set changes.
  useEffect(() => {
    setPage(1);
  }, [search, statusFilter, sortField, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginated = useMemo(
    () => filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE),
    [filtered, safePage],
  );

  const toggleSort = useCallback(
    (field: DiscountSortField) => {
      if (sortField === field) {
        setSortDir((d) => (d === "asc" ? "desc" : "asc"));
      } else {
        setSortField(field);
        setSortDir(field === "name" ? "asc" : "desc");
      }
    },
    [sortField],
  );

  // Optimistic local mutations so the table reacts instantly after writes.
  const upsertLocal = useCallback((rows: DiscountWithTarget[]) => {
    setRaw((prev) => {
      const map = new Map(prev.map((d) => [d.id, d]));
      for (const r of rows) map.set(r.id, r);
      return Array.from(map.values());
    });
  }, []);

  const removeLocal = useCallback((id: string) => {
    setRaw((prev) => prev.filter((d) => d.id !== id));
  }, []);

  return {
    // data
    loading,
    error,
    stats,
    filtered,
    paginated,
    // controls
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    sortField,
    sortDir,
    toggleSort,
    page: safePage,
    setPage,
    totalPages,
    pageSize: PAGE_SIZE,
    // actions
    reload: load,
    upsertLocal,
    removeLocal,
  };
}
