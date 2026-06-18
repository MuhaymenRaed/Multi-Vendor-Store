// Safe for client components — only uses the browser Supabase client.
// RLS already restricts write operations to admins.

import { supabase } from "../supabase/client";
import type {
  DiscountFormValues,
  DiscountRow,
  DiscountWithTarget,
} from "@/app/_lib/types/discount";

const TARGET_SELECT =
  "*, products(id, name), categories(id, name), stores(id, name)";

// ─── READ ─────────────────────────────────────────────────────────────────────

/** All discounts with their joined target names — for the admin table. */
export async function getDiscounts(): Promise<DiscountWithTarget[]> {
  const { data, error } = await supabase
    .from("discounts")
    .select(TARGET_SELECT)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data as DiscountWithTarget[]) || [];
}

/**
 * All discounts belonging to a specific store: store-scoped rows + product-scoped
 * rows for products in that store. Used by the merchant discount panel so owners
 * only see and manage their own discounts.
 */
export async function getStoreDiscounts(
  storeId: string,
): Promise<DiscountWithTarget[]> {
  // Fetch products in this store — need both ids (product scope) and category_ids (category scope)
  const { data: storeProducts } = await supabase
    .from("products")
    .select("id, category_id")
    .eq("store_id", storeId)
    .eq("is_deleted", false);

  const productIds = (storeProducts ?? []).map((p: { id: string }) => p.id);
  const categoryIds = [
    ...new Set(
      (storeProducts ?? [])
        .map((p: { category_id: number | null }) => p.category_id)
        .filter((id): id is number => id != null),
    ),
  ];

  type Q = Promise<{ data: DiscountWithTarget[] | null; error: { message: string } | null }>;
  const queries: Q[] = [
    supabase
      .from("discounts")
      .select(TARGET_SELECT)
      .eq("scope", "store")
      .eq("store_id", storeId)
      .order("created_at", { ascending: false }) as unknown as Q,
  ];

  if (productIds.length > 0) {
    queries.push(
      supabase
        .from("discounts")
        .select(TARGET_SELECT)
        .eq("scope", "product")
        .in("product_id", productIds)
        .order("created_at", { ascending: false }) as unknown as Q,
    );
  }

  if (categoryIds.length > 0) {
    queries.push(
      supabase
        .from("discounts")
        .select(TARGET_SELECT)
        .eq("scope", "category")
        .in("category_id", categoryIds)
        .order("created_at", { ascending: false }) as unknown as Q,
    );
  }

  const results = await Promise.all(queries);
  for (const r of results) {
    if (r.error) throw new Error(r.error.message);
  }

  const combined = results.flatMap((r) => r.data ?? []);
  const seen = new Set<string>();
  return combined.filter((d) => {
    if (seen.has(d.id)) return false;
    seen.add(d.id);
    return true;
  });
}

/**
 * Currently-relevant discounts for storefront pricing: stored status 'active'
 * and (if a window is set) not yet expired. Final live check is done client-side
 * by `isDiscountLive` so a discount whose start_date just passed is picked up
 * without a refetch.
 */
export async function getActiveDiscounts(): Promise<DiscountRow[]> {
  const nowIso = new Date().toISOString();
  const { data, error } = await supabase
    .from("discounts")
    .select("*")
    .eq("status", "active")
    .or(`end_date.is.null,end_date.gte.${nowIso}`);
  if (error) throw new Error(error.message);
  return (data as DiscountRow[]) || [];
}

/**
 * Active (and upcoming) discounts with joined target names, for the homepage
 * banner. Returns admin-status 'active' rows that are not yet expired —
 * including scheduled ones (start_date in the future) so visitors can see
 * upcoming deals. Sorted: global first, then by created_at desc.
 */
export async function getActiveDiscountsForBanner(): Promise<DiscountWithTarget[]> {
  const nowIso = new Date().toISOString();
  const { data, error } = await supabase
    .from("discounts")
    .select(TARGET_SELECT)
    .eq("status", "active")
    .or(`end_date.is.null,end_date.gte.${nowIso}`)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  // Sort: global scope first so the most prominent discounts lead
  const rows = (data as DiscountWithTarget[]) || [];
  return rows.sort((a, b) => {
    const priority: Record<string, number> = { global: 0, store: 1, category: 2, product: 3 };
    return (priority[a.scope] ?? 9) - (priority[b.scope] ?? 9);
  });
}

// ─── WRITE ──────────────────────────────────────────────────────────────────

/**
 * Build the per-target rows for a given form payload. Each row targets exactly
 * one product/category/store (or none for global), satisfying the DB CHECK
 * constraint. Multi-select therefore expands into multiple rows.
 */
function buildRowsFromForm(values: DiscountFormValues, createdBy: string | null) {
  const baseRow = {
    name: values.name.trim(),
    description: values.description?.trim() || null,
    discount_type: values.discount_type,
    discount_value: values.discount_value,
    scope: values.scope,
    status: values.status,
    start_date: values.start_date || null,
    end_date: values.end_date || null,
    created_by: createdBy,
    product_id: null as string | null,
    category_id: null as number | null,
    store_id: null as string | null,
  };

  switch (values.scope) {
    case "product":
      return values.product_ids.map((id) => ({ ...baseRow, product_id: id }));
    case "category":
      return values.category_ids.map((id) => ({
        ...baseRow,
        category_id: id,
      }));
    case "store":
      return values.store_ids.map((id) => ({ ...baseRow, store_id: id }));
    case "global":
    default:
      return [baseRow];
  }
}

async function getCurrentUserId(): Promise<string | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.id ?? null;
}

/**
 * Create one or more discounts. For product/category/store scope with multiple
 * targets selected, this inserts one row per target.
 * Returns the inserted rows.
 */
export async function createDiscounts(
  values: DiscountFormValues,
): Promise<DiscountRow[]> {
  const createdBy = await getCurrentUserId();
  const rows = buildRowsFromForm(values, createdBy);

  const { data, error } = await supabase
    .from("discounts")
    .insert(rows)
    .select(TARGET_SELECT);
  if (error) throw new Error(error.message);
  return (data as DiscountRow[]) || [];
}

/**
 * Update a single existing discount row. On edit the target is single-valued,
 * so we take the first id of the relevant scope array.
 */
export async function updateDiscount(
  id: string,
  values: DiscountFormValues,
): Promise<DiscountWithTarget> {
  const payload = {
    name: values.name.trim(),
    description: values.description?.trim() || null,
    discount_type: values.discount_type,
    discount_value: values.discount_value,
    scope: values.scope,
    status: values.status,
    start_date: values.start_date || null,
    end_date: values.end_date || null,
    product_id: values.scope === "product" ? values.product_ids[0] ?? null : null,
    category_id:
      values.scope === "category" ? values.category_ids[0] ?? null : null,
    store_id: values.scope === "store" ? values.store_ids[0] ?? null : null,
  };

  const { data, error } = await supabase
    .from("discounts")
    .update(payload)
    .eq("id", id)
    .select(TARGET_SELECT)
    .single();
  if (error) throw new Error(error.message);
  return data as DiscountWithTarget;
}

/** Flip a discount between 'active' and 'inactive'. */
export async function setDiscountActive(
  id: string,
  active: boolean,
): Promise<DiscountRow> {
  const { data, error } = await supabase
    .from("discounts")
    .update({ status: active ? "active" : "inactive" })
    .eq("id", id)
    .select(TARGET_SELECT)
    .single();
  if (error) throw new Error(error.message);
  return data as DiscountRow;
}

export async function deleteDiscount(id: string): Promise<void> {
  const { error } = await supabase.from("discounts").delete().eq("id", id);
  if (error) throw new Error(error.message);
}
