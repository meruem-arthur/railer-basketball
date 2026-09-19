"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  setCurrentSeasonAction,
  archiveSeasonAction,
  deleteSeasonAction,
} from "@/app/admin/(dashboard)/seasons/actions";
import { ConfirmDeleteButton } from "@/components/admin/confirm-delete-button";

export function SeasonRowActions({
  seasonId,
  label,
  isCurrent,
  isArchived,
}: {
  seasonId: string;
  label: string;
  isCurrent: boolean;
  isArchived: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex flex-wrap gap-2">
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
      <ConfirmDeleteButton
        action={() => deleteSeasonAction(seasonId)}
        title="Delete season?"
        description={
          <>
            <p>
              <span className="text-rail-white">{label}</span> will be removed for good, together with
              all of its games, results, box scores and team stats, and every player&apos;s roster
              entry for that season. The players themselves are kept.
            </p>
            {isCurrent && (
              <p>
                This is the current season, so the site will have no current season until you set
                another one.
              </p>
            )}
            {!isArchived && !isCurrent && <p>If you just want it out of the way, Archive keeps its history.</p>}
          </>
        }
        successMessage="Season deleted."
        confirmText={label}
      />
    </div>
  );
}
