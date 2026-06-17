import type { DerivedDiscountStatus } from "@/app/_lib/types/discount";

// Shared badge styling for derived discount statuses, reused by the table,
// the view modal, and anywhere a status pill is rendered.
export const STATUS_STYLES: Record<DerivedDiscountStatus, string> = {
  active:
    "bg-green-500/5 border-green-500/20 text-green-600 dark:text-green-400",
  scheduled:
    "bg-blue-500/5 border-blue-500/20 text-blue-600 dark:text-blue-400",
  expired:
    "bg-marketplace-text-secondary/5 border-marketplace-border text-marketplace-text-secondary",
  inactive:
    "bg-yellow-500/5 border-yellow-500/20 text-yellow-600 dark:text-yellow-400",
};
