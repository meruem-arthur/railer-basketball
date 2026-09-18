"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/session";
import { logAction } from "@/lib/services/audit";

const VALID_STATUSES = ["PENDING", "SHORTLISTED", "APPROVED", "REJECTED", "CONTACTED"] as const;
type TryoutStatus = (typeof VALID_STATUSES)[number];

export async function updateTryoutStatusAction(id: string, status: TryoutStatus) {
  const user = await requireRole(["SUPER_ADMIN", "ADMIN"]);
  if (!VALID_STATUSES.includes(status)) throw new Error("Invalid status.");

  await prisma.tryoutApplication.update({ where: { id }, data: { status } });
  await logAction({
    userId: user.id,
    action: "TRYOUT_STATUS_CHANGED",
    entity: "TryoutApplication",
    entityId: id,
    metadata: { status },
  });
  revalidatePath("/admin/tryouts");
  revalidatePath(`/admin/tryouts/${id}`);
}

export async function deleteTryoutAction(id: string) {
  const user = await requireRole(["SUPER_ADMIN", "ADMIN"]);
  await prisma.tryoutApplication.delete({ where: { id } });
  await logAction({ userId: user.id, action: "TRYOUT_DELETED", entity: "TryoutApplication", entityId: id });
  revalidatePath("/admin/tryouts");
}
