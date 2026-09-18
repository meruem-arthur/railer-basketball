import "server-only";
import cloudinary, { isCloudinaryConfigured } from "./client";

export type CloudinaryFolder =
  | "players"
  | "gallery"
  | "news"
  | "teams"
  | "opponents"
  | "misc";

const ROOT = "srid-railers";

const MAX_UPLOAD_BYTES = 8 * 1024 * 1024; // 8MB
const ALLOWED_MIME = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export interface UploadResult {
  publicId: string;
  secureUrl: string;
  width: number;
  height: number;
  resourceType: string;
}

export class CloudinaryConfigError extends Error {
  constructor() {
    super(
      "Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET."
    );
    this.name = "CloudinaryConfigError";
  }
}

/**
 * Uploads a base64 data URL (or remote URL) to Cloudinary under the
 * srid-railers/<folder> namespace. Throws CloudinaryConfigError if
 * credentials are missing so callers can surface a clear admin-facing
 * message instead of a generic 500.
 */
export async function uploadImage(
  dataUrlOrBuffer: string,
  folder: CloudinaryFolder,
  options?: { publicId?: string; mimeType?: string; sizeBytes?: number }
): Promise<UploadResult> {
  if (!isCloudinaryConfigured) throw new CloudinaryConfigError();

  if (options?.mimeType && !ALLOWED_MIME.includes(options.mimeType)) {
    throw new Error("Unsupported file type. Use JPEG, PNG, WEBP or GIF.");
  }

  if (options?.sizeBytes && options.sizeBytes > MAX_UPLOAD_BYTES) {
    throw new Error("File is too large. Maximum upload size is 8MB.");
  }

  const result = await cloudinary.uploader.upload(dataUrlOrBuffer, {
    folder: `${ROOT}/${folder}`,
    public_id: options?.publicId,
    overwrite: Boolean(options?.publicId),
    resource_type: "image",
    transformation: [{ quality: "auto", fetch_format: "auto" }],
  });

  return {
    publicId: result.public_id,
    secureUrl: result.secure_url,
    width: result.width,
    height: result.height,
    resourceType: result.resource_type,
  };
}

export async function deleteImage(publicId: string): Promise<void> {
  if (!isCloudinaryConfigured) throw new CloudinaryConfigError();
  await cloudinary.uploader.destroy(publicId);
}

/** Builds a responsive, auto-optimized delivery URL for a stored public ID. */
export function buildImageUrl(
  publicId: string,
  opts?: { width?: number; height?: number; crop?: string }
): string {
  return cloudinary.url(publicId, {
    secure: true,
    quality: "auto",
    fetch_format: "auto",
    width: opts?.width,
    height: opts?.height,
    crop: opts?.crop ?? "fill",
  });
}
