"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Label, Input } from "@/components/ui/form-field";
import { Button } from "@/components/ui/button";
import { createSeasonAction, type SeasonFormState } from "@/app/admin/(dashboard)/seasons/actions";

const initialState: SeasonFormState = { success: false };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Creating…" : "Create season"}
    </Button>
  );
}

export function SeasonForm() {
  const [state, formAction] = useActionState(createSeasonAction, initialState);

  return (
    <form action={formAction} className="flex flex-wrap items-end gap-4 border border-rail-line bg-rail-navy/40 p-5">
      {state.error && <p className="text-sm text-rail-loss w-full">{state.error}</p>}
      <div>
        <Label htmlFor="label">Label</Label>
        <Input id="label" name="label" placeholder="2026/27" className="w-32" required />
      </div>
      <div>
        <Label htmlFor="startDate">Start date</Label>
        <Input id="startDate" name="startDate" type="date" required />
      </div>
      <div>
        <Label htmlFor="endDate">End date</Label>
        <Input id="endDate" name="endDate" type="date" required />
      </div>
      <label className="flex items-center gap-2 text-sm text-rail-silver pb-2.5">
        <input type="checkbox" name="isCurrent" className="accent-rail-gold" />
        Set as current
      </label>
      <SubmitButton />
    </form>
  );
}
