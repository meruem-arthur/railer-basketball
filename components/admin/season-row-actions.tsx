"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { setCurrentSeasonAction, archiveSeasonAction } from "@/app/admin/(dashboard)/seasons/actions";

export function SeasonRowActions({
  seasonId,
  isCurrent,
  isArchived,
}: {
  seasonId: string;
  isCurrent: boolean;
  isArchived: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex gap-2">
      {!isCurrent && (
        <Button
          size="sm"
          variant="outline"
          disabled={isPending}
          onClick={() =>
            startTransition(async () => {
              await setCurrentSeasonAction(seasonId);
              toast.success("Current season updated.");
            })
          }
        >
          Set current
        </Button>
      )}
      {!isArchived && !isCurrent && (
        <Button
          size="sm"
          variant="ghost"
          disabled={isPending}
          onClick={() =>
            startTransition(async () => {
              await archiveSeasonAction(seasonId);
              toast.success("Season archived.");
            })
          }
        >
          Archive
        </Button>
      )}
    </div>
  );
}
