"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/session";
import { logAction } from "@/lib/services/audit";
import { heroSlideSchema } from "@/lib/validation/hero";
import { deleteImage } from "@/lib/cloudinary/upload";

export interface HeroFormState {
  success: boolean;
  error?: string;
}

const ROLES = ["SUPER_ADMIN", "ADMIN"] as const;

/** Best effort: an orphaned image in Cloudinary is harmless, a failed save is not. */
async function discardImage(publicId?: string | null) {
  if (!publicId || !publicId.startsWith("srid-railers/")) return;
  try {
    await deleteImage(publicId);
  } catch {
    /* ignore */
  }
}

function refresh() {
  revalidatePath("/admin/hero");
  revalidatePath("/");
}

export async function saveHeroSlideAction(id: string | null, _prev: HeroFormState, formData: FormData): Promise<HeroFormState> {
  const user = await requireRole([...ROLES]);
  const raw = Object.fromEntries(formData.entries());
  const parsed = heroSlideSchema.safeParse({ ...raw, active: formData.get("active") === "on" });
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };

  if (id) {
    const before = await prisma.heroSlide.findUnique({ where: { id } });
    if (!before) return { success: false, error: "Slide not found." };
    await prisma.heroSlide.update({ where: { id }, data: parsed.data });
    if (before.imagePublicId && before.imagePublicId !== parsed.data.imagePublicId) await discardImage(before.imagePublicId);
    await logAction({ userId: user.id, action: "HERO_SLIDE_UPDATED", entity: "HeroSlide", entityId: id });
  } else {
    const created = await prisma.heroSlide.create({ data: parsed.data });
    await logAction({ userId: user.id, action: "HERO_SLIDE_CREATED", entity: "HeroSlide", entityId: created.id });
  }
  refresh();
  redirect("/admin/hero");
}

export async function toggleHeroSlideAction(id: string, active: boolean) {
  const user = await requireRole([...ROLES]);
  await prisma.heroSlide.update({ where: { id }, data: { active } });
  await logAction({ userId: user.id, action: active ? "HERO_SLIDE_SHOWN" : "HERO_SLIDE_HIDDEN", entity: "HeroSlide", entityId: id });
  refresh();
}

export async function deleteHeroSlideAction(id: string) {
  const user = await requireRole([...ROLES]);
  const slide = await prisma.heroSlide.findUnique({ where: { id } });
  if (!slide) return;
  await prisma.heroSlide.delete({ where: { id } });
  await discardImage(slide.imagePublicId);
  await logAction({ userId: user.id, action: "HERO_SLIDE_DELETED", entity: "HeroSlide", entityId: id });
  refresh();
}
