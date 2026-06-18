"use client";

import {
  ImageUploadGrid,
  type PendingImage,
} from "@/app/_components/image/ImageUploadGrid";
import { CategorySelect } from "@/app/_components/ui/product/CategorySelect";
import {
  createProduct,
  uploadProductImages,
} from "@/app/_lib/data-services/products-service";
import { AnimatePresence, motion } from "framer-motion";
import {
  DollarSign,
  Hash,
  Loader2,
  Package,
  Tag,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";

type AddProductModalProps = {
  isOpen: boolean;
  onClose: () => void;
  storeId: string;
  onProductAdded: (product: unknown) => void;
  isAdmin?: boolean;
};

export function AddProductModal({
  isOpen,
  onClose,
  storeId,
  onProductAdded,
  isAdmin = false,
}: AddProductModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  // ── Multi-image state ──────────────────────────────────────────────────────
  const [existingImages] = useState<string[]>([]); // always empty for "add"
  const [pendingImages, setPendingImages] = useState<PendingImage[]>([]);

  const [form, setForm] = useState({
    name: "",
    price: "",
    description: "",
    stock_quantity: "",
    category_id: "",
  });

  // ── Init ───────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return;
    setForm({
      name: "",
      price: "",
      description: "",
      stock_quantity: "",
      category_id: "",
    });
    setPendingImages([]);
  }, [isOpen]);

  // Escape key
  useEffect(() => {
    const handle = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handle);
    return () => window.removeEventListener("keydown", handle);
  }, [onClose]);

  // ── Remove existing image (N/A in add flow, but required by ImageUploadGrid) ──
  const handleRemoveExisting = (_url: string) => {
    // No-op for add flow — existingImages is always empty
  };

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name || !form.price) {
      toast.error("يرجى ملء الحقول المطلوبة");
      return;
    }
    if (Number(form.price) < 0 || Number(form.stock_quantity) < 0) {
      toast.error("يرجى إدخال قيم موجبة للسعر والمخزون");
      return;
    }
    if (form.stock_quantity && !Number.isInteger(Number(form.stock_quantity))) {
      toast.error("الكمية يجب أن تكون عدداً صحيحاً بدون فواصل عشرية");
      return;
    }

    setIsLoading(true);
    try {
      // 1. Create the product first (no images yet)
      const newProduct = await createProduct({
        name: form.name,
        price: parseFloat(form.price) || 0,
        description: form.description,
        stock_quantity: Number(form.stock_quantity) || 0,
        category_id: form.category_id ? Number(form.category_id) : null,
        store_id: storeId,
        image_url: [],
      });

      // 2. Upload images (now we have the productId)
      let imageUrls: string[] = [];
      if (pendingImages.length > 0) {
        imageUrls = await uploadProductImages(
          storeId,
          pendingImages.map((p) => p.file),
          newProduct.id,
        );
      }

      // 3. Patch the product with the image URLs
      if (imageUrls.length > 0) {
        const { data: updatedProduct, error } = await (
          await import("@/app/_lib/supabase/client")
        ).supabase
          .from("products")
          .update({
            image_url: imageUrls,
          })
          .eq("id", newProduct.id)
          .select()
          .single();

        if (!error && updatedProduct) {
          toast.success("تمت إضافة المنتج بنجاح");
          onProductAdded(updatedProduct);
          onClose();
          return;
        }
      }

      toast.success("تمت إضافة المنتج بنجاح");
      onProductAdded(newProduct);
      onClose();
    } catch (err: any) {
      toast.error(err.message || "حدث خطأ أثناء الحفظ");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-2xl bg-marketplace-card border border-marketplace-border rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col"
          dir="rtl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* ── Header ── */}
          <div className="px-8 py-6 border-b border-marketplace-border flex items-center justify-between bg-linear-to-l from-marketplace-accent/5 to-transparent">
            <h2 className="text-xl font-black text-marketplace-text-primary flex items-center gap-3">
              <div className="p-2 bg-marketplace-accent/20 rounded-xl text-marketplace-accent">
                <Package size={20} />
              </div>
              إضافة منتج جديد
            </h2>
            <button
              onClick={onClose}
              className="p-2 cursor-pointer hover:bg-marketplace-card-hover rounded-full text-marketplace-text-secondary transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* ── Form Body ── */}
          <div className="flex-1 overflow-y-auto p-8 custom-scrollbar max-h-[70vh]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* ── Multi-image upload ── */}
              <div className="md:col-span-2">
                <ImageUploadGrid
                  existingImages={existingImages}
                  pendingImages={pendingImages}
                  onPendingChange={setPendingImages}
                  onRemoveExisting={handleRemoveExisting}
                  maxImages={6}
                  disabled={isLoading}
                />
              </div>

              {/* Name */}
              <div className="md:col-span-2 space-y-2">
                <label className="text-[11px] font-bold text-marketplace-text-secondary uppercase">
                  اسم المنتج
                </label>
                <div className="relative group">
                  <Tag
                    size={18}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-marketplace-text-secondary/50 group-focus-within:text-marketplace-accent transition-colors"
                  />
                  <input
                    type="text"
                    placeholder="مثال: آيفون 15 برو"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full bg-marketplace-bg border border-marketplace-border rounded-2xl py-3.5 pr-11 pl-4 text-marketplace-text-primary font-bold focus:border-marketplace-accent/50 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Price */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-marketplace-text-secondary uppercase">
                  السعر (د.ع)
                </label>
                <div className="relative group">
                  <DollarSign
                    size={18}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-marketplace-text-secondary/50 group-focus-within:text-marketplace-accent transition-colors"
                  />
                  <input
                    type="number"
                    placeholder="0.00"
                    value={form.price}
                    onChange={(e) =>
                      setForm({ ...form, price: e.target.value })
                    }
                    min="0"
                    className="w-full bg-marketplace-bg border border-marketplace-border rounded-2xl py-3.5 pr-11 pl-4 text-marketplace-text-primary font-black outline-none focus:border-marketplace-accent/50 transition-all"
                  />
                </div>
              </div>

              {/* Stock */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-marketplace-text-secondary uppercase">
                  الكمية المتوفرة
                </label>
                <div className="relative group">
                  <Hash
                    size={18}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-marketplace-text-secondary/50 group-focus-within:text-marketplace-accent transition-colors"
                  />
                  <input
                    type="number"
                    min="0"
                    step="1"
                    placeholder="0"
                    value={form.stock_quantity}
                    onKeyDown={(e) => {
                      if (e.key === "." || e.key === ",") e.preventDefault();
                    }}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val && !Number.isInteger(Number(val))) {
                        toast.error(
                          "الكمية يجب أن تكون عدداً صحيحاً بدون فواصل عشرية",
                        );
                        return;
                      }
                      setForm({ ...form, stock_quantity: val });
                    }}
                    className="w-full bg-marketplace-bg border border-marketplace-border rounded-2xl py-3.5 pr-11 pl-4 text-marketplace-text-primary font-bold outline-none focus:border-marketplace-accent/50 transition-all"
                  />
                </div>
                {form.stock_quantity !== "" && (
                  <p
                    className={`text-[11px] font-bold px-1 ${
                      Number(form.stock_quantity) === 0
                        ? "text-destructive"
                        : Number(form.stock_quantity) <= 5
                          ? "text-amber-400"
                          : "text-marketplace-text-secondary"
                    }`}
                  >
                    {Number(form.stock_quantity) === 0
                      ? "⚠ سيظهر المنتج كـ «نفدت الكمية»"
                      : Number(form.stock_quantity) <= 5
                        ? "⚡ سيظهر تحذير «كمية محدودة»"
                        : "✓ الكمية كافية"}
                  </p>
                )}
              </div>

              {/* Category */}
              <div className="md:col-span-2 space-y-2">
                <label className="text-[11px] font-bold text-marketplace-text-secondary uppercase">
                  الفئة
                  {isAdmin && (
                    <span className="mr-2 text-marketplace-accent/60 normal-case tracking-normal font-medium">
                      (يمكنك إضافة أو حذف الفئات)
                    </span>
                  )}
                </label>
                <CategorySelect
                  value={form.category_id}
                  onChange={(id) => setForm({ ...form, category_id: id })}
                  isAdmin={isAdmin}
                  disabled={isLoading}
                />
              </div>

              {/* Description */}
              <div className="md:col-span-2 space-y-2">
                <label className="text-[11px] font-bold text-marketplace-text-secondary uppercase">
                  وصف المنتج
                </label>
                <textarea
                  rows={4}
                  placeholder="اكتب تفاصيل المنتج هنا..."
                  value={form.description ?? ""}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  className="w-full bg-marketplace-bg border border-marketplace-border rounded-3xl py-4 px-5 text-marketplace-text-primary font-medium outline-none resize-none focus:border-marketplace-accent/50 transition-all"
                />
              </div>
            </div>
          </div>

          {/* ── Footer ── */}
          <div className="p-8 border-t border-marketplace-border flex items-center justify-end gap-4 bg-marketplace-card">
            <button
              onClick={onClose}
              className="px-6 py-3 cursor-pointer font-bold text-marketplace-text-secondary hover:text-marketplace-text-primary transition-all"
            >
              إلغاء
            </button>
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="min-w-45 flex cursor-pointer items-center justify-center gap-3 px-10 py-3 bg-marketplace-accent text-white rounded-xl font-black shadow-lg shadow-marketplace-accent/20 hover:opacity-90 active:scale-95 transition-all disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                "نشر المنتج"
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
