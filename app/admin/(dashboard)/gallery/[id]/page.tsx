import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { MultiImageUploader } from "@/components/admin/multi-image-uploader";
import { AdminImageGrid } from "@/components/admin/admin-image-grid";
import { deleteAlbumAction } from "@/app/admin/(dashboard)/gallery/actions";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Album" };

export default async function AdminAlbumDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const album = await prisma.galleryAlbum.findUnique({
    where: { id },
    include: { images: { orderBy: { sortOrder: "asc" } } },
  });

  if (!album) notFound();

  return (
    <div>
      <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
        <div>
          <h1 className="font-display text-4xl tracking-tight text-rail-white">{album.title}</h1>
          <p className="text-sm text-rail-silver mt-1">{album.images.length} photos</p>
        </div>
        <form action={async () => { "use server"; await deleteAlbumAction(album.id); }}>
          <Button variant="ghost" size="sm">Delete album</Button>
        </form>
      </div>

      <div className="mb-8">
        <MultiImageUploader albumId={album.id} />
      </div>

      <AdminImageGrid albumId={album.id} images={album.images} coverImageUrl={album.coverImageUrl} />
    </div>
  );
}
