"use server";

import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";
import { prisma } from "@/lib/db/prisma";
import { requireRole, requireUser } from "@/lib/auth/session";
import { z } from "zod";
import { logAction } from "@/lib/services/audit";

const newUserSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Enter a valid email address"),
  role: z.enum(["SUPER_ADMIN", "ADMIN", "EDITOR"]),
});

export interface UserFormState {
  success: boolean;
  error?: string;
  temporaryPassword?: string;
}

export async function createUserAction(
  _prev: UserFormState,
  formData: FormData
): Promise<UserFormState> {
  const admin = await requireRole(["SUPER_ADMIN"]);

  const parsed = newUserSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    role: formData.get("role"),
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const existing = await prisma.user.findUnique({ where: { email: parsed.data.email.toLowerCase() } });
  if (existing) {
    return { success: false, error: "A user with that email already exists." };
  }

  // Generate a strong temporary password shown once; the admin can also
  // trigger a normal password-reset email from the list afterwards.
  const temporaryPassword = randomBytes(9).toString("base64").replace(/[+/=]/g, "").slice(0, 12) + "A1!";
  const passwordHash = await bcrypt.hash(temporaryPassword, 12);

  const user = await prisma.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email.toLowerCase(),
      role: parsed.data.role,
      passwordHash,
    },
  });

  await logAction({ userId: admin.id, action: "USER_CREATED", entity: "User", entityId: user.id });
  revalidatePath("/admin/users");

  return { success: true, temporaryPassword };
}

export async function updateUserRoleAction(userId: string, role: "SUPER_ADMIN" | "ADMIN" | "EDITOR") {
  const admin = await requireUser();
  if ((admin as { role: string }).role !== "SUPER_ADMIN") {
    throw new Error("Only a super admin can change roles.");
  }
  if (admin.id === userId) {
    throw new Error("You cannot change your own role.");
  }

  await prisma.user.update({ where: { id: userId }, data: { role } });
  await logAction({ userId: admin.id, action: "USER_ROLE_CHANGED", entity: "User", entityId: userId, metadata: { role } });
  revalidatePath("/admin/users");
}

export async function toggleUserActiveAction(userId: string, active: boolean) {
  const admin = await requireRole(["SUPER_ADMIN"]);
  if (admin.id === userId) {
    throw new Error("You cannot deactivate your own account.");
  }

  await prisma.user.update({ where: { id: userId }, data: { active } });
  await logAction({
    userId: admin.id,
    action: active ? "USER_REACTIVATED" : "USER_DEACTIVATED",
    entity: "User",
    entityId: userId,
  });
  revalidatePath("/admin/users");
}
