"use client";

import Image from "next/image";
import { useState } from "react";
import { canOptimizeImage, checkImageUrl } from "@/lib/images";
import { cn } from "@/lib/utils";

type SiteImageProps = {
  src: string | null | undefined;
  alt: string;
  /** CSS aspect-ratio, e.g. "16 / 10". The box reserves space to avoid layout shift. */
  aspect?: string;
  sizes?: string;
  priority?: boolean;
  fit?: "cover" | "contain";
  className?: string;
  imgClassName?: string;
  /** Label shown in the placeholder when there is no image or it fails to load. */
  placeholderLabel?: string;
};

/**
 * Renders an externally hosted (or /public) image inside a fixed aspect-ratio box.
 * Allow-listed hosts go through next/image; others use a lazy native <img>.
 * Broken or missing images degrade to a quiet placeholder instead of a broken icon.
 */
export function SiteImage({
  src,
  alt,
  aspect = "16 / 10",
  sizes = "100vw",
  priority = false,
  fit = "cover",
  className,
  imgClassName,
  placeholderLabel,
}: SiteImageProps) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const check = checkImageUrl(src);
  const url = check.ok && check.kind !== "empty" ? check.url : null;
  const failed = url !== null && failedSrc === url;

  return (
    <div className={cn("relative overflow-hidden bg-surface", className)} style={{ aspectRatio: aspect }}>
      {url && !failed ? (
        canOptimizeImage(url) ? (
          <Image
            src={url}
            alt={alt}
            fill
            sizes={sizes}
            priority={priority}
            className={cn(fit === "cover" ? "object-cover" : "object-contain", imgClassName)}
            onError={() => setFailedSrc(url)}
          />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element -- host is not allow-listed for optimization
          <img
            src={url}
            alt={alt}
            loading={priority ? "eager" : "lazy"}
            decoding="async"
            referrerPolicy="no-referrer"
            className={cn("absolute inset-0 h-full w-full", fit === "cover" ? "object-cover" : "object-contain", imgClassName)}
            onError={() => setFailedSrc(url)}
          />
        )
      ) : (
        <div
          className="absolute inset-0 flex items-end p-4"
          role={alt ? "img" : undefined}
          aria-label={alt || undefined}
          style={{
            backgroundImage:
              "repeating-linear-gradient(135deg, rgb(var(--rule) / 0.6) 0 1px, transparent 1px 12px)",
          }}
        >
          <span className="label">{failed ? "Image unavailable" : (placeholderLabel ?? "No image")}</span>
        </div>
      )}
    </div>
  );
}
