"use client";

import { useState, useTransition, useRef } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { Upload, X, Loader2 } from "lucide-react";
import { uploadAdminImage } from "@/app/admin/upload-actions";
import type { CloudinaryFolder } from "@/lib/cloudinary/upload";

export function ImageUploader({
  folder,
  initialUrl,
  onUploaded,
  label = "Upload image",
}: {
  folder: CloudinaryFolder;
  initialUrl?: string | null;
  onUploaded: (result: { secureUrl: string; publicId: string }) => void;
  label?: string;
}) {
  const [preview, setPreview] = useState<string | null>(initialUrl ?? null);
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setPreview(URL.createObjectURL(file));

    const formData = new FormData();
    formData.set("file", file);

    startTransition(async () => {
      const result = await uploadAdminImage(folder, formData);
      if (!result.success || !result.secureUrl || !result.publicId) {
        toast.error(result.error ?? "Upload failed.");
        return;
      }
      onUploaded({ secureUrl: result.secureUrl, publicId: result.publicId });
      toast.success("Image uploaded.");
    });
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={handleFileChange}
      />

      {preview ? (
        <div className="relative w-40 aspect-square border border-rail-line overflow-hidden group">
          <Image src={preview} alt="" fill sizes="160px" className="object-cover" />
          {isPending && (
            <div className="absolute inset-0 bg-rail-bg/70 flex items-center justify-center">
              <Loader2 className="h-5 w-5 animate-spin text-rail-gold" />
            </div>
          )}
          <button
            type="button"
            onClick={() => {
              setPreview(null);
              if (inputRef.current) inputRef.current.value = "";
            }}
            className="absolute top-1 right-1 bg-rail-bg/80 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Remove image"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={isPending}
          className="flex w-40 aspect-square flex-col items-center justify-center gap-2 border border-dashed border-rail-line text-rail-silver hover:border-rail-gold hover:text-rail-gold transition-colors disabled:opacity-50"
        >
          {isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Upload className="h-5 w-5" />}
          <span className="text-xs">{label}</span>
        </button>
      )}
    </div>
  );
}
