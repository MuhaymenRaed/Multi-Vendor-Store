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
  type DiscountWithTarget,
} from "@/app/_lib/types/discount";
import { STATUS_STYLES } from "@/app/_components/ui/dashboard/components/discountStatusStyles";
import { DiscountModal } from "@/app/_components/ui/dashboard/components/DiscountModal";
import { ViewDiscountModal } from "@/app/_components/ui/dashboard/components/ViewDiscountModal";
import { ConfirmDeleteModal } from "@/app/_components/reuseable/ConfirmDeleteModal";
import { AnimatePresence, motion } from "framer-motion"; // AnimatePresence used for search results dropdown in this file's JSX
import {
  Eye,
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

const MERCHANT_SCOPES = ["store", "product"] as const;

export function StoreDiscountPanel({ storeId, onClose }: StoreDiscountPanelProps) {
  const [discounts, setDiscounts] = useState<EnrichedDiscount[]>([]);
  const [loading, setLoading] = useState(true);

  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<DiscountWithTarget | null>(null);
  const [viewTarget, setViewTarget] = useState<EnrichedDiscount | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<EnrichedDiscount | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getStoreDiscounts(storeId);
      setDiscounts(
        data.map((d) => ({ ...d, derivedStatus: resolveDiscountStatus(d) })),
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "فشل تحميل الخصومات");
    } finally {
      setLoading(false);
    }
  }, [storeId]);

  useEffect(() => {
    load();
  }, [load]);

  // Close on Escape
  useEffect(() => {
    const handle = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handle);
    return () => window.removeEventListener("keydown", handle);
  }, [onClose]);

  const stats = useMemo(() => {
    const base = { total: discounts.length, active: 0, scheduled: 0, expired: 0 };
    for (const d of discounts) {
      if (d.derivedStatus === "active") base.active++;
      else if (d.derivedStatus === "scheduled") base.scheduled++;
      else if (d.derivedStatus === "expired") base.expired++;
    }
    return base;
  }, [discounts]);

  function upsertLocal(rows: DiscountWithTarget[]) {
    setDiscounts((prev) => {
      const map = new Map(prev.map((d) => [d.id, d]));
      for (const r of rows) {
        map.set(r.id, { ...r, derivedStatus: resolveDiscountStatus(r) });
      }
      return Array.from(map.values());
    });
  }
  function removeLocal(id: string) {
    setDiscounts((prev) => prev.filter((d) => d.id !== id));
  }

  async function handleToggle(d: EnrichedDiscount) {
    const next = d.derivedStatus !== "active";
    setTogglingId(d.id);
    try {
      const updated = await setDiscountActive(d.id, next);
      upsertLocal([updated as DiscountWithTarget]);
      toast.success(next ? "تم تفعيل الخصم" : "تم إيقاف الخصم");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "فشل تغيير الحالة");
    } finally {
      setTogglingId(null);
    }
  }

  async function handleDelete(d: EnrichedDiscount) {
    setDeletingId(d.id);
    try {
      await deleteDiscount(d.id);
      removeLocal(d.id);
      setDeleteTarget(null);
      toast.success("تم حذف الخصم");
    } catch (err) {
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
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60]"
      />

      {/* Panel */}
      <motion.aside
        dir="rtl"
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", stiffness: 300, damping: 32 }}
        className="fixed top-0 left-0 h-full w-full max-w-xl bg-marketplace-card border-l border-marketplace-border shadow-2xl z-[70] flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-marketplace-border bg-gradient-to-l from-marketplace-accent/5 to-transparent shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-marketplace-accent/15 text-marketplace-accent">
              <TicketPercent size={20} />
            </div>
            <div>
              <h2 className="text-lg font-black text-marketplace-text-primary">خصومات المتجر</h2>
              <p className="text-xs text-marketplace-text-secondary font-medium">
                إدارة العروض الخاصة بمنتجاتك
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-marketplace-card-hover text-marketplace-text-secondary transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 px-6 py-4 shrink-0">
          {[
            { label: "الكل", value: stats.total, color: "text-marketplace-text-primary" },
            { label: "نشط", value: stats.active, color: "text-green-500" },
            { label: "منتهي", value: stats.expired, color: "text-marketplace-text-secondary" },
          ].map((s) => (
            <div
              key={s.label}
              className="bg-marketplace-bg border border-marketplace-border rounded-2xl p-3 text-center"
            >
              <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
              <p className="text-[10px] font-bold text-marketplace-text-secondary uppercase tracking-widest mt-0.5">
                {s.label}
              </p>
            </div>
          ))}
        </div>

        {/* Create button */}
        <div className="px-6 pb-4 shrink-0">
          <button
            onClick={() => setCreateOpen(true)}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-marketplace-accent text-white font-black shadow-lg shadow-marketplace-accent/20 hover:brightness-110 transition-all cursor-pointer active:scale-98"
          >
            <Plus size={18} />
            إنشاء خصم جديد
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto px-6 pb-6 cute-scrollbar space-y-3">
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
              <p className="text-marketplace-text-secondary font-bold text-sm">
                لا توجد خصومات بعد
              </p>
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
                className="bg-marketplace-bg border border-marketplace-border rounded-2xl p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    {/* Name + status */}
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-black text-marketplace-text-primary text-sm truncate max-w-[160px]">
                        {d.name}
                      </span>
                      <span
                        className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${STATUS_STYLES[d.derivedStatus]}`}
                      >
                        {DISCOUNT_STATUS_LABELS[d.derivedStatus]}
                      </span>
                    </div>

                    {/* Value + scope */}
                    <div className="flex items-center gap-2 flex-wrap text-xs text-marketplace-text-secondary font-medium">
                      <span className="font-black text-marketplace-accent text-sm">{fmtValue(d)}</span>
                      <span>•</span>
                      <span>{DISCOUNT_TYPE_LABELS[d.discount_type]}</span>
                      <span>•</span>
                      <span>{DISCOUNT_SCOPE_LABELS[d.scope]}: {targetLabel(d)}</span>
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
                  <div className="flex items-center gap-1.5 shrink-0">
                    {/* View */}
                    <button
                      onClick={() => setViewTarget(d)}
                      title="عرض"
                      className="w-8 h-8 rounded-xl bg-marketplace-card-hover flex items-center justify-center text-marketplace-text-secondary hover:text-marketplace-accent transition-colors cursor-pointer"
                    >
                      <Eye size={14} />
                    </button>

                    {/* Edit */}
                    <button
                      onClick={() => setEditTarget(d)}
                      title="تعديل"
                      className="w-8 h-8 rounded-xl bg-marketplace-card-hover flex items-center justify-center text-marketplace-text-secondary hover:text-blue-500 transition-colors cursor-pointer"
                    >
                      <Pencil size={14} />
                    </button>

                    {/* Toggle active */}
                    <button
                      onClick={() => handleToggle(d)}
                      disabled={!!togglingId}
                      title={d.derivedStatus === "active" ? "إيقاف" : "تفعيل"}
                      className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors cursor-pointer disabled:opacity-50 ${
                        d.derivedStatus === "active"
                          ? "bg-green-500/10 text-green-500 hover:bg-green-500/20"
                          : "bg-marketplace-card-hover text-marketplace-text-secondary hover:text-green-500"
                      }`}
                    >
                      {togglingId === d.id ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <Power size={14} />
                      )}
                    </button>

                    {/* Delete */}
                    <button
                      onClick={() => setDeleteTarget(d)}
                      title="حذف"
                      className="w-8 h-8 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500 hover:bg-red-500/20 transition-colors cursor-pointer"
                    >
                      <Trash2 size={14} />
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
          upsertLocal(rows as DiscountWithTarget[]);
          setCreateOpen(false);
        }}
        allowedScopes={MERCHANT_SCOPES as unknown as import("@/app/_lib/types/discount").DiscountScope[]}
        merchantStoreId={storeId}
      />

      {/* Edit modal */}
      <DiscountModal
        isOpen={!!editTarget}
        onClose={() => setEditTarget(null)}
        discount={editTarget ?? undefined}
        onSaved={(rows) => {
          upsertLocal(rows as DiscountWithTarget[]);
          setEditTarget(null);
        }}
        allowedScopes={MERCHANT_SCOPES as unknown as import("@/app/_lib/types/discount").DiscountScope[]}
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
