"use client";

import {
  deleteDiscount,
  getStoreDiscounts,
  setDiscountActive,
} from "@/app/_lib/data-services/discount-service";
import { resolveDiscountStatus } from "@/app/_lib/utils/discount-pricing";
import {
  DISCOUNT_SCOPE_LABELS,
  DISCOUNT_STATUS_LABELS,
  DISCOUNT_TYPE_LABELS,
  type DiscountScope,
  type DiscountWithTarget,
} from "@/app/_lib/types/discount";
import { STATUS_STYLES } from "@/app/_components/ui/dashboard/components/discountStatusStyles";
import { DiscountModal } from "@/app/_components/ui/dashboard/components/DiscountModal";
import { ViewDiscountModal } from "@/app/_components/ui/dashboard/components/ViewDiscountModal";
import { ConfirmDeleteModal } from "@/app/_components/reuseable/ConfirmDeleteModal";
import { motion } from "framer-motion";
import {
  AlignLeft,
  Eye,
  Info,
  Loader2,
  Pencil,
  Plus,
  Power,
  Tag,
  TicketPercent,
  Trash2,
  X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";

interface EnrichedDiscount extends DiscountWithTarget {
  derivedStatus: ReturnType<typeof resolveDiscountStatus>;
}

interface StoreDiscountPanelProps {
  storeId: string;
  onClose: () => void;
}

const MERCHANT_SCOPES: DiscountScope[] = ["store", "category", "product"];

// Scope priority for display — matches computeProductPricing
const SCOPE_PRIORITY: Record<DiscountScope, number> = {
  product: 3,
  category: 2,
  store: 1,
  global: 0,
};

const PRIORITY_STYLES: Record<DiscountScope, string> = {
  product: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  category: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  store: "bg-marketplace-accent/10 text-marketplace-accent border-marketplace-accent/20",
  global: "bg-gray-500/10 text-gray-500 border-gray-500/20",
};

export function StoreDiscountPanel({ storeId, onClose }: StoreDiscountPanelProps) {
  const [discounts, setDiscounts] = useState<EnrichedDiscount[]>([]);
  const [loading, setLoading] = useState(true);

  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<DiscountWithTarget | null>(null);
  const [viewTarget, setViewTarget] = useState<EnrichedDiscount | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<EnrichedDiscount | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  /**
   * silent=true: syncs data without showing the loading spinner (used after mutations
   * so the optimistically-updated list stays visible while the server confirms).
   */
  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const data = await getStoreDiscounts(storeId);
      setDiscounts(data.map((d) => ({ ...d, derivedStatus: resolveDiscountStatus(d) })));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "فشل تحميل الخصومات");
    } finally {
      if (!silent) setLoading(false);
    }
  }, [storeId]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const handle = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handle);
    return () => window.removeEventListener("keydown", handle);
  }, [onClose]);

  const stats = useMemo(() => {
    const base = { total: discounts.length, active: 0, expired: 0 };
    for (const d of discounts) {
      if (d.derivedStatus === "active") base.active++;
      else if (d.derivedStatus === "expired") base.expired++;
    }
    return base;
  }, [discounts]);

  /** Immediately reflect new/updated rows, then sync quietly from server. */
  function upsertLocal(rows: DiscountWithTarget[]) {
    setDiscounts((prev) => {
      const map = new Map(prev.map((d) => [d.id, d]));
      for (const r of rows) {
        map.set(r.id, { ...r, derivedStatus: resolveDiscountStatus(r) });
      }
      // Sort by priority desc, then by created_at desc
      return Array.from(map.values()).sort((a, b) => {
        const pd = (SCOPE_PRIORITY[b.scope] ?? 0) - (SCOPE_PRIORITY[a.scope] ?? 0);
        if (pd !== 0) return pd;
        return new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime();
      });
    });
    // Background sync — confirms server state without clearing the list
    load(true);
  }

  function removeLocal(id: string) {
    setDiscounts((prev) => prev.filter((d) => d.id !== id));
  }

  async function handleToggle(d: EnrichedDiscount) {
    const next = d.derivedStatus !== "active";
    setTogglingId(d.id);
    // Optimistic: flip status locally right away
    setDiscounts((prev) =>
      prev.map((x) =>
        x.id === d.id
          ? { ...x, derivedStatus: next ? "active" : "inactive", status: next ? "active" : "inactive" }
          : x,
      ),
    );
    try {
      const updated = await setDiscountActive(d.id, next);
      upsertLocal([updated as DiscountWithTarget]);
      toast.success(next ? "تم تفعيل الخصم" : "تم إيقاف الخصم");
    } catch (err) {
      // Roll back on failure
      load(true);
      toast.error(err instanceof Error ? err.message : "فشل تغيير الحالة");
    } finally {
      setTogglingId(null);
    }
  }

  async function handleDelete(d: EnrichedDiscount) {
    setDeletingId(d.id);
    removeLocal(d.id); // optimistic remove
    setDeleteTarget(null);
    try {
      await deleteDiscount(d.id);
      toast.success("تم حذف الخصم");
    } catch (err) {
      load(true); // roll back
      toast.error(err instanceof Error ? err.message : "فشل الحذف");
    } finally {
      setDeletingId(null);
    }
  }

  function fmtValue(d: DiscountWithTarget) {
    return d.discount_type === "percentage"
      ? `${d.discount_value}%`
      : `${d.discount_value.toLocaleString("en-US")} د.ع`;
  }

  function targetLabel(d: DiscountWithTarget) {
    if (d.scope === "store") return d.stores?.name ?? "المتجر";
    if (d.scope === "product") return d.products?.name ?? "منتج";
    if (d.scope === "category") return d.categories?.name ?? "فئة";
    return "شامل";
  }

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[99]"
      />

      {/* Panel */}
      <motion.aside
        dir="rtl"
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", stiffness: 300, damping: 32 }}
        className="fixed top-0 left-0 h-full w-full sm:max-w-xl bg-marketplace-card border-l border-marketplace-border shadow-2xl z-120 flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 sm:py-5 border-b border-marketplace-border bg-gradient-to-l from-marketplace-accent/5 to-transparent shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-marketplace-accent/15 text-marketplace-accent shrink-0">
              <TicketPercent size={18} />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-marketplace-text-primary">خصومات المتجر</h2>
              <p className="text-xs text-marketplace-text-secondary font-medium hidden sm:block">
                إدارة العروض الخاصة بمنتجاتك
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-marketplace-card-hover text-marketplace-text-secondary transition-colors cursor-pointer shrink-0"
          >
            <X size={20} />
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3 px-4 sm:px-6 py-3 sm:py-4 shrink-0">
          {[
            { label: "الكل", value: stats.total, color: "text-marketplace-text-primary" },
            { label: "نشط", value: stats.active, color: "text-green-500" },
            { label: "منتهي", value: stats.expired, color: "text-marketplace-text-secondary" },
          ].map((s) => (
            <div
              key={s.label}
              className="bg-marketplace-bg border border-marketplace-border rounded-2xl p-2 sm:p-3 text-center"
            >
              <p className={`text-xl sm:text-2xl font-black ${s.color}`}>{s.value}</p>
              <p className="text-[10px] font-bold text-marketplace-text-secondary uppercase tracking-widest mt-0.5">
                {s.label}
              </p>
            </div>
          ))}
        </div>

        {/* Priority info bar */}
        <div className="mx-4 sm:mx-6 mb-3 flex items-center gap-2 bg-marketplace-bg border border-marketplace-border/60 rounded-2xl px-3 py-2 shrink-0">
          <Info size={13} className="text-marketplace-text-secondary/60 shrink-0" />
          <p className="text-[10px] text-marketplace-text-secondary/70 font-medium">
            الأولوية عند التعارض:&nbsp;
            <span className="text-purple-500 font-black">منتج</span>
            <span className="opacity-40"> &gt; </span>
            <span className="text-blue-500 font-black">فئة</span>
            <span className="opacity-40"> &gt; </span>
            <span className="text-marketplace-accent font-black">متجر</span>
          </p>
        </div>

        {/* Create button */}
        <div className="px-4 sm:px-6 pb-3 sm:pb-4 shrink-0">
          <button
            onClick={() => setCreateOpen(true)}
            className="w-full flex items-center justify-center gap-2 py-2.5 sm:py-3 rounded-2xl bg-marketplace-accent text-white font-black shadow-lg shadow-marketplace-accent/20 hover:brightness-110 transition-all cursor-pointer active:scale-98 text-sm sm:text-base"
          >
            <Plus size={18} />
            إنشاء خصم جديد
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 pb-6 cute-scrollbar space-y-2 sm:space-y-3">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <Loader2 className="animate-spin text-marketplace-accent" size={32} />
              <p className="text-sm text-marketplace-text-secondary font-bold">جاري التحميل...</p>
            </div>
          ) : discounts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
              <div className="w-16 h-16 rounded-3xl bg-marketplace-accent/10 flex items-center justify-center text-marketplace-accent">
                <Tag size={28} />
              </div>
              <p className="text-marketplace-text-secondary font-bold text-sm">لا توجد خصومات بعد</p>
              <p className="text-marketplace-text-secondary/60 text-xs">
                أنشئ خصمك الأول لتشجيع المبيعات
              </p>
            </div>
          ) : (
            discounts.map((d) => (
              <motion.div
                key={d.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-marketplace-bg border border-marketplace-border rounded-2xl p-3 sm:p-4"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    {/* Name + status + priority */}
                    <div className="flex items-center gap-1.5 flex-wrap mb-1">
                      <span className="font-black text-marketplace-text-primary text-sm truncate max-w-[110px] sm:max-w-[170px]">
                        {d.name}
                      </span>
                      <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full border shrink-0 ${STATUS_STYLES[d.derivedStatus]}`}>
                        {DISCOUNT_STATUS_LABELS[d.derivedStatus]}
                      </span>
                      {/* Priority badge */}
                      <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full border shrink-0 flex items-center gap-0.5 ${PRIORITY_STYLES[d.scope]}`}>
                        {d.scope === "product" && <Tag size={9} />}
                        {d.scope === "category" && <AlignLeft size={9} />}
                        {d.scope === "store" && <TicketPercent size={9} />}
                        {DISCOUNT_SCOPE_LABELS[d.scope]}
                        <span className="opacity-60 text-[8px]">P{SCOPE_PRIORITY[d.scope]}</span>
                      </span>
                    </div>

                    {/* Value + type + target */}
                    <div className="flex items-center gap-1.5 flex-wrap text-xs text-marketplace-text-secondary font-medium">
                      <span className="font-black text-marketplace-accent">{fmtValue(d)}</span>
                      <span className="opacity-40">•</span>
                      <span>{DISCOUNT_TYPE_LABELS[d.discount_type]}</span>
                      <span className="opacity-40">•</span>
                      <span className="truncate max-w-[100px] sm:max-w-[160px]">{targetLabel(d)}</span>
                    </div>

                    {/* Dates */}
                    {(d.start_date || d.end_date) && (
                      <p className="text-[10px] text-marketplace-text-secondary/60 font-medium mt-1">
                        {d.start_date && `من ${new Date(d.start_date).toLocaleDateString("ar")}`}
                        {d.start_date && d.end_date && " — "}
                        {d.end_date && `حتى ${new Date(d.end_date).toLocaleDateString("ar")}`}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => setViewTarget(d)} title="عرض"
                      className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-marketplace-card-hover flex items-center justify-center text-marketplace-text-secondary hover:text-marketplace-accent transition-colors cursor-pointer">
                      <Eye size={13} />
                    </button>
                    <button onClick={() => setEditTarget(d)} title="تعديل"
                      className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-marketplace-card-hover flex items-center justify-center text-marketplace-text-secondary hover:text-blue-500 transition-colors cursor-pointer">
                      <Pencil size={13} />
                    </button>
                    <button
                      onClick={() => handleToggle(d)} disabled={!!togglingId}
                      title={d.derivedStatus === "active" ? "إيقاف" : "تفعيل"}
                      className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center transition-colors cursor-pointer disabled:opacity-50 ${
                        d.derivedStatus === "active"
                          ? "bg-green-500/10 text-green-500 hover:bg-green-500/20"
                          : "bg-marketplace-card-hover text-marketplace-text-secondary hover:text-green-500"
                      }`}>
                      {togglingId === d.id
                        ? <Loader2 size={13} className="animate-spin" />
                        : <Power size={13} />}
                    </button>
                    <button onClick={() => setDeleteTarget(d)} title="حذف"
                      disabled={deletingId === d.id}
                      className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500 hover:bg-red-500/20 transition-colors cursor-pointer disabled:opacity-50">
                      {deletingId === d.id
                        ? <Loader2 size={13} className="animate-spin" />
                        : <Trash2 size={13} />}
                    </button>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </motion.aside>

      {/* Create modal */}
      <DiscountModal
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        onSaved={(rows) => {
          upsertLocal(rows as DiscountWithTarget[]); // instant optimistic add
          setCreateOpen(false);
          // load(true) is already called inside upsertLocal
        }}
        allowedScopes={MERCHANT_SCOPES}
        merchantStoreId={storeId}
      />

      {/* Edit modal */}
      <DiscountModal
        isOpen={!!editTarget}
        onClose={() => setEditTarget(null)}
        discount={editTarget ?? undefined}
        onSaved={(rows) => {
          upsertLocal(rows as DiscountWithTarget[]); // instant optimistic update
          setEditTarget(null);
        }}
        allowedScopes={MERCHANT_SCOPES}
        merchantStoreId={storeId}
      />

      {/* View modal */}
      <ViewDiscountModal
        isOpen={!!viewTarget}
        discount={viewTarget}
        onClose={() => setViewTarget(null)}
      />

      {/* Delete confirm */}
      <ConfirmDeleteModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && handleDelete(deleteTarget)}
        title="حذف الخصم"
        description={`هل أنت متأكد من حذف الخصم "${deleteTarget?.name}"؟`}
        isLoading={!!deletingId}
      />
    </>
  );
}
