import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { PlayCircle } from "lucide-react";
import { getGameById } from "@/lib/services/games";
import { Scoreboard } from "@/components/games/scoreboard";
import { GameStatusBadge } from "@/components/ui/badge";
import { Countdown } from "@/components/games/countdown";
import { formatDateTimeLong } from "@/lib/utils/format";
import { ButtonLink } from "@/components/ui/button";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const game = await getGameById(id);
  if (!game) return { title: "Game" };
  return {
    title: `Railers vs ${game.opponentName}`,
    description: game.gameReport ?? `${game.competition} · ${game.venue}`,
  };
}

export default async function GameDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const game = await getGameById(id);
  if (!game) notFound();

  const isCompleted = game.status === "COMPLETED";
  const isUpcoming = game.status === "UPCOMING" && game.dateTime.getTime() > Date.now();

  const topPerformers = [...game.playerStats].sort((a, b) => b.points - a.points).slice(0, 3);
  const mvp = game.playerStats.find((s) => s.playerSeasonId === game.mvpPlayerSeasonId);

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-16">
      <div className="mb-8 flex items-center justify-between">
        <p className="text-sm text-rail-silver">
          {game.season.label} · {game.competition}
        </p>
        <GameStatusBadge status={game.status} />
      </div>

      {isCompleted && game.railersScore !== null && game.opponentScore !== null ? (
        <Scoreboard
          opponentName={game.opponentName}
          railersScore={game.railersScore}
          opponentScore={game.opponentScore}
          dateTime={game.dateTime}
          competition={game.competition}
          venue={game.venue}
        />
      ) : (
        <div className="border border-rail-line bg-rail-navy p-8 sm:p-12 text-center">
          <p className="font-display text-3xl sm:text-4xl tracking-tight text-rail-white">
            RAILERS {game.homeAway === "HOME" ? "VS" : "AT"} {game.opponentName.toUpperCase()}
          </p>
          <p className="mt-3 text-rail-silver">{formatDateTimeLong(game.dateTime)}</p>
          <p className="text-rail-silver">{game.venue}</p>
          {isUpcoming && (
            <div className="mt-8 flex justify-center">
              <Countdown target={game.dateTime.toISOString()} />
            </div>
          )}
        </div>
      )}

      {game.quarterScores.length > 0 && (
        <div className="mt-10 border border-rail-line overflow-x-auto">
          <table className="w-full text-sm min-w-[400px]">
            <thead>
              <tr className="border-b border-rail-line text-left text-xs uppercase tracking-wide text-rail-silver">
                <th className="py-3 px-4">Team</th>
                {game.quarterScores.map((q) => (
                  <th key={q.id} className="py-3 px-4 text-center">
                    {q.quarter <= 4 ? `Q${q.quarter}` : `OT${q.quarter - 4}`}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-rail-line/60">
                <td className="py-3 px-4 font-medium text-rail-white">Railers</td>
                {game.quarterScores.map((q) => (
                  <td key={q.id} className="py-3 px-4 text-center tabular-nums">
                    {q.railersScore}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-3 px-4 font-medium text-rail-white">{game.opponentName}</td>
                {game.quarterScores.map((q) => (
                  <td key={q.id} className="py-3 px-4 text-center tabular-nums">
                    {q.opponentScore}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {game.gameReport && (
        <div className="mt-10 prose-invert max-w-none">
          <h2 className="font-display text-2xl tracking-tight text-rail-white mb-3">Game Report</h2>
          <p className="text-rail-silver leading-relaxed whitespace-pre-line">{game.gameReport}</p>
        </div>
      )}

      {(topPerformers.length > 0 || mvp) && (
        <div className="mt-10">
          <h2 className="font-display text-2xl tracking-tight text-rail-white mb-4">Box Score</h2>
          <div className="border border-rail-line overflow-x-auto">
            <table className="w-full text-sm min-w-[500px]">
              <thead>
                <tr className="border-b border-rail-line text-left text-xs uppercase tracking-wide text-rail-silver">
                  <th className="py-3 px-4">Player</th>
                  <th className="py-3 px-4 text-center">PTS</th>
                  <th className="py-3 px-4 text-center">REB</th>
                  <th className="py-3 px-4 text-center">AST</th>
                  <th className="py-3 px-4 text-center">STL</th>
                  <th className="py-3 px-4 text-center">BLK</th>
                </tr>
              </thead>
              <tbody>
                {game.playerStats.map((s) => (
                  <tr key={s.id} className="border-b border-rail-line/60">
                    <td className="py-3 px-4">
                      <Link
                        href={`/team/${s.playerSeason.player.slug}`}
                        className="text-rail-white hover:text-rail-gold"
                      >
                        {s.playerSeason.player.firstName} {s.playerSeason.player.lastName}
                        {s.playerSeasonId === game.mvpPlayerSeasonId && (
                          <span className="ml-2 text-xs text-rail-gold font-semibold uppercase">MVP</span>
                        )}
                      </Link>
                    </td>
                    <td className="py-3 px-4 text-center tabular-nums font-semibold text-rail-gold">
                      {s.points}
                    </td>
                    <td className="py-3 px-4 text-center tabular-nums">{s.rebounds}</td>
                    <td className="py-3 px-4 text-center tabular-nums">{s.assists}</td>
                    <td className="py-3 px-4 text-center tabular-nums">{s.steals}</td>
                    <td className="py-3 px-4 text-center tabular-nums">{s.blocks}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {game.highlightUrl && (
        <div className="mt-10">
          <ButtonLink href={game.highlightUrl} target="_blank" rel="noopener noreferrer" variant="outline">
            <PlayCircle className="h-4 w-4" /> Watch highlights
          </ButtonLink>
        </div>
      )}

      {game.galleryAlbums.length > 0 && game.galleryAlbums[0].images.length > 0 && (
        <div className="mt-10">
          <h2 className="font-display text-2xl tracking-tight text-rail-white mb-4">Photos</h2>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {game.galleryAlbums[0].images.map((img) => (
              <div key={img.id} className="relative aspect-square overflow-hidden border border-rail-line">
                <Image src={img.secureUrl} alt={img.altText} fill sizes="16vw" className="object-cover" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
