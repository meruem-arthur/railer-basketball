"use server";

import { prisma } from "@/lib/db/prisma";
import { tryoutApplicationSchema } from "@/lib/validation/tryout";
import { sendTryoutConfirmationEmail } from "@/lib/email/brevo";
import { isEmailConfigured } from "@/lib/email/brevo";

export interface TryoutSubmitState {
  success: boolean;
  message: string;
  fieldErrors?: Record<string, string>;
}

export async function submitTryoutApplication(
  _prev: TryoutSubmitState,
  formData: FormData
): Promise<TryoutSubmitState> {
  const raw = Object.fromEntries(formData.entries());

  const parsed = tryoutApplicationSchema.safeParse({
    ...raw,
    heightCm: raw.heightCm || undefined,
    yearsPlayed: raw.yearsPlayed || undefined,
    preferredJerseyNumber: raw.preferredJerseyNumber || undefined,
  });

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      fieldErrors[String(issue.path[0])] = issue.message;
    }
    return { success: false, message: "Please fix the errors below.", fieldErrors };
  }

  const data = parsed.data;

  try {
    await prisma.tryoutApplication.create({
      data: {
        fullName: data.fullName,
        studentId: data.studentId,
        programme: data.programme,
        level: data.level,
        phone: data.phone,
        email: data.email,
        dateOfBirth: data.dateOfBirth,
        position: data.position,
        heightCm: data.heightCm ?? null,
        previousExperience: data.previousExperience ?? null,
        yearsPlayed: data.yearsPlayed ?? null,
        preferredJerseyNumber: data.preferredJerseyNumber ?? null,
        motivation: data.motivation,
        emergencyContactName: data.emergencyContactName,
        emergencyContactPhone: data.emergencyContactPhone,
        photoUrl: data.photoUrl || null,
        photoPublicId: data.photoPublicId || null,
      },
    });
  } catch {
    return {
      success: false,
      message: "Something went wrong saving your application. Please try again.",
    };
  }

  if (isEmailConfigured) {
    try {
      await sendTryoutConfirmationEmail({ to: data.email, name: data.fullName });
    } catch {
      // Application is already saved; a failed confirmation email should not
      // fail the submission from the applicant's point of view.
    }
  }

  return { success: true, message: "Application received." };
}
