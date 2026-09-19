"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/session";
import { seasonSchema } from "@/lib/validation/misc";
import { setCurrentSeason } from "@/lib/services/season";
import { logAction } from "@/lib/services/audit";
import type { DeleteResult } from "@/lib/utils/action-result";

export interface SeasonFormState {
  success: boolean;
  error?: string;
}

export async function createSeasonAction(
  _prev: SeasonFormState,
  formData: FormData
): Promise<SeasonFormState> {
  const user = await requireRole(["SUPER_ADMIN", "ADMIN"]);

  const parsed = seasonSchema.safeParse({
    label: formData.get("label"),
    startDate: formData.get("startDate"),
    endDate: formData.get("endDate"),
    isCurrent: formData.get("isCurrent") === "on",
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  let season;
  try {
    season = await prisma.teamSeason.create({ data: { ...parsed.data, isCurrent: false } });
  } catch {
    return { success: false, error: "A season with that label already exists." };
  }

  if (parsed.data.isCurrent) {
    await setCurrentSeason(season.id);
  }

  await logAction({ userId: user.id, action: "SEASON_CREATED", entity: "TeamSeason", entityId: season.id });
  revalidatePath("/admin/seasons");
  revalidatePath("/");

  return { success: true };
}

export async function setCurrentSeasonAction(seasonId: string) {
  const user = await requireRole(["SUPER_ADMIN", "ADMIN"]);
  await setCurrentSeason(seasonId);
  await logAction({ userId: user.id, action: "SEASON_SET_CURRENT", entity: "TeamSeason", entityId: seasonId });
  revalidatePath("/admin/seasons");
  revalidatePath("/");
}

export async function archiveSeasonAction(seasonId: string) {
  const user = await requireRole(["SUPER_ADMIN", "ADMIN"]);
  await prisma.teamSeason.update({ where: { id: seasonId }, data: { isArchived: true, isCurrent: false } });
  await logAction({ userId: user.id, action: "SEASON_ARCHIVED", entity: "TeamSeason", entityId: seasonId });
  revalidatePath("/admin/seasons");
}

/**
 * Permanently deletes a season together with everything that belongs to it:
 * its games, results and box scores, team stats, and every player's roster
 * entry for that season (database cascade). Players themselves are kept.
 * Gallery albums that were linked to its games stay, just unlinked.
 */
export async function deleteSeasonAction(seasonId: string): Promise<DeleteResult> {
  const user = await requireRole(["SUPER_ADMIN", "ADMIN"]);

  const season = await prisma.teamSeason.findUnique({
    where: { id: seasonId },
    select: { label: true },
  });
  if (!season) return { success: false, error: "This season no longer exists." };

  try {
    await prisma.$transaction([
      prisma.siteSetting.updateMany({
        where: { currentSeasonId: seasonId },
        data: { currentSeasonId: null },
      }),
      prisma.teamSeason.delete({ where: { id: seasonId } }),
    ]);
  } catch {
    return { success: false, error: "Could not delete this season. Please try again." };
  }

  await logAction({
    userId: user.id,
    action: "SEASON_DELETED",
    entity: "TeamSeason",
    entityId: seasonId,
    metadata: { label: season.label },
  });

  // A season touches most public pages (roster, schedule, results, stats,
  // home), so refresh everything rather than list them one by one.
  revalidatePath("/", "layout");

  return { success: true };
}
