"use client";

import { ImageSlider } from "@/app/_components/image/ImageSlider";
import { motion, AnimatePresence } from "framer-motion";
import { X, Ban, MessageCircle, Maximize2, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/app/_lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import { createOrderLead } from "@/app/_lib/data-services/order-service";
import { getProfile } from "@/app/_lib/data-services/profile-service";
import type { ProductPricing } from "@/app/_lib/utils/discount-pricing";
import toast from "react-hot-toast";
import { ConfirmPurchaseModal } from "./ConfirmPurchaseModal";

interface ProductModalProps {
  product: {
    id: string;
    name: string;
    price: number;
    description: string;
    image_url?: string[];
    category?: string;
    stock_quantity?: number;
    store_id: string;
    admin_commission?: number;
  } | null;
  pricing?: ProductPricing | null;
  dealer_phone?: string;
  store_name?: string;
  isOpen: boolean;
  onClose: () => void;
}

export function ProductModal({
  product,
  pricing,
  isOpen,
  onClose,
  dealer_phone,
}: ProductModalProps) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

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

  // Effective price after discounts — this is what the customer pays and what
  // is recorded on the order (and therefore flows into revenue).
  const hasDiscount = !!pricing?.hasDiscount;
  const effectivePrice = pricing?.finalPrice ?? product.price;

  const images: string[] =
    product.image_url && Array.isArray(product.image_url)
      ? product.image_url
      : product.image_url
        ? [product.image_url]
        : [];

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
      if (!profile?.location) {
        toast.error("يرجى إضافة موقعك لإتمام الطلب");
        router.push("/profile");
        setLoading(false);
        return;
      }

      await createOrderLead({
        buyer_id: user.id,
        store_id: product.store_id,
        product_id: product.id,
        product_price_at_click: effectivePrice,
        admin_commission_at_click: product.admin_commission || 0,
      });

      const now = new Date();
      const formattedDate = `${now.getFullYear()}/${now.getMonth() + 1}/${now.getDate()}`;

      const message = [
        `*طلب جديد عبر المنصة*`,
        `══════════════════`,
        `*تفاصيل المنتج:*`,
        ` المنتج: ${product.name}`,
        ` السعر: ${effectivePrice.toLocaleString("en-US")} د.ع`,
        ` التصنيف: ${product.category || "غير محدد"}`,
        ``,
        `*بيانات الزبون:*`,
        ` الاسم: ${profile.full_name || "غير معروف"}`,
        `الموقع: ${profile.location || "غير محدد"}`,
        ` الهاتف: ${profile.phone}`,
        ` التاريخ: ${formattedDate}`,
      ].join("\n");

      const encoded = encodeURIComponent(message);
      const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

      let whatsappNumber = dealer_phone || "";
      if (whatsappNumber && !whatsappNumber.startsWith("964")) {
        whatsappNumber = whatsappNumber.replace(/^0/, "");
        whatsappNumber = `964${whatsappNumber}`;
      }

      if (isMobile) {
        window.location.href = `whatsapp://send?phone=${whatsappNumber}&text=${encoded}`;
      } else {
        window.open(
          `https://wa.me/${whatsappNumber}?text=${encoded}`,
          `_blank`,
        );
      }

      toast.success("جاري تحويلك لتأكيد الطلب");
      setShowConfirm(false);
      onClose();
    } catch {
      toast.error("حدث خطأ أثناء إتمام الطلب.");
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
              className="relative bg-marketplace-card rounded-[2.5rem] max-w-4xl w-full max-h-[90vh] md:max-h-[85vh] overflow-hidden border border-border shadow-2xl flex flex-col md:flex-row"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={onClose}
                className="absolute cursor-pointer top-4 left-4 z-30 p-2 bg-black/40 backdrop-blur-md rounded-full hover:bg-red-500 text-white transition-all"
              >
                <X className="w-5 h-5" />
              </button>

              {/* ── IMAGE SECTION ── */}
              <div
                className={`relative w-full md:w-1/2 aspect-square overflow-hidden ${
                  isOutOfStock ? "grayscale" : ""
                } group bg-black/5 flex items-center justify-center`}
              >
                {images.length > 0 ? (
                  <ImageSlider
                    image_url={images}
                    alt={product.name}
                    objectFit="cover"
                    showDots={images.length > 1}
                    initialSlide={currentImageIndex}
                    onSlideChange={setCurrentImageIndex}
                  />
                ) : (
                  <div className="w-full h-full bg-marketplace-card-hover animate-pulse" />
                )}

                {/* Cleaner, Non-blocking Lightbox Trigger */}
                <button
                  onClick={() => setIsLightboxOpen(true)}
                  className="absolute cursor-pointer bottom-4 left-4 z-20 flex items-center gap-2 px-3 py-1.5 bg-black/50 backdrop-blur-lg border border-white/10 rounded-full text-white/90 transition-all hover:bg-marketplace-accent hover:scale-105 active:scale-95 md:opacity-0 md:group-hover:opacity-100 shadow-lg"
                >
                  <Maximize2 className="w-4 h-4" />
                  <span className="text-[11px] font-bold">عرض كامل</span>
                </button>

                {isOutOfStock && (
                  <div className="absolute inset-0 z-10 bg-black/60 flex items-center justify-center">
                    <span className="bg-red-600 text-white px-5 py-2 rounded-full font-bold text-sm">
                      نفدت الكمية
                    </span>
                  </div>
                )}
              </div>

              {/* ── CONTENT SECTION ── */}
              <div className="flex flex-col p-6 md:p-12 w-full md:w-1/2 overflow-y-auto cute-scrollbar">
                <div className="flex-1">
                  {product.category && (
                    <span className="text-[10px] font-bold text-marketplace-accent mb-3 px-3 py-1 bg-marketplace-accent/10 rounded-full w-fit uppercase tracking-widest inline-block">
                      {product.category}
                    </span>
                  )}

                  <h2
                    dir="auto"
                    className="text-2xl md:text-3xl font-black mb-2 leading-tight text-marketplace-text-primary"
                  >
                    {product.name}
                  </h2>

                  <div className="mb-5">
                    {hasDiscount && (
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg font-bold text-marketplace-text-secondary/60 line-through">
                          {product.price.toLocaleString("en-US")} د.ع
                        </span>
                        <span className="text-[11px] font-black bg-marketplace-accent text-white px-2 py-0.5 rounded-lg">
                          {pricing!.appliedDiscount?.discount_type === "fixed_amount"
                            ? `خصم ${pricing!.amountOff.toLocaleString("en-US")} د.ع`
                            : `خصم ${pricing!.percentOff}%`}
                        </span>
                      </div>
                    )}
                    <div className="text-3xl md:text-4xl font-black text-marketplace-accent flex items-baseline gap-2">
                      {effectivePrice.toLocaleString("en-US")}
                      <span className="text-lg opacity-80 font-bold">د.ع</span>
                    </div>
                  </div>

                  <p
                    dir="auto"
                    className="text-marketplace-text-secondary mb-6 leading-relaxed text-sm md:text-base opacity-70 whitespace-pre-line break-words max-h-48 overflow-y-auto cute-scrollbar pl-1"
                  >
                    {product.description}
                  </p>
                </div>

                <div className="mt-4 pt-6 border-t border-border">
                  {isOutOfStock ? (
                    <div className="w-full flex items-center justify-center gap-3 bg-marketplace-card-hover text-marketplace-text-secondary py-4 rounded-2xl cursor-not-allowed">
                      <Ban className="w-5 h-5" /> نفدت الكمية
                    </div>
                  ) : (
                    <motion.button
                      disabled={loading}
                      onClick={() => setShowConfirm(true)}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full flex cursor-pointer items-center justify-center gap-3 bg-marketplace-accent text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-marketplace-accent/10 hover:brightness-110 disabled:opacity-70 transition-all"
                    >
                      {loading ? (
                        <Loader2 className="w-6 h-6 animate-spin" />
                      ) : (
                        <MessageCircle className="w-6 h-6" />
                      )}
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
            price={effectivePrice}
            loading={loading}
          />

          {/* ── LIGHTBOX ── */}
          <AnimatePresence>
            {isLightboxOpen && images.length > 0 && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setIsLightboxOpen(false)}
                  className="fixed inset-0 bg-black/95 backdrop-blur-2xl z-[100] cursor-zoom-out"
                />

                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="fixed inset-0 z-[101] flex flex-col items-center justify-center pointer-events-none"
                >
                  <button
                    onClick={() => setIsLightboxOpen(false)}
                    className="absolute cursor-pointer top-6 left-6 z-[102] p-3 bg-white/10 backdrop-blur-md rounded-full hover:bg-red-500 text-white transition-all pointer-events-auto"
                  >
                    <X className="w-6 h-6" />
                  </button>

                  <div className="w-full max-w-5xl h-[80vh] flex flex-col items-center justify-center pointer-events-auto px-4">
                    <ImageSlider
                      image_url={images}
                      alt={product.name}
                      objectFit="contain"
                      showDots={false}
                      showArrows={images.length > 1}
                      initialSlide={currentImageIndex}
                      onSlideChange={setCurrentImageIndex}
                    />

                    <div className="mt-6 text-white/50 text-xs font-bold flex items-center gap-2 bg-white/5 px-4 py-1.5 rounded-full">
                      <span className="text-marketplace-accent">
                        {currentImageIndex + 1}
                      </span>
                      <span>/</span>
                      <span>{images.length}</span>
                    </div>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </>
      )}
    </AnimatePresence>
  );
}
