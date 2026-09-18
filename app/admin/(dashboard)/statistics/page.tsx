import type { Metadata } from "next";
import { StatCard } from "@/components/ui/stat-card";
import { SeasonSelect } from "@/components/admin/season-select";
import { getAllSeasons, getCurrentSeason } from "@/lib/services/season";
import { getTeamRecord, getPlayerSeasonTotals } from "@/lib/services/stats";

export const metadata: Metadata = { title: "Statistics" };

export default async function AdminStatisticsPage({
  searchParams,
}: {
  searchParams: Promise<{ season?: string }>;
}) {
  const { season: seasonParam } = await searchParams;
  const [seasons, currentSeason] = await Promise.all([getAllSeasons(), getCurrentSeason()]);
  const activeSeason = seasonParam ? seasons.find((s) => s.id === seasonParam) ?? currentSeason : currentSeason;

  if (!activeSeason) {
    return (
      <div>
        <h1 className="font-display text-4xl tracking-tight text-rail-white mb-8">Statistics</h1>
        <p className="text-rail-silver">Set a current season to see statistics here.</p>
      </div>
    );
  }

  const [record, players] = await Promise.all([
    getTeamRecord(activeSeason.id),
    getPlayerSeasonTotals(activeSeason.id),
  ]);

  return (
    <div>
      <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
        <h1 className="font-display text-4xl tracking-tight text-rail-white">Statistics</h1>
        <SeasonSelect seasons={seasons} activeSeasonId={activeSeason.id} />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-12">
        <StatCard label="Games" value={record.gamesPlayed} />
        <StatCard label="Wins" value={record.wins} highlight />
        <StatCard label="Losses" value={record.losses} />
        <StatCard label="Win %" value={record.winPct} suffix="%" />
      </div>

      <div className="border border-rail-line overflow-x-auto">
        <table className="w-full text-sm min-w-[600px]">
          <thead>
            <tr className="border-b border-rail-line text-left text-xs uppercase tracking-wide text-rail-silver">
              <th className="py-3 px-4">Player</th>
              <th className="py-3 px-4 text-center">GP</th>
              <th className="py-3 px-4 text-center">PPG</th>
              <th className="py-3 px-4 text-center">RPG</th>
              <th className="py-3 px-4 text-center">APG</th>
            </tr>
          </thead>
          <tbody>
            {players.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-rail-silver">
                  No statistics recorded yet for this season.
                </td>
              </tr>
            ) : (
              players
                .sort((a, b) => b.ppg - a.ppg)
                .map((p) => (
                  <tr key={p.playerSeasonId} className="border-b border-rail-line/60">
                    <td className="py-3 px-4 text-rail-white">#{p.jerseyNumber} {p.firstName} {p.lastName}</td>
                    <td className="py-3 px-4 text-center tabular-nums">{p.gamesPlayed}</td>
                    <td className="py-3 px-4 text-center tabular-nums text-rail-gold font-semibold">{p.ppg}</td>
                    <td className="py-3 px-4 text-center tabular-nums">{p.rpg}</td>
                    <td className="py-3 px-4 text-center tabular-nums">{p.apg}</td>
                  </tr>
                ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
