import type { Metadata } from "next";
import Link from "next/link";
import { SectionHeading } from "@/components/ui/section-heading";
import { NewsCard } from "@/components/news/news-card";
import { EmptyState } from "@/components/ui/empty-state";
import { Newspaper } from "lucide-react";
import { getPublishedArticles, getAllCategories } from "@/lib/services/news";
import { cn } from "@/lib/utils/cn";

export const metadata: Metadata = {
  title: "News",
  description: "Team news, match reports, and updates from UMaT SRID Railers.",
};

export default async function NewsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const [articles, categories] = await Promise.all([
    getPublishedArticles({ categoryName: category }),
    getAllCategories(),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
      <SectionHeading title="News" />

      <div className="flex flex-wrap gap-2 mb-10">
        <Link
          href="/news"
          className={cn(
            "px-3 py-1.5 text-sm border",
            !category ? "border-rail-gold text-rail-gold" : "border-rail-line text-rail-silver"
          )}
        >
          All
        </Link>
        {categories.map((c) => (
          <Link
            key={c.id}
            href={`/news?category=${c.name}`}
            className={cn(
              "px-3 py-1.5 text-sm border",
              category === c.name ? "border-rail-gold text-rail-gold" : "border-rail-line text-rail-silver"
            )}
          >
            {c.label}
          </Link>
        ))}
      </div>

      {articles.length === 0 ? (
        <EmptyState icon={Newspaper} title="News coming soon" />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {articles.map((a) => (
            <NewsCard key={a.slug} article={a} />
          ))}
        </div>
      )}
    </div>
  );
}
