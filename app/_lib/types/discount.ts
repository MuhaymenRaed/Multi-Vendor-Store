// ─────────────────────────────────────────────────────────────────────────────
// Discount domain types
//
// Mirrors the `discounts` table DDL exactly:
//   discount_type_enum   : 'percentage' | 'fixed_amount'
//   discount_scope_enum  : 'product' | 'category' | 'store' | 'global'
//   discount_status_enum : 'active' | 'inactive' | 'scheduled' | 'expired'
//
// NOTE: each discount row targets EXACTLY ONE of product_id / category_id /
// store_id (or none, for global), enforced by a CHECK constraint. Multi-target
// creation is handled at the service layer by inserting one row per target.
// ─────────────────────────────────────────────────────────────────────────────

export const DISCOUNT_TYPES = ["percentage", "fixed_amount"] as const;
export type DiscountType = (typeof DISCOUNT_TYPES)[number];

export const DISCOUNT_SCOPES = [
  "product",
  "category",
  "store",
  "global",
] as const;
export type DiscountScope = (typeof DISCOUNT_SCOPES)[number];

// Stored status the admin controls. Scheduled/expired are *derived* from dates
// (see resolveDiscountStatus) but the enum supports them for completeness.
export const DISCOUNT_STATUSES = [
  "active",
  "inactive",
  "scheduled",
  "expired",
] as const;
export type DiscountStatus = (typeof DISCOUNT_STATUSES)[number];

// The effective, date-aware status used everywhere in the UI.
export type DerivedDiscountStatus =
  | "active"
  | "inactive"
  | "scheduled"
  | "expired";

// ── Row as it lives in the database ──────────────────────────────────────────
export interface DiscountRow {
  id: string;
  name: string;
  description: string | null;
  discount_type: DiscountType;
  discount_value: number;
  scope: DiscountScope;
  product_id: string | null;
  category_id: number | null;
  store_id: string | null;
  status: DiscountStatus;
  start_date: string | null;
  end_date: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

// ── Row joined with target names (for table/view rendering) ──────────────────
export interface DiscountWithTarget extends DiscountRow {
  products?: { id: string; name: string } | null;
  categories?: { id: number; name: string } | null;
  stores?: { id: string; name: string } | null;
}

// ── Payload for create/update (validated by Zod before reaching the service) ──
export interface DiscountFormValues {
  name: string;
  description: string;
  discount_type: DiscountType;
  discount_value: number;
  scope: DiscountScope;
  status: Exclude<DiscountStatus, "scheduled" | "expired">; // admin sets active|inactive
  start_date: string | null;
  end_date: string | null;
  // Target selections — only the one matching `scope` is used.
  product_ids: string[];
  category_ids: number[];
  store_ids: string[];
}

// ── Arabic labels (UI is RTL/Arabic, matching the rest of the dashboard) ─────
export const DISCOUNT_TYPE_LABELS: Record<DiscountType, string> = {
  percentage: "نسبة مئوية",
  fixed_amount: "مبلغ ثابت",
};

export const DISCOUNT_SCOPE_LABELS: Record<DiscountScope, string> = {
  product: "منتج",
  category: "فئة",
  store: "متجر",
  global: "شامل",
};

export const DISCOUNT_STATUS_LABELS: Record<DerivedDiscountStatus, string> = {
  active: "نشط",
  inactive: "غير نشط",
  scheduled: "مجدول",
  expired: "منتهي",
};
