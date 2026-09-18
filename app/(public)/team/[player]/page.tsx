import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import { getPlayerBySlug } from "@/lib/services/players";
import { getPlayerCareerHistory } from "@/lib/services/stats";
import { getCurrentSeason } from "@/lib/services/season";
import { StatCard } from "@/components/ui/stat-card";
import {
  academicLevelLabel,
  heightDisplay,
  playerFullName,
  positionLabel,
} from "@/lib/utils/format";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ player: string }>;
}): Promise<Metadata> {
  const { player: slug } = await params;
  const player = await getPlayerBySlug(slug);
  if (!player) return { title: "Player" };
  return {
    title: playerFullName(player),
    description: player.bio ?? `${playerFullName(player)} — UMaT SRID Railers`,
  };
}

export default async function PlayerProfilePage({
  params,
}: {
  params: Promise<{ player: string }>;
}) {
  const { player: slug } = await params;
  const [player, currentSeason] = await Promise.all([
    getPlayerBySlug(slug),
    getCurrentSeason(),
  ]);

  if (!player) notFound();

  const history = await getPlayerCareerHistory(player.id);
  const currentPlayerSeason = player.seasons.find((s) => s.seasonId === currentSeason?.id);
  const currentStats = history.find((h) => h.seasonId === currentSeason?.id);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
      <div className="grid lg:grid-cols-5 gap-10">
        <div className="lg:col-span-2">
          <div className="relative aspect-[3/4] bg-rail-navy-light border border-rail-line overflow-hidden">
            {player.photoUrl ? (
              <Image
                src={player.photoUrl}
                alt={playerFullName(player)}
                fill
                sizes="(max-width: 1024px) 100vw, 40vw"
                className="object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center font-display text-8xl text-rail-line">
                {currentPlayerSeason?.jerseyNumber ?? ""}
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-3">
          {currentPlayerSeason && (
            <p className="font-display text-2xl text-rail-gold">#{currentPlayerSeason.jerseyNumber}</p>
          )}
          <h1 className="font-display text-5xl sm:text-6xl tracking-tight text-rail-white text-balance">
            {playerFullName(player)}
          </h1>

          <dl className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
            {currentPlayerSeason && (
              <div>
                <dt className="text-rail-silver uppercase text-xs tracking-wide">Position</dt>
                <dd className="mt-1 text-rail-white">{positionLabel(currentPlayerSeason.position)}</dd>
              </div>
            )}
            {player.heightCm && (
              <div>
                <dt className="text-rail-silver uppercase text-xs tracking-wide">Height</dt>
                <dd className="mt-1 text-rail-white">{heightDisplay(player.heightCm)}</dd>
              </div>
            )}
            {player.academicLevel && (
              <div>
                <dt className="text-rail-silver uppercase text-xs tracking-wide">Level</dt>
                <dd className="mt-1 text-rail-white">{academicLevelLabel(player.academicLevel)}</dd>
              </div>
            )}
            {player.programme && (
              <div>
                <dt className="text-rail-silver uppercase text-xs tracking-wide">Programme</dt>
                <dd className="mt-1 text-rail-white">{player.programme}</dd>
              </div>
            )}
            {player.yearJoined && (
              <div>
                <dt className="text-rail-silver uppercase text-xs tracking-wide">Joined</dt>
                <dd className="mt-1 text-rail-white">{player.yearJoined}</dd>
              </div>
            )}
            {player.hometown && (
              <div>
                <dt className="text-rail-silver uppercase text-xs tracking-wide">Hometown</dt>
                <dd className="mt-1 text-rail-white">{player.hometown}</dd>
              </div>
            )}
          </dl>

          {player.bio && <p className="mt-8 text-rail-silver leading-relaxed max-w-2xl">{player.bio}</p>}

          {currentStats && currentStats.gamesPlayed > 0 && (
            <div className="mt-10">
              <p className="text-xs font-semibold uppercase tracking-wide text-rail-silver mb-3">
                {currentSeason?.label} Season
              </p>
              <div className="grid grid-cols-4 gap-3 max-w-md">
                <StatCard label="Games" value={currentStats.gamesPlayed} />
                <StatCard label="PPG" value={currentStats.ppg} highlight />
                <StatCard label="RPG" value={currentStats.rpg} />
                <StatCard label="APG" value={currentStats.apg} />
              </div>
            </div>
          )}
        </div>
      </div>

      {history.length > 0 && (
        <div className="mt-16">
          <h2 className="font-display text-3xl tracking-tight text-rail-white mb-6">
            Season History
          </h2>
          <div className="border border-rail-line overflow-x-auto">
            <table className="w-full text-sm min-w-[480px]">
              <thead>
                <tr className="border-b border-rail-line text-left text-xs uppercase tracking-wide text-rail-silver">
                  <th className="py-3 px-4">Season</th>
                  <th className="py-3 px-4">#</th>
                  <th className="py-3 px-4">GP</th>
                  <th className="py-3 px-4">PPG</th>
                  <th className="py-3 px-4">RPG</th>
                  <th className="py-3 px-4">APG</th>
                </tr>
              </thead>
              <tbody>
                {history.map((h) => (
                  <tr key={h.seasonId} className="border-b border-rail-line/60">
                    <td className="py-3 px-4 font-medium text-rail-white">{h.seasonLabel}</td>
                    <td className="py-3 px-4 text-rail-silver">#{h.jerseyNumber}</td>
                    <td className="py-3 px-4 text-rail-silver">{h.gamesPlayed}</td>
                    <td className="py-3 px-4 text-rail-gold font-semibold">{h.ppg}</td>
                    <td className="py-3 px-4 text-rail-silver">{h.rpg}</td>
                    <td className="py-3 px-4 text-rail-silver">{h.apg}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
