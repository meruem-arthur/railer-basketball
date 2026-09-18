"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Select } from "@/components/ui/form-field";
import { Button } from "@/components/ui/button";
import { updateUserRoleAction, toggleUserActiveAction } from "@/app/admin/(dashboard)/users/actions";

export function UserRowControls({
  userId,
  role,
  active,
  isSelf,
}: {
  userId: string;
  role: string;
  active: boolean;
  isSelf: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  if (isSelf) {
    return <span className="text-xs text-rail-silver">(you)</span>;
  }

  return (
    <div className="flex items-center gap-3">
      <Select
        defaultValue={role}
        disabled={isPending}
        onChange={(e) =>
          startTransition(async () => {
            try {
              await updateUserRoleAction(userId, e.target.value as "SUPER_ADMIN" | "ADMIN" | "EDITOR");
              toast.success("Role updated.");
            } catch (err) {
              toast.error(err instanceof Error ? err.message : "Could not update role.");
            }
          })
        }
        className="w-36 py-1.5 text-xs"
      >
        <option value="EDITOR">Editor</option>
        <option value="ADMIN">Admin</option>
        <option value="SUPER_ADMIN">Super Admin</option>
      </Select>
      <Button
        size="sm"
        variant="ghost"
        disabled={isPending}
        onClick={() =>
          startTransition(async () => {
            try {
              await toggleUserActiveAction(userId, !active);
              toast.success(active ? "User deactivated." : "User reactivated.");
            } catch (err) {
              toast.error(err instanceof Error ? err.message : "Could not update user.");
            }
          })
        }
      >
        {active ? "Deactivate" : "Reactivate"}
      </Button>
    </div>
  );
}
