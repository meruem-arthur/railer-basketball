import type { Metadata } from "next";
import { SectionHeading } from "@/components/ui/section-heading";
import { GameCard } from "@/components/games/game-card";
import { EmptyState } from "@/components/ui/empty-state";
import { Trophy } from "lucide-react";
import { getCurrentSeason } from "@/lib/services/season";
import { getSchedule } from "@/lib/services/games";
import { getPageHero } from "@/lib/services/hero";
import { PageBanner } from "@/components/layout/page-banner";

export const metadata: Metadata = {
  title: "Results",
  description: "UMaT SRID Railers game results this season.",
};

export default async function ResultsPage() {
  const hero = await getPageHero("results");
  const season = await getCurrentSeason();

  if (!season) {
    return (
      <>
        <PageBanner hero={hero} title="Results" />
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-20">
        <EmptyState icon={Trophy} title="No results yet" />
        </div>
      </>
    );
  }

  const games = await getSchedule({ seasonId: season.id, status: "COMPLETED" });

  return (
    <>
      <PageBanner hero={hero} title="Results" subtitle={`${season.label} season`} />
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-16">
      <SectionHeading compact={Boolean(hero?.imageUrl)} title="Results" subtitle={`${season.label} season`} />
      {games.length === 0 ? (
        <EmptyState icon={Trophy} title="No results yet" description="Results will appear here after the first game." />
      ) : (
        <div className="space-y-3">
          {games.map((g) => (
            <GameCard key={g.id} game={g} />
          ))}
        </div>
      )}
      </div>
    </>
  );
}
