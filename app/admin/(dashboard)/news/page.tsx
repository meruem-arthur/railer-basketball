import type { Metadata } from "next";
import { FileEdit } from "lucide-react";
import { prisma } from "@/lib/db/prisma";
import { DataTable, type Column } from "@/components/ui/data-table";
import { Badge, type BadgeTone } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { formatShortDate } from "@/lib/utils/format";
import Link from "next/link";
import type { NewsArticle } from "@prisma/client";

export const metadata: Metadata = { title: "News" };

const STATUS_TONE: Record<string, BadgeTone> = {
  DRAFT: "neutral",
  PUBLISHED: "win",
  ARCHIVED: "neutral",
};

export default async function AdminNewsPage() {
  const articles = await prisma.newsArticle.findMany({
    orderBy: { createdAt: "desc" },
    include: { category: true, author: { select: { name: true } } },
    take: 100,
  });

  const columns: Column<NewsArticle & { category: { label: string }; author: { name: string } }>[] = [
    {
      key: "title",
      header: "Title",
      render: (a) => (
        <Link href={`/admin/news/${a.id}`} className="text-rail-white hover:text-rail-gold font-medium">
          {a.title}
        </Link>
      ),
    },
    { key: "category", header: "Category", render: (a) => a.category.label },
    { key: "author", header: "Author", render: (a) => a.author.name },
    { key: "status", header: "Status", render: (a) => <Badge tone={STATUS_TONE[a.status]}>{a.status}</Badge> },
    { key: "date", header: "Created", render: (a) => formatShortDate(a.createdAt) },
  ];

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <h1 className="font-display text-4xl tracking-tight text-rail-white">News</h1>
        <ButtonLink href="/admin/news/new">
          <FileEdit className="h-4 w-4" /> Create News
        </ButtonLink>
      </div>
      <DataTable columns={columns} rows={articles} emptyMessage="No articles yet." />
    </div>
  );
}
