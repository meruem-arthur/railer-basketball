import type { Metadata } from "next";
import Link from "next/link";
import { StatCard } from "@/components/ui/stat-card";
import { DataTable, type Column } from "@/components/ui/data-table";
import { Badge, type BadgeTone } from "@/components/ui/badge";
import { getTryoutApplications, getTryoutCounts } from "@/lib/services/tryouts";
import { formatShortDate, positionShort, academicLevelLabel } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";
import type { TryoutApplication } from "@prisma/client";

export const metadata: Metadata = { title: "Tryouts" };

const STATUS_TONE: Record<string, BadgeTone> = {
  PENDING: "neutral",
  SHORTLISTED: "gold",
  APPROVED: "win",
  REJECTED: "loss",
  CONTACTED: "important",
};

const STATUSES = ["PENDING", "SHORTLISTED", "APPROVED", "REJECTED", "CONTACTED"];

export default async function AdminTryoutsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; position?: string; level?: string; page?: string }>;
}) {
  const { status, position, level, page } = await searchParams;

  const [counts, result] = await Promise.all([
    getTryoutCounts(),
    getTryoutApplications({ status, position, level, page: page ? Number(page) : 1 }),
  ]);

  const columns: Column<TryoutApplication>[] = [
    {
      key: "name",
      header: "Applicant",
      render: (a) => (
        <Link href={`/admin/tryouts/${a.id}`} className="text-rail-white hover:text-rail-gold font-medium">
          {a.fullName}
        </Link>
      ),
    },
    { key: "position", header: "Position", render: (a) => positionShort(a.position) },
    { key: "level", header: "Level", render: (a) => academicLevelLabel(a.level) },
    { key: "date", header: "Applied", render: (a) => formatShortDate(a.createdAt) },
    { key: "status", header: "Status", render: (a) => <Badge tone={STATUS_TONE[a.status]}>{a.status}</Badge> },
  ];

  return (
    <div>
      <h1 className="font-display text-4xl tracking-tight text-rail-white mb-8">Tryouts</h1>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-8">
        <StatCard label="Total" value={counts.total} />
        <StatCard label="Pending" value={counts.PENDING} highlight />
        <StatCard label="Shortlisted" value={counts.SHORTLISTED} />
        <StatCard label="Approved" value={counts.APPROVED} />
        <StatCard label="Rejected" value={counts.REJECTED} />
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        <Link
          href="/admin/tryouts"
          className={cn("px-3 py-1.5 text-sm border", !status ? "border-rail-gold text-rail-gold" : "border-rail-line text-rail-silver")}
        >
          All
        </Link>
        {STATUSES.map((s) => (
          <Link
            key={s}
            href={`/admin/tryouts?status=${s}`}
            className={cn("px-3 py-1.5 text-sm border", status === s ? "border-rail-gold text-rail-gold" : "border-rail-line text-rail-silver")}
          >
            {s}
          </Link>
        ))}
      </div>

      <DataTable columns={columns} rows={result.items} emptyMessage="No applications yet." />

      {result.totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          {Array.from({ length: result.totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={`/admin/tryouts?${status ? `status=${status}&` : ""}page=${p}`}
              className={cn(
                "px-3 py-1.5 text-sm border",
                result.page === p ? "border-rail-gold text-rail-gold" : "border-rail-line text-rail-silver"
              )}
            >
              {p}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
