import type { Metadata } from "next";
import { requireRole } from "@/lib/auth/session";
import { getAllSeasons } from "@/lib/services/season";
import { PlayerImportForm } from "@/components/admin/player-import-form";

export const metadata: Metadata = { title: "Import Players" };

export default async function ImportPlayersPage() {
  await requireRole(["SUPER_ADMIN", "ADMIN"]);
  const seasons = await getAllSeasons();
  return (
    <div>
      <h1 className="font-display text-4xl tracking-tight text-rail-white mb-8">Import Players</h1>
      <PlayerImportForm seasons={seasons.map((s) => ({ id: s.id, label: s.label, isCurrent: s.isCurrent }))} />
    </div>
  );
}
