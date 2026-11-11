import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/session";
import { HeroSlideForm } from "@/components/admin/hero-slide-form";

export const metadata: Metadata = { title: "Edit hero slide" };

export default async function EditHeroSlidePage({ params }: { params: Promise<{ id: string }> }) {
  await requireRole(["SUPER_ADMIN", "ADMIN"]);
  const { id } = await params;
  const slide = await prisma.heroSlide.findUnique({ where: { id } });
  if (!slide) notFound();
  return (
    <div>
      <h1 className="font-display text-4xl tracking-tight text-rail-white mb-8">Edit hero slide</h1>
      <HeroSlideForm id={slide.id} slide={slide} />
    </div>
  );
}
