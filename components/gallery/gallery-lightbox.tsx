"use client";

import { useState, useCallback, useEffect } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

export interface LightboxImage {
  id: string;
  secureUrl: string;
  altText: string;
  caption: string | null;
}

export function GalleryLightbox({ images }: { images: LightboxImage[] }) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const close = useCallback(() => setActiveIndex(null), []);
  const next = useCallback(
    () => setActiveIndex((i) => (i === null ? null : (i + 1) % images.length)),
    [images.length]
  );
  const prev = useCallback(
    () => setActiveIndex((i) => (i === null ? null : (i - 1 + images.length) % images.length)),
    [images.length]
  );

  useEffect(() => {
    if (activeIndex === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [activeIndex, close, next, prev]);

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {images.map((img, i) => (
          <button
            key={img.id}
            onClick={() => setActiveIndex(i)}
            className="relative aspect-square overflow-hidden border border-rail-line group"
            aria-label={`View photo: ${img.altText}`}
          >
            <Image
              src={img.secureUrl}
              alt={img.altText}
              fill
              sizes="(max-width: 640px) 50vw, 33vw"
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </button>
        ))}
      </div>

      {activeIndex !== null && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Photo viewer"
          className="fixed inset-0 z-50 bg-rail-bg/95 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <button
            onClick={close}
            aria-label="Close"
            className="absolute top-4 right-4 text-rail-white p-2"
          >
            <X className="h-6 w-6" />
          </button>
          <button
            onClick={prev}
            aria-label="Previous photo"
            className="absolute left-2 sm:left-6 text-rail-white p-2"
          >
            <ChevronLeft className="h-8 w-8" />
          </button>
          <button
            onClick={next}
            aria-label="Next photo"
            className="absolute right-2 sm:right-6 text-rail-white p-2"
          >
            <ChevronRight className="h-8 w-8" />
          </button>

          <div className="relative max-w-4xl w-full aspect-[4/3]">
            <Image
              src={images[activeIndex].secureUrl}
              alt={images[activeIndex].altText}
              fill
              sizes="90vw"
              className="object-contain"
              priority
            />
          </div>
          {images[activeIndex].caption && (
            <p className="absolute bottom-6 text-sm text-rail-silver">{images[activeIndex].caption}</p>
          )}
        </div>
      )}
    </>
  );
}
