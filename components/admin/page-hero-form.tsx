"use client";

import { useActionState, useState, useTransition } from "react";
import { useFormStatus } from "react-dom";
import { toast } from "sonner";
import { Label, Input } from "@/components/ui/form-field";
import { Button, ButtonLink } from "@/components/ui/button";
import { ImageUploader } from "@/components/admin/image-uploader";
import { savePageHeroAction, clearPageHeroAction, type BannerFormState } from "@/app/admin/(dashboard)/banners/actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Saving…" : "Save banner"}
    </Button>
  );
}

export function PageHeroForm({
  pageKey,
  pageLabel,
  banner,
}: {
  pageKey: string;
  pageLabel: string;
  banner?: { title: string | null; subtitle: string | null; imageUrl: string | null; imagePublicId: string | null } | null;
}) {
  const [state, formAction] = useActionState(savePageHeroAction.bind(null, pageKey), { success: false } as BannerFormState);
  const [image, setImage] = useState({ url: banner?.imageUrl ?? "", publicId: banner?.imagePublicId ?? "" });
  const [clearing, startClear] = useTransition();

  return (
    <form action={formAction} className="space-y-5 border border-rail-line bg-rail-navy/40 p-6 max-w-xl">
      {state.error && (
        <p role="alert" className="text-sm text-rail-loss">
          {state.error}
        </p>
      )}
      <div>
        <Label htmlFor="imageUrl">Banner photo</Label>
        <ImageUploader
          folder="heroes"
          initialUrl={banner?.imageUrl}
          label="Upload banner photo"
          onUploaded={({ secureUrl, publicId }) => setImage({ url: secureUrl, publicId })}
        />
        <input type="hidden" id="imageUrl" name="imageUrl" value={image.url} />
        <input type="hidden" name="imagePublicId" value={image.publicId} />
      </div>
      <div>
        <Label htmlFor="title">Title (optional)</Label>
        <Input id="title" name="title" defaultValue={banner?.title ?? ""} maxLength={100} placeholder={pageLabel} />
        <p className="mt-1 text-xs text-rail-silver">Leave empty to use “{pageLabel}”.</p>
      </div>
      <div>
        <Label htmlFor="subtitle">Subtitle (optional)</Label>
        <Input id="subtitle" name="subtitle" defaultValue={banner?.subtitle ?? ""} maxLength={250} />
      </div>
      <div className="flex flex-wrap gap-3">
        <SubmitButton />
        <ButtonLink href="/admin/banners" variant="outline">
          Cancel
        </ButtonLink>
        {banner && (
          <Button
            type="button"
            variant="outline"
            disabled={clearing}
            onClick={() => {
              if (!confirm("Remove this banner and its photo?")) return;
              startClear(async () => {
                await clearPageHeroAction(pageKey);
                toast.success("Banner removed.");
                window.location.href = "/admin/banners";
              });
            }}
          >
            Remove banner
          </Button>
        )}
      </div>
    </form>
  );
}
