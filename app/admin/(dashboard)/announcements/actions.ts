"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/session";
import { announcementSchema } from "@/lib/validation/misc";
import { logAction } from "@/lib/services/audit";

export interface AnnouncementFormState {
  success: boolean;
  error?: string;
}

export async function createAnnouncementAction(
  _prev: AnnouncementFormState,
  formData: FormData
): Promise<AnnouncementFormState> {
  const user = await requireRole(["SUPER_ADMIN", "ADMIN", "EDITOR"]);

  const raw = Object.fromEntries(formData.entries());
  const parsed = announcementSchema.safeParse({
    ...raw,
    expiresAt: raw.expiresAt || undefined,
    publishedAt: raw.publishedAt || new Date().toISOString(),
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const announcement = await prisma.announcement.create({ data: parsed.data });

  await logAction({
    userId: user.id,
    action: "ANNOUNCEMENT_CREATED",
    entity: "Announcement",
    entityId: announcement.id,
  });
  revalidatePath("/admin/announcements");
  revalidatePath("/announcements");
  revalidatePath("/");

  return { success: true };
}

export async function updateAnnouncementStatusAction(id: string, status: "ACTIVE" | "EXPIRED" | "DRAFT") {
  const user = await requireRole(["SUPER_ADMIN", "ADMIN", "EDITOR"]);
  await prisma.announcement.update({ where: { id }, data: { status } });
  await logAction({ userId: user.id, action: "ANNOUNCEMENT_STATUS_CHANGED", entity: "Announcement", entityId: id });
  revalidatePath("/admin/announcements");
  revalidatePath("/announcements");
  revalidatePath("/");
}

export async function deleteAnnouncementAction(id: string) {
  const user = await requireRole(["SUPER_ADMIN", "ADMIN"]);
  await prisma.announcement.delete({ where: { id } });
  await logAction({ userId: user.id, action: "ANNOUNCEMENT_DELETED", entity: "Announcement", entityId: id });
  revalidatePath("/admin/announcements");
  revalidatePath("/announcements");
}
