import type { Metadata } from "next";
import { SectionHeading } from "@/components/ui/section-heading";
import { AnnouncementBanner } from "@/components/announcements/announcement-banner";
import { EmptyState } from "@/components/ui/empty-state";
import { Megaphone } from "lucide-react";
import { getActiveAnnouncements } from "@/lib/services/announcements";

export const metadata: Metadata = {
  title: "Announcements",
  description: "Official announcements from UMaT SRID Railers.",
};

export default async function AnnouncementsPage() {
  const announcements = await getActiveAnnouncements();

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-16">
      <SectionHeading title="Announcements" />
      {announcements.length === 0 ? (
        <EmptyState icon={Megaphone} title="No announcements right now" />
      ) : (
        <div className="space-y-3">
          {announcements.map((a) => (
            <AnnouncementBanner key={a.id} announcement={a} />
          ))}
        </div>
      )}
    </div>
  );
}
