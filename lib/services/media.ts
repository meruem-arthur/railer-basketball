import "server-only";
import { uploadImage, type CloudinaryFolder } from "@/lib/cloudinary/upload";

export async function uploadFileToCloudinary(file: File, folder: CloudinaryFolder) {
  const bytes = await file.arrayBuffer();
  const base64 = Buffer.from(bytes).toString("base64");
  const dataUrl = `data:${file.type};base64,${base64}`;

  return uploadImage(dataUrl, folder, { mimeType: file.type, sizeBytes: file.size });
}
