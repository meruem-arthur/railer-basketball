import type { Metadata } from "next";
import { SectionHeading } from "@/components/ui/section-heading";
import { PlayerCard } from "@/components/team/player-card";
import { EmptyState } from "@/components/ui/empty-state";
import { Users } from "lucide-react";
import { getCurrentSeason } from "@/lib/services/season";
import { getRosterForSeason } from "@/lib/services/players";
import { getPlayerSeasonTotals } from "@/lib/services/stats";
import Link from "next/link";
import { cn } from "@/lib/utils/cn";

export const metadata: Metadata = {
  title: "Team",
  description: "The UMaT SRID Railers basketball roster.",
};

const FILTERS = [
  { label: "All", value: undefined },
  { label: "Guards", value: "GUARD" },
  { label: "Forwards", value: "FORWARD" },
  { label: "Centers", value: "CENTER" },
] as const;

function matchesGroup(position: string, group?: string) {
  if (!group) return true;
  if (group === "GUARD") return position === "POINT_GUARD" || position === "SHOOTING_GUARD";
  if (group === "FORWARD") return position === "SMALL_FORWARD" || position === "POWER_FORWARD";
  if (group === "CENTER") return position === "CENTER";
  return true;
}

export default async function TeamPage({
  searchParams,
}: {
  searchParams: Promise<{ position?: string }>;
}) {
  const { position } = await searchParams;
  const season = await getCurrentSeason();

  if (!season) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
        <EmptyState icon={Users} title="Roster coming soon" />
      </div>
    );
  }

  const [roster, totals] = await Promise.all([
    getRosterForSeason(season.id),
    getPlayerSeasonTotals(season.id),
  ]);

  const statsByPlayerSeason = new Map(totals.map((t) => [t.playerSeasonId, t]));
  const filtered = roster.filter((ps) => matchesGroup(ps.position, position));

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
      <SectionHeading title="The Roster" subtitle={`${season.label} season`} />

      <div className="flex flex-wrap gap-2 mb-10" role="tablist" aria-label="Filter by position">
        {FILTERS.map((f) => {
          const isActive = position === f.value || (!position && !f.value);
          const href = f.value ? `/team?position=${f.value}` : "/team";
          return (
            <Link
              key={f.label}
              href={href}
              role="tab"
              aria-selected={isActive}
              className={cn(
                "px-4 py-2 text-sm font-semibold uppercase tracking-wide border transition-colors",
                isActive
                  ? "border-rail-gold bg-rail-gold text-rail-bg"
                  : "border-rail-line text-rail-silver hover:text-rail-white"
              )}
            >
              {f.label}
            </Link>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={Users} title="No players in this group" />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
          {filtered.map((ps) => {
            const s = statsByPlayerSeason.get(ps.id);
            return (
              <PlayerCard
                key={ps.id}
                slug={ps.player.slug}
                firstName={ps.player.firstName}
                lastName={ps.player.lastName}
                jerseyNumber={ps.jerseyNumber}
                position={ps.position}
                photoUrl={ps.player.photoUrl}
                ppg={s?.ppg}
                rpg={s?.rpg}
                apg={s?.apg}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
