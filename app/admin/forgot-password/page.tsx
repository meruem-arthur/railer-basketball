"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { Label, Input } from "@/components/ui/form-field";
import { Button } from "@/components/ui/button";
import { forgotPasswordAction, type ForgotPasswordState } from "@/app/admin/login/actions";

const initialState: ForgotPasswordState = { submitted: false };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? "Sending…" : "Send reset link"}
    </Button>
  );
}

export default function ForgotPasswordPage() {
  const [state, formAction] = useActionState(forgotPasswordAction, initialState);

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <p className="font-display text-3xl text-rail-gold tracking-tight">RAILERS</p>
          <p className="text-sm text-rail-silver mt-1">Reset your password</p>
        </div>

        {state.submitted ? (
          <div className="flex flex-col items-center text-center gap-3 border border-rail-gold/40 bg-rail-gold/[0.06] px-6 py-10">
            <CheckCircle2 className="h-8 w-8 text-rail-gold" />
            <p className="text-rail-white">
              If an account exists for that email, a reset link is on its way.
            </p>
          </div>
        ) : (
          <form action={formAction} className="space-y-5 border border-rail-line bg-rail-navy/40 p-6">
            {state.error && (
              <p role="alert" className="text-sm text-rail-loss">
                {state.error}
              </p>
            )}
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" autoComplete="email" required />
            </div>
            <SubmitButton />
          </form>
        )}

        <p className="mt-8 text-center">
          <Link href="/admin/login" className="text-sm text-rail-silver hover:text-rail-white">
            ← Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
