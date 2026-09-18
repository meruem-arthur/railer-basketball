import "server-only";
import { prisma } from "@/lib/db/prisma";

export async function getNextGame(seasonId: string) {
  return prisma.game.findFirst({
    where: {
      seasonId,
      status: "UPCOMING",
      dateTime: { gte: new Date() },
    },
    orderBy: { dateTime: "asc" },
  });
}

export async function getLatestCompletedGame(seasonId: string) {
  return prisma.game.findFirst({
    where: { seasonId, status: "COMPLETED" },
    orderBy: { dateTime: "desc" },
    include: { quarterScores: { orderBy: { quarter: "asc" } } },
  });
}

export interface ScheduleFilters {
  seasonId: string;
  status?: "UPCOMING" | "COMPLETED" | "ALL";
  homeAway?: "HOME" | "AWAY" | "NEUTRAL";
  competition?: string;
}

export async function getSchedule(filters: ScheduleFilters) {
  const where: Record<string, unknown> = { seasonId: filters.seasonId };

  if (filters.status === "UPCOMING") {
    where.status = { in: ["UPCOMING", "LIVE", "POSTPONED"] };
  } else if (filters.status === "COMPLETED") {
    where.status = "COMPLETED";
  }

  if (filters.homeAway) where.homeAway = filters.homeAway;
  if (filters.competition) where.competition = filters.competition;

  return prisma.game.findMany({
    where,
    orderBy: { dateTime: filters.status === "COMPLETED" ? "desc" : "asc" },
  });
}

export async function getGameById(id: string) {
  return prisma.game.findUnique({
    where: { id },
    include: {
      season: true,
      quarterScores: { orderBy: { quarter: "asc" } },
      playerStats: {
        include: { playerSeason: { include: { player: true } } },
        orderBy: { points: "desc" },
      },
      galleryAlbums: { include: { images: { take: 6, orderBy: { sortOrder: "asc" } } } },
    },
  });
}

export async function getDistinctCompetitions(seasonId: string) {
  const games = await prisma.game.findMany({
    where: { seasonId },
    select: { competition: true },
    distinct: ["competition"],
  });
  return games.map((g) => g.competition);
}
