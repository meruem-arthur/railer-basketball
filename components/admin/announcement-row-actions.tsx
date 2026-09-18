"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  updateAnnouncementStatusAction,
  deleteAnnouncementAction,
} from "@/app/admin/(dashboard)/announcements/actions";

export function AnnouncementRowActions({ id, status }: { id: string; status: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex gap-2 shrink-0">
      {status === "ACTIVE" ? (
        <Button
          size="sm"
          variant="outline"
          disabled={isPending}
          onClick={() =>
            startTransition(async () => {
              await updateAnnouncementStatusAction(id, "EXPIRED");
              toast.success("Announcement deactivated.");
            })
          }
        >
          Deactivate
        </Button>
      ) : (
        <Button
          size="sm"
          variant="outline"
          disabled={isPending}
          onClick={() =>
            startTransition(async () => {
              await updateAnnouncementStatusAction(id, "ACTIVE");
              toast.success("Announcement activated.");
            })
          }
        >
          Activate
        </Button>
      )}
      <Button
        size="sm"
        variant="ghost"
        disabled={isPending}
        onClick={() => {
          if (!confirm("Delete this announcement?")) return;
          startTransition(async () => {
            await deleteAnnouncementAction(id);
            toast.success("Announcement deleted.");
          });
        }}
      >
        Delete
      </Button>
    </div>
  );
}
