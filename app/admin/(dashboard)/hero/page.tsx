import type { Metadata } from "next";
import Image from "next/image";
import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/session";
import { ButtonLink } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { HeroSlideRowActions } from "@/components/admin/hero-slide-row-actions";

export const metadata: Metadata = { title: "Hero slides" };

export default async function AdminHeroPage() {
  await requireRole(["SUPER_ADMIN", "ADMIN"]);
  const slides = await prisma.heroSlide.findMany({ orderBy: [{ displayOrder: "asc" }, { createdAt: "asc" }] });
  const live = slides.filter((s) => s.active).length;

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-4xl tracking-tight text-rail-white">Hero slides</h1>
        <ButtonLink href="/admin/hero/new">Add slide</ButtonLink>
      </div>
      <p className="mb-8 max-w-2xl text-sm text-rail-silver">
        These photos make up the slideshow at the top of the homepage. With two or more showing slides it changes automatically; with one it stays still;
        with none the homepage shows the classic “Built to move” header. {live > 0 && <span className="text-rail-white">{live} slide{live === 1 ? "" : "s"} showing now.</span>}
      </p>

      <div className="border border-rail-line divide-y divide-rail-line">
        {slides.length === 0 ? (
          <p className="px-4 py-10 text-center text-rail-silver">No slides yet. Add your first one to turn the homepage header into a slideshow.</p>
        ) : (
          slides.map((s) => (
            <div key={s.id} className="flex flex-wrap items-center gap-4 px-5 py-4">
              <div className="relative h-16 w-28 shrink-0 overflow-hidden border border-rail-line">
                <Image src={s.imageUrl} alt="" fill sizes="112px" className="object-cover" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium text-rail-white">{s.heading || "Default heading"}</span>
                  <Badge tone={s.active ? "win" : "neutral"}>{s.active ? "Showing" : "Hidden"}</Badge>
                </div>
                <p className="mt-1 text-xs text-rail-silver">Order {s.displayOrder}{s.ctaLabel ? ` · Button: ${s.ctaLabel}` : ""}</p>
              </div>
              <HeroSlideRowActions id={s.id} active={s.active} />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
