"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Users,
  CalendarRange,
  Trophy,
  BarChart3,
  Newspaper,
  Images,
  Megaphone,
  ClipboardList,
  UserCog,
  Settings,
  Menu,
  X,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { signOutAction } from "@/app/admin/actions";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/players", label: "Players", icon: Users },
  { href: "/admin/seasons", label: "Seasons", icon: CalendarRange },
  { href: "/admin/games", label: "Games", icon: Trophy },
  { href: "/admin/statistics", label: "Statistics", icon: BarChart3 },
  { href: "/admin/news", label: "News", icon: Newspaper },
  { href: "/admin/gallery", label: "Gallery", icon: Images },
  { href: "/admin/announcements", label: "Announcements", icon: Megaphone },
  { href: "/admin/tryouts", label: "Tryouts", icon: ClipboardList },
  { href: "/admin/users", label: "Users", icon: UserCog, role: "SUPER_ADMIN" },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export function AdminSidebar({ role }: { role: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => setOpen(false), [pathname]);

  const items = NAV.filter((item) => !item.role || item.role === role);

  const content = (
    <nav className="flex flex-col gap-1 p-4">
      <Link href="/admin" className="px-2 py-4 font-display text-xl text-rail-gold tracking-tight">
        RAILERS ADMIN
      </Link>
      {items.map((item) => {
        const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-colors",
              isActive
                ? "bg-rail-gold/10 text-rail-gold border-l-2 border-rail-gold"
                : "text-rail-silver hover:text-rail-white border-l-2 border-transparent"
            )}
          >
            <Icon className="h-4 w-4" />
            {item.label}
          </Link>
        );
      })}
      <form action={signOutAction} className="mt-4 pt-4 border-t border-rail-line">
        <button className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-rail-silver hover:text-rail-loss w-full">
          <LogOut className="h-4 w-4" />
          Log out
        </button>
      </form>
    </nav>
  );

  return (
    <>
      <div className="hidden lg:block w-64 shrink-0 border-r border-rail-line bg-rail-navy/60 min-h-screen sticky top-0">
        {content}
      </div>

      <div className="lg:hidden sticky top-0 z-40 flex items-center justify-between border-b border-rail-line bg-rail-bg px-4 h-14">
        <span className="font-display text-lg text-rail-gold">RAILERS ADMIN</span>
        <button onClick={() => setOpen((o) => !o)} aria-label="Toggle menu" className="p-2">
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
      {open && (
        <div className="lg:hidden fixed inset-x-0 top-14 bottom-0 z-30 bg-rail-bg overflow-y-auto border-t border-rail-line">
          {content}
        </div>
      )}
    </>
  );
}
