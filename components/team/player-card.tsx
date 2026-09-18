import Link from "next/link";
import Image from "next/image";
import { positionShort } from "@/lib/utils/format";

interface PlayerCardProps {
  slug: string;
  firstName: string;
  lastName: string;
  jerseyNumber: number;
  position: string;
  photoUrl?: string | null;
  ppg?: number;
  rpg?: number;
  apg?: number;
}

export function PlayerCard({
  slug,
  firstName,
  lastName,
  jerseyNumber,
  position,
  photoUrl,
  ppg,
  rpg,
  apg,
}: PlayerCardProps) {
  const hasStats = ppg !== undefined;

  return (
    <Link
      href={`/team/${slug}`}
      className="group relative block overflow-hidden border border-rail-line bg-rail-navy/50 transition-colors hover:border-rail-gold/60"
    >
      <div className="relative aspect-[3/4] bg-rail-navy-light overflow-hidden">
        {photoUrl ? (
          <Image
            src={photoUrl}
            alt={`${firstName} ${lastName}`}
            fill
            sizes="(max-width: 640px) 50vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center font-display text-6xl text-rail-line">
            {jerseyNumber}
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-rail-bg to-transparent" />
        <span className="absolute top-3 left-3 font-display text-3xl text-rail-gold drop-shadow-md">
          #{jerseyNumber}
        </span>

        {hasStats && (
          <div className="absolute inset-0 flex items-end justify-center gap-4 bg-rail-bg/85 opacity-0 transition-opacity duration-300 group-hover:opacity-100 pb-6">
            <StatMini label="PPG" value={ppg} />
            <StatMini label="RPG" value={rpg} />
            <StatMini label="APG" value={apg} />
          </div>
        )}
      </div>

      <div className="p-4">
        <p className="font-display text-xl leading-tight tracking-tight text-rail-white">
          {firstName} {lastName}
        </p>
        <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-rail-silver">
          {positionShort(position)}
        </p>
      </div>
    </Link>
  );
}

function StatMini({ label, value }: { label: string; value?: number }) {
  return (
    <div className="text-center">
      <div className="font-display text-2xl text-rail-gold tabular-nums">{value ?? 0}</div>
      <div className="text-[10px] uppercase tracking-wide text-rail-silver">{label}</div>
    </div>
  );
}
