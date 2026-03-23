"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Ban, Loader2, MessageCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/app/_lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import { createOrderLead } from "@/app/_lib/data-services/order-service";
import { getProfile } from "@/app/_lib/data-services/profile-service";
import toast from "react-hot-toast";
import { ConfirmPurchaseModal } from "./ConfirmPurchaseModal";

interface ProductModalProps {
  product: {
    id: string;
    name: string;
    price: number;
    description: string;
    image_url?: string;
    category?: string;
    stock_quantity?: number;
    store_id: string;
    admin_commission?: number;
  } | null;
  dealer_phone?: string;
  store_name?: string;
  isOpen: boolean;
  onClose: () => void;
}

export function ProductModal({
  product,
  isOpen,
  onClose,
  dealer_phone,
  store_name,
}: ProductModalProps) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const ADMIN_WHATSAPP = "9647717333838";

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      },
    );
    return () => listener.subscription.unsubscribe();
  }, []);

  if (!product) return null;

  const stock = product.stock_quantity ?? null;
  const isOutOfStock = stock !== null && stock === 0;

  const handleOrderProcess = async () => {
    if (!user) {
      router.push("/login");
      return;
    }

    setLoading(true);
    try {
      const profile = await getProfile(user.id);
      if (!profile?.phone) {
        toast.error("يرجى إضافة رقم هاتفك لإتمام الطلب");
        router.push("/profile");
        setLoading(false);
        return;
      }

      const orderEntry = await createOrderLead({
        buyer_id: user.id,
        store_id: product.store_id,
        product_id: product.id,
        product_price_at_click: product.price,
        admin_commission_at_click: product.admin_commission || 0,
      });

      const orderId = orderEntry?.id ? orderEntry.id.slice(0, 8) : "NEW";
      const now = new Date();
      const formattedDate = `${now.getFullYear()}/${now.getMonth() + 1}/${now.getDate()}`;

      const message = [
        `*طلب جديد عبر المنصة*`,
        `══════════════════`,
        ``,
        `*تفاصيل المنتج:*`,
        `  المنتج: ${product.name}`,
        `  السعر: ${product.price.toLocaleString("en-US")} د.ع`,
        `  التصنيف: ${product.category || "غير محدد"}`,
        `  الكمية المتوفرة: ${stock !== null ? stock : "غير محدد"}`,
        ``,
        `══════════════════`,
        ``,
        `*بيانات الزبون:*`,
        `  الاسم: ${profile.full_name || "غير معروف"}`,
        `  الهاتف: ${profile.phone}`,
        `  البريد: ${user?.email || "غير متوفر"}`,
        ``,
        `══════════════════`,
        ``,
        `*معلومات إدارية:*`,
        `  المتجر: ${store_name || "غير معروف"}`,
        `  هاتف التاجر: ${dealer_phone || "غير متوفر"}`,
        `  التاريخ: ${formattedDate}`,
      ].join("\n");

      const encoded = encodeURIComponent(message);
      const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

      if (isMobile) {
        window.location.href = `whatsapp://send?phone=${ADMIN_WHATSAPP}&text=${encoded}`;
      } else {
        window.open(
          `https://wa.me/${ADMIN_WHATSAPP}?text=${encoded}`,
          "_blank",
        );
      }

      toast.success("جاري تحويلك لتأكيد الطلب");
      setShowConfirm(false);
      onClose();
    } catch (error: any) {
      toast.error("حدث خطأ أثناء إتمام الطلب. حاول مرة أخرى.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-xl z-50"
          />

          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
            dir="rtl"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-marketplace-card rounded-[2.5rem] max-w-4xl w-full max-h-[85vh] overflow-hidden border border-border shadow-2xl flex flex-col md:flex-row"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={onClose}
                className="absolute cursor-pointer top-4 left-4 z-20 p-2 bg-black/40 dark:bg-black/40 backdrop-blur-md rounded-full hover:bg-red-500 text-white transition-all"
              >
                <X className="w-5 h-5" />
              </button>

              {/* IMAGE SECTION: Fixed dimensions */}
              <div
                className={`relative w-full md:w-1/2 h-[300px] md:h-auto overflow-hidden ${isOutOfStock ? "grayscale" : ""}`}
              >
                {product.image_url ? (
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-full object-cover" // This prevents stretching
                  />
                ) : (
                  <div className="w-full h-full bg-marketplace-card-hover animate-pulse" />
                )}

                {isOutOfStock && (
                  <div className="absolute inset-0 bg-black/60 dark:bg-black/60 flex items-center justify-center">
                    <span className="bg-red-600 text-white px-5 py-2 rounded-full font-bold text-sm">
                      نفدت الكمية
                    </span>
                  </div>
                )}
              </div>

              {/* CONTENT SECTION: Scrollable if text is too long */}
              <div className="flex flex-col p-8 md:p-12 w-full md:w-1/2 overflow-y-auto cute-scrollbar">
                <div className="flex-1">
                  {product.category && (
                    <span className="text-[10px] font-bold text-marketplace-accent mb-4 px-3 py-1 bg-marketplace-accent/10 rounded-full w-fit uppercase tracking-widest">
                      {product.category}
                    </span>
                  )}

                  <h2
                    dir="auto"
                    className="text-3xl font-black mb-3 leading-tight text-marketplace-text-primary"
                  >
                    {product.name}
                  </h2>

                  <div className="text-4xl font-black mb-6 text-marketplace-accent flex items-baseline gap-2">
                    {product.price.toLocaleString("en-US")}
                    <span className="text-lg opacity-80 font-bold">د.ع</span>
                  </div>

                  <p
                    dir="auto"
                    className="text-marketplace-text-secondary mb-8 leading-relaxed text-sm md:text-base opacity-70 whitespace-pre-line break-words max-h-40 overflow-y-auto cute-scrollbar pl-1"
                  >
                    {product.description}
                  </p>
                </div>

                {/* Fixed footer for the button */}
                <div className="mt-6 pt-6 border-t border-border">
                  {isOutOfStock ? (
                    <div className="w-full flex items-center justify-center gap-3 bg-marketplace-card-hover text-marketplace-text-secondary py-4 rounded-2xl cursor-not-allowed">
                      <Ban className="w-5 h-5" /> نفدت الكمية
                    </div>
                  ) : (
                    <motion.button
                      disabled={loading}
                      onClick={() => setShowConfirm(true)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full flex cursor-pointer items-center justify-center gap-3 bg-marketplace-accent text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-marketplace-accent/10 hover:brightness-110 disabled:opacity-70 transition-all"
                    >
                      <MessageCircle className="w-6 h-6" />
                      اطلب الآن
                    </motion.button>
                  )}
                </div>
              </div>
            </motion.div>
          </div>

          <ConfirmPurchaseModal
            isOpen={showConfirm}
            onClose={() => setShowConfirm(false)}
            onConfirm={handleOrderProcess}
            product={product}
            loading={loading}
          />
        </>
      )}
    </AnimatePresence>
  );
}
