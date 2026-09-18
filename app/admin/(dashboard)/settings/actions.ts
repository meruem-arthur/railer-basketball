"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/session";
import { siteSettingSchema, socialLinkSchema } from "@/lib/validation/misc";
import { logAction } from "@/lib/services/audit";

export interface SettingsFormState {
  success: boolean;
  error?: string;
}

export async function updateSettingsAction(
  _prev: SettingsFormState,
  formData: FormData
): Promise<SettingsFormState> {
  const user = await requireRole(["SUPER_ADMIN", "ADMIN"]);

  const raw = Object.fromEntries(formData.entries());
  const parsed = siteSettingSchema.safeParse({
    teamName: raw.teamName,
    slogan: raw.slogan,
    aboutText: raw.aboutText || undefined,
    contactEmail: raw.contactEmail || undefined,
    contactPhone: raw.contactPhone || undefined,
    venue: raw.venue || undefined,
    logoUrl: raw.logoUrl || undefined,
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  await prisma.siteSetting.upsert({
    where: { id: "singleton" },
    create: { id: "singleton", ...parsed.data },
    update: parsed.data,
  });

  await logAction({ userId: user.id, action: "SETTINGS_UPDATED", entity: "SiteSetting", entityId: "singleton" });
  revalidatePath("/admin/settings");
  revalidatePath("/", "layout");

  return { success: true };
}

export async function addSocialLinkAction(
  _prev: SettingsFormState,
  formData: FormData
): Promise<SettingsFormState> {
  const user = await requireRole(["SUPER_ADMIN", "ADMIN"]);

  const parsed = socialLinkSchema.safeParse({
    platform: formData.get("platform"),
    url: formData.get("url"),
    active: true,
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  await prisma.socialLink.upsert({
    where: { platform: parsed.data.platform },
    create: parsed.data,
    update: { url: parsed.data.url, active: true },
  });
  await logAction({ userId: user.id, action: "SOCIAL_LINK_ADDED", entity: "SocialLink" });
  revalidatePath("/admin/settings");
  revalidatePath("/", "layout");

  return { success: true };
}

export async function removeSocialLinkAction(id: string) {
  const user = await requireRole(["SUPER_ADMIN", "ADMIN"]);
  await prisma.socialLink.delete({ where: { id } });
  await logAction({ userId: user.id, action: "SOCIAL_LINK_REMOVED", entity: "SocialLink", entityId: id });
  revalidatePath("/admin/settings");
  revalidatePath("/", "layout");
}
