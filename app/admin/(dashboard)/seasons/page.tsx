import type { Metadata } from "next";
import { getAllSeasons } from "@/lib/services/season";
import { SeasonForm } from "@/components/admin/season-form";
import { Badge } from "@/components/ui/badge";
import { SeasonRowActions } from "@/components/admin/season-row-actions";
import { formatShortDate } from "@/lib/utils/format";

export const metadata: Metadata = { title: "Seasons" };

export default async function AdminSeasonsPage() {
  const seasons = await getAllSeasons();

  return (
    <div>
      <h1 className="font-display text-4xl tracking-tight text-rail-white mb-8">Seasons</h1>

      <div className="mb-10">
        <SeasonForm />
      </div>

      <div className="border border-rail-line divide-y divide-rail-line">
        {seasons.length === 0 ? (
          <p className="px-4 py-8 text-center text-rail-silver">No seasons yet.</p>
        ) : (
          seasons.map((s) => (
            <div key={s.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-display text-xl text-rail-white">{s.label}</span>
                  {s.isCurrent && <Badge tone="gold">Current</Badge>}
                  {s.isArchived && <Badge tone="neutral">Archived</Badge>}
                </div>
                <p className="text-sm text-rail-silver mt-0.5">
                  {formatShortDate(s.startDate)} – {formatShortDate(s.endDate)}
                </p>
              </div>
              <SeasonRowActions seasonId={s.id} isCurrent={s.isCurrent} isArchived={s.isArchived} />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
