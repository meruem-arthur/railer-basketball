import type { Metadata } from "next";
import { prisma } from "@/lib/db/prisma";
import { AnnouncementForm } from "@/components/admin/announcement-form";
import { AnnouncementRowActions } from "@/components/admin/announcement-row-actions";
import { Badge, type BadgeTone } from "@/components/ui/badge";
import { formatShortDate } from "@/lib/utils/format";

export const metadata: Metadata = { title: "Announcements" };

const STATUS_TONE: Record<string, BadgeTone> = {
  ACTIVE: "win",
  EXPIRED: "neutral",
  DRAFT: "neutral",
};

export default async function AdminAnnouncementsPage() {
  const announcements = await prisma.announcement.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div>
      <h1 className="font-display text-4xl tracking-tight text-rail-white mb-8">Announcements</h1>

      <div className="mb-10">
        <AnnouncementForm />
      </div>

      <div className="border border-rail-line divide-y divide-rail-line">
        {announcements.length === 0 ? (
          <p className="px-4 py-8 text-center text-rail-silver">No announcements yet.</p>
        ) : (
          announcements.map((a) => (
            <div key={a.id} className="flex flex-wrap items-start justify-between gap-3 px-5 py-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium text-rail-white">{a.title}</span>
                  <Badge tone={a.priority === "URGENT" ? "urgent" : a.priority === "IMPORTANT" ? "important" : "neutral"}>
                    {a.priority}
                  </Badge>
                  <Badge tone={STATUS_TONE[a.status]}>{a.status}</Badge>
                </div>
                <p className="text-sm text-rail-silver mt-1 max-w-lg">{a.content}</p>
                {a.expiresAt && (
                  <p className="text-xs text-rail-silver/70 mt-1">Expires {formatShortDate(a.expiresAt)}</p>
                )}
              </div>
              <AnnouncementRowActions id={a.id} status={a.status} />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
