import { SectionHeading } from "@/components/ui/section-heading";
import { ButtonLink } from "@/components/ui/button";
import { PlayerCard } from "@/components/team/player-card";
import { EmptyState } from "@/components/ui/empty-state";
import { Users } from "lucide-react";
import type { Player, PlayerSeason } from "@prisma/client";

type FeaturedPlayer = PlayerSeason & { player: Player };

export function TeamSnapshot({ players }: { players: FeaturedPlayer[] }) {
  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
      <SectionHeading
        title="Meet the Railers"
        subtitle="The roster driving this season's campaign."
        action={<ButtonLink href="/team" variant="outline">View full roster</ButtonLink>}
      />

      {players.length === 0 ? (
        <EmptyState icon={Users} title="Roster coming soon" />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
          {players.map((ps) => (
            <PlayerCard
              key={ps.id}
              slug={ps.player.slug}
              firstName={ps.player.firstName}
              lastName={ps.player.lastName}
              jerseyNumber={ps.jerseyNumber}
              position={ps.position}
              photoUrl={ps.player.photoUrl}
            />
          ))}
        </div>
      )}
    </section>
  );
}
