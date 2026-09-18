import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { GameForm } from "@/components/admin/game-form";
import { ResultEntryForm } from "@/components/admin/result-entry-form";
import { getAllSeasons } from "@/lib/services/season";
import {
  updateGameAction,
  cancelGameAction,
  postponeGameAction,
} from "@/app/admin/(dashboard)/games/actions";
import { Button } from "@/components/ui/button";
import { GameStatusBadge } from "@/components/ui/badge";

export const metadata: Metadata = { title: "Edit Game" };

export default async function AdminGameDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [game, seasons] = await Promise.all([
    prisma.game.findUnique({
      where: { id },
      include: {
        quarterScores: { orderBy: { quarter: "asc" } },
        playerStats: true,
      },
    }),
    getAllSeasons(),
  ]);

  if (!game) notFound();

  const roster = await prisma.playerSeason.findMany({
    where: { seasonId: game.seasonId },
    include: { player: true },
    orderBy: { jerseyNumber: "asc" },
  });

  const rosterOptions = roster.map((r) => ({
    id: r.id,
    jerseyNumber: r.jerseyNumber,
    name: `${r.player.firstName} ${r.player.lastName}`,
  }));

  const boundUpdate = updateGameAction.bind(null, game.id);

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
        <div>
          <h1 className="font-display text-4xl tracking-tight text-rail-white">
            Railers {game.homeAway === "HOME" ? "vs" : "at"} {game.opponentName}
          </h1>
          <div className="mt-2"><GameStatusBadge status={game.status} /></div>
        </div>
        <div className="flex gap-2">
          {game.status !== "CANCELLED" && (
            <form action={async () => { "use server"; await postponeGameAction(game.id); }}>
              <Button variant="outline" size="sm">Postpone</Button>
            </form>
          )}
          {game.status !== "CANCELLED" && (
            <form action={async () => { "use server"; await cancelGameAction(game.id); }}>
              <Button variant="outline" size="sm">Cancel</Button>
            </form>
          )}
        </div>
      </div>

      <section className="mb-16">
        <h2 className="font-display text-2xl tracking-tight text-rail-white mb-5">Game Details</h2>
        <GameForm game={game} seasons={seasons} action={boundUpdate} mode="edit" />
      </section>

      <section className="border-t border-rail-line pt-10">
        <h2 className="font-display text-2xl tracking-tight text-rail-white mb-2">Result Entry</h2>
        <p className="text-sm text-rail-silver mb-6">
          Saving a result automatically marks this game as Completed and updates public stats.
        </p>
        {rosterOptions.length === 0 ? (
          <p className="text-rail-silver">
            No players are assigned to this game&apos;s season yet. Assign players to the season
            before entering a box score.
          </p>
        ) : (
          <ResultEntryForm
            gameId={game.id}
            opponentName={game.opponentName}
            roster={rosterOptions}
            existingQuarters={game.quarterScores.map((q) => ({
              quarter: q.quarter,
              railersScore: q.railersScore,
              opponentScore: q.opponentScore,
            }))}
            existingStats={game.playerStats.map((s) => ({
              playerSeasonId: s.playerSeasonId,
              minutes: s.minutes,
              points: s.points,
              rebounds: s.rebounds,
              assists: s.assists,
              steals: s.steals,
              blocks: s.blocks,
              turnovers: s.turnovers,
              fouls: s.fouls,
              fieldGoalsMade: s.fieldGoalsMade,
              fieldGoalsAttempted: s.fieldGoalsAttempted,
              threePointersMade: s.threePointersMade,
              threePointersAttempted: s.threePointersAttempted,
              freeThrowsMade: s.freeThrowsMade,
              freeThrowsAttempted: s.freeThrowsAttempted,
            }))}
            existingMvp={game.mvpPlayerSeasonId}
            existingReport={game.gameReport}
            existingHighlight={game.highlightUrl}
          />
        )}
      </section>
    </div>
  );
}
