"use server";

import { AuthError } from "next-auth";
import { randomBytes, createHash } from "crypto";
import { signIn } from "@/auth";
import { prisma } from "@/lib/db/prisma";
import { loginSchema, forgotPasswordSchema, resetPasswordSchema } from "@/lib/validation/auth";
import { sendPasswordResetEmail, isEmailConfigured } from "@/lib/email/brevo";
import { logAction } from "@/lib/services/audit";
import bcrypt from "bcryptjs";

export interface LoginState {
  error?: string;
  success?: boolean;
  /** Echoed back on failure so the email field isn't wiped by the form reset. */
  email?: string;
}

export async function loginAction(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") ?? "");

  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: "Enter a valid email and password.", email };
  }

  try {
    // redirect: false — the client shows a "Login successful" message and
    // then navigates to /admin itself. Bad credentials still throw an
    // AuthError (Auth.js raw mode), which is handled below.
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirect: false,
    });
    return { success: true };
  } catch (err) {
    if (err instanceof AuthError) {
      return { error: "Invalid email or password.", email };
    }
    throw err;
  }
}

export interface ForgotPasswordState {
  submitted: boolean;
  error?: string;
}

const RESET_TOKEN_TTL_MS = 1000 * 60 * 30; // 30 minutes

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export async function forgotPasswordAction(
  _prev: ForgotPasswordState,
  formData: FormData
): Promise<ForgotPasswordState> {
  const parsed = forgotPasswordSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) {
    return { submitted: false, error: "Enter a valid email address." };
  }

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email.toLowerCase() } });

  // Always report success, whether or not the account exists, so this
  // endpoint can't be used to enumerate admin emails.
  if (user && user.active) {
    const rawToken = randomBytes(32).toString("hex");

    await prisma.passwordResetToken.create({
      data: {
        token: hashToken(rawToken),
        userId: user.id,
        expiresAt: new Date(Date.now() + RESET_TOKEN_TTL_MS),
      },
    });

    if (isEmailConfigured) {
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
      const resetUrl = `${siteUrl}/admin/reset-password?token=${rawToken}&uid=${user.id}`;
      await sendPasswordResetEmail({ to: user.email, name: user.name, resetUrl }).catch(() => {});
    }
  }

  return { submitted: true };
}

export interface ResetPasswordState {
  success: boolean;
  error?: string;
}

export async function resetPasswordAction(
  _prev: ResetPasswordState,
  formData: FormData
): Promise<ResetPasswordState> {
  const uid = String(formData.get("uid") ?? "");
  const parsed = resetPasswordSchema.safeParse({
    token: formData.get("token"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const tokenHash = hashToken(parsed.data.token);
  const resetToken = await prisma.passwordResetToken.findUnique({ where: { token: tokenHash } });

  if (
    !resetToken ||
    resetToken.userId !== uid ||
    resetToken.usedAt ||
    resetToken.expiresAt < new Date()
  ) {
    return { success: false, error: "This reset link is invalid or has expired." };
  }

  const newHash = await bcrypt.hash(parsed.data.password, 12);

  await prisma.$transaction([
    prisma.user.update({ where: { id: uid }, data: { passwordHash: newHash } }),
    prisma.passwordResetToken.update({
      where: { id: resetToken.id },
      data: { usedAt: new Date() },
    }),
  ]);

  await logAction({ userId: uid, action: "PASSWORD_RESET", entity: "User", entityId: uid });

  return { success: true };
}
