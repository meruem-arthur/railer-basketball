import Image from "next/image";
import Link from "next/link";
import type { PageHero } from "@prisma/client";

/**
 * Full-screen photo banner for an inner page. Renders nothing unless an admin has uploaded a banner photo
 * (Admin → Page banners), so pages without one look exactly as before.
 */
export function PageBanner({ hero, title, subtitle }: { hero: PageHero | null; title: string; subtitle?: string }) {
  if (!hero?.imageUrl) return null;
  const heading = hero.title || title;
  const sub = hero.subtitle || subtitle;
  return (
    <header className="relative flex min-h-[calc(100svh-6rem)] items-center justify-center overflow-hidden border-b border-rail-line bg-rail-bg px-4 text-center">
      <Image src={hero.imageUrl} alt="" fill priority sizes="100vw" className="object-cover object-[50%_30%]" />
      <div className="absolute inset-0 bg-rail-bg/45" />
      <div className="absolute inset-0 bg-gradient-to-t from-rail-bg/70 via-transparent to-rail-bg/30" />
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-[0.06]"
        style={{ backgroundImage: "repeating-linear-gradient(115deg, #F5A900 0px, #F5A900 2px, transparent 2px, transparent 90px)" }}
      />
      <div className="relative mx-auto flex max-w-4xl flex-col items-center py-20">
        <h1 className="font-display text-6xl leading-[0.9] tracking-tight text-rail-white text-balance sm:text-7xl lg:text-9xl [text-shadow:0_2px_24px_rgba(0,0,0,.5)]">
          {heading}
        </h1>
        {sub && <p className="mt-5 max-w-xl text-lg text-rail-silver [text-shadow:0_1px_12px_rgba(0,0,0,.5)]">{sub}</p>}
        <nav aria-label="Breadcrumb" className="mt-7 flex items-center gap-2 text-xs font-semibold tracking-[0.2em] sm:text-sm">
          <Link href="/" className="text-rail-gold hover:underline">
            HOME
          </Link>
          <span aria-hidden="true" className="text-rail-silver">
            ›
          </span>
          <span className="text-rail-white">{heading.toUpperCase()}</span>
        </nav>
      </div>
      <span aria-hidden="true" className="absolute bottom-5 left-1/2 -translate-x-1/2 text-[11px] tracking-[0.3em] text-rail-silver">
        SCROLL ↓
      </span>
    </header>
  );
}
