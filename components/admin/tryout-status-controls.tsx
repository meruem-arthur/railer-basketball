"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { updateTryoutStatusAction, deleteTryoutAction } from "@/app/admin/(dashboard)/tryouts/actions";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils/cn";

const STATUSES = ["PENDING", "SHORTLISTED", "APPROVED", "REJECTED", "CONTACTED"] as const;

export function TryoutStatusControls({ id, status }: { id: string; status: string }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <div className="flex flex-wrap items-center gap-2">
      {STATUSES.map((s) => (
        <button
          key={s}
          disabled={isPending}
          onClick={() =>
            startTransition(async () => {
              await updateTryoutStatusAction(id, s);
              toast.success(`Marked as ${s.toLowerCase()}.`);
            })
          }
          className={cn(
            "px-3 py-1.5 text-xs font-semibold uppercase tracking-wide border transition-colors",
            status === s ? "border-rail-gold bg-rail-gold text-rail-bg" : "border-rail-line text-rail-silver hover:text-rail-white"
          )}
        >
          {s}
        </button>
      ))}
      <Button
        size="sm"
        variant="ghost"
        disabled={isPending}
        onClick={() => {
          if (!confirm("Delete this application?")) return;
          startTransition(async () => {
            await deleteTryoutAction(id);
            router.push("/admin/tryouts");
          });
        }}
      >
        Delete
      </Button>
    </div>
  );
}
