"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { CheckCircle2 } from "lucide-react";
import { Label, Input, Textarea, FieldError } from "@/components/ui/form-field";
import { Button } from "@/components/ui/button";
import { submitContactForm, type ContactSubmitState } from "@/app/(public)/contact/actions";

const initialState: ContactSubmitState = { success: false, message: "" };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full sm:w-auto">
      {pending ? "Sending…" : "Send message"}
    </Button>
  );
}

export function ContactForm() {
  const [state, formAction] = useActionState(submitContactForm, initialState);

  if (state.success) {
    return (
      <div className="flex flex-col items-center text-center gap-3 border border-rail-gold/40 bg-rail-gold/[0.06] px-6 py-12">
        <CheckCircle2 className="h-9 w-9 text-rail-gold" />
        <p className="font-display text-2xl tracking-tight text-rail-white">Message sent</p>
        <p className="text-sm text-rail-silver">We'll get back to you as soon as we can.</p>
      </div>
    );
  }

  const errors = state.fieldErrors ?? {};

  return (
    <form action={formAction} className="space-y-5">
      {state.message && !state.success && (
        <p role="alert" className="text-sm text-rail-loss">
          {state.message}
        </p>
      )}

      {/* Honeypot — hidden from real users, tripped only by bots that fill every field */}
      <div className="hidden" aria-hidden="true">
        <label htmlFor="website">Website</label>
        <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div>
        <Label htmlFor="name" required>Name</Label>
        <Input id="name" name="name" hasError={!!errors.name} />
        <FieldError message={errors.name} />
      </div>
      <div>
        <Label htmlFor="email" required>Email</Label>
        <Input id="email" name="email" type="email" hasError={!!errors.email} />
        <FieldError message={errors.email} />
      </div>
      <div>
        <Label htmlFor="subject" required>Subject</Label>
        <Input id="subject" name="subject" hasError={!!errors.subject} />
        <FieldError message={errors.subject} />
      </div>
      <div>
        <Label htmlFor="message" required>Message</Label>
        <Textarea id="message" name="message" rows={5} hasError={!!errors.message} />
        <FieldError message={errors.message} />
      </div>
      <SubmitButton />
    </form>
  );
}
