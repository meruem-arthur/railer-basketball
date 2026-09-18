import type { Metadata } from "next";
import { PlayerForm } from "@/components/admin/player-form";
import { getAllSeasons } from "@/lib/services/season";
import { createPlayerAction } from "@/app/admin/(dashboard)/players/actions";

export const metadata: Metadata = { title: "Add Player" };

export default async function NewPlayerPage() {
  const seasons = await getAllSeasons();

  return (
    <div>
      <h1 className="font-display text-4xl tracking-tight text-rail-white mb-8">Add Player</h1>
      <PlayerForm seasons={seasons} action={createPlayerAction} mode="create" />
    </div>
  );
}
