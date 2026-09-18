import { Countdown } from "@/components/games/countdown";
import { EmptyState } from "@/components/ui/empty-state";
import { CalendarClock } from "lucide-react";
import { formatDateTimeLong } from "@/lib/utils/format";
import type { Game } from "@prisma/client";

export function NextGameSection({ game }: { game: Game | null }) {
  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
      {!game ? (
        <EmptyState
          icon={CalendarClock}
          title="Next game to be announced"
          description="Check back soon for the latest fixture."
        />
      ) : (
        <div className="relative overflow-hidden border border-rail-line bg-rail-navy">
          <div className="grid lg:grid-cols-5">
            <div className="lg:col-span-3 p-8 sm:p-12">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rail-gold">
                Next Game
              </p>
              <div className="mt-6 flex items-center gap-6">
                <span className="font-display text-3xl sm:text-4xl tracking-tight text-rail-white">
                  RAILERS
                </span>
                <span className="font-display text-xl text-rail-silver">VS</span>
                <span className="font-display text-3xl sm:text-4xl tracking-tight text-rail-white">
                  {game.opponentName.toUpperCase()}
                </span>
              </div>
              <p className="mt-4 text-rail-silver">{formatDateTimeLong(game.dateTime)}</p>
              <p className="text-rail-silver">
                {game.venue} · {game.competition}
              </p>
            </div>

            <div className="lg:col-span-2 flex items-center justify-center bg-rail-navy-light/60 p-8 sm:p-12 rail-clip-right">
              <Countdown target={game.dateTime.toISOString()} />
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
