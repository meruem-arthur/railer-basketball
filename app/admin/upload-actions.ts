"use server";

import { requireRole } from "@/lib/auth/session";
import { uploadFileToCloudinary } from "@/lib/services/media";
import type { CloudinaryFolder } from "@/lib/cloudinary/upload";

export interface UploadResultState {
  success: boolean;
  error?: string;
  secureUrl?: string;
  publicId?: string;
  width?: number;
  height?: number;
}

export async function uploadAdminImage(folder: CloudinaryFolder, formData: FormData): Promise<UploadResultState> {
  await requireRole(["SUPER_ADMIN", "ADMIN", "EDITOR"]);

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { success: false, error: "No file selected." };
  }

  try {
    const result = await uploadFileToCloudinary(file, folder);
    return {
      success: true,
      secureUrl: result.secureUrl,
      publicId: result.publicId,
      width: result.width,
      height: result.height,
    };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Upload failed." };
  }
}
