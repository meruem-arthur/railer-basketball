import { ResultBadge } from "@/components/ui/badge";
import { formatGameDate } from "@/lib/utils/format";

export function Scoreboard({
  opponentName,
  railersScore,
  opponentScore,
  dateTime,
  competition,
  venue,
}: {
  opponentName: string;
  railersScore: number;
  opponentScore: number;
  dateTime: Date;
  competition: string;
  venue: string;
}) {
  const won = railersScore > opponentScore;

  return (
    <div className="border border-rail-line bg-rail-navy/50">
      <div className="grid grid-cols-3 items-center px-6 py-10 sm:px-10">
        <div className="text-center sm:text-left">
          <p className="font-display text-2xl sm:text-3xl tracking-tight text-rail-white">
            RAILERS
          </p>
        </div>
        <div className="text-center">
          <p className="font-display text-5xl sm:text-6xl tabular-nums text-rail-gold">
            {railersScore}
            <span className="text-rail-silver mx-2 text-3xl">–</span>
            {opponentScore}
          </p>
        </div>
        <div className="text-center sm:text-right">
          <p className="font-display text-2xl sm:text-3xl tracking-tight text-rail-white uppercase">
            {opponentName}
          </p>
        </div>
      </div>
      <div className="rail-divider" />
      <div className="flex flex-wrap items-center justify-center gap-4 px-6 py-4 text-sm text-rail-silver">
        <ResultBadge won={won} />
        <span>{formatGameDate(dateTime)}</span>
        <span>·</span>
        <span>{competition}</span>
        <span>·</span>
        <span>{venue}</span>
      </div>
    </div>
  );
}
