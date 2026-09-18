import Link from "next/link";
import Image from "next/image";
import { Images } from "lucide-react";

export function GalleryCard({
  slug,
  title,
  coverImageUrl,
  imageCount,
}: {
  slug: string;
  title: string;
  coverImageUrl: string | null;
  imageCount: number;
}) {
  return (
    <Link
      href={`/gallery/${slug}`}
      className="group relative block aspect-square overflow-hidden border border-rail-line bg-rail-navy-light"
    >
      {coverImageUrl ? (
        <Image
          src={coverImageUrl}
          alt=""
          fill
          sizes="(max-width: 640px) 50vw, 25vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
      ) : (
        <div className="flex h-full items-center justify-center">
          <Images className="h-8 w-8 text-rail-line" />
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-rail-bg/90 via-transparent to-transparent" />
      <div className="absolute inset-x-0 bottom-0 p-4">
        <p className="font-display text-lg tracking-tight text-rail-white leading-tight">{title}</p>
        <p className="text-xs text-rail-silver mt-0.5">{imageCount} photos</p>
      </div>
    </Link>
  );
}
