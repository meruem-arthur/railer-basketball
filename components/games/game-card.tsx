import Link from "next/link";
import { GameStatusBadge, ResultBadge } from "@/components/ui/badge";
import { formatGameDate, formatGameTime } from "@/lib/utils/format";

export interface GameCardData {
  id: string;
  opponentName: string;
  dateTime: Date;
  venue: string;
  homeAway: string;
  competition: string;
  status: string;
  railersScore: number | null;
  opponentScore: number | null;
}

export function GameCard({ game }: { game: GameCardData }) {
  const isCompleted = game.status === "COMPLETED";
  const won =
    isCompleted && game.railersScore !== null && game.opponentScore !== null
      ? game.railersScore > game.opponentScore
      : null;

  return (
    <Link
      href={`/games/${game.id}`}
      className="flex items-center justify-between gap-4 border border-rail-line bg-rail-navy/50 px-5 py-4 transition-colors hover:border-rail-gold/50"
    >
      <div className="min-w-0">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-rail-silver">
          <span>{game.homeAway === "HOME" ? "vs" : "@"}</span>
          <span>{game.competition}</span>
        </div>
        <p className="mt-1 font-display text-xl tracking-tight text-rail-white truncate">
          Railers {game.homeAway === "HOME" ? "vs" : "at"} {game.opponentName}
        </p>
        <p className="mt-1 text-sm text-rail-silver">
          {formatGameDate(game.dateTime)} · {formatGameTime(game.dateTime)} · {game.venue}
        </p>
      </div>

      <div className="flex items-center gap-4 shrink-0">
        {isCompleted && game.railersScore !== null && game.opponentScore !== null ? (
          <div className="text-right">
            <p className="font-display text-2xl tabular-nums text-rail-white">
              {game.railersScore}–{game.opponentScore}
            </p>
            {won !== null && <ResultBadge won={won} />}
          </div>
        ) : (
          <GameStatusBadge status={game.status} />
        )}
      </div>
    </Link>
  );
}
