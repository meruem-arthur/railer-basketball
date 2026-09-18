"use client";

import { useRouter, usePathname } from "next/navigation";
import type { TeamSeason } from "@prisma/client";

export function SeasonSelect({
  seasons,
  activeSeasonId,
}: {
  seasons: TeamSeason[];
  activeSeasonId: string;
}) {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <select
      defaultValue={activeSeasonId}
      onChange={(e) => router.push(`${pathname}?season=${e.target.value}`)}
      className="border border-rail-line bg-rail-navy/60 px-3 py-2 text-sm text-rail-white"
    >
      {seasons.map((s) => (
        <option key={s.id} value={s.id}>{s.label}</option>
      ))}
    </select>
  );
}
