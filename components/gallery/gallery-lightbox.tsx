"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import { ImageViewer, type LightboxImage } from "./image-viewer";

export type { LightboxImage };

/** A grid of photos; clicking any opens the full-screen viewer. Used for albums, the home strip and game photos. */
export function GalleryLightbox({
  images,
  gridClassName = "grid grid-cols-2 sm:grid-cols-3 gap-3",
  sizes = "(max-width: 640px) 50vw, 33vw",
}: {
  images: LightboxImage[];
  gridClassName?: string;
  sizes?: string;
}) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const close = useCallback(() => setActiveIndex(null), []);

  return (
    <>
      <div className={gridClassName}>
        {images.map((img, i) => (
          <button
            key={img.id}
            type="button"
            onClick={() => setActiveIndex(i)}
            className="relative aspect-square cursor-zoom-in overflow-hidden border border-rail-line group"
            aria-label={`View photo: ${img.altText}`}
          >
            <Image
              src={img.secureUrl}
              alt={img.altText}
              fill
              sizes={sizes}
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </button>
        ))}
      </div>
      {activeIndex !== null && <ImageViewer images={images} index={activeIndex} onClose={close} onChange={setActiveIndex} />}
    </>
  );
}
