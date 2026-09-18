import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAlbumBySlug } from "@/lib/services/gallery";
import { GalleryLightbox } from "@/components/gallery/gallery-lightbox";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ album: string }>;
}): Promise<Metadata> {
  const { album: slug } = await params;
  const album = await getAlbumBySlug(slug);
  if (!album) return { title: "Gallery" };
  return { title: album.title, description: album.description ?? undefined };
}

export default async function GalleryAlbumPage({
  params,
}: {
  params: Promise<{ album: string }>;
}) {
  const { album: slug } = await params;
  const album = await getAlbumBySlug(slug);
  if (!album) notFound();

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="font-display text-4xl sm:text-5xl tracking-tight text-rail-white text-balance">
        {album.title}
      </h1>
      {album.description && <p className="mt-3 max-w-xl text-rail-silver">{album.description}</p>}
      <p className="mt-1 text-sm text-rail-silver">{album.images.length} photos</p>

      <div className="mt-10">
        <GalleryLightbox images={album.images} />
      </div>
    </div>
  );
}
