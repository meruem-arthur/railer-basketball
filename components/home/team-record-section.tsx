import { StatCard } from "@/components/ui/stat-card";
import type { TeamRecord } from "@/lib/services/stats";

export function TeamRecordSection({ record, seasonLabel }: { record: TeamRecord; seasonLabel?: string }) {
  return (
    <section className="border-y border-rail-line bg-rail-navy/40">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14">
        <div className="flex items-baseline justify-between mb-8">
          <h2 className="font-display text-3xl tracking-tight text-rail-white">Season Record</h2>
          {seasonLabel && (
            <span className="text-sm font-medium text-rail-silver">{seasonLabel}</span>
          )}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard label="Games" value={record.gamesPlayed} />
          <StatCard label="Wins" value={record.wins} highlight />
          <StatCard label="Losses" value={record.losses} />
          <StatCard label="Win %" value={record.winPct} suffix="%" />
        </div>
      </div>
    </section>
  );
}
