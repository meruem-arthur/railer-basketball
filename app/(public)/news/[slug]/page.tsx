import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import DOMPurify from "isomorphic-dompurify";
import { getArticleBySlug } from "@/lib/services/news";
import { formatDateTimeLong } from "@/lib/utils/format";
import { ShareButton } from "@/components/news/share-button";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article || article.status !== "PUBLISHED") return { title: "News" };
  return {
    title: article.title,
    description: article.excerpt,
    openGraph: {
      title: article.title,
      description: article.excerpt,
      images: article.featuredImageUrl ? [article.featuredImageUrl] : undefined,
    },
  };
}

export default async function NewsArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  if (!article || article.status !== "PUBLISHED") notFound();

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const cleanContent = DOMPurify.sanitize(article.content);

  return (
    <article className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-16">
      <p className="text-xs font-semibold uppercase tracking-wide text-rail-gold">
        {article.category.label}
      </p>
      <h1 className="mt-3 font-display text-4xl sm:text-5xl tracking-tight text-rail-white text-balance">
        {article.title}
      </h1>
      <div className="mt-4 flex items-center justify-between flex-wrap gap-3">
        <p className="text-sm text-rail-silver">
          {article.publishedAt && formatDateTimeLong(article.publishedAt)}
          {article.author?.name && ` · ${article.author.name}`}
        </p>
        <ShareButton title={article.title} url={`${siteUrl}/news/${article.slug}`} />
      </div>

      {article.featuredImageUrl && (
        <div className="relative mt-8 aspect-[16/9] overflow-hidden border border-rail-line">
          <Image src={article.featuredImageUrl} alt="" fill sizes="100vw" className="object-cover" priority />
        </div>
      )}

      <div
        className="article-content mt-10"
        dangerouslySetInnerHTML={{ __html: cleanContent }}
      />
    </article>
  );
}
