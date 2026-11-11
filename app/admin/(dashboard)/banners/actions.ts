"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/session";
import { logAction } from "@/lib/services/audit";
import { pageHeroSchema } from "@/lib/validation/hero";
import { PAGE_HERO_PAGES } from "@/lib/services/hero";
import { deleteImage } from "@/lib/cloudinary/upload";

export interface BannerFormState {
  success: boolean;
  error?: string;
}

const ROLES = ["SUPER_ADMIN", "ADMIN"] as const;
const isKnownPage = (key: string) => PAGE_HERO_PAGES.some((p) => p.key === key);

async function discardImage(publicId?: string | null) {
  if (!publicId || !publicId.startsWith("srid-railers/")) return;
  try {
    await deleteImage(publicId);
  } catch {
    /* ignore */
  }
}

export async function savePageHeroAction(pageKey: string, _prev: BannerFormState, formData: FormData): Promise<BannerFormState> {
  const user = await requireRole([...ROLES]);
  if (!isKnownPage(pageKey)) return { success: false, error: "Unknown page." };
  const parsed = pageHeroSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };

  const before = await prisma.pageHero.findUnique({ where: { pageKey } });
  await prisma.pageHero.upsert({ where: { pageKey }, create: { pageKey, ...parsed.data }, update: parsed.data });
  if (before?.imagePublicId && before.imagePublicId !== parsed.data.imagePublicId) await discardImage(before.imagePublicId);
  await logAction({ userId: user.id, action: "PAGE_BANNER_SAVED", entity: "PageHero", entityId: pageKey });
  revalidatePath("/", "layout");
  redirect("/admin/banners");
}

export async function clearPageHeroAction(pageKey: string) {
  const user = await requireRole([...ROLES]);
  if (!isKnownPage(pageKey)) return;
  const before = await prisma.pageHero.findUnique({ where: { pageKey } });
  if (!before) return;
  await prisma.pageHero.delete({ where: { pageKey } });
  await discardImage(before.imagePublicId);
  await logAction({ userId: user.id, action: "PAGE_BANNER_CLEARED", entity: "PageHero", entityId: pageKey });
  revalidatePath("/", "layout");
  revalidatePath("/admin/banners");
}
