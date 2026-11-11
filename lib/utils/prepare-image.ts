/**
 * Browser-side image preparation for admin uploads. Photos go through a Server Action, which rejects bodies over a
 * size limit, and phone photos are routinely 3-8 MB, so they are scaled down (keeping EXIF rotation) before upload.
 * Hero/gallery photos keep much more resolution than a logo would need.
 */
export const MAX_PHOTO_BYTES = 900 * 1024;
const PHOTO_STEPS = [2400, 2000, 1600, 1280, 1024];

async function shrink(file: File, maxDimension: number): Promise<File> {
  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" }).catch(() => createImageBitmap(file));
  const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas unavailable");
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  // Photos stay JPEG; PNG/WebP/GIF (often with transparency) become WebP.
  const type = file.type === "image/jpeg" ? "image/jpeg" : "image/webp";
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, 0.85));
  if (!blob) throw new Error("Could not process image");
  const ext = blob.type === "image/jpeg" ? "jpg" : "webp";
  const base = file.name.replace(/\.[^.]+$/, "") || "photo";
  return new File([blob], `${base}.${ext}`, { type: blob.type });
}

/** Returns a file under the size limit when possible; if the browser can't decode it, returns the original. */
export async function preparePhotoForUpload(file: File): Promise<File> {
  if (file.size <= MAX_PHOTO_BYTES || file.type === "image/gif") return file;
  try {
    let result = file;
    for (const size of PHOTO_STEPS) {
      result = await shrink(file, size);
      if (result.size <= MAX_PHOTO_BYTES) return result;
    }
    return result;
  } catch {
    return file;
  }
}

export const isTooLarge = (file: File) => file.size > MAX_PHOTO_BYTES * 1.1;
