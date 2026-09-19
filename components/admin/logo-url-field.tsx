"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { ImagePlus, Loader2, X } from "lucide-react";
import { Input, Label } from "@/components/ui/form-field";
import { Button } from "@/components/ui/button";
import { uploadAdminImage } from "@/app/admin/upload-actions";
import type { CloudinaryFolder } from "@/lib/cloudinary/upload";

// Server Actions reject request bodies over 1MB by default and phone photos
// are routinely 3-8MB, so the picked image is scaled down in the browser
// before it is uploaded. A logo doesn't need more than this.
const MAX_UPLOAD_BYTES = 900 * 1024;
const SIZE_STEPS = [1024, 640, 384];

async function shrinkImage(file: File, maxDimension: number): Promise<File> {
  // "from-image" applies the EXIF rotation phone cameras rely on; older
  // browsers don't accept the option, so fall back to a plain decode.
  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" }).catch(() =>
    createImageBitmap(file)
  );
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

  // Keep photos as JPEG; everything else (logos, often with transparency) as WebP.
  const type = file.type === "image/jpeg" ? "image/jpeg" : "image/webp";
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, 0.88));
  if (!blob) throw new Error("Could not process image");

  const ext = blob.type === "image/jpeg" ? "jpg" : blob.type === "image/png" ? "png" : "webp";
  const baseName = file.name.replace(/\.[^.]+$/, "") || "logo";
  return new File([blob], `${baseName}.${ext}`, { type: blob.type });
}

async function prepareForUpload(file: File): Promise<File> {
  if (file.size <= MAX_UPLOAD_BYTES) return file;

  let result = file;
  for (const size of SIZE_STEPS) {
    result = await shrinkImage(file, size);
    if (result.size <= MAX_UPLOAD_BYTES) return result;
  }
  return result;
}

/**
 * A logo field that takes either a pasted URL or a picked image. Picking
 * opens the device's file picker (camera roll / files on a phone), uploads
 * to Cloudinary and fills the URL in. The input keeps its `name`, so the
 * surrounding form and server action work exactly as before.
 */
export function LogoUrlField({
  id,
  name,
  label,
  defaultValue,
  folder,
}: {
  id: string;
  name: string;
  label: string;
  defaultValue?: string | null;
  folder: CloudinaryFolder;
}) {
  const [url, setUrl] = useState(defaultValue ?? "");
  const [uploading, setUploading] = useState(false);
  const [previewFailed, setPreviewFailed] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const picked = e.target.files?.[0];
    // Reset so picking the same file again still fires onChange.
    e.target.value = "";
    if (!picked) return;

    setUploading(true);
    try {
      let file = picked;
      try {
        file = await prepareForUpload(picked);
      } catch {
        // Browser couldn't decode/resize it — try the original as-is.
      }

      if (file.size > MAX_UPLOAD_BYTES * 1.1) {
        toast.error("That image is too large. Choose a smaller one.");
        return;
      }

      const formData = new FormData();
      formData.set("file", file);
      const result = await uploadAdminImage(folder, formData);

      if (!result.success || !result.secureUrl) {
        toast.error(result.error ?? "Upload failed. Please try again.");
        return;
      }
      setUrl(result.secureUrl);
      setPreviewFailed(false);
      toast.success("Image uploaded. Save to keep it.");
    } catch {
      toast.error("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <Label htmlFor={id}>{label}</Label>

      <div className="flex items-stretch gap-2">
        {url && !previewFailed && (
          <div className="flex h-[42px] w-[42px] shrink-0 items-center justify-center border border-rail-line bg-rail-navy/60">
            {/* Plain <img>: the URL can point at any host, which next/image would reject. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={url}
              alt=""
              className="max-h-full max-w-full object-contain"
              onError={() => setPreviewFailed(true)}
            />
          </div>
        )}

        <Input
          id={id}
          name={name}
          type="url"
          value={url}
          onChange={(e) => {
            setUrl(e.target.value);
            setPreviewFailed(false);
          }}
          placeholder="Paste a link, or upload an image"
          disabled={uploading}
          className="min-w-0 flex-1"
        />

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="shrink-0"
        >
          {uploading ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            <ImagePlus className="h-4 w-4" aria-hidden="true" />
          )}
          <span className="hidden sm:inline">{uploading ? "Uploading…" : "Upload"}</span>
          <span className="sr-only sm:hidden">{uploading ? "Uploading" : "Upload image"}</span>
        </Button>

        {url && !uploading && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              setUrl("");
              setPreviewFailed(false);
            }}
            aria-label="Remove logo"
            className="shrink-0 px-2"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </Button>
        )}
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={handleFile}
        tabIndex={-1}
        aria-hidden="true"
      />
    </div>
  );
}
