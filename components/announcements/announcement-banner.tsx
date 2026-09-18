import { Megaphone } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatShortDate } from "@/lib/utils/format";

export interface AnnouncementData {
  id: string;
  title: string;
  content: string;
  priority: string;
  publishedAt: Date | null;
}

export function AnnouncementBanner({ announcement }: { announcement: AnnouncementData }) {
  const isUrgent = announcement.priority === "URGENT";
  const isImportant = announcement.priority === "IMPORTANT";

  return (
    <div
      className={`flex gap-4 border px-5 py-4 ${
        isUrgent
          ? "border-rail-loss/40 bg-rail-loss/[0.06]"
          : isImportant
          ? "border-rail-gold/40 bg-rail-gold/[0.06]"
          : "border-rail-line bg-rail-navy/50"
      }`}
    >
      <Megaphone
        className={`h-5 w-5 shrink-0 mt-0.5 ${
          isUrgent ? "text-rail-loss" : isImportant ? "text-rail-gold" : "text-rail-silver"
        }`}
        aria-hidden="true"
      />
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-semibold text-rail-white">{announcement.title}</p>
          {(isUrgent || isImportant) && (
            <Badge tone={isUrgent ? "urgent" : "important"}>{announcement.priority}</Badge>
          )}
        </div>
        <p className="mt-1 text-sm text-rail-silver">{announcement.content}</p>
        {announcement.publishedAt && (
          <p className="mt-2 text-xs text-rail-silver/70">
            {formatShortDate(announcement.publishedAt)}
          </p>
        )}
      </div>
    </div>
  );
}
