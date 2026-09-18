"use server";

import { contactFormSchema } from "@/lib/validation/misc";
import { sendContactFormEmail, isEmailConfigured } from "@/lib/email/brevo";
import { getSiteSettings } from "@/lib/services/settings";

export interface ContactSubmitState {
  success: boolean;
  message: string;
  fieldErrors?: Record<string, string>;
}

export async function submitContactForm(
  _prev: ContactSubmitState,
  formData: FormData
): Promise<ContactSubmitState> {
  const raw = Object.fromEntries(formData.entries());
  const parsed = contactFormSchema.safeParse(raw);

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      fieldErrors[String(issue.path[0])] = issue.message;
    }
    return { success: false, message: "Please fix the errors below.", fieldErrors };
  }

  // Honeypot tripped — pretend success so bots don't learn anything, but do nothing.
  if (parsed.data.website) {
    return { success: true, message: "Message sent." };
  }

  const settings = await getSiteSettings();
  const recipient = settings.contactEmail;

  if (recipient && isEmailConfigured) {
    try {
      await sendContactFormEmail({
        toEmail: recipient,
        fromName: parsed.data.name,
        fromEmail: parsed.data.email,
        subject: parsed.data.subject,
        message: parsed.data.message,
      });
    } catch {
      return {
        success: false,
        message: "Could not send your message right now. Please try again shortly.",
      };
    }
  }

  return { success: true, message: "Message sent." };
}
