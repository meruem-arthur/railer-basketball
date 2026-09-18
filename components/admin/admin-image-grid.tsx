"use client";

import { useTransition } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { Trash2, Star } from "lucide-react";
import { deleteImageAction, setCoverImageAction } from "@/app/admin/(dashboard)/gallery/actions";

interface AdminImage {
  id: string;
  secureUrl: string;
  altText: string;
}

export function AdminImageGrid({
  albumId,
  images,
  coverImageUrl,
}: {
  albumId: string;
  images: AdminImage[];
  coverImageUrl: string | null;
}) {
  const [isPending, startTransition] = useTransition();

  if (images.length === 0) {
    return <p className="text-rail-silver">No photos in this album yet.</p>;
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {images.map((img) => (
        <div key={img.id} className="relative aspect-square border border-rail-line group overflow-hidden">
          <Image src={img.secureUrl} alt={img.altText} fill sizes="25vw" className="object-cover" />
          {coverImageUrl === img.secureUrl && (
            <span className="absolute top-1.5 left-1.5 bg-rail-gold text-rail-bg text-[10px] font-semibold uppercase px-1.5 py-0.5">
              Cover
            </span>
          )}
          <div className="absolute inset-0 bg-rail-bg/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <button
              type="button"
              disabled={isPending}
              aria-label="Set as cover"
              onClick={() =>
                startTransition(async () => {
                  await setCoverImageAction(albumId, img.secureUrl);
                  toast.success("Cover image updated.");
                })
              }
              className="p-2 bg-rail-navy border border-rail-line hover:border-rail-gold"
            >
              <Star className="h-4 w-4" />
            </button>
            <button
              type="button"
              disabled={isPending}
              aria-label="Delete photo"
              onClick={() => {
                if (!confirm("Delete this photo?")) return;
                startTransition(async () => {
                  await deleteImageAction(img.id, albumId);
                  toast.success("Photo deleted.");
                });
              }}
              className="p-2 bg-rail-navy border border-rail-line hover:border-rail-loss"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
