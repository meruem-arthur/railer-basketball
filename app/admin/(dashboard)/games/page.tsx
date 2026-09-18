import type { Metadata } from "next";
import { CalendarPlus } from "lucide-react";
import { prisma } from "@/lib/db/prisma";
import { DataTable, type Column } from "@/components/ui/data-table";
import { GameStatusBadge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { formatGameDate } from "@/lib/utils/format";
import Link from "next/link";
import type { Game } from "@prisma/client";

export const metadata: Metadata = { title: "Games" };

export default async function AdminGamesPage() {
  const games = await prisma.game.findMany({
    orderBy: { dateTime: "desc" },
    include: { season: true },
    take: 100,
  });

  const columns: Column<Game & { season: { label: string } }>[] = [
    {
      key: "matchup",
      header: "Matchup",
      render: (g) => (
        <Link href={`/admin/games/${g.id}`} className="text-rail-white hover:text-rail-gold font-medium">
          {g.homeAway === "HOME" ? "vs" : "@"} {g.opponentName}
        </Link>
      ),
    },
    { key: "season", header: "Season", render: (g) => g.season.label },
    { key: "date", header: "Date", render: (g) => formatGameDate(g.dateTime) },
    {
      key: "score",
      header: "Score",
      render: (g) => (g.railersScore !== null ? `${g.railersScore}–${g.opponentScore}` : "—"),
    },
    { key: "status", header: "Status", render: (g) => <GameStatusBadge status={g.status} /> },
  ];

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <h1 className="font-display text-4xl tracking-tight text-rail-white">Games</h1>
        <ButtonLink href="/admin/games/new">
          <CalendarPlus className="h-4 w-4" /> Add Game
        </ButtonLink>
      </div>
      <DataTable columns={columns} rows={games} emptyMessage="No games scheduled yet." />
    </div>
  );
}
