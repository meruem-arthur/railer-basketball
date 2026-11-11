"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils/cn";
import { ImageViewer } from "@/components/gallery/image-viewer";

/**
 * A single photo that opens full-screen when clicked. The caller supplies the positioning and shape in `className`
 * (for example "relative aspect-[16/9]" or "absolute inset-0"); the photo fills that box.
 */
export function ZoomImage({
  src,
  alt,
  sizes,
  className,
  imgClassName,
  priority,
}: {
  src: string;
  alt: string;
  sizes: string;
  className?: string;
  imgClassName?: string;
  priority?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`View larger${alt ? `: ${alt}` : ""}`}
        className={cn("block cursor-zoom-in overflow-hidden", className)}
      >
        <Image src={src} alt={alt} fill sizes={sizes} priority={priority} className={cn("object-cover", imgClassName)} />
      </button>
      {open && <ImageViewer images={[{ id: src, secureUrl: src, altText: alt, caption: null }]} index={0} onClose={close} onChange={() => {}} />}
    </>
  );
}
