import "server-only";
import * as brevo from "@getbrevo/brevo";

const apiKey = process.env.BREVO_API_KEY;
const senderEmail = process.env.BREVO_SENDER_EMAIL;
const senderName = process.env.BREVO_SENDER_NAME ?? "UMaT SRID Railers";

export const isEmailConfigured = Boolean(apiKey && senderEmail);

let apiInstance: brevo.TransactionalEmailsApi | null = null;

function getClient(): brevo.TransactionalEmailsApi {
  if (!apiInstance) {
    apiInstance = new brevo.TransactionalEmailsApi();
    apiInstance.setApiKey(brevo.TransactionalEmailsApiApiKeys.apiKey, apiKey as string);
  }
  return apiInstance;
}

export class EmailConfigError extends Error {
  constructor() {
    super(
      "Email is not configured. Set BREVO_API_KEY, BREVO_SENDER_EMAIL and BREVO_SENDER_NAME."
    );
    this.name = "EmailConfigError";
  }
}

interface SendEmailArgs {
  to: { email: string; name?: string }[];
  subject: string;
  htmlContent: string;
}

async function sendEmail({ to, subject, htmlContent }: SendEmailArgs): Promise<void> {
  if (!isEmailConfigured) throw new EmailConfigError();

  const message = new brevo.SendSmtpEmail();
  message.sender = { email: senderEmail as string, name: senderName };
  message.to = to;
  message.subject = subject;
  message.htmlContent = htmlContent;

  await getClient().sendTransacEmail(message);
}

export async function sendPasswordResetEmail(params: {
  to: string;
  name: string;
  resetUrl: string;
}): Promise<void> {
  await sendEmail({
    to: [{ email: params.to, name: params.name }],
    subject: "Reset your SRID Railers admin password",
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color:#050B16;">Password reset requested</h2>
        <p>Hi ${params.name},</p>
        <p>We received a request to reset your SRID Railers admin password. This link expires in 1 hour.</p>
        <p>
          <a href="${params.resetUrl}" style="display:inline-block;background:#F5A900;color:#050B16;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:bold;">
            Reset Password
          </a>
        </p>
        <p>If you didn't request this, you can safely ignore this email.</p>
      </div>
    `,
  });
}

export async function sendContactFormEmail(params: {
  toEmail: string;
  fromName: string;
  fromEmail: string;
  subject: string;
  message: string;
}): Promise<void> {
  await sendEmail({
    to: [{ email: params.toEmail }],
    subject: `[Contact] ${params.subject}`,
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color:#050B16;">New contact form message</h2>
        <p><strong>From:</strong> ${params.fromName} (${params.fromEmail})</p>
        <p><strong>Subject:</strong> ${params.subject}</p>
        <p style="white-space:pre-line;">${params.message}</p>
      </div>
    `,
  });
}

export async function sendTryoutConfirmationEmail(params: {
  to: string;
  name: string;
}): Promise<void> {
  await sendEmail({
    to: [{ email: params.to, name: params.name }],
    subject: "Your SRID Railers tryout application was received",
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color:#050B16;">Application received</h2>
        <p>Hi ${params.name},</p>
        <p>Thanks for applying to try out for the UMaT SRID Railers. Our coaching staff will review your application and reach out with next steps.</p>
        <p style="color:#AEB6C1;">Speed. Precision. Victory.</p>
      </div>
    `,
  });
}
