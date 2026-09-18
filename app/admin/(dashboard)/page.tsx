import Link from "next/link";
import {
  UserPlus,
  CalendarPlus,
  Trophy,
  FileEdit,
  ImagePlus,
  ClipboardList,
} from "lucide-react";
import { StatCard } from "@/components/ui/stat-card";
import { getCurrentSeason } from "@/lib/services/season";
import { getDashboardCounts } from "@/lib/services/settings";
import { getRecentAuditLogs } from "@/lib/services/audit";
import { relativeTime } from "@/lib/utils/format";

export const metadata = { title: "Dashboard" };

const QUICK_ACTIONS = [
  { href: "/admin/players/new", label: "Add Player", icon: UserPlus },
  { href: "/admin/games/new", label: "Add Game", icon: CalendarPlus },
  { href: "/admin/games", label: "Add Result", icon: Trophy },
  { href: "/admin/news/new", label: "Create News", icon: FileEdit },
  { href: "/admin/gallery/new", label: "Upload Photos", icon: ImagePlus },
  { href: "/admin/tryouts", label: "View Tryouts", icon: ClipboardList },
];

export default async function AdminDashboardPage() {
  const season = await getCurrentSeason();
  const counts = await getDashboardCounts(season?.id ?? null);
  const recentActivity = await getRecentAuditLogs(8);

  return (
    <div>
      <div className="flex items-baseline justify-between mb-8">
        <h1 className="font-display text-4xl tracking-tight text-rail-white">Dashboard</h1>
        <span className="text-sm text-rail-silver">
          {season ? `Current season: ${season.label}` : "No current season set"}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-12">
        <StatCard label="Players" value={counts.totalPlayers} />
        <StatCard label="Upcoming Games" value={counts.upcomingGames} />
        <StatCard label="Wins" value={counts.wins} highlight />
        <StatCard label="Losses" value={counts.losses} />
        <StatCard label="Pending Tryouts" value={counts.pendingTryouts} />
        <StatCard label="News Published" value={counts.publishedNews} />
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-rail-silver mb-3">
            Quick Actions
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {QUICK_ACTIONS.map((action) => {
              const Icon = action.icon;
              return (
                <Link
                  key={action.href}
                  href={action.href}
                  className="flex flex-col items-center justify-center gap-2 border border-rail-line bg-rail-navy/50 py-6 text-center hover:border-rail-gold/50 transition-colors"
                >
                  <Icon className="h-5 w-5 text-rail-gold" />
                  <span className="text-xs font-semibold uppercase tracking-wide text-rail-silver">
                    {action.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-rail-silver mb-3">
            Recent Activity
          </p>
          <div className="border border-rail-line divide-y divide-rail-line">
            {recentActivity.length === 0 ? (
              <p className="px-4 py-6 text-sm text-rail-silver text-center">No activity yet.</p>
            ) : (
              recentActivity.map((log) => (
                <div key={log.id} className="px-4 py-3 text-sm">
                  <p className="text-rail-white">
                    {log.user?.name ?? "System"}{" "}
                    <span className="text-rail-silver">{log.action.toLowerCase().replaceAll("_", " ")}</span>{" "}
                    {log.entity}
                  </p>
                  <p className="text-xs text-rail-silver/70 mt-0.5">{relativeTime(log.createdAt)}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
