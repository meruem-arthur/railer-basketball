import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ImagePlus, Images } from "lucide-react";
import { prisma } from "@/lib/db/prisma";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

export const metadata: Metadata = { title: "Gallery" };

export default async function AdminGalleryPage() {
  const albums = await prisma.galleryAlbum.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { images: true } } },
  });

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <h1 className="font-display text-4xl tracking-tight text-rail-white">Gallery</h1>
        <ButtonLink href="/admin/gallery/new">
          <ImagePlus className="h-4 w-4" /> New Album
        </ButtonLink>
      </div>

      {albums.length === 0 ? (
        <EmptyState icon={Images} title="No albums yet" />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {albums.map((album) => (
            <Link
              key={album.id}
              href={`/admin/gallery/${album.id}`}
              className="border border-rail-line hover:border-rail-gold/50 transition-colors"
            >
              <div className="relative aspect-square bg-rail-navy-light">
                {album.coverImageUrl && (
                  <Image src={album.coverImageUrl} alt="" fill sizes="25vw" className="object-cover" />
                )}
              </div>
              <div className="p-3">
                <p className="text-sm font-medium text-rail-white truncate">{album.title}</p>
                <p className="text-xs text-rail-silver mt-0.5">{album._count.images} photos</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
