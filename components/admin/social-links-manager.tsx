"use client";

import { useActionState, useTransition } from "react";
import { useFormStatus } from "react-dom";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { Label, Input, Select } from "@/components/ui/form-field";
import { Button } from "@/components/ui/button";
import { addSocialLinkAction, removeSocialLinkAction, type SettingsFormState } from "@/app/admin/(dashboard)/settings/actions";
import type { SocialLink } from "@prisma/client";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="sm" disabled={pending}>
      {pending ? "Adding…" : "Add link"}
    </Button>
  );
}

export function SocialLinksManager({ links }: { links: SocialLink[] }) {
  const [state, formAction] = useActionState(addSocialLinkAction, { success: false } as SettingsFormState);
  const [isPending, startTransition] = useTransition();

  return (
    <div className="max-w-xl">
      {links.length > 0 && (
        <div className="border border-rail-line divide-y divide-rail-line mb-6">
          {links.map((link) => (
            <div key={link.id} className="flex items-center justify-between px-4 py-3">
              <div>
                <span className="text-sm font-medium text-rail-white capitalize">{link.platform}</span>
                <span className="text-sm text-rail-silver ml-3">{link.url}</span>
              </div>
              <button
                disabled={isPending}
                onClick={() =>
                  startTransition(async () => {
                    await removeSocialLinkAction(link.id);
                    toast.success("Removed.");
                  })
                }
                aria-label="Remove link"
                className="text-rail-silver hover:text-rail-loss"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      <form action={formAction} className="flex flex-wrap items-end gap-4">
        {state.error && <p className="text-sm text-rail-loss w-full">{state.error}</p>}
        <div>
          <Label htmlFor="platform">Platform</Label>
          <Select id="platform" name="platform" defaultValue="instagram" className="w-36">
            <option value="instagram">Instagram</option>
            <option value="facebook">Facebook</option>
            <option value="tiktok">TikTok</option>
            <option value="x">X / Twitter</option>
            <option value="youtube">YouTube</option>
          </Select>
        </div>
        <div className="flex-1 min-w-[200px]">
          <Label htmlFor="url">URL</Label>
          <Input id="url" name="url" type="url" placeholder="https://" required />
        </div>
        <SubmitButton />
      </form>
    </div>
  );
}
