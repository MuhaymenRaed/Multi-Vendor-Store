"use client";

import { loadHeic2any } from "@/app/_components/image/loadHeic2any";
import { resizeImageForStorage } from "@/app/_components/image/resizeImageForStorage";
import { SmartImage } from "@/app/_components/image/SmartImage";
import { ImagePlus, Loader2, X } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "react-hot-toast";

// ── Types ──────────────────────────────────────────────────────────────────────

export interface PendingImage {
  /** Stable client-side ID for React key / removal */
  id: string;
  file: File;
  previewUrl: string;
}

interface ImageUploadGridProps {
  /** Already-uploaded URLs stored in the database */
  existingImages: string[];
  /** Local files not yet uploaded — parent owns this state */
  pendingImages: PendingImage[];
  onPendingChange: (images: PendingImage[]) => void;
  /** Called when the user clicks ✕ on an existing image */
  onRemoveExisting: (url: string) => void;
  maxImages?: number;
  disabled?: boolean;
}

// ── Component ──────────────────────────────────────────────────────────────────

export function ImageUploadGrid({
  existingImages,
  pendingImages,
  onPendingChange,
  onRemoveExisting,
  maxImages = 6,
  disabled = false,
}: ImageUploadGridProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const totalCount = existingImages.length + pendingImages.length;
  const canAddMore = totalCount < maxImages && !disabled;

  // ── File handling ────────────────────────────────────────────────────────────

  const processFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const slots = maxImages - totalCount;
    if (slots <= 0) {
      toast.error(`الحد الأقصى ${maxImages} صور`);
      return;
    }

    const toProcess = Array.from(files).slice(0, slots);
    setIsProcessing(true);
    const toastId = toast.loading(`جاري معالجة ${toProcess.length} صورة...`);

    try {
      const newPending: PendingImage[] = [];

      for (const file of toProcess) {
        let processedFile = file;

        // HEIC → JPEG
        if (
          file.type === "image/heic" ||
          file.name.toLowerCase().endsWith(".heic")
        ) {
          const heic2any = await loadHeic2any();
          const converted = await heic2any({
            blob: file,
            toType: "image/jpeg",
          });
          processedFile = new File(
            Array.isArray(converted) ? converted : [converted],
            file.name.replace(/\.[^.]+$/, ".jpg"),
            { type: "image/jpeg" },
          );
        }

        // Resize & convert to WebP
        const finalFile = await resizeImageForStorage(processedFile, 2000);

        newPending.push({
          id: `${Date.now()}_${Math.random().toString(36).slice(2)}`,
          file: finalFile,
          previewUrl: URL.createObjectURL(finalFile),
        });
      }

      onPendingChange([...pendingImages, ...newPending]);
      toast.success(`تمت إضافة ${newPending.length} صورة`, { id: toastId });
    } catch {
      toast.error("فشل في معالجة الصور", { id: toastId });
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removePending = (id: string) => {
    onPendingChange(pendingImages.filter((p) => p.id !== id));
  };

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-3">
      {/* Label */}
      <div className="flex items-center justify-between px-1">
        <label className="text-[11px] font-bold text-marketplace-text-secondary uppercase tracking-widest">
          صور المنتج
        </label>
        <span className="text-[11px] font-bold text-marketplace-text-secondary/60">
          {totalCount} / {maxImages}
        </span>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-3 gap-3">
        {/* ── Existing (saved) images ── */}
        {existingImages.map((url) => (
          <div
            key={url}
            className="relative aspect-square rounded-2xl overflow-hidden border border-marketplace-border group/thumb bg-marketplace-bg"
          >
            <SmartImage
              src={url}
              alt="صورة محفوظة"
              className="w-full h-full object-cover transition-transform duration-300 group-hover/thumb:scale-105"
            />

            {/* Delete button */}
            {!disabled && (
              <button
                type="button"
                onClick={() => onRemoveExisting(url)}
                aria-label="حذف الصورة"
                className="absolute cursor-pointer top-1.5 right-1.5 z-10 p-1 rounded-full
                           bg-red-500 text-white
                           opacity-0 group-hover/thumb:opacity-100
                           transition-opacity hover:bg-red-600"
              >
                <X size={11} strokeWidth={3} />
              </button>
            )}

            {/* Badge */}
            <div
              className="absolute bottom-1.5 left-1.5 text-[9px] font-black
                            bg-black/60 backdrop-blur-sm text-white px-1.5 py-0.5 rounded-full"
            >
              محفوظة
            </div>
          </div>
        ))}

        {/* ── Pending (local preview) images ── */}
        {pendingImages.map((img) => (
          <div
            key={img.id}
            className="relative aspect-square rounded-2xl overflow-hidden border border-marketplace-accent/40 group/thumb bg-marketplace-bg"
          >
            <SmartImage
              src={img.previewUrl}
              alt="معاينة"
              className="w-full h-full object-cover transition-transform duration-300 group-hover/thumb:scale-105"
            />

            {/* Delete button */}
            <button
              type="button"
              onClick={() => removePending(img.id)}
              aria-label="إزالة الصورة"
              className="absolute cursor-pointer top-1.5 right-1.5 z-10 p-1 rounded-full
                         bg-red-500 text-white
                         opacity-0 group-hover/thumb:opacity-100
                         transition-opacity hover:bg-red-600"
            >
              <X size={11} strokeWidth={3} />
            </button>

            {/* Badge */}
            <div
              className="absolute bottom-1.5 left-1.5 text-[9px] font-black
                            bg-marketplace-accent/80 backdrop-blur-sm text-white px-1.5 py-0.5 rounded-full"
            >
              جديدة
            </div>
          </div>
        ))}

        {/* ── Add-more slot ── */}
        {canAddMore && (
          <button
            type="button"
            onClick={() => !isProcessing && fileInputRef.current?.click()}
            disabled={isProcessing || disabled}
            className="aspect-square rounded-2xl border-2 border-dashed border-marketplace-border
                       hover:border-marketplace-accent/50 bg-marketplace-bg
                       flex flex-col items-center justify-center gap-2
                       transition-all cursor-pointer group/add
                       disabled:opacity-50 disabled:cursor-wait"
          >
            {isProcessing ? (
              <Loader2
                className="text-marketplace-accent animate-spin"
                size={22}
              />
            ) : (
              <>
                <div
                  className="p-2 bg-marketplace-card rounded-xl border border-marketplace-border
                                text-marketplace-text-secondary group-hover/add:text-marketplace-accent
                                group-hover/add:border-marketplace-accent/30 transition-colors"
                >
                  <ImagePlus size={18} />
                </div>
                <span
                  className="text-[10px] font-bold text-marketplace-text-secondary
                                 group-hover/add:text-marketplace-accent transition-colors"
                >
                  إضافة صورة
                </span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Empty state hint */}
      {totalCount === 0 && (
        <p className="text-[11px] text-marketplace-text-secondary/50 px-1">
          أضف حتى {maxImages} صور — يدعم HEIC وجميع صيغ الصور
        </p>
      )}

      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*,image/heic"
        multiple
        onChange={(e) => processFiles(e.target.files)}
      />
    </div>
  );
}
