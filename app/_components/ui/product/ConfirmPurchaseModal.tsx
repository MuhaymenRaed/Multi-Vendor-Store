"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  MessageCircle,
  ShoppingBag,
  Loader2,
  ShieldCheck,
} from "lucide-react";

type ConfirmPurchaseModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  product: any;
  loading: boolean;
};

export function ConfirmPurchaseModal({
  isOpen,
  onClose,
  onConfirm,
  product,
  loading,
}: ConfirmPurchaseModalProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-md"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-md bg-marketplace-card border border-marketplace-border rounded-[2.5rem] shadow-2xl overflow-hidden p-8 flex flex-col items-center text-center"
          dir="rtl"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute cursor-pointer top-6 left-6 p-2 hover:bg-marketplace-card-hover rounded-full text-marketplace-text-secondary transition-colors"
          >
            <X size={20} />
          </button>

          {/* Icon Header */}
          <div className="mb-6 relative">
            <div className="w-20 h-20 bg-marketplace-accent/10 rounded-[2rem] flex items-center justify-center text-marketplace-accent">
              <ShoppingBag size={32} />
            </div>
            <div className="absolute -bottom-2 -right-2 bg-green-500 text-white p-1.5 rounded-lg shadow-lg">
              <ShieldCheck size={16} />
            </div>
          </div>

          {/* Text Content */}
          <h3 className="text-xl font-black text-marketplace-text-primary mb-2">
            تأكيد طلب الشراء
          </h3>
          <p className="text-sm text-marketplace-text-secondary leading-relaxed mb-6">
            أنت على وشك طلب{" "}
            <span className="text-marketplace-text-primary font-bold">
              "{product?.name ?? ""}"
            </span>
            . سيتم تحويلك الآن إلى واتساب الشركة لإتمام عملية الدفع والتوصيل.
          </p>

          {/* Pricing Card */}
          <div className="w-full bg-marketplace-bg border border-marketplace-border rounded-2xl p-4 mb-8 flex items-center justify-between">
            <span className="text-xs font-bold text-marketplace-text-secondary uppercase tracking-widest">
              المبلغ الإجمالي
            </span>
            <span className="text-xl font-black text-marketplace-accent">
              {(product?.price ?? 0).toLocaleString("en-US")} د.ع
            </span>
          </div>

          {/* Actions */}
          <div className="w-full space-y-3">
            <button
              onClick={onConfirm}
              disabled={loading}
              className="w-full cursor-pointer py-4 bg-marketplace-accent text-white rounded-2xl font-black shadow-lg shadow-marketplace-accent/20 hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-3"
            >
              {loading ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <MessageCircle size={20} />
              )}
              {loading ? "جارٍ الإرسال..." : "متابعة إلى واتساب"}
            </button>
            <button
              onClick={onClose}
              className="w-full cursor-pointer py-4 font-bold text-marketplace-text-secondary hover:text-marketplace-text-primary transition-all"
            >
              إلغاء الطلب
            </button>
          </div>

          {/* Trust Footer */}
          <p className="mt-6 text-[10px] text-marketplace-text-secondary/50 font-medium">
            بضغطك على متابعة، أنت توافق على شروط الخدمة الخاصة بالمتجر
          </p>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
