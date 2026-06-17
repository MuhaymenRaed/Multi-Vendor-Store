"use client";

import {
  DISCOUNT_SCOPE_LABELS,
  DISCOUNT_STATUS_LABELS,
  DISCOUNT_TYPE_LABELS,
} from "@/app/_lib/types/discount";
import type { EnrichedDiscount } from "@/app/_lib/hooks/useDiscounts";
import { STATUS_STYLES } from "@/app/_components/ui/dashboard/components/discountStatusStyles";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlignLeft,
  Calendar,
  CalendarCheck,
  Globe,
  Hash,
  Tag,
  TicketPercent,
  X,
} from "lucide-react";

interface ViewDiscountModalProps {
  isOpen: boolean;
  onClose: () => void;
  discount: EnrichedDiscount | null;
}

function fmtDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("ar-IQ", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function ViewDiscountModal({
  isOpen,
  onClose,
  discount,
}: ViewDiscountModalProps) {
  if (!isOpen || !discount) return null;

  const valueLabel =
    discount.discount_type === "percentage"
      ? `${discount.discount_value}%`
      : `${Number(discount.discount_value).toLocaleString("en-US")} د.ع`;

  const target =
    discount.scope === "product"
      ? discount.products?.name
      : discount.scope === "category"
        ? discount.categories?.name
        : discount.scope === "store"
          ? discount.stores?.name
          : "جميع المنتجات";

  const statusStyle = STATUS_STYLES[discount.derivedStatus];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-lg bg-marketplace-card border border-marketplace-border rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col"
          dir="rtl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-8 py-6 border-b border-marketplace-border flex items-start justify-between bg-linear-to-l from-marketplace-accent/5 to-transparent">
            <div className="flex items-start gap-3 min-w-0">
              <div className="p-2 bg-marketplace-accent/20 rounded-xl text-marketplace-accent shrink-0">
                <TicketPercent size={20} />
              </div>
              <div className="min-w-0">
                <h2 className="text-xl font-black text-marketplace-text-primary truncate">
                  {discount.name}
                </h2>
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 mt-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider border ${statusStyle}`}
                >
                  {DISCOUNT_STATUS_LABELS[discount.derivedStatus]}
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 cursor-pointer hover:bg-marketplace-card-hover rounded-full text-marketplace-text-secondary transition-colors shrink-0"
            >
              <X size={20} />
            </button>
          </div>

          {/* Body */}
          <div className="p-8 space-y-6 overflow-y-auto cute-scrollbar max-h-[70vh]">
            {discount.description && (
              <p className="text-sm text-marketplace-text-secondary leading-relaxed bg-marketplace-bg border border-marketplace-border rounded-2xl p-4">
                {discount.description}
              </p>
            )}

            {/* Value + Type */}
            <div className="grid grid-cols-2 gap-3">
              <InfoTile
                icon={<Hash size={16} />}
                label="قيمة الخصم"
                value={valueLabel}
                highlight
              />
              <InfoTile
                icon={<AlignLeft size={16} />}
                label="النوع"
                value={DISCOUNT_TYPE_LABELS[discount.discount_type]}
              />
            </div>

            {/* Scope + Target */}
            <div className="grid grid-cols-2 gap-3">
              <InfoTile
                icon={
                  discount.scope === "global" ? (
                    <Globe size={16} />
                  ) : (
                    <Tag size={16} />
                  )
                }
                label="النطاق"
                value={DISCOUNT_SCOPE_LABELS[discount.scope]}
              />
              <InfoTile
                icon={<Tag size={16} />}
                label="الهدف"
                value={target || "—"}
              />
            </div>

            {/* Schedule */}
            <div className="grid grid-cols-2 gap-3">
              <InfoTile
                icon={<Calendar size={16} />}
                label="تاريخ البدء"
                value={fmtDate(discount.start_date)}
              />
              <InfoTile
                icon={<CalendarCheck size={16} />}
                label="تاريخ الانتهاء"
                value={fmtDate(discount.end_date)}
              />
            </div>

            {/* Created */}
            <div className="pt-2 border-t border-marketplace-border/50">
              <p className="text-xs text-marketplace-text-secondary">
                تاريخ الإنشاء:{" "}
                <span className="font-bold text-marketplace-text-primary">
                  {fmtDate(discount.created_at)}
                </span>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

function InfoTile({
  icon,
  label,
  value,
  highlight = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="bg-marketplace-bg border border-marketplace-border rounded-2xl p-4">
      <div className="flex items-center gap-2 text-marketplace-text-secondary mb-1.5">
        <span className="text-marketplace-accent">{icon}</span>
        <span className="text-[10px] font-bold uppercase tracking-widest">
          {label}
        </span>
      </div>
      <p
        className={`font-black truncate ${highlight ? "text-marketplace-accent text-lg" : "text-marketplace-text-primary"}`}
      >
        {value}
      </p>
    </div>
  );
}
