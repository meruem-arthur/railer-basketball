"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { toast } from "sonner";
import { Copy, Check } from "lucide-react";
import { Label, Input, Select } from "@/components/ui/form-field";
import { Button } from "@/components/ui/button";
import { createUserAction, type UserFormState } from "@/app/admin/(dashboard)/users/actions";

const initialState: UserFormState = { success: false };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Creating…" : "Create admin"}
    </Button>
  );
}

export function CreateUserForm() {
  const [state, formAction] = useActionState(createUserAction, initialState);
  const [copied, setCopied] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
    }
  }, [state]);

  return (
    <div className="space-y-4 max-w-lg">
      <form ref={formRef} action={formAction} className="space-y-5 border border-rail-line bg-rail-navy/40 p-6">
        {state.error && (
          <p role="alert" className="text-sm text-rail-loss">
            {state.error}
          </p>
        )}
        <div>
          <Label htmlFor="name" required>Name</Label>
          <Input id="name" name="name" required />
        </div>
        <div>
          <Label htmlFor="email" required>Email</Label>
          <Input id="email" name="email" type="email" required />
        </div>
        <div>
          <Label htmlFor="role" required>Role</Label>
          <Select id="role" name="role" defaultValue="EDITOR">
            <option value="EDITOR">Editor</option>
            <option value="ADMIN">Admin</option>
            <option value="SUPER_ADMIN">Super Admin</option>
          </Select>
        </div>
        <SubmitButton />
      </form>

      {state.success && state.temporaryPassword && (
        <div className="border border-rail-gold/40 bg-rail-gold/[0.06] p-5">
          <p className="text-sm text-rail-white mb-2">
            Account created. Share this temporary password securely — it won&apos;t be shown again:
          </p>
          <div className="flex items-center gap-2">
            <code className="flex-1 bg-rail-bg px-3 py-2 text-rail-gold text-sm border border-rail-line">
              {state.temporaryPassword}
            </code>
            <button
              type="button"
              onClick={async () => {
                await navigator.clipboard.writeText(state.temporaryPassword ?? "");
                setCopied(true);
                toast.success("Copied.");
                setTimeout(() => setCopied(false), 2000);
              }}
              aria-label="Copy password"
              className="p-2 border border-rail-line hover:border-rail-gold"
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
