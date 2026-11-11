"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Button, ButtonLink } from "@/components/ui/button";
import { toggleHeroSlideAction, deleteHeroSlideAction } from "@/app/admin/(dashboard)/hero/actions";

export function HeroSlideRowActions({ id, active }: { id: string; active: boolean }) {
  const [pending, startTransition] = useTransition();
  return (
    <div className="flex flex-wrap gap-2 shrink-0">
      <ButtonLink href={`/admin/hero/${id}`} size="sm" variant="outline">
        Edit
      </ButtonLink>
      <Button
        size="sm"
        variant="outline"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            await toggleHeroSlideAction(id, !active);
            toast.success(active ? "Slide hidden." : "Slide is now showing.");
          })
        }
      >
        {active ? "Hide" : "Show"}
      </Button>
      <Button
        size="sm"
        variant="outline"
        disabled={pending}
        onClick={() => {
          if (!confirm("Delete this slide and its photo? This cannot be undone.")) return;
          startTransition(async () => {
            await deleteHeroSlideAction(id);
            toast.success("Slide deleted.");
          });
        }}
      >
        Delete
      </Button>
    </div>
  );
}
