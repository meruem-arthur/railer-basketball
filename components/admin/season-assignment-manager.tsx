"use client";

import { useActionState, useTransition } from "react";
import { useFormStatus } from "react-dom";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { Label, Input, Select } from "@/components/ui/form-field";
import { Button } from "@/components/ui/button";
import { positionLabel } from "@/lib/utils/format";
import {
  assignPlayerSeasonAction,
  removePlayerSeasonAction,
  type AssignSeasonState,
} from "@/app/admin/(dashboard)/players/actions";
import type { TeamSeason } from "@prisma/client";

const POSITIONS = [
  { value: "POINT_GUARD", label: "Point Guard" },
  { value: "SHOOTING_GUARD", label: "Shooting Guard" },
  { value: "SMALL_FORWARD", label: "Small Forward" },
  { value: "POWER_FORWARD", label: "Power Forward" },
  { value: "CENTER", label: "Center" },
];

interface ExistingAssignment {
  id: string;
  jerseyNumber: number;
  position: string;
  active: boolean;
  season: { id: string; label: string };
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="sm" disabled={pending}>
      {pending ? "Adding…" : "Assign"}
    </Button>
  );
}

export function SeasonAssignmentManager({
  playerId,
  assignments,
  seasons,
}: {
  playerId: string;
  assignments: ExistingAssignment[];
  seasons: TeamSeason[];
}) {
  const initialState: AssignSeasonState = { success: false };
  const [state, formAction] = useActionState(assignPlayerSeasonAction, initialState);
  const [isPending, startTransition] = useTransition();

  const assignedSeasonIds = new Set(assignments.map((a) => a.season.id));
  const availableSeasons = seasons.filter((s) => !assignedSeasonIds.has(s.id));

  function handleRemove(assignmentId: string) {
    if (!confirm("Remove this season assignment?")) return;
    startTransition(async () => {
      try {
        await removePlayerSeasonAction(assignmentId, playerId);
        toast.success("Season assignment removed.");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Could not remove.");
      }
    });
  }

  return (
    <div>
      {assignments.length > 0 && (
        <div className="border border-rail-line divide-y divide-rail-line mb-6">
          {assignments.map((a) => (
            <div key={a.id} className="flex items-center justify-between px-4 py-3 text-sm">
              <div>
                <span className="text-rail-white font-medium">{a.season.label}</span>
                <span className="text-rail-silver ml-3">
                  #{a.jerseyNumber} · {positionLabel(a.position)}
                </span>
              </div>
              <button
                onClick={() => handleRemove(a.id)}
                disabled={isPending}
                aria-label="Remove season assignment"
                className="text-rail-silver hover:text-rail-loss disabled:opacity-50"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {availableSeasons.length > 0 && (
        <form action={formAction} className="flex flex-wrap items-end gap-4">
          <input type="hidden" name="playerId" value={playerId} />
          {state.error && <p className="text-sm text-rail-loss w-full">{state.error}</p>}
          <div>
            <Label htmlFor="assign-season">Season</Label>
            <Select id="assign-season" name="seasonId" defaultValue="" className="w-40">
              <option value="" disabled>Select</option>
              {availableSeasons.map((s) => (
                <option key={s.id} value={s.id}>{s.label}</option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="assign-jersey">Jersey #</Label>
            <Input id="assign-jersey" name="jerseyNumber" type="number" min={0} max={99} className="w-24" />
          </div>
          <div>
            <Label htmlFor="assign-position">Position</Label>
            <Select id="assign-position" name="position" defaultValue="" className="w-44">
              <option value="" disabled>Select</option>
              {POSITIONS.map((p) => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </Select>
          </div>
          <SubmitButton />
        </form>
      )}
    </div>
  );
}
