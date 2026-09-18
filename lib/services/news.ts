import "server-only";
import { prisma } from "@/lib/db/prisma";

export async function getPublishedArticles(opts?: { take?: number; categoryName?: string }) {
  return prisma.newsArticle.findMany({
    where: {
      status: "PUBLISHED",
      publishedAt: { lte: new Date() },
      ...(opts?.categoryName ? { category: { name: opts.categoryName as never } } : {}),
    },
    include: { category: true, author: { select: { name: true } } },
    orderBy: { publishedAt: "desc" },
    take: opts?.take,
  });
}

export async function getFeaturedAndSupportingArticles() {
  const articles = await getPublishedArticles({ take: 4 });
  return { featured: articles[0] ?? null, supporting: articles.slice(1) };
}

export async function getArticleBySlug(slug: string) {
  return prisma.newsArticle.findUnique({
    where: { slug },
    include: { category: true, author: { select: { name: true } } },
  });
}

export async function getAllCategories() {
  return prisma.newsCategory.findMany({ orderBy: { label: "asc" } });
}

export function slugifyTitle(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
