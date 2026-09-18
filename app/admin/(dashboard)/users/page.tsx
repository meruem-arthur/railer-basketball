import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/session";
import { CreateUserForm } from "@/components/admin/create-user-form";
import { UserRowControls } from "@/components/admin/user-row-controls";
import { Badge } from "@/components/ui/badge";
import { relativeTime } from "@/lib/utils/format";

export const metadata: Metadata = { title: "Users" };

export default async function AdminUsersPage() {
  const session = await getSession();
  if (session?.user.role !== "SUPER_ADMIN") redirect("/admin");

  const users = await prisma.user.findMany({ orderBy: { createdAt: "asc" } });

  return (
    <div>
      <h1 className="font-display text-4xl tracking-tight text-rail-white mb-8">Users</h1>

      <div className="mb-10">
        <CreateUserForm />
      </div>

      <div className="border border-rail-line divide-y divide-rail-line">
        {users.map((u) => (
          <div key={u.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium text-rail-white">{u.name}</span>
                <Badge tone={u.active ? "win" : "neutral"}>{u.active ? "Active" : "Inactive"}</Badge>
              </div>
              <p className="text-sm text-rail-silver mt-0.5">{u.email}</p>
              <p className="text-xs text-rail-silver/70 mt-0.5">
                {u.lastLoginAt ? `Last login ${relativeTime(u.lastLoginAt)}` : "Never logged in"}
              </p>
            </div>
            <UserRowControls
              userId={u.id}
              role={u.role}
              active={u.active}
              isSelf={u.id === session.user.id}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
