"use client";

import { Suspense, useActionState } from "react";
import { useFormStatus } from "react-dom";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { Label, Input } from "@/components/ui/form-field";
import { Button } from "@/components/ui/button";
import { resetPasswordAction, type ResetPasswordState } from "@/app/admin/login/actions";

const initialState: ResetPasswordState = { success: false };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? "Resetting…" : "Set new password"}
    </Button>
  );
}

// useSearchParams() has no value during static generation, so Next.js
// requires it to sit under a Suspense boundary — the wrapper below
// provides that. See https://nextjs.org/docs/messages/missing-suspense-with-csr-bailout
function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const uid = searchParams.get("uid") ?? "";
  const [state, formAction] = useActionState(resetPasswordAction, initialState);

  return (
    <div className="w-full max-w-sm">
      <div className="text-center mb-10">
        <p className="font-display text-3xl text-rail-gold tracking-tight">RAILERS</p>
        <p className="text-sm text-rail-silver mt-1">Set a new password</p>
      </div>

      {state.success ? (
        <div className="flex flex-col items-center text-center gap-3 border border-rail-gold/40 bg-rail-gold/[0.06] px-6 py-10">
          <CheckCircle2 className="h-8 w-8 text-rail-gold" />
          <p className="text-rail-white">Your password has been updated.</p>
          <Link href="/admin/login" className="text-sm text-rail-gold underline">
            Sign in
          </Link>
        </div>
      ) : !token || !uid ? (
        <p className="text-sm text-rail-loss text-center">
          This reset link is missing required information.
        </p>
      ) : (
        <form action={formAction} className="space-y-5 border border-rail-line bg-rail-navy/40 p-6">
          <input type="hidden" name="token" value={token} />
          <input type="hidden" name="uid" value={uid} />
          {state.error && (
            <p role="alert" className="text-sm text-rail-loss">
              {state.error}
            </p>
          )}
          <div>
            <Label htmlFor="password">New password</Label>
            <Input id="password" name="password" type="password" required minLength={10} />
            <p className="mt-1.5 text-xs text-rail-silver">
              At least 10 characters, one uppercase letter, one number.
            </p>
          </div>
          <div>
            <Label htmlFor="confirmPassword">Confirm new password</Label>
            <Input id="confirmPassword" name="confirmPassword" type="password" required minLength={10} />
          </div>
          <SubmitButton />
        </form>
      )}
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <Suspense fallback={<div className="w-full max-w-sm text-center text-rail-silver text-sm">Loading…</div>}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
