import type { Metadata } from "next";
import { SectionHeading } from "@/components/ui/section-heading";
import { GameCard } from "@/components/games/game-card";
import { EmptyState } from "@/components/ui/empty-state";
import { Trophy } from "lucide-react";
import { getCurrentSeason } from "@/lib/services/season";
import { getSchedule } from "@/lib/services/games";

export const metadata: Metadata = {
  title: "Results",
  description: "UMaT SRID Railers game results this season.",
};

export default async function ResultsPage() {
  const season = await getCurrentSeason();

  if (!season) {
    return (
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-20">
        <EmptyState icon={Trophy} title="No results yet" />
      </div>
    );
  }

  const games = await getSchedule({ seasonId: season.id, status: "COMPLETED" });

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-16">
      <SectionHeading title="Results" subtitle={`${season.label} season`} />
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
  );
}
