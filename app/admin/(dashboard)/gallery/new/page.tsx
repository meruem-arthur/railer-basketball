"use client";

import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Label, Input, Textarea, Select } from "@/components/ui/form-field";
import { Button } from "@/components/ui/button";
import { createAlbumAction } from "@/app/admin/(dashboard)/gallery/actions";

const CATEGORIES = [
  { value: "GAME_DAY", label: "Game Day" },
  { value: "TRAINING", label: "Training" },
  { value: "TEAM", label: "Team" },
  { value: "TOURNAMENTS", label: "Tournaments" },
  { value: "EVENTS", label: "Events" },
  { value: "BEHIND_THE_SCENES", label: "Behind the Scenes" },
];

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Creating…" : "Create album"}
    </Button>
  );
}

export default function NewAlbumPage() {
  const router = useRouter();
  const [state, formAction] = useActionState(createAlbumAction, { success: false });
  const handledRef = useRef(false);

  useEffect(() => {
    if (!state.success || !state.albumId || handledRef.current) return;
    handledRef.current = true;
    toast.success("Album created.");
    router.push(`/admin/gallery/${state.albumId}`);
  }, [state, router]);

  return (
    <div>
      <h1 className="font-display text-4xl tracking-tight text-rail-white mb-8">New Album</h1>
      <form action={formAction} className="space-y-6 max-w-lg">
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
          <Label htmlFor="category" required>Category</Label>
          <Select id="category" name="category" defaultValue="">
            <option value="" disabled>Select category</option>
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" name="description" rows={3} />
        </div>
        <SubmitButton />
      </form>
    </div>
  );
}
