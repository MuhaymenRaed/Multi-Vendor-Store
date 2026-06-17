"use client";

import Image, { ImageProps } from "next/image";

const SUPERHOME_UPLOADS_BASE = "https://superhome-iraq.store/";
const SUPABASE_STORAGE_BASE =
  "https://nmawdgekleauyusygqot.supabase.co/storage/v1/object/public/";

export function buildImageSrc(src?: string | string[] | null) {
  if (!src) return "";
  const normalizedSrc = Array.isArray(src) ? (src.find(Boolean) ?? "") : src;
  if (!normalizedSrc) return "";
  const trimmedSrc = normalizedSrc.trim();

  if (trimmedSrc.startsWith("http://") || trimmedSrc.startsWith("https://")) {
    return encodeURI(trimmedSrc);
  }

  if (trimmedSrc.startsWith("//")) {
    return encodeURI(`https:${trimmedSrc}`);
  }

  if (trimmedSrc.startsWith("blob:") || trimmedSrc.startsWith("data:")) {
    return trimmedSrc;
  }

  const trimmed = trimmedSrc.replace(/^\/+/, "");

  if (
    trimmed.startsWith("wp-content/uploads/") ||
    trimmed.startsWith("uploads/") ||
    trimmed.startsWith("superhome-iraq.store/") ||
    trimmed.startsWith("www.superhome-iraq.store/")
  ) {
    return encodeURI(
      `${SUPERHOME_UPLOADS_BASE}${trimmed.replace(/^((www\.)?superhome-iraq\.store\/)?/, "")}`,
    );
  }

  if (trimmed.startsWith("storage/v1/object/public/")) {
    return encodeURI(`https://nmawdgekleauyusygqot.supabase.co/${trimmed}`);
  }

  if (
    trimmed.startsWith("products/stores/") ||
    trimmed.startsWith("galary/") ||
    trimmed.startsWith("stores/")
  ) {
    return encodeURI(`${SUPABASE_STORAGE_BASE}${trimmed}`);
  }

  return encodeURI(trimmedSrc);
}

export function isBlobOrDataUrl(src?: string | null) {
  return !!src && (src.startsWith("blob:") || src.startsWith("data:"));
}

export interface SmartImageProps extends Omit<ImageProps, "src" | "alt"> {
  src?: string | string[] | null;
  alt?: string;
  onLoad?: () => void;
}

export function SmartImage({
  src,
  alt = "",
  onLoad,
  fill,
  ...props
}: SmartImageProps) {
  const finalSrc = buildImageSrc(src);
  if (!finalSrc) return null;

  const safeProps = props as Omit<ImageProps, "src" | "alt">;
  const { width, height, className, style, sizes, ...restProps } = safeProps;
  const isRemote =
    finalSrc.startsWith("http://") || finalSrc.startsWith("https://");
  const shouldFill =
    fill !== undefined ? fill : width === undefined && height === undefined;
  const isProblematicRemote =
    isRemote &&
    (finalSrc.includes("superhome-iraq.store") ||
      finalSrc.includes("supabase.co"));
  const defaultSizes = shouldFill ? (sizes ?? "100vw") : sizes;

  if (isBlobOrDataUrl(finalSrc) || isProblematicRemote) {
    return (
      <img
        src={finalSrc}
        alt={alt}
        onLoad={onLoad}
        className={className}
        style={style}
        {...(restProps as React.ImgHTMLAttributes<HTMLImageElement>)}
      />
    );
  }

  const sharedImageProps = {
    className,
    style,
    onLoadingComplete: onLoad,
    sizes: defaultSizes,
    ...restProps,
  } as Omit<ImageProps, "src" | "alt">;

  if (shouldFill) {
    return <Image src={finalSrc} alt={alt} fill {...sharedImageProps} />;
  }

  return (
    <Image
      src={finalSrc}
      alt={alt}
      width={width}
      height={height}
      {...sharedImageProps}
    />
  );
}
