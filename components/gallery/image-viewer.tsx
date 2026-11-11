"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

export interface LightboxImage {
  id: string;
  secureUrl: string;
  altText: string;
  caption: string | null;
}

/**
 * Full-screen photo viewer. The whole photo is shown (never cropped) at the largest size that fits the screen.
 * Esc closes, ← → navigate, and on touch screens a horizontal swipe changes photo.
 */
export function ImageViewer({
  images,
  index,
  onClose,
  onChange,
}: {
  images: LightboxImage[];
  index: number;
  onClose: () => void;
  onChange: (i: number) => void;
}) {
  const total = images.length;
  const startX = useRef<number | null>(null);
  const go = (d: number) => onChange((index + d + total) % total);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (total > 1 && e.key === "ArrowRight") onChange((index + 1) % total);
      if (total > 1 && e.key === "ArrowLeft") onChange((index - 1 + total) % total);
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [index, total, onClose, onChange]);

  const img = images[index];
  const nav = "absolute top-1/2 z-10 -translate-y-1/2 bg-rail-bg/50 p-2 text-rail-white hover:text-rail-gold";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Photo viewer"
      className="fixed inset-0 z-50 flex flex-col bg-black/95"
      onClick={onClose}
      onPointerDown={(e) => {
        startX.current = e.clientX;
      }}
      onPointerUp={(e) => {
        if (startX.current !== null && total > 1) {
          const dx = e.clientX - startX.current;
          if (Math.abs(dx) > 60) go(dx < 0 ? 1 : -1);
        }
        startX.current = null;
      }}
    >
      <div className="flex shrink-0 items-center justify-between px-4 py-3 text-rail-white">
        <span className="text-sm tabular-nums text-rail-silver">{total > 1 ? `${index + 1} / ${total}` : ""}</span>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          aria-label="Close"
          className="p-2 hover:text-rail-gold"
        >
          <X className="h-6 w-6" />
        </button>
      </div>

      <div className="relative min-h-0 flex-1">
        <Image key={img.secureUrl} src={img.secureUrl} alt={img.altText} fill sizes="100vw" className="object-contain" priority />
        {total > 1 && (
          <>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                go(-1);
              }}
              aria-label="Previous photo"
              className={`${nav} left-2 sm:left-6`}
            >
              <ChevronLeft className="h-8 w-8" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                go(1);
              }}
              aria-label="Next photo"
              className={`${nav} right-2 sm:right-6`}
            >
              <ChevronRight className="h-8 w-8" />
            </button>
          </>
        )}
      </div>

      {img.caption && <p className="shrink-0 px-4 py-3 text-center text-sm text-rail-silver">{img.caption}</p>}
    </div>
  );
}
