import type { Metadata } from "next";
import Link from "next/link";
import { UserPlus } from "lucide-react";
import { prisma } from "@/lib/db/prisma";
import { DataTable, type Column } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { positionShort } from "@/lib/utils/format";
import type { Player } from "@prisma/client";

export const metadata: Metadata = { title: "Players" };

export default async function AdminPlayersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;

  const players = await prisma.player.findMany({
    where: q
      ? {
          OR: [
            { firstName: { contains: q, mode: "insensitive" } },
            { lastName: { contains: q, mode: "insensitive" } },
          ],
        }
      : undefined,
    include: {
      seasons: { where: { season: { isCurrent: true } }, take: 1 },
    },
    orderBy: [{ active: "desc" }, { lastName: "asc" }],
  });

  const columns: Column<Player & { seasons: { jerseyNumber: number; position: string }[] }>[] = [
    {
      key: "name",
      header: "Player",
      render: (p) => (
        <Link href={`/admin/players/${p.id}`} className="text-rail-white hover:text-rail-gold font-medium">
          {p.firstName} {p.lastName}
        </Link>
      ),
    },
    {
      key: "jersey",
      header: "Jersey",
      render: (p) => (p.seasons[0] ? `#${p.seasons[0].jerseyNumber}` : "—"),
    },
    {
      key: "position",
      header: "Position",
      render: (p) => (p.seasons[0] ? positionShort(p.seasons[0].position) : "—"),
    },
    {
      key: "status",
      header: "Status",
      render: (p) => <Badge tone={p.active ? "win" : "neutral"}>{p.active ? "Active" : "Inactive"}</Badge>,
    },
  ];

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <h1 className="font-display text-4xl tracking-tight text-rail-white">Players</h1>
        <ButtonLink href="/admin/players/new">
          <UserPlus className="h-4 w-4" /> Add Player
        </ButtonLink>
      </div>

      <form className="mb-6 max-w-sm">
        <input
          name="q"
          defaultValue={q}
          placeholder="Search players…"
          className="w-full border border-rail-line bg-rail-navy/60 px-3.5 py-2.5 text-sm text-rail-white placeholder:text-rail-silver/50 outline-none focus:border-rail-gold"
        />
      </form>

      <DataTable columns={columns} rows={players} emptyMessage="No players found." />
    </div>
  );
}
