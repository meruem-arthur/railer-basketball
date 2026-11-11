"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { Label, Input, Textarea } from "@/components/ui/form-field";
import { Button, ButtonLink } from "@/components/ui/button";
import { ImageUploader } from "@/components/admin/image-uploader";
import { saveHeroSlideAction, type HeroFormState } from "@/app/admin/(dashboard)/hero/actions";

interface SlideValues {
  heading: string | null;
  subheading: string | null;
  imageUrl: string;
  imagePublicId: string | null;
  ctaLabel: string | null;
  ctaHref: string | null;
  displayOrder: number;
  active: boolean;
}

function SubmitButton({ editing }: { editing: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Saving…" : editing ? "Save changes" : "Add slide"}
    </Button>
  );
}

export function HeroSlideForm({ id, slide }: { id?: string; slide?: SlideValues }) {
  const [state, formAction] = useActionState(saveHeroSlideAction.bind(null, id ?? null), { success: false } as HeroFormState);
  const [image, setImage] = useState({ url: slide?.imageUrl ?? "", publicId: slide?.imagePublicId ?? "" });

  return (
    <form action={formAction} className="space-y-5 border border-rail-line bg-rail-navy/40 p-6 max-w-2xl">
      {state.error && (
        <p role="alert" className="text-sm text-rail-loss">
          {state.error}
        </p>
      )}

      <div>
        <Label htmlFor="imageUrl" required>Photo</Label>
        <ImageUploader
          folder="heroes"
          initialUrl={slide?.imageUrl}
          label="Upload slide photo"
          onUploaded={({ secureUrl, publicId }) => setImage({ url: secureUrl, publicId })}
        />
        <p className="mt-2 text-xs text-rail-silver">Wide, landscape photos (about 1600 px or more) look best. They are shaded slightly so the text stays readable.</p>
        <input type="hidden" id="imageUrl" name="imageUrl" value={image.url} />
        <input type="hidden" name="imagePublicId" value={image.publicId} />
      </div>

      <div>
        <Label htmlFor="heading">Heading (optional)</Label>
        <Input id="heading" name="heading" defaultValue={slide?.heading ?? ""} maxLength={120} placeholder="Season opener / Saturday 6pm" />
        <p className="mt-1 text-xs text-rail-silver">Leave empty to use “BUILT TO MOVE. BUILT TO WIN.” To put the second line in gold, separate the lines with “ / ” (for example: Season opener / Saturday 6pm).</p>
      </div>

      <div>
        <Label htmlFor="subheading">Short text (optional)</Label>
        <Textarea id="subheading" name="subheading" rows={2} defaultValue={slide?.subheading ?? ""} maxLength={300} />
      </div>

      <div className="grid sm:grid-cols-2 gap-5">
        <div>
          <Label htmlFor="ctaLabel">Button text (optional)</Label>
          <Input id="ctaLabel" name="ctaLabel" defaultValue={slide?.ctaLabel ?? ""} maxLength={40} placeholder="View the team" />
        </div>
        <div>
          <Label htmlFor="ctaHref">Button link</Label>
          <Input id="ctaHref" name="ctaHref" defaultValue={slide?.ctaHref ?? ""} maxLength={300} placeholder="/team or https://…" />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-5 items-end">
        <div>
          <Label htmlFor="displayOrder">Order</Label>
          <Input id="displayOrder" name="displayOrder" type="number" min={0} max={999} defaultValue={slide?.displayOrder ?? 0} />
          <p className="mt-1 text-xs text-rail-silver">Lower numbers show first.</p>
        </div>
        <label className="flex items-center gap-2 text-sm text-rail-white">
          <input type="checkbox" name="active" defaultChecked={slide?.active ?? true} className="h-4 w-4 accent-[#F5A900]" />
          Show this slide on the homepage
        </label>
      </div>

      <div className="flex gap-3">
        <SubmitButton editing={Boolean(id)} />
        <ButtonLink href="/admin/hero" variant="outline">
          Cancel
        </ButtonLink>
      </div>
    </form>
  );
}
