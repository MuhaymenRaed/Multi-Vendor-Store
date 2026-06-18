"use client";

import {
  ImageUploadGrid,
  type PendingImage,
} from "@/app/_components/image/ImageUploadGrid";
import { getCategoriesForSelect } from "@/app/_lib/data-services/admin-service";
import { CategorySelect } from "@/app/_components/ui/product/CategorySelect";
import {
  deleteProductImage,
  updateProduct,
  uploadProductImages,
} from "@/app/_lib/data-services/products-service";
import { AnimatePresence, motion } from "framer-motion";
import {
  Check,
  DollarSign,
  Hash,
  Loader2,
  Package,
  Tag,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";

interface ManageProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: any | null;
  storeId: string;
  onProductUpdated: (updated: any) => void;
  isAdmin?: boolean;
}

export function ManageProductModal({
  isOpen,
  onClose,
  product,
  storeId,
  onProductUpdated,
  isAdmin = false,
}: ManageProductModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);

  // ── Multi-image state ──────────────────────────────────────────────────────
  // existingImages = URLs already in the database (saved)
  const [existingImages, setExistingImages] = useState<string[]>([]);
  // pendingImages = local files not yet uploaded
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
    if (!isOpen || !product) return;

    async function init() {
      try {
        const categoriesData = await getCategoriesForSelect();
        setCategories(categoriesData);

        const matchedCategory = categoriesData.find(
          (c: any) =>
            c.id === product.category_id ||
            c.name === product.category ||
            c.name === product.categories?.name,
        );

        setForm({
          name: product.name || "",
          price: String(product.price || ""),
          description: product.description || "",
          stock_quantity: String(product.stock_quantity ?? product.stock ?? 0),
          category_id: matchedCategory?.id || "",
        });

        // Populate existing images: prefer the image_url[] array, fall back to image_url
        const imgs: string[] =
          product.image_url && product.image_url.length > 0
            ? Array.isArray(product.image_url)
              ? product.image_url
              : [product.image_url]
            : [];

        setExistingImages(imgs);
        setPendingImages([]);
      } catch {
        toast.error("فشل تحميل بيانات المنتج");
      }
    }

    init();
  }, [product, isOpen]);

  // ── Delete a single existing image from storage + state ───────────────────
  const handleRemoveExisting = async (url: string) => {
    // Optimistic UI update first
    setExistingImages((prev) => prev.filter((u) => u !== url));
    try {
      await deleteProductImage(url);
    } catch {
      // Revert on failure
      setExistingImages((prev) => [...prev, url]);
      toast.error("فشل حذف الصورة، حاول مرة أخرى");
    }
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
      // Upload new images
      let newUrls: string[] = [];
      if (pendingImages.length > 0) {
        newUrls = await uploadProductImages(
          storeId,
          pendingImages.map((p) => p.file),
          product.id,
        );
      }

      // Merge existing (minus deleted) with newly uploaded
      const allImages = [...existingImages, ...newUrls];

      const updated = await updateProduct(product.id, {
        name: form.name,
        price: Number(form.price),
        description: form.description,
        stock_quantity: Number(form.stock_quantity) || 0,
        category_id: form.category_id ? Number(form.category_id) : null,
        image_url: allImages,
      });

      toast.success("تم التحديث بنجاح");
      onProductUpdated(updated);
      onClose();
    } catch (err: any) {
      toast.error(err.message || "حدث خطأ أثناء الحفظ");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen || !product) return null;

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
          className="relative w-full max-w-2xl bg-marketplace-card border border-marketplace-border rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col"
          dir="rtl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-8 py-6 border-b border-marketplace-border flex items-center justify-between bg-linear-to-l from-marketplace-accent/5 to-transparent">
            <h2 className="text-xl font-black text-marketplace-text-primary flex items-center gap-3">
              <div className="p-2 bg-marketplace-accent/20 rounded-xl text-marketplace-accent">
                <Package size={20} />
              </div>
              تعديل بيانات المنتج
            </h2>
            <button
              onClick={onClose}
              className="p-2 cursor-pointer hover:bg-marketplace-card-hover rounded-full text-marketplace-text-secondary transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Form */}
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
                    placeholder="اسم المنتج"
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

          {/* Footer */}
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
                <>
                  <Check size={18} />
                  حفظ التعديلات
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
