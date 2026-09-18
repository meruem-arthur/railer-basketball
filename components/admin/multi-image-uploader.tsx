"use client";

import { useState, useTransition, useRef } from "react";
import { toast } from "sonner";
import { Upload, Loader2 } from "lucide-react";
import { uploadAdminImage } from "@/app/admin/upload-actions";
import { addImagesToAlbumAction } from "@/app/admin/(dashboard)/gallery/actions";

export function MultiImageUploader({ albumId }: { albumId: string }) {
  const [isPending, startTransition] = useTransition();
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;

    startTransition(async () => {
      setProgress({ done: 0, total: files.length });
      const uploaded: { cloudinaryPublicId: string; secureUrl: string; width?: number; height?: number; altText: string }[] = [];

      for (const [i, file] of files.entries()) {
        const formData = new FormData();
        formData.set("file", file);
        const result = await uploadAdminImage("gallery", formData);
        if (result.success && result.secureUrl && result.publicId) {
          uploaded.push({
            cloudinaryPublicId: result.publicId,
            secureUrl: result.secureUrl,
            width: result.width,
            height: result.height,
            altText: file.name.replace(/\.[^.]+$/, "").replaceAll(/[-_]/g, " "),
          });
        }
        setProgress({ done: i + 1, total: files.length });
      }

      if (uploaded.length > 0) {
        await addImagesToAlbumAction(albumId, uploaded);
        toast.success(`${uploaded.length} photo${uploaded.length === 1 ? "" : "s"} uploaded.`);
      }
      if (uploaded.length < files.length) {
        toast.error(`${files.length - uploaded.length} photo(s) failed to upload.`);
      }

      setProgress(null);
      if (inputRef.current) inputRef.current.value = "";
    });
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        multiple
        className="hidden"
        onChange={handleFiles}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={isPending}
        className="flex items-center gap-2 border border-dashed border-rail-line px-5 py-4 text-sm text-rail-silver hover:border-rail-gold hover:text-rail-gold transition-colors disabled:opacity-50"
      >
        {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
        {progress ? `Uploading ${progress.done}/${progress.total}…` : "Upload photos"}
      </button>
    </div>
  );
}
