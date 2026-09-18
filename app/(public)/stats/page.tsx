import type { Metadata } from "next";
import Link from "next/link";
import { SectionHeading } from "@/components/ui/section-heading";
import { StatCard } from "@/components/ui/stat-card";
import { EmptyState } from "@/components/ui/empty-state";
import { BarChart3 } from "lucide-react";
import { getAllSeasons, getCurrentSeason } from "@/lib/services/season";
import { getTeamRecord, getPlayerSeasonTotals } from "@/lib/services/stats";
import { cn } from "@/lib/utils/cn";

export const metadata: Metadata = {
  title: "Statistics",
  description: "UMaT SRID Railers team and player statistics.",
};

export default async function StatsPage({
  searchParams,
}: {
  searchParams: Promise<{ season?: string }>;
}) {
  const { season: seasonParam } = await searchParams;
  const [seasons, currentSeason] = await Promise.all([getAllSeasons(), getCurrentSeason()]);

  const activeSeason = seasonParam
    ? seasons.find((s) => s.id === seasonParam) ?? currentSeason
    : currentSeason;

  if (!activeSeason) {
    return (
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-20">
        <EmptyState icon={BarChart3} title="Statistics will appear after the first game" />
      </div>
    );
  }

  const [record, players] = await Promise.all([
    getTeamRecord(activeSeason.id),
    getPlayerSeasonTotals(activeSeason.id),
  ]);

  const sortedByPoints = [...players].sort((a, b) => b.ppg - a.ppg);

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-16">
      <SectionHeading
        title="Statistics"
        action={
          seasons.length > 1 ? (
            <div className="flex gap-2 flex-wrap">
              {seasons.map((s) => (
                <Link
                  key={s.id}
                  href={`/stats?season=${s.id}`}
                  className={cn(
                    "px-3 py-1.5 text-sm border",
                    activeSeason.id === s.id
                      ? "border-rail-gold text-rail-gold"
                      : "border-rail-line text-rail-silver"
                  )}
                >
                  {s.label}
                </Link>
              ))}
            </div>
          ) : undefined
        }
      />

      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-rail-silver mb-3">
          Team
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard label="Games" value={record.gamesPlayed} />
          <StatCard label="Wins" value={record.wins} highlight />
          <StatCard label="Losses" value={record.losses} />
          <StatCard label="Win %" value={record.winPct} suffix="%" />
          <StatCard label="Avg Pts" value={record.avgPointsFor} />
          <StatCard label="Avg Pts Against" value={record.avgPointsAgainst} />
          <StatCard label="Avg Rebounds" value={record.avgRebounds} />
          <StatCard label="Avg Assists" value={record.avgAssists} />
        </div>
      </div>

      <div className="mt-14">
        <p className="text-xs font-semibold uppercase tracking-wide text-rail-silver mb-3">
          Player Leaders
        </p>
        {sortedByPoints.length === 0 ? (
          <EmptyState
            icon={BarChart3}
            title="Statistics will appear after the first game"
          />
        ) : (
          <div className="border border-rail-line overflow-x-auto">
            <table className="w-full text-sm min-w-[560px]">
              <thead>
                <tr className="border-b border-rail-line text-left text-xs uppercase tracking-wide text-rail-silver">
                  <th className="py-3 px-4">Player</th>
                  <th className="py-3 px-4 text-center">GP</th>
                  <th className="py-3 px-4 text-center">PPG</th>
                  <th className="py-3 px-4 text-center">RPG</th>
                  <th className="py-3 px-4 text-center">APG</th>
                  <th className="py-3 px-4 text-center">STL</th>
                  <th className="py-3 px-4 text-center">BLK</th>
                </tr>
              </thead>
              <tbody>
                {sortedByPoints.map((p) => (
                  <tr key={p.playerSeasonId} className="border-b border-rail-line/60">
                    <td className="py-3 px-4">
                      <Link href={`/team/${p.slug}`} className="text-rail-white hover:text-rail-gold">
                        #{p.jerseyNumber} {p.firstName} {p.lastName}
                      </Link>
                    </td>
                    <td className="py-3 px-4 text-center tabular-nums">{p.gamesPlayed}</td>
                    <td className="py-3 px-4 text-center tabular-nums font-semibold text-rail-gold">
                      {p.ppg}
                    </td>
                    <td className="py-3 px-4 text-center tabular-nums">{p.rpg}</td>
                    <td className="py-3 px-4 text-center tabular-nums">{p.apg}</td>
                    <td className="py-3 px-4 text-center tabular-nums">{p.steals}</td>
                    <td className="py-3 px-4 text-center tabular-nums">{p.blocks}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
