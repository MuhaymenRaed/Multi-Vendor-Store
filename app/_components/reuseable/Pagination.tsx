"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

function getPageNumbers(current: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | "…")[] = [1];
  if (current > 3) pages.push("…");
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  for (let i = start; i <= end; i++) pages.push(i);
  if (current < total - 2) pages.push("…");
  pages.push(total);
  return pages;
}

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

/**
 * Reusable numbered pagination matching the storefront products pattern.
 * RTL-aware: "previous" sits on the right, "next" on the left.
 */
export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
  if (totalPages <= 1) return null;
  const pages = getPageNumbers(currentPage, totalPages);

  const btnBase =
    "flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-xl text-sm font-bold transition-all duration-200 border cursor-pointer select-none";
  const btnActive =
    "bg-marketplace-accent text-white border-marketplace-accent shadow-md shadow-marketplace-accent/25 scale-105";
  const btnIdle =
    "bg-marketplace-card border-marketplace-border text-marketplace-text-secondary hover:border-marketplace-accent/50 hover:text-marketplace-accent";
  const btnDisabled =
    "bg-marketplace-card/40 border-marketplace-border/40 text-marketplace-text-secondary/30 cursor-not-allowed";

  return (
    <nav
      dir="rtl"
      aria-label="تنقل الصفحات"
      className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 pt-6 border-t border-marketplace-border/50"
    >
      <span className="text-sm text-marketplace-text-secondary font-medium order-2 sm:order-1">
        صفحة{" "}
        <span className="text-marketplace-text-primary font-bold">
          {currentPage}
        </span>{" "}
        من{" "}
        <span className="text-marketplace-text-primary font-bold">
          {totalPages}
        </span>
      </span>

      <div className="flex items-center gap-1.5 order-1 sm:order-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`${btnBase} px-2 gap-1 ${currentPage === 1 ? btnDisabled : btnIdle}`}
          aria-label="الصفحة السابقة"
        >
          <ChevronRight size={16} />
          <span className="hidden sm:inline text-xs">السابق</span>
        </button>

        <div className="flex items-center gap-1">
          {pages.map((p, i) =>
            p === "…" ? (
              <span
                key={`e-${i}`}
                className="w-9 h-9 flex items-center justify-center text-marketplace-text-secondary/50 text-sm select-none"
              >
                …
              </span>
            ) : (
              <button
                key={p}
                onClick={() => onPageChange(p as number)}
                className={`${btnBase} ${p === currentPage ? btnActive : btnIdle}`}
                aria-current={p === currentPage ? "page" : undefined}
              >
                {p}
              </button>
            ),
          )}
        </div>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`${btnBase} px-2 gap-1 ${currentPage === totalPages ? btnDisabled : btnIdle}`}
          aria-label="الصفحة التالية"
        >
          <span className="hidden sm:inline text-xs">التالي</span>
          <ChevronLeft size={16} />
        </button>
      </div>
    </nav>
  );
}
