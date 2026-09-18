"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/session";
import { playerSchema, playerSeasonSchema } from "@/lib/validation/player";
import { logAction } from "@/lib/services/audit";
import { slugify, slugExists } from "@/lib/services/players";

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
