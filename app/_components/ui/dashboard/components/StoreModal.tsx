"use client";

import {
  adminUpsertStore,
  updateStore,
  uploadStoreLogo,
} from "@/app/_lib/data-services/admin-service";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  Camera,
  Check,
  ChevronDown,
  Link as LinkIcon,
  Loader2,
  MapPin,
  Phone,
  Store,
  Upload,
  UserCircle2,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-hot-toast";

// دالة معالجة الصورة: تغيير الحجم، الضغط، والتحويل إلى WebP
const processImage = async (file: File): Promise<File> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Failed to get canvas context"));
          return;
        }

        // تحديد أقصى أبعاد للصورة لضمان الحجم الصغير
        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 800;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;

        ctx.drawImage(img, 0, 0, width, height);

        // التحويل إلى WebP بجودة 80%
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const newFileName = file.name.replace(/\.[^/.]+$/, "") + ".webp";
              const newFile = new File([blob], newFileName, {
                type: "image/webp",
              });
              resolve(newFile);
            } else {
              reject(new Error("Canvas to Blob conversion failed"));
            }
          },
          "image/webp",
          0.8,
        );
      };
      img.onerror = (error) => reject(error);
    };
    reader.onerror = (error) => reject(error);
  });
};

export function StoreModal({
  isOpen,
  onClose,
  store,
  profiles = [],
  onSuccess,
}: any) {
  const [loading, setLoading] = useState(false);
  const isEdit = !!store;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    owner_id: "",
    name: "",
    slug: "",
    phone: "",
    logo_url: "",
    monthly_hosting_fee: "",
    commission_fee_per_sale: "",
    address: "",
    description: "",
    is_active: true,
    is_deleted: false,
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");

  useEffect(() => {
    if (store && isOpen) {
      setFormData({
        owner_id: store.ownerId || "",
        name: store.name || "",
        slug: store.slug || "",
        phone: store.phone || "",
        logo_url: store.logoUrl || "",
        monthly_hosting_fee: store.monthlyHostingFee?.toString() || "",
        commission_fee_per_sale: store.commissionFeePerSale?.toString() || "",
        address: store.address || "",
        description: store.description || "",
        is_active: store.isActive ?? true,
        is_deleted: store.isDeleted ?? false,
      });
      setPreviewUrl(store.logoUrl || "");
    } else {
      setFormData({
        owner_id: "",
        name: "",
        slug: "",
        phone: "",
        logo_url: "",
        monthly_hosting_fee: "",
        commission_fee_per_sale: "",
        address: "",
        description: "",
        is_active: true,
        is_deleted: false,
      });
      setPreviewUrl("");
      setSelectedFile(null);
    }
  }, [store, isOpen]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const processedFile = await processImage(file);
        setSelectedFile(processedFile);
        setPreviewUrl(URL.createObjectURL(processedFile));
      } catch (error) {
        console.error("Image processing failed:", error);
        // Fallback to original file if processing fails
        setSelectedFile(file);
        setPreviewUrl(URL.createObjectURL(file));
      }
    }
  };

  const handleSubmit = async () => {
    if (
      Number(formData.monthly_hosting_fee) < 0 ||
      Number(formData.commission_fee_per_sale) < 0
    ) {
      toast.error("يرجى إدخال قيم موجبة للرسوم");
      return;
    }
    setLoading(true);
    try {
      let finalLogoUrl = formData.logo_url;

      if (isEdit) {
        if (selectedFile) {
          finalLogoUrl =
            (await uploadStoreLogo(store.id, selectedFile)) ?? finalLogoUrl;
        }
        const submissionData = { ...formData, logo_url: finalLogoUrl };
        await updateStore(store.id, submissionData);
      } else {
        const newStore = await adminUpsertStore(undefined, {
          ...formData,
          logo_url: "",
        });

        if (selectedFile && newStore?.id) {
          finalLogoUrl =
            (await uploadStoreLogo(newStore.id, selectedFile)) ?? finalLogoUrl;
          await updateStore(newStore.id, {
            ...formData,
            logo_url: finalLogoUrl,
          });
        }
      }

      await onSuccess();
      onClose();
    } catch (error: any) {
      console.error("Operation failed:", error.message);
      toast.error(`حدث خطأ: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-2xl bg-marketplace-card border border-marketplace-border rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col"
          dir="rtl"
        >
          {/* Header */}
          <div className="px-8 py-6 border-b border-marketplace-border flex items-center justify-between bg-linear-to-l from-marketplace-accent/5 to-transparent flex-shrink-0">
            <h2 className="text-xl font-black text-marketplace-text-primary flex items-center gap-3">
              <div className="p-2 bg-marketplace-accent/20 rounded-xl text-marketplace-accent">
                <Store size={20} />
              </div>
              {isEdit ? "تعديل بيانات المتجر" : "إضافة متجر جديد"}
            </h2>
            <button
              onClick={onClose}
              className="p-2 cursor-pointer hover:bg-marketplace-text-secondary/10 rounded-full text-marketplace-text-secondary transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-8 custom-scrollbar max-h-[70vh]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Logo Upload */}
              <div className="md:col-span-2 space-y-3">
                <label className="text-[11px] font-bold text-marketplace-text-secondary uppercase tracking-widest px-1">
                  شعار المتجر
                </label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="relative h-48 w-full border-2 border-dashed border-marketplace-border rounded-[2.5rem] overflow-hidden group bg-marketplace-text-secondary/5 hover:border-marketplace-accent/40 transition-all cursor-pointer flex items-center justify-center"
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                  {previewUrl ? (
                    <>
                      <img
                        src={previewUrl}
                        alt="Logo"
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-background/60 opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-center gap-2 backdrop-blur-[2px]">
                        <Camera className="text-marketplace-accent" size={28} />
                        <span className="text-[10px] font-black text-marketplace-text-primary uppercase tracking-[0.2em]">
                          تغيير الصورة
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center gap-3">
                      <div className="p-4 bg-marketplace-text-secondary/10 rounded-full text-marketplace-text-secondary group-hover:text-marketplace-accent transition-colors">
                        <Upload size={24} />
                      </div>
                      <span className="text-xs font-bold text-marketplace-text-secondary/60">
                        اضغط لرفع الشعار
                      </span>
                    </div>
                  )}
                </div>
                {selectedFile && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center gap-2 px-4 py-2 bg-marketplace-accent/10 border border-marketplace-accent/20 rounded-xl"
                  >
                    <Check size={14} className="text-marketplace-accent" />
                    <span className="text-[10px] font-bold text-marketplace-accent">
                      صورة جديدة بانتظار الحفظ
                    </span>
                  </motion.div>
                )}
              </div>

              {/* Owner Selection */}
              <div className="md:col-span-2 space-y-2">
                <label className="text-[11px] font-bold text-marketplace-text-secondary uppercase tracking-wider">
                  المالك المرتبط
                </label>
                <div className="relative group">
                  <UserCircle2
                    size={18}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-marketplace-text-secondary/40 group-focus-within:text-marketplace-accent"
                  />
                  <select
                    value={formData.owner_id}
                    onChange={(e) =>
                      setFormData({ ...formData, owner_id: e.target.value })
                    }
                    className="w-full bg-marketplace-text-secondary/5 border border-marketplace-border focus:border-marketplace-accent/50 rounded-2xl py-3.5 pr-11 pl-10 outline-none text-marketplace-text-primary font-bold transition-all appearance-none cursor-pointer"
                  >
                    <option value="" className="bg-marketplace-card">
                      اختر حساباً...
                    </option>
                    {profiles.map((p: any) => (
                      <option
                        key={p.id}
                        value={p.id}
                        className="bg-marketplace-card"
                      >
                        {p.full_name || "بدون اسم"}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={16}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-marketplace-text-secondary/40 pointer-events-none"
                  />
                </div>
              </div>

              {/* Store Name */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-marketplace-text-secondary uppercase">
                  اسم المتجر
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full bg-marketplace-text-secondary/5 border border-marketplace-border rounded-2xl py-3.5 px-4 text-marketplace-text-primary font-bold focus:border-marketplace-accent/50 outline-none"
                />
              </div>

              {/* Slug */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-marketplace-text-secondary uppercase">
                  (بالإنجليزية حصرًا) الرابط المختصر
                </label>
                <div className="relative">
                  <LinkIcon
                    size={16}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-marketplace-text-secondary/40"
                  />
                  <input
                    dir="ltr"
                    type="text"
                    value={formData.slug}
                    onChange={(e) =>
                      setFormData({ ...formData, slug: e.target.value })
                    }
                    className="w-full bg-marketplace-text-secondary/5 border border-marketplace-border rounded-2xl py-3.5 pr-4 pl-10 text-marketplace-text-primary font-bold text-left outline-none focus:border-marketplace-accent/50"
                  />
                </div>
              </div>

              {/* Fees */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-marketplace-text-secondary uppercase">
                  رسوم الاستضافة (د.ع)
                </label>
                <input
                  type="number"
                  inputMode="decimal"
                  step="0.01"
                  value={formData.monthly_hosting_fee}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      monthly_hosting_fee: e.target.value,
                    })
                  }
                  min="0"
                  className="w-full bg-marketplace-text-secondary/5 border border-marketplace-border rounded-2xl py-3.5 px-4 text-marketplace-text-primary font-black outline-none focus:border-marketplace-accent/50"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold text-marketplace-text-secondary uppercase">
                  رسوم بيع كل منتج (د.ع)
                </label>
                <input
                  type="number"
                  value={formData.commission_fee_per_sale}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      commission_fee_per_sale: e.target.value,
                    })
                  }
                  min="0"
                  step="0.01"
                  inputMode="decimal"
                  className="w-full bg-marketplace-text-secondary/5 border border-marketplace-border rounded-2xl py-3.5 px-4 text-marketplace-text-primary font-black outline-none focus:border-marketplace-accent/50"
                />
              </div>

              {/* Phone */}
              <div className="md:col-span-2 space-y-2">
                <label className="text-[11px] font-bold text-marketplace-text-secondary uppercase">
                  رقم الهاتف
                </label>
                <div className="relative">
                  <Phone
                    size={16}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-marketplace-text-secondary/40"
                  />
                  <input
                    dir="ltr"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        phone: e.target.value,
                      })
                    }
                    className="w-full bg-marketplace-text-secondary/5 border border-marketplace-border rounded-2xl py-3.5 pr-4 pl-10 text-marketplace-text-primary font-bold text-left outline-none focus:border-marketplace-accent/50"
                  />
                </div>
              </div>

              {/* Address */}
              <div className="md:col-span-2 space-y-2">
                <label className="text-[11px] font-bold text-marketplace-text-secondary uppercase">
                  العنوان
                </label>
                <div className="relative">
                  <MapPin
                    size={16}
                    className="absolute right-4 top-4 text-marketplace-text-secondary/40"
                  />
                  <textarea
                    rows={2}
                    value={formData.address}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                    className="w-full bg-marketplace-text-secondary/5 border border-marketplace-border rounded-2xl py-3.5 pr-11 pl-4 text-marketplace-text-primary font-medium outline-none resize-none focus:border-marketplace-accent/50"
                  />
                </div>
              </div>
            </div>

            <div className="mt-8">
              <ToggleCard
                label="حالة المتجر"
                sub={formData.is_active ? "نشط حالياً" : "معطل مؤقتاً"}
                active={formData.is_active}
                icon={<AlertCircle size={18} />}
                onClick={() =>
                  setFormData({ ...formData, is_active: !formData.is_active })
                }
              />
            </div>
          </div>

          {/* Footer */}
          <div className="p-8 border-t border-marketplace-border flex items-center justify-end gap-4 bg-marketplace-text-secondary/5 flex-shrink-0">
            <button
              onClick={onClose}
              className="px-6 py-3 cursor-pointer font-bold text-marketplace-text-secondary hover:text-marketplace-text-primary transition-all"
            >
              إلغاء
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="min-w-[160px] flex cursor-pointer items-center justify-center gap-3 px-10 py-3 bg-marketplace-accent text-white rounded-xl font-black shadow-lg shadow-marketplace-accent/20 hover:opacity-90 active:scale-95 transition-all disabled:opacity-50"
            >
              {loading ? (
                <Loader2 size={20} className="animate-spin" />
              ) : isEdit ? (
                "تحديث البيانات"
              ) : (
                "إنشاء المتجر"
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

function ToggleCard({ label, sub, active, icon, onClick }: any) {
  return (
    <div
      onClick={onClick}
      className="flex items-center justify-between p-4 rounded-2xl bg-marketplace-text-secondary/5 border border-marketplace-border cursor-pointer hover:bg-marketplace-text-secondary/10 transition-all"
    >
      <div className="flex items-center gap-3">
        <div
          className={`p-2 rounded-lg transition-colors ${
            active
              ? "bg-marketplace-accent/20 text-marketplace-accent"
              : "bg-marketplace-text-secondary/10 text-marketplace-text-secondary/40"
          }`}
        >
          {icon}
        </div>
        <div>
          <p className="text-sm font-bold text-marketplace-text-primary">
            {label}
          </p>
          <p className="text-[10px] text-marketplace-text-secondary">{sub}</p>
        </div>
      </div>
      <div
        className={`w-10 h-5 rounded-full relative transition-colors ${
          active ? "bg-marketplace-accent" : "bg-marketplace-text-secondary/20"
        }`}
      >
        <motion.div
          animate={{ x: active ? -20 : 0 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          className="absolute top-1 right-1 w-3 h-3 rounded-full bg-white shadow-sm"
        />
      </div>
    </div>
  );
}
