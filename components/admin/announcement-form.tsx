"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Label, Input, Textarea, Select } from "@/components/ui/form-field";
import { Button } from "@/components/ui/button";
import { createAnnouncementAction, type AnnouncementFormState } from "@/app/admin/(dashboard)/announcements/actions";

const initialState: AnnouncementFormState = { success: false };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Publishing…" : "Publish announcement"}
    </Button>
  );
}

export function AnnouncementForm() {
  const [state, formAction] = useActionState(createAnnouncementAction, initialState);

  return (
    <form action={formAction} className="space-y-5 border border-rail-line bg-rail-navy/40 p-6 max-w-xl">
      {state.error && (
        <p role="alert" className="text-sm text-rail-loss">
          {state.error}
        </p>
      )}
      <div>
        <Label htmlFor="title" required>Title</Label>
        <Input id="title" name="title" required />
      </div>
      <div>
        <Label htmlFor="content" required>Content</Label>
        <Textarea id="content" name="content" rows={3} required />
      </div>
      <div className="grid sm:grid-cols-2 gap-5">
        <div>
          <Label htmlFor="priority">Priority</Label>
          <Select id="priority" name="priority" defaultValue="NORMAL">
            <option value="NORMAL">Normal</option>
            <option value="IMPORTANT">Important</option>
            <option value="URGENT">Urgent</option>
          </Select>
        </div>
        <div>
          <Label htmlFor="expiresAt">Expires (optional)</Label>
          <Input id="expiresAt" name="expiresAt" type="date" />
        </div>
      </div>
      <input type="hidden" name="status" value="ACTIVE" />
      <SubmitButton />
    </form>
  );
}
