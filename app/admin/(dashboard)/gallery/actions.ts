"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/prisma";
import { requireRole, requireUser } from "@/lib/auth/session";
import { galleryAlbumSchema, galleryImageSchema } from "@/lib/validation/misc";
import { slugifyAlbumTitle } from "@/lib/services/gallery";
import { deleteImage } from "@/lib/cloudinary/upload";
import { logAction } from "@/lib/services/audit";

export interface AlbumFormState {
  success: boolean;
  error?: string;
  albumId?: string;
}

async function uniqueAlbumSlug(title: string): Promise<string> {
  const base = slugifyAlbumTitle(title);
  let candidate = base;
  let n = 1;
  while (await prisma.galleryAlbum.findUnique({ where: { slug: candidate } })) {
    candidate = `${base}-${n}`;
    n += 1;
  }
  return candidate;
}

export async function createAlbumAction(
  _prev: AlbumFormState,
  formData: FormData
): Promise<AlbumFormState> {
  const user = await requireRole(["SUPER_ADMIN", "ADMIN", "EDITOR"]);

  const title = String(formData.get("title") ?? "");
  const slug = await uniqueAlbumSlug(title);

  const parsed = galleryAlbumSchema.safeParse({
    title,
    slug,
    category: formData.get("category"),
    description: formData.get("description") || null,
    gameId: formData.get("gameId") || null,
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const album = await prisma.galleryAlbum.create({
    data: { ...parsed.data, createdById: user.id },
  });

  await logAction({ userId: user.id, action: "GALLERY_ALBUM_CREATED", entity: "GalleryAlbum", entityId: album.id });
  revalidatePath("/admin/gallery");
  revalidatePath("/gallery");

  return { success: true, albumId: album.id };
}

export async function addImagesToAlbumAction(
  albumId: string,
  images: { cloudinaryPublicId: string; secureUrl: string; width?: number; height?: number; altText: string }[]
) {
  const user = await requireRole(["SUPER_ADMIN", "ADMIN", "EDITOR"]);

  const existingCount = await prisma.galleryImage.count({ where: { albumId } });

  for (const [i, img] of images.entries()) {
    const parsed = galleryImageSchema.safeParse({ albumId, ...img });
    if (!parsed.success) continue;
    await prisma.galleryImage.create({
      data: { ...parsed.data, sortOrder: existingCount + i },
    });
  }

  const album = await prisma.galleryAlbum.findUnique({ where: { id: albumId } });
  if (album && !album.coverImageUrl && images[0]) {
    await prisma.galleryAlbum.update({ where: { id: albumId }, data: { coverImageUrl: images[0].secureUrl } });
  }

  await logAction({ userId: user.id, action: "GALLERY_IMAGES_UPLOADED", entity: "GalleryAlbum", entityId: albumId });
  revalidatePath(`/admin/gallery/${albumId}`);
  revalidatePath("/gallery");
}

export async function deleteImageAction(imageId: string, albumId: string) {
  const user = await requireRole(["SUPER_ADMIN", "ADMIN", "EDITOR"]);

  const image = await prisma.galleryImage.findUnique({ where: { id: imageId } });
  if (!image) return;

  await prisma.galleryImage.delete({ where: { id: imageId } });
  await deleteImage(image.cloudinaryPublicId).catch(() => {
    // The DB record is gone either way; a stray Cloudinary asset can be
    // cleaned up later and shouldn't block the admin's action.
  });

  await logAction({ userId: user.id, action: "GALLERY_IMAGE_DELETED", entity: "GalleryImage", entityId: imageId });
  revalidatePath(`/admin/gallery/${albumId}`);
  revalidatePath("/gallery");
}

export async function setCoverImageAction(albumId: string, secureUrl: string) {
  const user = await requireRole(["SUPER_ADMIN", "ADMIN", "EDITOR"]);
  await prisma.galleryAlbum.update({ where: { id: albumId }, data: { coverImageUrl: secureUrl } });
  await logAction({ userId: user.id, action: "GALLERY_COVER_SET", entity: "GalleryAlbum", entityId: albumId });
  revalidatePath(`/admin/gallery/${albumId}`);
  revalidatePath("/gallery");
}

export async function updateImageCaptionAction(imageId: string, albumId: string, caption: string, altText: string) {
  await requireUser();
  await prisma.galleryImage.update({ where: { id: imageId }, data: { caption: caption || null, altText } });
  revalidatePath(`/admin/gallery/${albumId}`);
}

export async function deleteAlbumAction(albumId: string) {
  const user = await requireRole(["SUPER_ADMIN", "ADMIN"]);
  await prisma.galleryAlbum.delete({ where: { id: albumId } });
  await logAction({ userId: user.id, action: "GALLERY_ALBUM_DELETED", entity: "GalleryAlbum", entityId: albumId });
  revalidatePath("/admin/gallery");
  revalidatePath("/gallery");
}
