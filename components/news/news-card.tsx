import Link from "next/link";
import Image from "next/image";
import { formatShortDate } from "@/lib/utils/format";

export interface NewsCardData {
  slug: string;
  title: string;
  excerpt: string;
  featuredImageUrl: string | null;
  publishedAt: Date | null;
  category: { label: string };
}

export function NewsCard({ article, featured = false }: { article: NewsCardData; featured?: boolean }) {
  return (
    <Link
      href={`/news/${article.slug}`}
      className={`group block border border-rail-line bg-rail-navy/50 overflow-hidden hover:border-rail-gold/50 transition-colors ${
        featured ? "sm:col-span-2" : ""
      }`}
    >
      <div className={`relative bg-rail-navy-light overflow-hidden ${featured ? "aspect-[16/8]" : "aspect-[16/10]"}`}>
        {article.featuredImageUrl ? (
          <Image
            src={article.featuredImageUrl}
            alt=""
            fill
            sizes={featured ? "100vw" : "(max-width: 640px) 100vw, 33vw"}
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center font-display text-2xl text-rail-line">
            RAILERS
          </div>
        )}
        <span className="absolute top-3 left-3 bg-rail-bg/85 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-rail-gold border border-rail-gold/30">
          {article.category.label}
        </span>
      </div>
      <div className="p-5">
        <p className="text-xs text-rail-silver">
          {article.publishedAt ? formatShortDate(article.publishedAt) : ""}
        </p>
        <h3
          className={`mt-2 font-display tracking-tight text-rail-white leading-tight ${
            featured ? "text-3xl" : "text-xl"
          }`}
        >
          {article.title}
        </h3>
        <p className="mt-2 text-sm text-rail-silver line-clamp-2">{article.excerpt}</p>
      </div>
    </Link>
  );
}
