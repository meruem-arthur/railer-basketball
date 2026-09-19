"use client";

import { useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Label, Input } from "@/components/ui/form-field";
import { PasswordInput } from "@/components/ui/password-input";
import { Button } from "@/components/ui/button";
import { loginAction, type LoginState } from "@/app/admin/login/actions";

const initialState: LoginState = {};

function SubmitButton({ success }: { success: boolean }) {
  const { pending } = useFormStatus();
  // Stay in the loading state after a successful sign-in too, until the
  // dashboard has actually replaced this page.
  const busy = pending || success;

  return (
    <Button type="submit" disabled={busy} aria-busy={busy} className="w-full">
      {busy && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
      {success ? "Redirecting…" : pending ? "Signing in…" : "Sign in"}
    </Button>
  );
}

export function LoginForm() {
  const router = useRouter();
  const [state, formAction] = useActionState(loginAction, initialState);

  useEffect(() => {
    if (!state.success) return;
    router.replace("/admin");
    router.refresh();
  }, [state.success, router]);

  return (
    <form action={formAction} className="space-y-5 border border-rail-line bg-rail-navy/40 p-6">
      {state.error && (
        <p role="alert" className="text-sm text-rail-loss">
          {state.error}
        </p>
      )}
      {state.success && (
        <p role="status" className="flex items-center gap-2 text-sm text-rail-win">
          <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
          Login successful. Taking you to the dashboard…
        </p>
      )}
      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          defaultValue={state.email ?? ""}
          required
        />
      </div>
      <div>
        <Label htmlFor="password">Password</Label>
        <PasswordInput id="password" name="password" autoComplete="current-password" required />
      </div>
      <SubmitButton success={Boolean(state.success)} />
    </form>
  );
}
