import "server-only";
import { prisma } from "@/lib/db/prisma";

export async function getRosterForSeason(seasonId: string, position?: string) {
  return prisma.playerSeason.findMany({
    where: {
      seasonId,
      active: true,
      ...(position ? { position: position as never } : {}),
    },
    include: { player: true },
    orderBy: { jerseyNumber: "asc" },
  });
}

export async function getPlayerBySlug(slug: string) {
  return prisma.player.findUnique({
    where: { slug },
    include: {
      seasons: {
        include: { season: true },
        orderBy: { season: { startDate: "desc" } },
      },
    },
  });
}

export async function getFeaturedPlayers(seasonId: string, take = 4) {
  return prisma.playerSeason.findMany({
    where: { seasonId, active: true },
    include: { player: true },
    orderBy: { jerseyNumber: "asc" },
    take,
  });
}

export async function slugExists(slug: string): Promise<boolean> {
  const existing = await prisma.player.findUnique({ where: { slug }, select: { id: true } });
  return Boolean(existing);
}

export function slugify(firstName: string, lastName: string): string {
  return `${firstName}-${lastName}`
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
