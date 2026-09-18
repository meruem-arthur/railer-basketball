import type { MetadataRoute } from "next";
import { prisma } from "@/lib/db/prisma";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

const STATIC_ROUTES = [
  "",
  "/team",
  "/schedule",
  "/results",
  "/stats",
  "/news",
  "/gallery",
  "/tryouts",
  "/announcements",
  "/about",
  "/contact",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [players, articles, albums] = await Promise.all([
    prisma.player.findMany({ where: { active: true }, select: { slug: true, updatedAt: true } }),
    prisma.newsArticle.findMany({
      where: { status: "PUBLISHED" },
      select: { slug: true, updatedAt: true },
    }),
    prisma.galleryAlbum.findMany({ select: { slug: true, updatedAt: true } }),
  ]);

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((route) => ({
    url: `${SITE_URL}${route}`,
    lastModified: new Date(),
  }));

  const playerEntries: MetadataRoute.Sitemap = players.map((p) => ({
    url: `${SITE_URL}/team/${p.slug}`,
    lastModified: p.updatedAt,
  }));

  const articleEntries: MetadataRoute.Sitemap = articles.map((a) => ({
    url: `${SITE_URL}/news/${a.slug}`,
    lastModified: a.updatedAt,
  }));

  const albumEntries: MetadataRoute.Sitemap = albums.map((a) => ({
    url: `${SITE_URL}/gallery/${a.slug}`,
    lastModified: a.updatedAt,
  }));

  return [...staticEntries, ...playerEntries, ...articleEntries, ...albumEntries];
}
