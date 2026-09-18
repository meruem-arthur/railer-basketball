import { SectionHeading } from "@/components/ui/section-heading";
import { ButtonLink } from "@/components/ui/button";
import { NewsCard, type NewsCardData } from "@/components/news/news-card";
import { EmptyState } from "@/components/ui/empty-state";
import { Newspaper } from "lucide-react";

export function NewsSection({
  featured,
  supporting,
}: {
  featured: NewsCardData | null;
  supporting: NewsCardData[];
}) {
  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
      <SectionHeading
        title="Latest News"
        action={<ButtonLink href="/news" variant="outline">All news</ButtonLink>}
      />
      {!featured ? (
        <EmptyState icon={Newspaper} title="News coming soon" />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <NewsCard article={featured} featured />
          {supporting.slice(0, 2).map((a) => (
            <NewsCard key={a.slug} article={a} />
          ))}
        </div>
      )}
    </section>
  );
}
