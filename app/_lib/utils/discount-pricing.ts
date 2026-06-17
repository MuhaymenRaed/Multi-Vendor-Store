// ─────────────────────────────────────────────────────────────────────────────
// Pure discount pricing & status logic — NO Supabase, NO React.
//
// Shared by the dashboard (status badges/stats) and the storefront (effective
// product price). Keeping it pure means the same rules can later be reused in a
// server-side revenue calculation without dragging in client dependencies.
//
// Priority (most specific wins, no stacking):
//   product  >  category  >  store  >  global
// ─────────────────────────────────────────────────────────────────────────────

import type {
  DerivedDiscountStatus,
  DiscountRow,
  DiscountType,
} from "@/app/_lib/types/discount";

const SCOPE_PRIORITY: Record<string, number> = {
  product: 4,
  category: 3,
  store: 2,
  global: 1,
};

/**
 * Derive the *effective* status of a discount from its stored status + dates.
 * Matches the business rules in the spec:
 *   - inactive  → stored status is 'inactive'
 *   - expired   → now > end_date
 *   - scheduled → now < start_date
 *   - active    → stored 'active' and now within [start_date, end_date]
 */
export function resolveDiscountStatus(
  discount: Pick<DiscountRow, "status" | "start_date" | "end_date">,
  now: Date = new Date(),
): DerivedDiscountStatus {
  if (discount.status === "inactive") return "inactive";

  const start = discount.start_date ? new Date(discount.start_date) : null;
  const end = discount.end_date ? new Date(discount.end_date) : null;

  if (end && now > end) return "expired";
  if (start && now < start) return "scheduled";
  return "active";
}

/** Is this discount live right now (eligible to affect storefront prices)? */
export function isDiscountLive(
  discount: Pick<DiscountRow, "status" | "start_date" | "end_date">,
  now: Date = new Date(),
): boolean {
  return resolveDiscountStatus(discount, now) === "active";
}

/** Apply a single discount to a base price. Result is clamped to >= 0. */
export function applyDiscountToPrice(
  price: number,
  type: DiscountType,
  value: number,
): number {
  const final =
    type === "percentage" ? price * (1 - value / 100) : price - value;
  // Round to whole currency units (IQD has no minor unit in this app) and clamp.
  return Math.max(0, Math.round(final));
}

export interface ProductLike {
  id: string;
  price: number;
  category_id?: number | null;
  store_id?: string | null;
}

export interface ProductPricing {
  originalPrice: number;
  finalPrice: number;
  hasDiscount: boolean;
  amountOff: number;
  /** Whole-number percent off, for display (e.g. 25 → "خصم 25%"). */
  percentOff: number;
  appliedDiscount: DiscountRow | null;
}

/**
 * Compute the effective price for one product given a pool of LIVE discounts.
 * Picks the single highest-priority matching discount (product > category >
 * store > global). Does not stack discounts.
 *
 * `liveDiscounts` should already be filtered to currently-active discounts
 * (see isDiscountLive) for performance, but this function is safe either way.
 */
export function computeProductPricing(
  product: ProductLike,
  liveDiscounts: DiscountRow[],
  now: Date = new Date(),
): ProductPricing {
  const base: ProductPricing = {
    originalPrice: product.price,
    finalPrice: product.price,
    hasDiscount: false,
    amountOff: 0,
    percentOff: 0,
    appliedDiscount: null,
  };

  if (!product.price || product.price <= 0 || liveDiscounts.length === 0) {
    return base;
  }

  // Find all discounts that target this product, then take the most specific.
  const matches = liveDiscounts.filter((d) => {
    if (!isDiscountLive(d, now)) return false;
    switch (d.scope) {
      case "product":
        return d.product_id === product.id;
      case "category":
        return (
          product.category_id != null && d.category_id === product.category_id
        );
      case "store":
        return product.store_id != null && d.store_id === product.store_id;
      case "global":
        return true;
      default:
        return false;
    }
  });

  if (matches.length === 0) return base;

  matches.sort(
    (a, b) => (SCOPE_PRIORITY[b.scope] ?? 0) - (SCOPE_PRIORITY[a.scope] ?? 0),
  );
  const applied = matches[0];

  const finalPrice = applyDiscountToPrice(
    product.price,
    applied.discount_type,
    applied.discount_value,
  );
  const amountOff = Math.max(0, product.price - finalPrice);

  return {
    originalPrice: product.price,
    finalPrice,
    hasDiscount: finalPrice < product.price,
    amountOff,
    percentOff:
      product.price > 0 ? Math.round((amountOff / product.price) * 100) : 0,
    appliedDiscount: applied,
  };
}
