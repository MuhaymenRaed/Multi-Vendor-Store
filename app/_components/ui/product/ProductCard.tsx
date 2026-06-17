"use client";

import { ImageSlider } from "@/app/_components/image/ImageSlider";
import { AlertTriangle, Ban, Flame, Tag, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useState } from "react";
import type { ProductPricing } from "@/app/_lib/utils/discount-pricing";

import { ConfirmDeleteModal } from "../../reuseable/ConfirmDeleteModal";

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    price: number;
    image_url?: string[];
    category?: string;
    stock_quantity?: number;
  };
  isOwner?: boolean;
  onDelete?: (productId: string) => Promise<void> | void;
  /** Effective pricing after discounts; when absent the raw price is shown. */
  pricing?: ProductPricing | null;
}

const LOW_STOCK_THRESHOLD = 5;

export function ProductCard({
  product,
  isOwner = false,
  onDelete,
  pricing,
}: ProductCardProps) {
  const hasDiscount = !!pricing?.hasDiscount;
  const displayPrice = pricing?.finalPrice ?? product.price;
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const stock = product.stock_quantity ?? null;
  const isOutOfStock = stock !== null && stock === 0;
  const isLastUnit = stock !== null && stock === 1;
  const isLowStock =
    stock !== null && stock > 1 && stock <= LOW_STOCK_THRESHOLD;

  // Resolve images: prefer the array, fall back to legacy image_url
  const images: string[] =
    product.image_url && Array.isArray(product.image_url)
      ? product.image_url
      : product.image_url
        ? [product.image_url]
        : [];

  return (
    <>
      <motion.div
        dir="rtl"
        whileHover={isOutOfStock ? {} : { y: -6 }}
        className={`relative h-full flex flex-col bg-marketplace-card/50 backdrop-blur-sm rounded-3xl overflow-hidden border transition-all duration-300 shadow-md
          ${
            isOutOfStock
              ? "border-border/20 opacity-60 grayscale cursor-not-allowed"
              : isLastUnit
                ? "border-rose-500/40 hover:border-rose-400/70 hover:shadow-rose-500/15 hover:shadow-xl cursor-pointer group"
                : isLowStock
                  ? "border-amber-500/30 hover:border-amber-400/60 hover:shadow-amber-500/10 hover:shadow-xl cursor-pointer group"
                  : "border-border/40 hover:border-marketplace-accent/30 hover:shadow-xl cursor-pointer group"
          }
        `}
      >
        {/* ── Image / Slider ── */}
        <div className="relative aspect-square overflow-hidden m-2 rounded-2xl bg-muted/10">
          {images.length > 0 ? (
            <>
              {/* Out-of-stock overlay sits above the slider */}
              {isOutOfStock && (
                <div className="absolute inset-0 z-20 bg-marketplace-bg/60 flex flex-col items-center justify-center gap-2 backdrop-blur-[2px]">
                  <Ban
                    size={32}
                    className="text-marketplace-text-secondary/50"
                  />
                  <span className="text-xs font-black text-marketplace-text-secondary/70 uppercase tracking-widest">
                    نفدت الكمية
                  </span>
                </div>
              )}

              <ImageSlider
                image_url={images}
                alt={product.name}
                objectFit="cover"
                showDots={images.length > 1}
              />

              {/* Hover colour tint */}
              {!isOutOfStock && (
                <div
                  className={`absolute inset-0 z-10 pointer-events-none transition-colors duration-300 ${
                    isLastUnit
                      ? "bg-rose-400/0 group-hover:bg-rose-400/5"
                      : isLowStock
                        ? "bg-amber-400/0 group-hover:bg-amber-400/5"
                        : "bg-marketplace-accent/0 group-hover:bg-marketplace-accent/5"
                  }`}
                />
              )}
            </>
          ) : (
            <div className="w-full h-full bg-muted/10 flex items-center justify-center" />
          )}

          {/* Last unit badge */}
          {isLastUnit && (
            <div className="absolute top-2 right-2 z-30 flex items-center gap-1.5 bg-rose-500/90 backdrop-blur-sm text-white text-[10px] font-black px-3 py-1.5 rounded-full shadow-lg animate-pulse">
              <span>{`${stock} متبقية فقط`}</span>
              <Flame size={11} className="shrink-0" />
            </div>
          )}

          {/* Low stock badge */}
          {isLowStock && !isOutOfStock && (
            <div className="absolute top-2 right-2 z-30 flex items-center gap-1.5 bg-amber-500/90 backdrop-blur-sm text-white text-[10px] font-black px-3 py-1.5 rounded-full shadow-lg">
              <AlertTriangle size={11} className="shrink-0" />
              <span>{`${stock} متبقية فقط`}</span>
            </div>
          )}

          {/* Owner: stock count (hover, normal stock) */}
          {isOwner &&
            !isLowStock &&
            !isLastUnit &&
            !isOutOfStock &&
            stock !== null && (
              <div className="absolute top-2 right-2 z-30 bg-marketplace-card/80 backdrop-blur-sm border border-marketplace-border text-marketplace-text-secondary text-[10px] font-bold px-2.5 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                {stock} في المخزن
              </div>
            )}

          {/* Discount badge (top-left) */}
          {hasDiscount && !isOutOfStock && (
            <div className="absolute top-2 left-2 z-30 flex items-center gap-1 bg-marketplace-accent text-white text-[10px] font-black px-2.5 py-1.5 rounded-full shadow-lg">
              <Tag size={11} className="shrink-0" />
              <span>
                {pricing!.appliedDiscount?.discount_type === "fixed_amount"
                  ? `خصم ${pricing!.amountOff.toLocaleString("en-US")} د.ع`
                  : `خصم ${pricing!.percentOff}%`}
              </span>
            </div>
          )}
        </div>

        {/* ── Details ── */}
        <div className="p-5 text-right flex flex-col flex-1">
          <h4
            className={`font-bold text-marketplace-text-primary text-lg mb-1 line-clamp-1 transition-colors ${
              isOutOfStock
                ? "text-marketplace-text-secondary"
                : isLastUnit
                  ? "group-hover:text-rose-400"
                  : isLowStock
                    ? "group-hover:text-amber-400"
                    : "group-hover:text-marketplace-accent"
            }`}
          >
            {product.name}
          </h4>
          <p className="text-xs text-marketplace-text-secondary font-medium mb-4">
            {product.category}
          </p>

          <div className="flex items-center justify-between mt-auto pt-2">
            <div className="flex flex-col gap-0.5">
              {/* Original price (struck through) when discounted */}
              {hasDiscount && !isOutOfStock && (
                <span className="text-xs font-bold text-marketplace-text-secondary/60 line-through">
                  {product.price.toLocaleString("en-US")} د.ع
                </span>
              )}
              <div className="flex items-baseline gap-1">
                <span
                  className={`text-2xl font-black ${
                    isOutOfStock
                      ? "text-marketplace-text-secondary/50 line-through"
                      : isLastUnit
                        ? "text-rose-400"
                        : isLowStock
                          ? "text-amber-400"
                          : "text-marketplace-accent"
                  }`}
                >
                  {displayPrice.toLocaleString("en-US")}
                </span>
                <span
                  className={`text-xs font-bold opacity-80 ${
                    isOutOfStock
                      ? "text-marketplace-text-secondary/50"
                      : isLastUnit
                        ? "text-rose-400"
                        : isLowStock
                          ? "text-amber-400"
                          : "text-marketplace-accent"
                  }`}
                >
                  د.ع
                </span>
              </div>
            </div>

            {isOutOfStock && (
              <span className="text-[10px] font-black text-marketplace-text-secondary/50 bg-marketplace-bg/50 border border-marketplace-border px-2 py-1 rounded-lg">
                غير متاح
              </span>
            )}

            {/* Owner: Delete button */}
            {isOwner && onDelete && (
              <button
                title="حذف المنتج"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDeleteModal(true);
                }}
                className="ml-2 p-2 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white transition-colors cursor-pointer"
              >
                <Trash2 size={18} />
              </button>
            )}
          </div>
        </div>

        {/* Last unit bottom bar */}
        {isLastUnit && (
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-linear-to-r from-transparent via-rose-400/80 to-transparent" />
        )}

        {/* Low stock bottom bar */}
        {isLowStock && !isOutOfStock && (
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-linear-to-r from-transparent via-amber-400/60 to-transparent" />
        )}
      </motion.div>

      {/* Delete Modal */}
      <ConfirmDeleteModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={async () => {
          if (!onDelete) return;
          setIsDeleting(true);
          try {
            await onDelete(product.id);
            setShowDeleteModal(false);
          } finally {
            setIsDeleting(false);
          }
        }}
        title="تأكيد حذف المنتج"
        description={`هل أنت متأكد أنك تريد حذف المنتج "${product.name}"؟ لا يمكن التراجع عن هذا الإجراء.`}
        isLoading={isDeleting}
      />
    </>
  );
}
