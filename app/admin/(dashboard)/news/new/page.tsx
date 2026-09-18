import type { Metadata } from "next";
import { prisma } from "@/lib/db/prisma";
import { NewsForm } from "@/components/admin/news-form";
import { createNewsAction } from "@/app/admin/(dashboard)/news/actions";

export const metadata: Metadata = { title: "Create News" };

export default async function NewNewsPage() {
  const categories = await prisma.newsCategory.findMany({ orderBy: { label: "asc" } });

  return (
    <div>
      <h1 className="font-display text-4xl tracking-tight text-rail-white mb-8">Create Article</h1>
      <NewsForm categories={categories} action={createNewsAction} mode="create" />
    </div>
  );
}
