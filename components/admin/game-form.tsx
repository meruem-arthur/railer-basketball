"use client";

import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Label, Input, Select } from "@/components/ui/form-field";
import { Button } from "@/components/ui/button";
import type { GameFormState } from "@/app/admin/(dashboard)/games/actions";
import type { Game, TeamSeason } from "@prisma/client";

function toLocalInputValue(date: Date): string {
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60000);
  return local.toISOString().slice(0, 16);
}

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Saving…" : label}
    </Button>
  );
}

export function GameForm({
  game,
  seasons,
  action,
  mode,
}: {
  game?: Game;
  seasons: TeamSeason[];
  action: (prev: GameFormState, formData: FormData) => Promise<GameFormState>;
  mode: "create" | "edit";
}) {
  const router = useRouter();
  const [state, formAction] = useActionState(action, { success: false });
  const handledRef = useRef(false);
  const currentSeason = seasons.find((s) => s.isCurrent);

  useEffect(() => {
    if (!state.success || handledRef.current) return;
    handledRef.current = true;
    if (mode === "create" && state.gameId) {
      toast.success("Game created.");
      router.push(`/admin/games/${state.gameId}`);
    } else if (mode === "edit") {
      toast.success("Game updated.");
    }
  }, [state, mode, router]);

  return (
    <form action={formAction} className="space-y-6 max-w-xl">
      {state.error && (
        <p role="alert" className="text-sm text-rail-loss">
          {state.error}
        </p>
      )}

      <div>
        <Label htmlFor="seasonId" required>Season</Label>
        <Select id="seasonId" name="seasonId" defaultValue={game?.seasonId ?? currentSeason?.id ?? ""} required>
          <option value="" disabled>Select season</option>
          {seasons.map((s) => (
            <option key={s.id} value={s.id}>{s.label}</option>
          ))}
        </Select>
      </div>

      <div className="grid sm:grid-cols-2 gap-5">
        <div>
          <Label htmlFor="opponentName" required>Opponent</Label>
          <Input id="opponentName" name="opponentName" defaultValue={game?.opponentName} required />
        </div>
        <div>
          <Label htmlFor="competition">Competition</Label>
          <Input id="competition" name="competition" defaultValue={game?.competition ?? "Friendly"} />
        </div>
        <div>
          <Label htmlFor="dateTime" required>Date &amp; time</Label>
          <Input
            id="dateTime"
            name="dateTime"
            type="datetime-local"
            defaultValue={game ? toLocalInputValue(game.dateTime) : undefined}
            required
          />
        </div>
        <div>
          <Label htmlFor="venue" required>Venue</Label>
          <Input id="venue" name="venue" defaultValue={game?.venue} required />
        </div>
        <div>
          <Label htmlFor="homeAway">Home / Away</Label>
          <Select id="homeAway" name="homeAway" defaultValue={game?.homeAway ?? "HOME"}>
            <option value="HOME">Home</option>
            <option value="AWAY">Away</option>
            <option value="NEUTRAL">Neutral</option>
          </Select>
        </div>
        <div>
          <Label htmlFor="status">Status</Label>
          <Select id="status" name="status" defaultValue={game?.status ?? "UPCOMING"}>
            <option value="UPCOMING">Upcoming</option>
            <option value="LIVE">Live</option>
            <option value="COMPLETED">Completed</option>
            <option value="POSTPONED">Postponed</option>
            <option value="CANCELLED">Cancelled</option>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="opponentLogoUrl">Opponent logo URL</Label>
        <Input id="opponentLogoUrl" name="opponentLogoUrl" type="url" defaultValue={game?.opponentLogoUrl ?? ""} />
      </div>

      <SubmitButton label={mode === "create" ? "Create game" : "Save changes"} />
    </form>
  );
}
