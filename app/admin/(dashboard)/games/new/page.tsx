import type { Metadata } from "next";
import { GameForm } from "@/components/admin/game-form";
import { getAllSeasons } from "@/lib/services/season";
import { createGameAction } from "@/app/admin/(dashboard)/games/actions";

export const metadata: Metadata = { title: "Add Game" };

export default async function NewGamePage() {
  const seasons = await getAllSeasons();

  return (
    <div>
      <h1 className="font-display text-4xl tracking-tight text-rail-white mb-8">Add Game</h1>
      <GameForm seasons={seasons} action={createGameAction} mode="create" />
    </div>
  );
}
