import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db/prisma";
import { NewsForm } from "@/components/admin/news-form";
import { updateNewsAction, archiveNewsAction, deleteNewsAction } from "@/app/admin/(dashboard)/news/actions";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

export const metadata: Metadata = { title: "Edit Article" };

export default async function EditNewsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [article, categories] = await Promise.all([
    prisma.newsArticle.findUnique({ where: { id } }),
    prisma.newsCategory.findMany({ orderBy: { label: "asc" } }),
  ]);

  if (!article) notFound();

  const boundUpdate = updateNewsAction.bind(null, article.id);

  return (
    <div>
      <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
        <h1 className="font-display text-4xl tracking-tight text-rail-white">Edit Article</h1>
        <div className="flex gap-2">
          {article.status === "PUBLISHED" && (
            <Link
              href={`/news/${article.slug}`}
              target="_blank"
              className="inline-flex items-center gap-1.5 text-sm text-rail-silver hover:text-rail-gold px-3 py-2"
            >
              <ExternalLink className="h-4 w-4" /> Preview
            </Link>
          )}
          {article.status !== "ARCHIVED" && (
            <form action={async () => { "use server"; await archiveNewsAction(article.id); }}>
              <Button variant="outline" size="sm">Archive</Button>
            </form>
          )}
          <form action={async () => { "use server"; await deleteNewsAction(article.id); }}>
            <Button variant="ghost" size="sm">Delete</Button>
          </form>
        </div>
      </div>
      <NewsForm article={article} categories={categories} action={boundUpdate} mode="edit" />
    </div>
  );
}
