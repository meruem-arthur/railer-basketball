import type { Metadata } from "next";
import Link from "next/link";
import { SectionHeading } from "@/components/ui/section-heading";
import { GameCard } from "@/components/games/game-card";
import { EmptyState } from "@/components/ui/empty-state";
import { CalendarDays } from "lucide-react";
import { getCurrentSeason } from "@/lib/services/season";
import { getSchedule, getDistinctCompetitions } from "@/lib/services/games";
import { cn } from "@/lib/utils/cn";

export const metadata: Metadata = {
  title: "Schedule",
  description: "Upcoming and completed UMaT SRID Railers fixtures.",
};

const TABS = [
  { label: "Upcoming", value: "UPCOMING" },
  { label: "Completed", value: "COMPLETED" },
  { label: "All", value: "ALL" },
] as const;

export default async function SchedulePage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; homeAway?: string; competition?: string }>;
}) {
  const { status, homeAway, competition } = await searchParams;
  const activeStatus = (status ?? "UPCOMING") as "UPCOMING" | "COMPLETED" | "ALL";

  const season = await getCurrentSeason();

  if (!season) {
    return (
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-20">
        <EmptyState icon={CalendarDays} title="No upcoming games" />
      </div>
    );
  }

  const [games, competitions] = await Promise.all([
    getSchedule({
      seasonId: season.id,
      status: activeStatus,
      homeAway: homeAway as "HOME" | "AWAY" | "NEUTRAL" | undefined,
      competition,
    }),
    getDistinctCompetitions(season.id),
  ]);

  const buildHref = (overrides: Record<string, string | undefined>) => {
    const params = new URLSearchParams({
      status: activeStatus,
      ...(homeAway ? { homeAway } : {}),
      ...(competition ? { competition } : {}),
      ...overrides,
    });
    for (const [k, v] of [...params.entries()]) if (!v) params.delete(k);
    const qs = params.toString();
    return qs ? `/schedule?${qs}` : "/schedule";
  };

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-16">
      <SectionHeading title="Schedule" subtitle={`${season.label} season`} />

      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div className="flex gap-2" role="tablist">
          {TABS.map((tab) => (
            <Link
              key={tab.value}
              href={buildHref({ status: tab.value })}
              role="tab"
              aria-selected={activeStatus === tab.value}
              className={cn(
                "px-4 py-2 text-sm font-semibold uppercase tracking-wide border transition-colors",
                activeStatus === tab.value
                  ? "border-rail-gold bg-rail-gold text-rail-bg"
                  : "border-rail-line text-rail-silver hover:text-rail-white"
              )}
            >
              {tab.label}
            </Link>
          ))}
        </div>

        <div className="flex gap-2 text-sm">
          <Link
            href={buildHref({ homeAway: homeAway === "HOME" ? undefined : "HOME" })}
            className={cn(
              "px-3 py-1.5 border",
              homeAway === "HOME"
                ? "border-rail-gold text-rail-gold"
                : "border-rail-line text-rail-silver"
            )}
          >
            Home
          </Link>
          <Link
            href={buildHref({ homeAway: homeAway === "AWAY" ? undefined : "AWAY" })}
            className={cn(
              "px-3 py-1.5 border",
              homeAway === "AWAY"
                ? "border-rail-gold text-rail-gold"
                : "border-rail-line text-rail-silver"
            )}
          >
            Away
          </Link>
          {competitions.map((c) => (
            <Link
              key={c}
              href={buildHref({ competition: competition === c ? undefined : c })}
              className={cn(
                "px-3 py-1.5 border hidden sm:inline-block",
                competition === c
                  ? "border-rail-gold text-rail-gold"
                  : "border-rail-line text-rail-silver"
              )}
            >
              {c}
            </Link>
          ))}
        </div>
      </div>

      {games.length === 0 ? (
        <EmptyState icon={CalendarDays} title="No upcoming games" description="Check the All tab for the full fixture list." />
      ) : (
        <div className="space-y-3">
          {games.map((g) => (
            <GameCard key={g.id} game={g} />
          ))}
        </div>
      )}
    </div>
  );
}
