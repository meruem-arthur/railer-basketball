import "server-only";
import { cache } from "react";
import { prisma } from "@/lib/db/prisma";

export const getCurrentSeason = cache(async () => {
  return prisma.teamSeason.findFirst({ where: { isCurrent: true } });
});

export const getAllSeasons = cache(async () => {
  return prisma.teamSeason.findMany({ orderBy: { startDate: "desc" } });
});

export async function getSeasonByLabel(label: string) {
  return prisma.teamSeason.findUnique({ where: { label } });
}

export async function getSeasonById(id: string) {
  return prisma.teamSeason.findUnique({ where: { id } });
}

/**
 * Sets `seasonId` as the current season and unsets every other season's
 * isCurrent flag, atomically. Only one season may be current at a time.
 */
export async function setCurrentSeason(seasonId: string) {
  return prisma.$transaction([
    prisma.teamSeason.updateMany({
      where: { isCurrent: true },
      data: { isCurrent: false },
    }),
    prisma.teamSeason.update({
      where: { id: seasonId },
      data: { isCurrent: true, isArchived: false },
    }),
  ]);
}
