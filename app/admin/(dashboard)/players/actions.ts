"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/session";
import { playerSchema, playerSeasonSchema } from "@/lib/validation/player";
import { logAction } from "@/lib/services/audit";
import { slugify, slugExists } from "@/lib/services/players";
import { recomputeTeamGameStats } from "@/lib/services/stats";
import { deleteImage } from "@/lib/cloudinary/upload";
import type { DeleteResult } from "@/lib/utils/action-result";

export interface PlayerFormState {
  success: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
  playerId?: string;
}

async function uniqueSlugFor(firstName: string, lastName: string): Promise<string> {
  const base = slugify(firstName, lastName);
  let candidate = base;
  let n = 1;
  while (await slugExists(candidate)) {
    candidate = `${base}-${n}`;
    n += 1;
  }
  return candidate;
}

export async function createPlayerAction(
  _prev: PlayerFormState,
  formData: FormData
): Promise<PlayerFormState> {
  const user = await requireRole(["SUPER_ADMIN", "ADMIN"]);

  const raw = Object.fromEntries(formData.entries());
  const parsed = playerSchema.safeParse({
    ...raw,
    active: raw.active === "on" || raw.active === "true",
    heightCm: raw.heightCm || undefined,
    yearJoined: raw.yearJoined || undefined,
    dateOfBirth: raw.dateOfBirth || undefined,
    academicLevel: raw.academicLevel || undefined,
    hometown: raw.hometown || undefined,
    programme: raw.programme || undefined,
    bio: raw.bio || undefined,
  });

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) fieldErrors[String(issue.path[0])] = issue.message;
    return { success: false, error: "Please fix the errors below.", fieldErrors };
  }

  const slug = await uniqueSlugFor(parsed.data.firstName, parsed.data.lastName);
  const photoUrl = String(raw.photoUrl || "") || null;
  const photoPublicId = String(raw.photoPublicId || "") || null;

  const player = await prisma.player.create({
    data: { ...parsed.data, slug, photoUrl, photoPublicId },
  });

  // Optional immediate season assignment from the same form.
  const seasonId = String(raw.seasonId || "");
  const jerseyNumber = raw.jerseyNumber ? Number(raw.jerseyNumber) : null;
  const position = String(raw.position || "");

  if (seasonId && jerseyNumber !== null && position) {
    const seasonParsed = playerSeasonSchema.safeParse({
      playerId: player.id,
      seasonId,
      jerseyNumber,
      position,
      active: true,
    });
    if (seasonParsed.success) {
      await prisma.playerSeason.create({ data: seasonParsed.data }).catch(() => {
        // Duplicate jersey number for the season — player is still created;
        // the admin can assign a season separately from the edit page.
      });
    }
  }

  await logAction({ userId: user.id, action: "PLAYER_CREATED", entity: "Player", entityId: player.id });
  revalidatePath("/admin/players");
  revalidatePath("/team");

  return { success: true, playerId: player.id };
}

export async function updatePlayerAction(
  playerId: string,
  _prev: PlayerFormState,
  formData: FormData
): Promise<PlayerFormState> {
  const user = await requireRole(["SUPER_ADMIN", "ADMIN"]);

  const raw = Object.fromEntries(formData.entries());
  const parsed = playerSchema.safeParse({
    ...raw,
    active: raw.active === "on" || raw.active === "true",
    heightCm: raw.heightCm || undefined,
    yearJoined: raw.yearJoined || undefined,
    dateOfBirth: raw.dateOfBirth || undefined,
    academicLevel: raw.academicLevel || undefined,
    hometown: raw.hometown || undefined,
    programme: raw.programme || undefined,
    bio: raw.bio || undefined,
  });

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) fieldErrors[String(issue.path[0])] = issue.message;
    return { success: false, error: "Please fix the errors below.", fieldErrors };
  }

  const photoUrl = String(raw.photoUrl || "") || null;
  const photoPublicId = String(raw.photoPublicId || "") || null;

  await prisma.player.update({
    where: { id: playerId },
    data: { ...parsed.data, photoUrl, photoPublicId },
  });

  await logAction({ userId: user.id, action: "PLAYER_UPDATED", entity: "Player", entityId: playerId });
  revalidatePath("/admin/players");
  revalidatePath(`/admin/players/${playerId}`);
  revalidatePath("/team");

  return { success: true, playerId };
}

export async function deactivatePlayerAction(playerId: string) {
  const user = await requireRole(["SUPER_ADMIN", "ADMIN"]);

  // Soft deactivation only — historical stats and season records must
  // remain intact, so the player row itself is never deleted.
  await prisma.player.update({ where: { id: playerId }, data: { active: false } });
  await prisma.playerSeason.updateMany({ where: { playerId }, data: { active: false } });

  await logAction({ userId: user.id, action: "PLAYER_DEACTIVATED", entity: "Player", entityId: playerId });
  revalidatePath("/admin/players");
  revalidatePath("/team");
}

/**
 * Permanently deletes a player. Their season entries and every box-score
 * line recorded for them go with them (database cascade); any game that
 * named them MVP loses that MVP, and team totals for the affected games
 * are recalculated from the remaining stats.
 */
export async function deletePlayerAction(playerId: string): Promise<DeleteResult> {
  const user = await requireRole(["SUPER_ADMIN", "ADMIN"]);

  const player = await prisma.player.findUnique({
    where: { id: playerId },
    select: {
      slug: true,
      firstName: true,
      lastName: true,
      photoPublicId: true,
      seasons: { select: { id: true, gameStats: { select: { gameId: true } } } },
    },
  });
  if (!player) return { success: false, error: "This player no longer exists." };

  const playerSeasonIds = player.seasons.map((ps) => ps.id);
  const affectedGameIds = [
    ...new Set(player.seasons.flatMap((ps) => ps.gameStats.map((gs) => gs.gameId))),
  ];

  try {
    await prisma.$transaction(
      async (tx) => {
        if (playerSeasonIds.length > 0) {
          // mvpPlayerSeasonId is a plain column, not a foreign key, so it
          // would otherwise be left pointing at a row that no longer exists.
          await tx.game.updateMany({
            where: { mvpPlayerSeasonId: { in: playerSeasonIds } },
            data: { mvpPlayerSeasonId: null },
          });
        }
        await tx.player.delete({ where: { id: playerId } });
        await recomputeTeamGameStats(tx, affectedGameIds);
      },
      { timeout: 20_000 }
    );
  } catch {
    return { success: false, error: "Could not delete this player. Please try again." };
  }

  // Best-effort cleanup of the uploaded photo; the player is already gone.
  if (player.photoPublicId) await deleteImage(player.photoPublicId).catch(() => {});

  await logAction({
    userId: user.id,
    action: "PLAYER_DELETED",
    entity: "Player",
    entityId: playerId,
    metadata: { name: `${player.firstName} ${player.lastName}` },
  });

  // Deliberately not revalidating /admin/players/[id]: that page is the one
  // being deleted, and re-rendering it here would 404 before the redirect.
  revalidatePath("/admin/players");
  revalidatePath("/team");
  revalidatePath(`/team/${player.slug}`);
  revalidatePath("/stats");
  revalidatePath("/results");
  revalidatePath("/");

  return { success: true };
}

export async function reactivatePlayerAction(playerId: string) {
  const user = await requireRole(["SUPER_ADMIN", "ADMIN"]);
  await prisma.player.update({ where: { id: playerId }, data: { active: true } });
  await logAction({ userId: user.id, action: "PLAYER_REACTIVATED", entity: "Player", entityId: playerId });
  revalidatePath("/admin/players");
}

export interface AssignSeasonState {
  success: boolean;
  error?: string;
}

export async function assignPlayerSeasonAction(
  _prev: AssignSeasonState,
  formData: FormData
): Promise<AssignSeasonState> {
  const user = await requireRole(["SUPER_ADMIN", "ADMIN"]);

  const parsed = playerSeasonSchema.safeParse({
    playerId: formData.get("playerId"),
    seasonId: formData.get("seasonId"),
    jerseyNumber: formData.get("jerseyNumber"),
    position: formData.get("position"),
    active: true,
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  try {
    await prisma.playerSeason.create({ data: parsed.data });
  } catch {
    return { success: false, error: "This player already has a season entry, or the jersey number is taken." };
  }

  await logAction({
    userId: user.id,
    action: "PLAYER_SEASON_ASSIGNED",
    entity: "PlayerSeason",
    entityId: parsed.data.playerId,
  });
  revalidatePath(`/admin/players/${parsed.data.playerId}`);
  revalidatePath("/team");

  return { success: true };
}

export async function removePlayerSeasonAction(playerSeasonId: string, playerId: string) {
  const user = await requireRole(["SUPER_ADMIN", "ADMIN"]);
  try {
    await prisma.playerSeason.delete({ where: { id: playerSeasonId } });
  } catch {
    throw new Error(
      "This season entry has game statistics recorded against it and can't be removed. Deactivate it instead."
    );
  }
  await logAction({
    userId: user.id,
    action: "PLAYER_SEASON_REMOVED",
    entity: "PlayerSeason",
    entityId: playerSeasonId,
  });
  revalidatePath(`/admin/players/${playerId}`);
}
