import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { AdminSidebar } from "@/components/admin/sidebar";
import { AdminHeader } from "@/components/admin/header";

export default async function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();

  // Middleware already redirects unauthenticated requests, but a server
  // component guard here means this layout is safe even if it's ever
  // reached another way.
  if (!session?.user) redirect("/admin/login");

  return (
    <div className="flex">
      <AdminSidebar role={session.user.role} />
      <div className="flex-1 min-w-0">
        <AdminHeader userName={session.user.name ?? session.user.email ?? "Admin"} role={session.user.role} />
        <main className="p-4 sm:p-8">{children}</main>
      </div>
    </div>
  );
}
