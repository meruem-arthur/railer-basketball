import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/session";
import { PAGE_HERO_PAGES } from "@/lib/services/hero";
import { PageHeroForm } from "@/components/admin/page-hero-form";

export const metadata: Metadata = { title: "Edit page banner" };

export default async function EditBannerPage({ params }: { params: Promise<{ key: string }> }) {
  await requireRole(["SUPER_ADMIN", "ADMIN"]);
  const { key } = await params;
  const page = PAGE_HERO_PAGES.find((p) => p.key === key);
  if (!page) notFound();
  const banner = await prisma.pageHero.findUnique({ where: { pageKey: key } });
  return (
    <div>
      <h1 className="font-display text-4xl tracking-tight text-rail-white mb-8">{page.label} banner</h1>
      <PageHeroForm pageKey={key} pageLabel={page.label} banner={banner} />
    </div>
  );
}
