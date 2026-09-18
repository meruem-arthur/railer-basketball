import "server-only";
import { prisma } from "@/lib/db/prisma";

export async function getAlbums(category?: string) {
  return prisma.galleryAlbum.findMany({
    where: category ? { category: category as never } : undefined,
    include: { images: { take: 1, orderBy: { sortOrder: "asc" } }, _count: { select: { images: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function getFeaturedGalleryImages(take = 8) {
  return prisma.galleryImage.findMany({
    orderBy: { createdAt: "desc" },
    take,
    include: { album: { select: { title: true, slug: true } } },
  });
}

export async function getAlbumBySlug(slug: string) {
  return prisma.galleryAlbum.findUnique({
    where: { slug },
    include: { images: { orderBy: { sortOrder: "asc" } }, game: true },
  });
}

export function slugifyAlbumTitle(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
