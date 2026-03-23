"use client";

import {
  adminUpsertProduct,
  getCategoriesForSelect,
  getStoresForSelect,
} from "@/app/_lib/data-services/admin-service";
import { uploadProductImage } from "@/app/_lib/data-services/products-service";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlignLeft,
  Camera,
  ChevronDown,
  DollarSign,
  Hash,
  Loader2,
  Package,
  Store,
  Tag,
  Upload,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-hot-toast";

// --- Helper Functions for Image Processing ---
async function loadHeic2any(): Promise<any> {
  if (typeof window === "undefined") return;
  if ((window as any).heic2any) return (window as any).heic2any;

  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/heic2any@0.0.4/dist/heic2any.js";
    script.onload = () => resolve((window as any).heic2any);
    script.onerror = () => reject(new Error("Failed to load heic2any library"));
    document.head.appendChild(script);
  });
}

async function resizeImageForStorage(
  file: File,
  maxWidth: number = 2000,
): Promise<File> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      let width = img.width;
      let height = img.height;

      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      ctx?.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (!blob) return reject(new Error("Canvas blob conversion failed"));
          const resizedFile = new File(
            [blob],
            file.name.replace(/\.[^.]+$/, ".webp"),
            { type: "image/webp" },
          );
          resolve(resizedFile);
        },
        "image/webp",
        0.85,
      );
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product?: any | null;
  onSuccess: () => void;
}

export function ProductModal({
  isOpen,
  onClose,
  product,
  onSuccess,
}: ProductModalProps) {
  const isEdit = !!product;
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [stores, setStores] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);

  const [form, setForm] = useState({
    name: "",
    price: "",
    description: "",
    stock_quantity: "",
    store_id: "",
    category_id: "",
    image_url: "",
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    async function init() {
      try {
        const [storesData, categoriesData] = await Promise.all([
          getStoresForSelect(),
          getCategoriesForSelect(),
        ]);
        setStores(storesData);
        setCategories(categoriesData);

        if (product) {
          const matchedStore = storesData.find(
            (s: any) =>
              s.id === product.store_id ||
              s.name === product.store ||
              s.name === product.stores?.name,
          );
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
            stock_quantity: String(
              product.stock_quantity ?? product.stock ?? 0,
            ),
            store_id: matchedStore?.id || "",
            category_id: matchedCategory?.id || "",
            image_url: product.image_url || "",
          });
          setPreviewUrl(product.image_url || "");
        } else {
          resetForm();
        }
      } catch {
        toast.error("فشل تحميل بيانات النموذج");
      }
    }
    init();
  }, [product, isOpen]);

  const resetForm = () => {
    setForm({
      name: "",
      price: "",
      description: "",
      stock_quantity: "",
      store_id: "",
      category_id: "",
      image_url: "",
    });
    setPreviewUrl("");
    setSelectedFile(null);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    const toastId = toast.loading("جاري معالجة الصورة...");
    try {
      let processedFile = file;

      // 1. Handle HEIC (iPhone)
      if (
        file.type === "image/heic" ||
        file.name.toLowerCase().endsWith(".heic")
      ) {
        const heic2any = await loadHeic2any();
        const convertedBlob = await heic2any({
          blob: file,
          toType: "image/jpeg",
        });
        processedFile = new File(
          Array.isArray(convertedBlob) ? convertedBlob : [convertedBlob],
          file.name.replace(/\.[^.]+$/, ".jpg"),
          { type: "image/jpeg" },
        );
      }

      // 2. Resize & Convert to WebP
      const finalFile = await resizeImageForStorage(processedFile);
      setSelectedFile(finalFile);
      setPreviewUrl(URL.createObjectURL(finalFile));
      toast.success("تمت المعالجة بنجاح", { id: toastId });
    } catch (err) {
      toast.error("فشل في معالجة الصورة", { id: toastId });
    } finally {
      setIsLoading(false);
    }
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.price || !form.store_id) {
      toast.error("يرجى اختيار المتجر وملء الحقول المطلوبة");
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
      let finalImageUrl: string | null = form.image_url;
      if (selectedFile) {
        finalImageUrl = await uploadProductImage(
          form.store_id,
          selectedFile,
          product?.id,
        );
      }

      const payload = {
        ...form,
        image_url: finalImageUrl,
        price: Number(form.price),
        stock_quantity: Number(form.stock_quantity) || 0,
        category_id: form.category_id ? Number(form.category_id) : null,
      };

      await adminUpsertProduct(product?.id, payload);
      toast.success(isEdit ? "تم التحديث بنجاح" : "تمت الإضافة بنجاح");
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.message || "حدث خطأ أثناء الحفظ");
    } finally {
      setIsLoading(false);
    }
  }

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
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
        >
          {/* Header */}
          <div className="px-8 py-6 border-b border-marketplace-border flex items-center justify-between bg-linear-to-l from-marketplace-accent/5 to-transparent">
            <h2 className="text-xl font-black text-marketplace-text-primary flex items-center gap-3">
              <div className="p-2 bg-marketplace-accent/20 rounded-xl text-marketplace-accent">
                <Package size={20} />
              </div>
              {isEdit ? "تعديل بيانات المنتج" : "إضافة منتج جديد"}
            </h2>
            <button
              onClick={onClose}
              className="p-2 cursor-pointer hover:bg-marketplace-card-hover rounded-full text-marketplace-text-secondary transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Form Content */}
          <div className="flex-1 overflow-y-auto p-8 custom-scrollbar max-h-[70vh]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Image Upload Area */}
              <div className="md:col-span-2 space-y-3">
                <label className="text-[11px] font-bold text-marketplace-text-secondary uppercase tracking-widest px-1">
                  صورة المنتج
                </label>
                <div
                  onClick={() => !isLoading && fileInputRef.current?.click()}
                  className={`relative h-56 w-full border-2 border-dashed border-marketplace-border rounded-[2.5rem] overflow-hidden group bg-marketplace-bg hover:border-marketplace-accent/40 transition-all cursor-pointer flex items-center justify-center ${isLoading ? "opacity-50 cursor-wait" : ""}`}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*,image/heic"
                    onChange={handleFileChange}
                  />
                  {isLoading && (
                    <div className="absolute inset-0 z-20 bg-black/60 backdrop-blur-[2px] flex flex-col items-center justify-center gap-3 rounded-[2.5rem]">
                      <Loader2
                        className="text-marketplace-accent animate-spin"
                        size={32}
                      />
                      <span className="text-[11px] font-black text-white tracking-wide">
                        جاري معالجة الصورة...
                      </span>
                    </div>
                  )}
                  {previewUrl ? (
                    <>
                      <img
                        src={previewUrl}
                        alt="Product"
                        className="absolute inset-0 w-full h-full object-contain p-4 transition-transform duration-1000 group-hover:scale-110"
                      />
                      {!isLoading && (
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-center gap-2 backdrop-blur-[2px]">
                          <Camera
                            className="text-marketplace-accent"
                            size={28}
                          />
                          <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">
                            تغيير الصورة
                          </span>
                        </div>
                      )}
                    </>
                  ) : (
                    !isLoading && (
                      <div className="flex flex-col items-center gap-3">
                        <div className="p-4 bg-marketplace-card rounded-full border border-marketplace-border text-marketplace-text-secondary group-hover:text-marketplace-accent transition-colors">
                          <Upload size={24} />
                        </div>
                        <span className="text-xs font-bold text-marketplace-text-secondary">
                          اضغط لرفع صورة المنتج (يدعم صور الآيفون)
                        </span>
                      </div>
                    )
                  )}
                </div>
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
                    min="0"
                    step="1"
                    className="w-full bg-marketplace-bg border border-marketplace-border rounded-2xl py-3.5 pr-11 pl-4 text-marketplace-text-primary font-bold outline-none focus:border-marketplace-accent/50 transition-all"
                  />
                </div>
              </div>

              {/* Store Select */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-marketplace-text-secondary uppercase">
                  المتجر
                </label>
                <div className="relative group">
                  <Store
                    size={18}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-marketplace-text-secondary/50 group-focus-within:text-marketplace-accent transition-colors"
                  />
                  <select
                    value={form.store_id}
                    onChange={(e) =>
                      setForm({ ...form, store_id: e.target.value })
                    }
                    className="w-full bg-marketplace-bg border border-marketplace-border focus:border-marketplace-accent/50 rounded-2xl py-3.5 pr-11 pl-10 outline-none text-marketplace-text-primary font-bold transition-all appearance-none cursor-pointer"
                  >
                    <option value="">اختر متجراً...</option>
                    {stores.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={16}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-marketplace-text-secondary/50 pointer-events-none"
                  />
                </div>
              </div>

              {/* Category Select */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-marketplace-text-secondary uppercase">
                  الفئة
                </label>
                <div className="relative group">
                  <AlignLeft
                    size={18}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-marketplace-text-secondary/50 group-focus-within:text-marketplace-accent transition-colors"
                  />
                  <select
                    value={form.category_id}
                    onChange={(e) =>
                      setForm({ ...form, category_id: e.target.value })
                    }
                    className="w-full bg-marketplace-bg border border-marketplace-border focus:border-marketplace-accent/50 rounded-2xl py-3.5 pr-11 pl-10 outline-none text-marketplace-text-primary font-bold transition-all appearance-none cursor-pointer"
                  >
                    <option value="">بدون فئة</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={16}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-marketplace-text-secondary/50 pointer-events-none"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="md:col-span-2 space-y-2">
                <label className="text-[11px] font-bold text-marketplace-text-secondary uppercase">
                  وصف المنتج
                </label>
                <textarea
                  rows={4}
                  placeholder="اكتب تفاصيل المنتج هنا..."
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  className="w-full bg-marketplace-bg border border-marketplace-border rounded-[1.5rem] py-4 px-5 text-marketplace-text-primary font-medium outline-none resize-none focus:border-marketplace-accent/50 transition-all"
                />
              </div>
            </div>
          </div>

          {/* Footer Buttons */}
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
              className="min-w-[180px] flex cursor-pointer items-center justify-center gap-3 px-10 py-3 bg-marketplace-accent text-white rounded-xl font-black shadow-lg shadow-marketplace-accent/20 hover:opacity-90 active:scale-95 transition-all disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 size={20} className="animate-spin" />
              ) : isEdit ? (
                "حفظ التعديلات"
              ) : (
                "إضافة المنتج"
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
