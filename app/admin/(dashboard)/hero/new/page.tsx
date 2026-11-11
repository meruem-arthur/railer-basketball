import type { Metadata } from "next";
import { requireRole } from "@/lib/auth/session";
import { HeroSlideForm } from "@/components/admin/hero-slide-form";

export const metadata: Metadata = { title: "Add hero slide" };

export default async function NewHeroSlidePage() {
  await requireRole(["SUPER_ADMIN", "ADMIN"]);
  return (
    <div>
      <h1 className="font-display text-4xl tracking-tight text-rail-white mb-8">Add hero slide</h1>
      <HeroSlideForm />
    </div>
  );
}
