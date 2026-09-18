import { SectionHeading } from "@/components/ui/section-heading";
import { ButtonLink } from "@/components/ui/button";
import { Scoreboard } from "@/components/games/scoreboard";
import { EmptyState } from "@/components/ui/empty-state";
import { Trophy } from "lucide-react";
import type { Game } from "@prisma/client";

export function LatestResultSection({ game }: { game: Game | null }) {
  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
      <SectionHeading title="Latest Result" />
      {!game || game.railersScore === null || game.opponentScore === null ? (
        <EmptyState icon={Trophy} title="No results yet" description="The first game report will appear here." />
      ) : (
        <div className="space-y-6">
          <Scoreboard
            opponentName={game.opponentName}
            railersScore={game.railersScore}
            opponentScore={game.opponentScore}
            dateTime={game.dateTime}
            competition={game.competition}
            venue={game.venue}
          />
          <div className="flex justify-center">
            <ButtonLink href={`/games/${game.id}`} variant="outline">
              View game report
            </ButtonLink>
          </div>
        </div>
      )}
    </section>
  );
}
