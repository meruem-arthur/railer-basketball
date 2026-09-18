import "server-only";
import { cache } from "react";
import { prisma } from "@/lib/db/prisma";

export const getSiteSettings = cache(async () => {
  const settings = await prisma.siteSetting.findUnique({ where: { id: "singleton" } });
  if (settings) return settings;

  // Self-heal: the singleton row should exist after seeding, but don't
  // hard-fail the whole site if it's missing for any reason.
  return prisma.siteSetting.create({ data: { id: "singleton" } });
});

export const getActiveSocialLinks = cache(async () => {
  return prisma.socialLink.findMany({ where: { active: true } });
});

export async function getDashboardCounts(seasonId: string | null) {
  const [totalPlayers, upcomingGames, publishedNews, galleryAlbums, pendingTryouts, record] =
    await Promise.all([
      seasonId
        ? prisma.playerSeason.count({ where: { seasonId, active: true } })
        : Promise.resolve(0),
      seasonId
        ? prisma.game.count({ where: { seasonId, status: "UPCOMING" } })
        : Promise.resolve(0),
      prisma.newsArticle.count({ where: { status: "PUBLISHED" } }),
      prisma.galleryAlbum.count(),
      prisma.tryoutApplication.count({ where: { status: "PENDING" } }),
      seasonId
        ? prisma.game.findMany({
            where: { seasonId, status: "COMPLETED" },
            select: { railersScore: true, opponentScore: true },
          })
        : Promise.resolve([]),
    ]);

  const wins = record.filter((g) => (g.railersScore ?? 0) > (g.opponentScore ?? 0)).length;
  const losses = record.length - wins;

  return { totalPlayers, upcomingGames, publishedNews, galleryAlbums, pendingTryouts, wins, losses };
}
