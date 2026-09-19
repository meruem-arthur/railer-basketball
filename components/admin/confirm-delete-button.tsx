"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Input, Label } from "@/components/ui/form-field";
import type { DeleteResult } from "@/lib/utils/action-result";

/**
 * "Delete" button that opens a confirmation dialog before running a
 * destructive server action. If `confirmText` is given, the person must
 * type it exactly before the final button unlocks (used for seasons, which
 * take their games and stats with them).
 */
export function ConfirmDeleteButton({
  action,
  title,
  description,
  successMessage,
  redirectTo,
  confirmText,
  triggerLabel = "Delete",
  size = "sm",
}: {
  action: () => Promise<DeleteResult>;
  title: string;
  description: React.ReactNode;
  successMessage: string;
  /** Where to go after deleting (needed when the current page is the thing being deleted). */
  redirectTo?: string;
  confirmText?: string;
  triggerLabel?: string;
  size?: "sm" | "md";
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [typed, setTyped] = useState("");
  const [isPending, startTransition] = useTransition();

  const locked = confirmText ? typed.trim() !== confirmText : false;

  function close() {
    if (isPending) return;
    setOpen(false);
    setTyped("");
  }

  function confirm() {
    startTransition(async () => {
      try {
        const result = await action();
        if (!result.success) {
          toast.error(result.error);
          return;
        }
        toast.success(successMessage);
        setOpen(false);
        setTyped("");
        if (redirectTo) router.replace(redirectTo);
        else router.refresh();
      } catch {
        toast.error("Something went wrong. Please try again.");
      }
    });
  }

  return (
    <>
      <Button
        type="button"
        size={size}
        variant="outline"
        onClick={() => setOpen(true)}
        className="border-rail-loss/50 text-rail-loss hover:border-rail-loss hover:text-rail-loss"
      >
        <Trash2 className="h-4 w-4" aria-hidden="true" />
        {triggerLabel}
      </Button>

      <Modal open={open} onClose={close} title={title}>
        <div className="space-y-4 text-sm text-rail-silver">
          <div className="space-y-2">{description}</div>
          <p className="font-semibold text-rail-white">This can&apos;t be undone.</p>

          {confirmText && (
            <div>
              <Label htmlFor="confirm-delete-input">
                Type <span className="text-rail-white">{confirmText}</span> to confirm
              </Label>
              <Input
                id="confirm-delete-input"
                value={typed}
                onChange={(e) => setTyped(e.target.value)}
                autoComplete="off"
                autoCapitalize="none"
                spellCheck={false}
              />
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" size="sm" onClick={close} disabled={isPending}>
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={confirm}
              disabled={isPending || locked}
              className="bg-rail-loss text-white shadow-none hover:bg-rail-loss/90 active:bg-rail-loss/90"
            >
              {isPending && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
              {isPending ? "Deleting…" : "Delete permanently"}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
