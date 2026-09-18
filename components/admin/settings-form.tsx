"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { toast } from "sonner";
import { useEffect, useRef } from "react";
import { Label, Input, Textarea } from "@/components/ui/form-field";
import { Button } from "@/components/ui/button";
import { updateSettingsAction, type SettingsFormState } from "@/app/admin/(dashboard)/settings/actions";
import type { SiteSetting } from "@prisma/client";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Saving…" : "Save settings"}
    </Button>
  );
}

export function SettingsForm({ settings }: { settings: SiteSetting }) {
  const [state, formAction] = useActionState(updateSettingsAction, { success: false } as SettingsFormState);
  const handledRef = useRef(false);

  useEffect(() => {
    if (state.success && !handledRef.current) {
      handledRef.current = true;
      toast.success("Settings saved.");
    }
  }, [state]);

  return (
    <form action={formAction} className="space-y-6 max-w-xl">
      {state.error && (
        <p role="alert" className="text-sm text-rail-loss">
          {state.error}
        </p>
      )}
      <div>
        <Label htmlFor="teamName" required>Team name</Label>
        <Input id="teamName" name="teamName" defaultValue={settings.teamName} required />
      </div>
      <div>
        <Label htmlFor="slogan" required>Slogan</Label>
        <Input id="slogan" name="slogan" defaultValue={settings.slogan} required />
      </div>
      <div>
        <Label htmlFor="aboutText">About text</Label>
        <Textarea id="aboutText" name="aboutText" rows={5} defaultValue={settings.aboutText ?? ""} />
      </div>
      <div className="grid sm:grid-cols-2 gap-5">
        <div>
          <Label htmlFor="contactEmail">Contact email</Label>
          <Input id="contactEmail" name="contactEmail" type="email" defaultValue={settings.contactEmail ?? ""} />
        </div>
        <div>
          <Label htmlFor="contactPhone">Contact phone</Label>
          <Input id="contactPhone" name="contactPhone" defaultValue={settings.contactPhone ?? ""} />
        </div>
      </div>
      <div>
        <Label htmlFor="venue">Venue</Label>
        <Input id="venue" name="venue" defaultValue={settings.venue ?? ""} />
      </div>
      <div>
        <Label htmlFor="logoUrl">Logo URL</Label>
        <Input id="logoUrl" name="logoUrl" type="url" defaultValue={settings.logoUrl ?? ""} />
      </div>
      <SubmitButton />
    </form>
  );
}
