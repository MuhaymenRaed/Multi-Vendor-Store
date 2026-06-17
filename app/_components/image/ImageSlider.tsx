"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { SmartImage } from "@/app/_components/image/SmartImage";
import { useCallback, useState, useEffect } from "react";

interface ImageSliderProps {
  image_url: string[];
  alt: string;
  className?: string;
  /** Whether to show dot indicators. Default: true */
  showDots?: boolean;
  /** "cover" for cards, "contain" for modals. Default: "cover" */
  objectFit?: "cover" | "contain";
  initialSlide?: number;
  onSlideChange?: (index: number) => void;
  showArrows?: boolean;
}

export function ImageSlider({
  image_url,
  alt,
  className = "",
  showDots = true,
  objectFit = "cover",
  initialSlide = 0,
  onSlideChange,
  showArrows = true,
}: ImageSliderProps) {
  const [current, setCurrent] = useState(initialSlide);

  useEffect(() => {
    setCurrent(initialSlide);
  }, [initialSlide]);

  const goPrev = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      setCurrent((i) => {
        const newIndex = Math.max(0, i - 1);
        if (onSlideChange) onSlideChange(newIndex);
        return newIndex;
      });
    },
    [onSlideChange],
  );

  const goNext = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      setCurrent((i) => {
        const newIndex = Math.min(image_url.length - 1, i + 1);
        if (onSlideChange) onSlideChange(newIndex);
        return newIndex;
      });
    },
    [image_url.length, onSlideChange],
  );

  const goTo = useCallback(
    (e: React.MouseEvent, idx: number) => {
      e.stopPropagation();
      setCurrent(() => {
        if (onSlideChange) onSlideChange(idx);
        return idx;
      });
    },
    [onSlideChange],
  );

  if (!image_url || image_url.length === 0) {
    return <div className={`w-full h-full bg-muted/10 ${className}`} />;
  }

  if (image_url.length === 1) {
    return (
      <SmartImage
        src={image_url[0]}
        alt={alt}
        fill
        className={`w-full h-full ${objectFit === "cover" ? "object-cover" : "object-contain p-4"} ${className}`}
      />
    );
  }

  return (
    <div
      className={`relative w-full h-full group/slider overflow-hidden ${className}`}
    >
      {/* ── Preloaded Image Stack ── */}
      {image_url.map((url, index) => (
        <div
          key={url}
          className={`absolute inset-0 transition-opacity duration-300 ease-in-out select-none ${
            index === current ? "opacity-100 z-0" : "opacity-0 -z-10"
          }`}
        >
          <SmartImage
            src={url}
            alt={`${alt} — صورة ${index + 1} من ${image_url.length}`}
            fill
            className={`w-full h-full ${
              objectFit === "cover" ? "object-cover" : "object-contain p-4"
            }`}
          />
        </div>
      ))}

      {/* ── Prev arrow ── */}
      {showArrows && current > 0 && (
        <button
          onClick={goPrev}
          className="absolute cursor-pointer left-2 top-1/2 -translate-y-1/2 z-10 p-1.5 rounded-full bg-black/50 backdrop-blur-sm text-white opacity-100 md:opacity-0 md:group-hover/slider:opacity-100 transition-opacity duration-200 hover:bg-black/70"
        >
          <ChevronLeft size={15} strokeWidth={2.5} />
        </button>
      )}

      {/* ── Next arrow ── */}
      {showArrows && current < image_url.length - 1 && (
        <button
          onClick={goNext}
          className="absolute cursor-pointer right-2 top-1/2 -translate-y-1/2 z-10 p-1.5 rounded-full bg-black/50 backdrop-blur-sm text-white opacity-100 md:opacity-0 md:group-hover/slider:opacity-100 transition-opacity duration-200 hover:bg-black/70"
        >
          <ChevronRight size={15} strokeWidth={2.5} />
        </button>
      )}

      {/* ── Dot indicators ── */}
      {showDots && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1">
          {image_url.map((_, i) => (
            <button
              key={i}
              onClick={(e) => goTo(e, i)}
              className={`rounded-full cursor-pointer transition-all duration-300 ${
                i === current
                  ? "w-4 h-1.5 bg-white shadow"
                  : "w-1.5 h-1.5 bg-white/50"
              }`}
            />
          ))}
        </div>
      )}

      {/* ── UPDATED: Image counter badge (Now Top-Middle) ── */}
      <div
        className="absolute top-2 left-1/2 -translate-x-1/2 z-10 text-[10px] font-black
                   bg-black/50 backdrop-blur-sm text-white px-2 py-0.5 rounded-full
                   opacity-100 md:opacity-0 md:group-hover/slider:opacity-100 transition-opacity duration-200"
      >
        {current + 1} / {image_url.length}
      </div>
    </div>
  );
}
