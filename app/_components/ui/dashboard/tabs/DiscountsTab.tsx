"use client";

import { Pagination } from "@/app/_components/reuseable/Pagination";
import { ConfirmDeleteModal } from "../components/ConfirmDeleteModal";
import { DiscountModal } from "../components/DiscountModal";
import { STATUS_STYLES } from "../components/discountStatusStyles";
import { StatCard } from "../components/Statcard";
import { TableActions, type Action } from "../components/TableActions";
import { ViewDiscountModal } from "../components/ViewDiscountModal";
import {
  deleteDiscount,
  setDiscountActive,
} from "@/app/_lib/data-services/discount-service";
import {
  useDiscounts,
  type DiscountSortField,
  type DiscountStatusFilter,
  type EnrichedDiscount,
} from "@/app/_lib/hooks/useDiscounts";
import {
  DISCOUNT_SCOPE_LABELS,
  DISCOUNT_STATUS_LABELS,
} from "@/app/_lib/types/discount";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowDown,
  ArrowUp,
  CalendarClock,
  CheckCircle2,
  Eye,
  Globe,
  Pencil,
  Plus,
  Power,
  PowerOff,
  Search,
  Tag,
  TicketPercent,
  Timer,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { toast } from "react-hot-toast";

const STATUS_FILTERS: { id: DiscountStatusFilter; label: string }[] = [
  { id: "all", label: "الكل" },
  { id: "active", label: "نشط" },
  { id: "inactive", label: "غير نشط" },
  { id: "scheduled", label: "مجدول" },
  { id: "expired", label: "منتهي" },
];

function fmtDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("ar-IQ", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function DiscountsTab() {
  const d = useDiscounts();

  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<EnrichedDiscount | null>(null);
  const [viewTarget, setViewTarget] = useState<EnrichedDiscount | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<EnrichedDiscount | null>(
    null,
  );
  const [isDeleting, setIsDeleting] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  async function handleToggle(disc: EnrichedDiscount) {
    setTogglingId(disc.id);
    const makeActive = disc.status !== "active";
    try {
      const updated = await setDiscountActive(disc.id, makeActive);
      d.upsertLocal([updated as EnrichedDiscount]);
      toast.success(makeActive ? "تم تفعيل الخصم" : "تم تعطيل الخصم");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "فشل تحديث الحالة");
    } finally {
      setTogglingId(null);
    }
  }

  async function handleDeleteConfirm() {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deleteDiscount(deleteTarget.id);
      d.removeLocal(deleteTarget.id);
      toast.success("تم حذف الخصم بنجاح");
      setDeleteTarget(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "فشل الحذف");
    } finally {
      setIsDeleting(false);
    }
  }

  const stats = [
    {
      label: "إجمالي الخصومات",
      value: d.stats.total,
      icon: <TicketPercent size={18} />,
    },
    {
      label: "الخصومات النشطة",
      value: d.stats.active,
      icon: <CheckCircle2 size={18} />,
    },
    {
      label: "الخصومات المجدولة",
      value: d.stats.scheduled,
      icon: <CalendarClock size={18} />,
    },
    {
      label: "الخصومات المنتهية",
      value: d.stats.expired,
      icon: <Timer size={18} />,
    },
  ];

  return (
    <div className="space-y-6" dir="rtl">
      {/* ── Stats ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <StatCard key={s.label} stat={s} index={i} />
        ))}
      </div>

      {/* ── Toolbar ── */}
      <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between bg-marketplace-card p-4 rounded-[2rem] border border-marketplace-border shadow-sm">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
          {/* Search */}
          <div className="relative flex-1 max-w-md group">
            <Search
              className="absolute right-4 top-1/2 -translate-y-1/2 text-marketplace-text-secondary group-focus-within:text-marketplace-accent transition-colors"
              size={18}
            />
            <input
              type="text"
              placeholder="ابحث باسم الخصم..."
              value={d.search}
              onChange={(e) => d.setSearch(e.target.value)}
              className="w-full bg-marketplace-bg border border-transparent focus:border-marketplace-accent/20 rounded-2xl py-3 pr-11 pl-4 outline-none text-marketplace-text-primary font-bold transition-all"
            />
          </div>

          {/* Status filter pills */}
          <div className="flex flex-wrap gap-1.5">
            {STATUS_FILTERS.map((f) => (
              <button
                key={f.id}
                onClick={() => d.setStatusFilter(f.id)}
                className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  d.statusFilter === f.id
                    ? "bg-marketplace-accent text-white border-marketplace-accent shadow-sm"
                    : "bg-marketplace-bg border-marketplace-border text-marketplace-text-secondary hover:border-marketplace-accent/40"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={() => setCreateOpen(true)}
          className="cursor-pointer flex items-center justify-center gap-2 px-6 py-3 bg-marketplace-accent text-white rounded-2xl font-bold hover:opacity-90 transition-all shadow-lg shadow-marketplace-accent/20 whitespace-nowrap"
        >
          <Plus size={18} />
          <span>إنشاء خصم</span>
        </button>
      </div>

      {/* ── Table / states ── */}
      <div className="bg-marketplace-card rounded-[2.5rem] border border-marketplace-border overflow-hidden shadow-sm">
        {d.loading ? (
          <TableSkeleton />
        ) : d.error ? (
          <div className="p-20 text-center">
            <p className="text-destructive font-bold mb-3">{d.error}</p>
            <button
              onClick={d.reload}
              className="text-marketplace-accent font-bold hover:underline cursor-pointer"
            >
              إعادة المحاولة
            </button>
          </div>
        ) : d.filtered.length === 0 ? (
          <EmptyState
            hasFilters={d.search !== "" || d.statusFilter !== "all"}
            onCreate={() => setCreateOpen(true)}
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-right min-w-[1000px]">
                <thead>
                  <tr className="bg-marketplace-bg/30 border-b border-marketplace-border">
                    <SortableTh
                      label="الاسم"
                      field="name"
                      active={d.sortField}
                      dir={d.sortDir}
                      onSort={d.toggleSort}
                    />
                    <Th>النوع</Th>
                    <Th>القيمة</Th>
                    <Th>النطاق</Th>
                    <Th>الحالة</Th>
                    <SortableTh
                      label="البدء"
                      field="start_date"
                      active={d.sortField}
                      dir={d.sortDir}
                      onSort={d.toggleSort}
                    />
                    <SortableTh
                      label="الانتهاء"
                      field="end_date"
                      active={d.sortField}
                      dir={d.sortDir}
                      onSort={d.toggleSort}
                    />
                    <SortableTh
                      label="الإنشاء"
                      field="created_at"
                      active={d.sortField}
                      dir={d.sortDir}
                      onSort={d.toggleSort}
                    />
                    <th className="px-6 py-5 text-left text-marketplace-text-secondary font-black text-[10px] uppercase tracking-widest">
                      الإجراءات
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-marketplace-border/50">
                  <AnimatePresence mode="popLayout">
                    {d.paginated.map((disc) => (
                      <DiscountRow
                        key={disc.id}
                        disc={disc}
                        toggling={togglingId === disc.id}
                        onView={() => setViewTarget(disc)}
                        onEdit={() => setEditTarget(disc)}
                        onDelete={() => setDeleteTarget(disc)}
                        onToggle={() => handleToggle(disc)}
                      />
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>

            <div className="px-6 pb-4">
              <Pagination
                currentPage={d.page}
                totalPages={d.totalPages}
                onPageChange={d.setPage}
              />
            </div>
          </>
        )}
      </div>

      {/* ── Modals ── */}
      <DiscountModal
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        onSaved={(rows) => d.upsertLocal(rows)}
      />
      <DiscountModal
        isOpen={!!editTarget}
        discount={editTarget}
        onClose={() => setEditTarget(null)}
        onSaved={(rows) => d.upsertLocal(rows)}
      />
      <ViewDiscountModal
        isOpen={!!viewTarget}
        discount={viewTarget}
        onClose={() => setViewTarget(null)}
      />
      <ConfirmDeleteModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title="حذف الخصم"
        description={`هل أنت متأكد من حذف خصم "${deleteTarget?.name}"؟ لا يمكن التراجع عن هذا الإجراء.`}
        isLoading={isDeleting}
      />
    </div>
  );
}

// ── Row ──────────────────────────────────────────────────────────────────────
function DiscountRow({
  disc,
  toggling,
  onView,
  onEdit,
  onDelete,
  onToggle,
}: {
  disc: EnrichedDiscount;
  toggling: boolean;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onToggle: () => void;
}) {
  const isActive = disc.status === "active";
  const valueLabel =
    disc.discount_type === "percentage"
      ? `${disc.discount_value}%`
      : `${Number(disc.discount_value).toLocaleString("en-US")} د.ع`;

  const target =
    disc.scope === "product"
      ? disc.products?.name
      : disc.scope === "category"
        ? disc.categories?.name
        : disc.scope === "store"
          ? disc.stores?.name
          : null;

  const actions: Action[] = [
    { label: "عرض", icon: <Eye size={14} />, onClick: onView },
    { label: "تعديل", icon: <Pencil size={14} />, onClick: onEdit },
    {
      label: isActive ? "تعطيل" : "تفعيل",
      icon: isActive ? <PowerOff size={14} /> : <Power size={14} />,
      onClick: onToggle,
      variant: isActive ? "danger" : "success",
      disabled: toggling,
    },
    {
      label: "حذف",
      icon: <Trash2 size={14} />,
      onClick: onDelete,
      variant: "danger",
    },
  ];

  return (
    <motion.tr
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="group hover:bg-marketplace-card-hover transition-all"
    >
      {/* Name */}
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-marketplace-accent/10 border border-marketplace-accent/20 flex items-center justify-center text-marketplace-accent shrink-0">
            <TicketPercent size={16} />
          </div>
          <div className="min-w-0">
            <p className="text-marketplace-text-primary font-bold truncate max-w-[180px]">
              {disc.name}
            </p>
            {disc.description && (
              <p className="text-[11px] text-marketplace-text-secondary truncate max-w-[180px]">
                {disc.description}
              </p>
            )}
          </div>
        </div>
      </td>

      {/* Type */}
      <td className="px-6 py-4">
        <span className="text-sm text-marketplace-text-secondary font-bold">
          {disc.discount_type === "percentage" ? "نسبة" : "مبلغ"}
        </span>
      </td>

      {/* Value */}
      <td className="px-6 py-4">
        <span className="text-marketplace-accent font-black">{valueLabel}</span>
      </td>

      {/* Scope */}
      <td className="px-6 py-4">
        <div className="flex items-center gap-1.5 text-sm text-marketplace-text-secondary">
          {disc.scope === "global" ? (
            <Globe size={13} className="text-marketplace-accent" />
          ) : (
            <Tag size={13} className="text-marketplace-accent" />
          )}
          <span className="font-bold">{DISCOUNT_SCOPE_LABELS[disc.scope]}</span>
          {target && (
            <span className="text-marketplace-text-secondary/60 truncate max-w-[90px]">
              · {target}
            </span>
          )}
        </div>
      </td>

      {/* Status */}
      <td className="px-6 py-4">
        <span
          className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border ${STATUS_STYLES[disc.derivedStatus]}`}
        >
          {DISCOUNT_STATUS_LABELS[disc.derivedStatus]}
        </span>
      </td>

      {/* Dates */}
      <td className="px-6 py-4 text-sm text-marketplace-text-secondary whitespace-nowrap">
        {fmtDate(disc.start_date)}
      </td>
      <td className="px-6 py-4 text-sm text-marketplace-text-secondary whitespace-nowrap">
        {fmtDate(disc.end_date)}
      </td>
      <td className="px-6 py-4 text-sm text-marketplace-text-secondary whitespace-nowrap">
        {fmtDate(disc.created_at)}
      </td>

      {/* Actions */}
      <td className="px-6 py-4 text-left">
        <TableActions actions={actions} />
      </td>
    </motion.tr>
  );
}

// ── Header cells ──────────────────────────────────────────────────────────────
function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-6 py-5 text-marketplace-text-secondary font-black text-[10px] uppercase tracking-widest">
      {children}
    </th>
  );
}

function SortableTh({
  label,
  field,
  active,
  dir,
  onSort,
}: {
  label: string;
  field: DiscountSortField;
  active: DiscountSortField;
  dir: "asc" | "desc";
  onSort: (f: DiscountSortField) => void;
}) {
  const isActive = active === field;
  return (
    <th className="px-6 py-5">
      <button
        onClick={() => onSort(field)}
        className={`flex items-center gap-1 font-black text-[10px] uppercase tracking-widest transition-colors cursor-pointer ${
          isActive
            ? "text-marketplace-accent"
            : "text-marketplace-text-secondary hover:text-marketplace-text-primary"
        }`}
      >
        {label}
        {isActive &&
          (dir === "asc" ? <ArrowUp size={12} /> : <ArrowDown size={12} />)}
      </button>
    </th>
  );
}

// ── Skeleton ──────────────────────────────────────────────────────────────────
function TableSkeleton() {
  return (
    <div className="p-6 space-y-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="h-14 bg-marketplace-bg/60 rounded-2xl animate-pulse border border-marketplace-border/40"
        />
      ))}
    </div>
  );
}

// ── Empty state ───────────────────────────────────────────────────────────────
function EmptyState({
  hasFilters,
  onCreate,
}: {
  hasFilters: boolean;
  onCreate: () => void;
}) {
  return (
    <div className="p-20 text-center">
      <div className="w-16 h-16 bg-marketplace-bg rounded-2xl flex items-center justify-center mx-auto mb-4 border border-marketplace-border text-marketplace-text-secondary opacity-30">
        <TicketPercent size={32} />
      </div>
      <p className="text-marketplace-text-secondary font-bold mb-1">
        {hasFilters
          ? "لا توجد خصومات تطابق الفلاتر"
          : "لا توجد خصومات بعد"}
      </p>
      {!hasFilters && (
        <>
          <p className="text-sm text-marketplace-text-secondary/70 mb-5">
            ابدأ بإنشاء أول خصم لمنتجاتك
          </p>
          <button
            onClick={onCreate}
            className="inline-flex items-center gap-2 px-6 py-3 bg-marketplace-accent text-white rounded-2xl font-bold hover:opacity-90 transition-all cursor-pointer shadow-lg shadow-marketplace-accent/20"
          >
            <Plus size={18} />
            إنشاء خصم
          </button>
        </>
      )}
    </div>
  );
}
