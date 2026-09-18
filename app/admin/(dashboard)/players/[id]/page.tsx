import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { PlayerForm } from "@/components/admin/player-form";
import { SeasonAssignmentManager } from "@/components/admin/season-assignment-manager";
import { getAllSeasons } from "@/lib/services/season";
import { updatePlayerAction, deactivatePlayerAction, reactivatePlayerAction } from "@/app/admin/(dashboard)/players/actions";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Edit Player" };

export default async function EditPlayerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [player, seasons] = await Promise.all([
    prisma.player.findUnique({
      where: { id },
      include: { seasons: { include: { season: true }, orderBy: { season: { startDate: "desc" } } } },
    }),
    getAllSeasons(),
  ]);

  if (!player) notFound();

  const boundUpdate = updatePlayerAction.bind(null, player.id);

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-4xl tracking-tight text-rail-white">
          {player.firstName} {player.lastName}
        </h1>
        <form
          action={async () => {
            "use server";
            if (player.active) {
              await deactivatePlayerAction(player.id);
            } else {
              await reactivatePlayerAction(player.id);
            }
          }}
        >
          <Button variant={player.active ? "outline" : "primary"} size="sm">
            {player.active ? "Deactivate" : "Reactivate"}
          </Button>
        </form>
      </div>

      <PlayerForm player={player} seasons={seasons} action={boundUpdate} mode="edit" />

      <div className="mt-14 border-t border-rail-line pt-8">
        <h2 className="font-display text-2xl tracking-tight text-rail-white mb-4">Seasons</h2>
        <SeasonAssignmentManager playerId={player.id} assignments={player.seasons} seasons={seasons} />
      </div>
    </div>
  );
}
