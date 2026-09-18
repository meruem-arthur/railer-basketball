"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { toast } from "sonner";
import { Label, Input, Textarea, Select } from "@/components/ui/form-field";
import { Button } from "@/components/ui/button";
import { submitResultAction, type ResultFormState } from "@/app/admin/(dashboard)/games/actions";

interface RosterOption {
  id: string; // playerSeasonId
  jerseyNumber: number;
  name: string;
}

interface ExistingQuarter {
  quarter: number;
  railersScore: number;
  opponentScore: number;
}

interface ExistingStat {
  playerSeasonId: string;
  minutes: number | null;
  points: number;
  rebounds: number;
  assists: number;
  steals: number;
  blocks: number;
  turnovers: number;
  fouls: number;
  fieldGoalsMade: number;
  fieldGoalsAttempted: number;
  threePointersMade: number;
  threePointersAttempted: number;
  freeThrowsMade: number;
  freeThrowsAttempted: number;
}

const STAT_FIELDS: (keyof ExistingStat)[] = [
  "points",
  "rebounds",
  "assists",
  "steals",
  "blocks",
  "turnovers",
  "fouls",
];

function emptyStatRow(playerSeasonId: string): ExistingStat {
  return {
    playerSeasonId,
    minutes: null,
    points: 0,
    rebounds: 0,
    assists: 0,
    steals: 0,
    blocks: 0,
    turnovers: 0,
    fouls: 0,
    fieldGoalsMade: 0,
    fieldGoalsAttempted: 0,
    threePointersMade: 0,
    threePointersAttempted: 0,
    freeThrowsMade: 0,
    freeThrowsAttempted: 0,
  };
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" disabled={pending}>
      {pending ? "Saving result…" : "Save result"}
    </Button>
  );
}

export function ResultEntryForm({
  gameId,
  opponentName,
  roster,
  existingQuarters,
  existingStats,
  existingMvp,
  existingReport,
  existingHighlight,
}: {
  gameId: string;
  opponentName: string;
  roster: RosterOption[];
  existingQuarters: ExistingQuarter[];
  existingStats: ExistingStat[];
  existingMvp: string | null;
  existingReport: string | null;
  existingHighlight: string | null;
}) {
  const [state, formAction] = useActionState<ResultFormState, FormData>(submitResultAction, {
    success: false,
  });
  const handledRef = useRef(false);

  const [quarters, setQuarters] = useState<ExistingQuarter[]>(
    existingQuarters.length > 0
      ? existingQuarters
      : [1, 2, 3, 4].map((q) => ({ quarter: q, railersScore: 0, opponentScore: 0 }))
  );

  const [statsByPlayer, setStatsByPlayer] = useState<Record<string, ExistingStat>>(() => {
    const initial: Record<string, ExistingStat> = {};
    for (const s of existingStats) initial[s.playerSeasonId] = s;
    return initial;
  });

  const [activePlayers, setActivePlayers] = useState<Set<string>>(
    new Set(existingStats.map((s) => s.playerSeasonId))
  );

  useEffect(() => {
    if (!state.success || handledRef.current) return;
    handledRef.current = true;
    toast.success("Result saved.");
  }, [state]);

  const totalRailers = quarters.reduce((sum, q) => sum + (q.railersScore || 0), 0);
  const totalOpponent = quarters.reduce((sum, q) => sum + (q.opponentScore || 0), 0);

  function updateQuarter(index: number, field: "railersScore" | "opponentScore", value: number) {
    setQuarters((prev) => prev.map((q, i) => (i === index ? { ...q, [field]: value } : q)));
  }

  function toggleActive(playerSeasonId: string) {
    setActivePlayers((prev) => {
      const next = new Set(prev);
      if (next.has(playerSeasonId)) {
        next.delete(playerSeasonId);
      } else {
        next.add(playerSeasonId);
        if (!statsByPlayer[playerSeasonId]) {
          setStatsByPlayer((s) => ({ ...s, [playerSeasonId]: emptyStatRow(playerSeasonId) }));
        }
      }
      return next;
    });
  }

  function updateStat(playerSeasonId: string, field: keyof ExistingStat, value: number) {
    setStatsByPlayer((prev) => ({
      ...prev,
      [playerSeasonId]: { ...(prev[playerSeasonId] ?? emptyStatRow(playerSeasonId)), [field]: value },
    }));
  }

  const activeStats = roster
    .filter((p) => activePlayers.has(p.id))
    .map((p) => statsByPlayer[p.id] ?? emptyStatRow(p.id));

  return (
    <form action={formAction} className="space-y-10">
      <input type="hidden" name="gameId" value={gameId} />
      <input type="hidden" name="quarterScoresJson" value={JSON.stringify(quarters)} />
      <input type="hidden" name="playerStatsJson" value={JSON.stringify(activeStats)} />

      {state.error && (
        <p role="alert" className="text-sm text-rail-loss">
          {state.error}
        </p>
      )}

      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-rail-silver mb-3">
          Final Score
        </p>
        <div className="grid grid-cols-2 gap-5 max-w-md">
          <div>
            <Label htmlFor="railersScore">Railers</Label>
            <Input
              id="railersScore"
              name="railersScore"
              type="number"
              min={0}
              defaultValue={totalRailers || undefined}
              key={totalRailers}
              required
            />
          </div>
          <div>
            <Label htmlFor="opponentScore">{opponentName}</Label>
            <Input
              id="opponentScore"
              name="opponentScore"
              type="number"
              min={0}
              defaultValue={totalOpponent || undefined}
              key={totalOpponent}
              required
            />
          </div>
        </div>
      </div>

      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-rail-silver mb-3">
          Quarter Scores
        </p>
        <div className="border border-rail-line overflow-x-auto">
          <table className="w-full text-sm min-w-[400px]">
            <thead>
              <tr className="border-b border-rail-line text-left text-xs uppercase tracking-wide text-rail-silver">
                <th className="py-2.5 px-4">Team</th>
                {quarters.map((q, i) => (
                  <th key={i} className="py-2.5 px-4">Q{q.quarter}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-rail-line/60">
                <td className="py-2.5 px-4 text-rail-white">Railers</td>
                {quarters.map((q, i) => (
                  <td key={i} className="py-2 px-2">
                    <Input
                      type="number"
                      min={0}
                      value={q.railersScore}
                      onChange={(e) => updateQuarter(i, "railersScore", Number(e.target.value))}
                      className="w-16"
                    />
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-2.5 px-4 text-rail-white">{opponentName}</td>
                {quarters.map((q, i) => (
                  <td key={i} className="py-2 px-2">
                    <Input
                      type="number"
                      min={0}
                      value={q.opponentScore}
                      onChange={(e) => updateQuarter(i, "opponentScore", Number(e.target.value))}
                      className="w-16"
                    />
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-rail-silver mb-3">
          Box Score — select players who appeared
        </p>
        <div className="space-y-2">
          {roster.map((p) => {
            const isActive = activePlayers.has(p.id);
            const stat = statsByPlayer[p.id] ?? emptyStatRow(p.id);
            return (
              <div key={p.id} className="border border-rail-line">
                <label className="flex items-center gap-3 px-4 py-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={() => toggleActive(p.id)}
                    className="accent-rail-gold"
                  />
                  <span className="text-sm font-medium text-rail-white">
                    #{p.jerseyNumber} {p.name}
                  </span>
                </label>
                {isActive && (
                  <div className="grid grid-cols-4 sm:grid-cols-7 gap-3 px-4 pb-4">
                    {STAT_FIELDS.map((field) => (
                      <div key={field}>
                        <label className="block text-[10px] uppercase tracking-wide text-rail-silver mb-1">
                          {field.slice(0, 3).toUpperCase()}
                        </label>
                        <Input
                          type="number"
                          min={0}
                          value={stat[field] as number}
                          onChange={(e) => updateStat(p.id, field, Number(e.target.value))}
                          className="text-sm py-1.5"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div>
        <Label htmlFor="mvpPlayerSeasonId">MVP</Label>
        <Select id="mvpPlayerSeasonId" name="mvpPlayerSeasonId" defaultValue={existingMvp ?? ""} className="max-w-sm">
          <option value="">No MVP selected</option>
          {roster
            .filter((p) => activePlayers.has(p.id))
            .map((p) => (
              <option key={p.id} value={p.id}>
                #{p.jerseyNumber} {p.name}
              </option>
            ))}
        </Select>
      </div>

      <div>
        <Label htmlFor="gameReport">Game report</Label>
        <Textarea id="gameReport" name="gameReport" rows={5} defaultValue={existingReport ?? ""} />
      </div>

      <div>
        <Label htmlFor="highlightUrl">Highlight video URL</Label>
        <Input id="highlightUrl" name="highlightUrl" type="url" defaultValue={existingHighlight ?? ""} />
      </div>

      <SubmitButton />
    </form>
  );
}
