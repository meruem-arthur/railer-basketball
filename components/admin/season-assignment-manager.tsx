"use client";

import { useActionState, useEffect, useTransition } from "react";
import { useFormStatus } from "react-dom";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { Label, Input, Select } from "@/components/ui/form-field";
import { Button } from "@/components/ui/button";
import { positionLabel } from "@/lib/utils/format";
import {
  assignPlayerSeasonAction,
  removePlayerSeasonAction,
  updatePlayerSeasonAction,
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
  jerseyNumber: number | null;
  position: string;
  active: boolean;
  season: { id: string; label: string };
}

function EditEntry({ playerId, a }: { playerId: string; a: ExistingAssignment }) {
  const [state, formAction] = useActionState(updatePlayerSeasonAction, { success: false } as AssignSeasonState);
  useEffect(() => {
    if (state.success) toast.success("Saved.");
  }, [state]);
  return (
    <form action={formAction} className="flex flex-wrap items-end gap-3">
      <input type="hidden" name="playerSeasonId" value={a.id} />
      <input type="hidden" name="playerId" value={playerId} />
      <div>
        <Label htmlFor={`pos-${a.id}`}>Position</Label>
        <Select id={`pos-${a.id}`} name="position" defaultValue={a.position} className="w-44">
          {POSITIONS.map((p) => (
            <option key={p.value} value={p.value}>{p.label}</option>
          ))}
        </Select>
      </div>
      <div>
        <Label htmlFor={`jer-${a.id}`}>Jersey # (optional)</Label>
        <Input id={`jer-${a.id}`} name="jerseyNumber" type="number" min={0} max={99} defaultValue={a.jerseyNumber ?? ""} className="w-24" />
      </div>
      <Button type="submit" size="sm" variant="outline">Save</Button>
      {state.error && <p className="w-full text-sm text-rail-loss">{state.error}</p>}
    </form>
  );
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
            <div key={a.id} className="flex flex-wrap items-end justify-between gap-3 px-4 py-3 text-sm">
              <div className="space-y-3">
                <div>
                  <span className="text-rail-white font-medium">{a.season.label}</span>
                  <span className="text-rail-silver ml-3">
                    {a.jerseyNumber != null ? `#${a.jerseyNumber} · ` : ""}{positionLabel(a.position)}
                  </span>
                </div>
                <EditEntry playerId={playerId} a={a} />
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
            <Label htmlFor="assign-jersey">Jersey # (optional)</Label>
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
