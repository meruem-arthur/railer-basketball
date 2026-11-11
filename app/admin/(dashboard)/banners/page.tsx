import type { Metadata } from "next";
import Image from "next/image";
import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/session";
import { ButtonLink } from "@/components/ui/button";
import { PAGE_HERO_PAGES } from "@/lib/services/hero";

export const metadata: Metadata = { title: "Page banners" };

export default async function AdminBannersPage() {
  await requireRole(["SUPER_ADMIN", "ADMIN"]);
  const banners = await prisma.pageHero.findMany();
  const byKey = new Map(banners.map((b) => [b.pageKey, b]));

  return (
    <div>
      <h1 className="font-display text-4xl tracking-tight text-rail-white mb-3">Page banners</h1>
      <p className="mb-8 max-w-2xl text-sm text-rail-silver">
        Give any page a full-width photo banner with its title on top. Pages without a photo keep their normal heading.
      </p>
      <div className="border border-rail-line divide-y divide-rail-line">
        {PAGE_HERO_PAGES.map((p) => {
          const b = byKey.get(p.key);
          return (
            <div key={p.key} className="flex flex-wrap items-center gap-4 px-5 py-4">
              <div className="relative h-14 w-24 shrink-0 overflow-hidden border border-rail-line bg-rail-navy/60">
                {b?.imageUrl && <Image src={b.imageUrl} alt="" fill sizes="96px" className="object-cover" />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-rail-white">{p.label}</p>
                <p className="text-xs text-rail-silver">{b?.imageUrl ? "Banner photo set" : "No banner photo"}</p>
              </div>
              <ButtonLink href={`/admin/banners/${p.key}`} size="sm" variant="outline">
                {b?.imageUrl ? "Edit" : "Add banner"}
              </ButtonLink>
            </div>
          );
        })}
      </div>
    </div>
  );
}
