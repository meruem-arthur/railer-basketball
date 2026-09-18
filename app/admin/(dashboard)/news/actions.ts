"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/session";
import { newsArticleSchema, slugify } from "@/lib/validation/news";
import { logAction } from "@/lib/services/audit";

export interface NewsFormState {
  success: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
  articleId?: string;
}

async function uniqueSlug(title: string, excludeId?: string): Promise<string> {
  const base = slugify(title);
  let candidate = base;
  let n = 1;
  while (true) {
    const existing = await prisma.newsArticle.findUnique({ where: { slug: candidate } });
    if (!existing || existing.id === excludeId) return candidate;
    candidate = `${base}-${n}`;
    n += 1;
  }
}

export async function createNewsAction(
  _prev: NewsFormState,
  formData: FormData
): Promise<NewsFormState> {
  const user = await requireRole(["SUPER_ADMIN", "ADMIN", "EDITOR"]);

  const raw = Object.fromEntries(formData.entries());
  const slug = await uniqueSlug(String(raw.title ?? ""));

  const category = await prisma.newsCategory.findUnique({ where: { name: raw.categoryName as never } });
  if (!category) return { success: false, error: "Invalid category." };

  const parsed = newsArticleSchema.safeParse({
    ...raw,
    slug,
    featuredImageUrl: raw.featuredImageUrl || undefined,
    publishedAt: raw.status === "PUBLISHED" ? new Date() : raw.publishedAt || undefined,
  });

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) fieldErrors[String(issue.path[0])] = issue.message;
    return { success: false, error: "Please fix the errors below.", fieldErrors };
  }

  const article = await prisma.newsArticle.create({
    data: {
      title: parsed.data.title,
      slug: parsed.data.slug,
      excerpt: parsed.data.excerpt,
      content: parsed.data.content,
      featuredImageUrl: parsed.data.featuredImageUrl || null,
      featuredImagePublicId: String(raw.featuredImagePublicId || "") || null,
      categoryId: category.id,
      authorId: user.id,
      status: parsed.data.status,
      publishedAt: parsed.data.publishedAt ?? null,
    },
  });

  await logAction({ userId: user.id, action: "NEWS_CREATED", entity: "NewsArticle", entityId: article.id });
  revalidatePath("/admin/news");
  revalidatePath("/news");
  revalidatePath("/");

  return { success: true, articleId: article.id };
}

export async function updateNewsAction(
  articleId: string,
  _prev: NewsFormState,
  formData: FormData
): Promise<NewsFormState> {
  const user = await requireRole(["SUPER_ADMIN", "ADMIN", "EDITOR"]);

  const raw = Object.fromEntries(formData.entries());
  const slug = await uniqueSlug(String(raw.title ?? ""), articleId);

  const category = await prisma.newsCategory.findUnique({ where: { name: raw.categoryName as never } });
  if (!category) return { success: false, error: "Invalid category." };

  const existing = await prisma.newsArticle.findUnique({ where: { id: articleId } });
  const wasPublished = existing?.status === "PUBLISHED";

  const parsed = newsArticleSchema.safeParse({
    ...raw,
    slug,
    featuredImageUrl: raw.featuredImageUrl || undefined,
    publishedAt:
      raw.status === "PUBLISHED" && !wasPublished
        ? new Date()
        : existing?.publishedAt || raw.publishedAt || undefined,
  });

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) fieldErrors[String(issue.path[0])] = issue.message;
    return { success: false, error: "Please fix the errors below.", fieldErrors };
  }

  await prisma.newsArticle.update({
    where: { id: articleId },
    data: {
      title: parsed.data.title,
      slug: parsed.data.slug,
      excerpt: parsed.data.excerpt,
      content: parsed.data.content,
      featuredImageUrl: parsed.data.featuredImageUrl || null,
      featuredImagePublicId: String(raw.featuredImagePublicId || "") || null,
      categoryId: category.id,
      status: parsed.data.status,
      publishedAt: parsed.data.publishedAt ?? null,
    },
  });

  await logAction({ userId: user.id, action: "NEWS_UPDATED", entity: "NewsArticle", entityId: articleId });
  revalidatePath("/admin/news");
  revalidatePath(`/admin/news/${articleId}`);
  revalidatePath("/news");
  revalidatePath("/");

  return { success: true, articleId };
}

export async function archiveNewsAction(articleId: string) {
  const user = await requireRole(["SUPER_ADMIN", "ADMIN", "EDITOR"]);
  await prisma.newsArticle.update({ where: { id: articleId }, data: { status: "ARCHIVED" } });
  await logAction({ userId: user.id, action: "NEWS_ARCHIVED", entity: "NewsArticle", entityId: articleId });
  revalidatePath("/admin/news");
  revalidatePath("/news");
}

export async function deleteNewsAction(articleId: string) {
  const user = await requireRole(["SUPER_ADMIN", "ADMIN"]);
  await prisma.newsArticle.delete({ where: { id: articleId } });
  await logAction({ userId: user.id, action: "NEWS_DELETED", entity: "NewsArticle", entityId: articleId });
  revalidatePath("/admin/news");
  revalidatePath("/news");
}
