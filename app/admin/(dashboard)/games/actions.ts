"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/session";
import { gameSchema, resultSchema } from "@/lib/validation/game";
import { logAction } from "@/lib/services/audit";
import type { DeleteResult } from "@/lib/utils/action-result";

export interface GameFormState {
  success: boolean;
  error?: string;
  gameId?: string;
}

export async function createGameAction(
  _prev: GameFormState,
  formData: FormData
): Promise<GameFormState> {
  const user = await requireRole(["SUPER_ADMIN", "ADMIN"]);

  const raw = Object.fromEntries(formData.entries());
  const parsed = gameSchema.safeParse({
    ...raw,
    opponentLogoUrl: raw.opponentLogoUrl || undefined,
    highlightUrl: raw.highlightUrl || undefined,
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const game = await prisma.game.create({ data: parsed.data });

  await logAction({ userId: user.id, action: "GAME_CREATED", entity: "Game", entityId: game.id });
  revalidatePath("/admin/games");
  revalidatePath("/schedule");
  revalidatePath("/");

  return { success: true, gameId: game.id };
}

export async function updateGameAction(
  gameId: string,
  _prev: GameFormState,
  formData: FormData
): Promise<GameFormState> {
  const user = await requireRole(["SUPER_ADMIN", "ADMIN"]);

  const raw = Object.fromEntries(formData.entries());
  const parsed = gameSchema.safeParse({
    ...raw,
    opponentLogoUrl: raw.opponentLogoUrl || undefined,
    highlightUrl: raw.highlightUrl || undefined,
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  await prisma.game.update({ where: { id: gameId }, data: parsed.data });

  await logAction({ userId: user.id, action: "GAME_UPDATED", entity: "Game", entityId: gameId });
  revalidatePath("/admin/games");
  revalidatePath(`/admin/games/${gameId}`);
  revalidatePath(`/games/${gameId}`);
  revalidatePath("/schedule");
  revalidatePath("/");

  return { success: true, gameId };
}

export async function cancelGameAction(gameId: string) {
  const user = await requireRole(["SUPER_ADMIN", "ADMIN"]);
  await prisma.game.update({ where: { id: gameId }, data: { status: "CANCELLED" } });
  await logAction({ userId: user.id, action: "GAME_CANCELLED", entity: "Game", entityId: gameId });
  revalidatePath("/admin/games");
  revalidatePath("/schedule");
}

/**
 * Permanently deletes a game along with its result: quarter scores, every
 * player's box-score line, and the team totals (database cascade). Gallery
 * albums that were linked to it are kept, just unlinked.
 */
export async function deleteGameAction(gameId: string): Promise<DeleteResult> {
  const user = await requireRole(["SUPER_ADMIN", "ADMIN"]);

  const game = await prisma.game.findUnique({
    where: { id: gameId },
    select: { opponentName: true },
  });
  if (!game) return { success: false, error: "This game no longer exists." };

  try {
    await prisma.game.delete({ where: { id: gameId } });
  } catch {
    return { success: false, error: "Could not delete this game. Please try again." };
  }

  await logAction({
    userId: user.id,
    action: "GAME_DELETED",
    entity: "Game",
    entityId: gameId,
    metadata: { opponent: game.opponentName },
  });

  // Not revalidating /admin/games/[id] — that page is the one being deleted.
  revalidatePath("/admin/games");
  revalidatePath("/schedule");
  revalidatePath("/results");
  revalidatePath("/stats");
  revalidatePath(`/games/${gameId}`);
  revalidatePath("/gallery");
  revalidatePath("/");

  return { success: true };
}

export async function postponeGameAction(gameId: string) {
  const user = await requireRole(["SUPER_ADMIN", "ADMIN"]);
  await prisma.game.update({ where: { id: gameId }, data: { status: "POSTPONED" } });
  await logAction({ userId: user.id, action: "GAME_POSTPONED", entity: "Game", entityId: gameId });
  revalidatePath("/admin/games");
  revalidatePath("/schedule");
}

export interface ResultFormState {
  success: boolean;
  error?: string;
}

/**
 * Submits a full result: final score, quarter-by-quarter breakdown, and a
 * per-player box score. Everything is written in one transaction so a
 * completed game never ends up with a score but no box score (or vice
 * versa) if something fails partway through.
 */
export async function submitResultAction(
  _prev: ResultFormState,
  formData: FormData
): Promise<ResultFormState> {
  const user = await requireRole(["SUPER_ADMIN", "ADMIN"]);

  const gameId = String(formData.get("gameId") ?? "");
  const quarterScoresRaw = String(formData.get("quarterScoresJson") ?? "[]");
  const playerStatsRaw = String(formData.get("playerStatsJson") ?? "[]");

  let quarterScores: unknown[];
  let playerStats: unknown[];
  try {
    quarterScores = JSON.parse(quarterScoresRaw);
    playerStats = JSON.parse(playerStatsRaw);
  } catch {
    return { success: false, error: "Malformed submission." };
  }

  const parsed = resultSchema.safeParse({
    gameId,
    railersScore: formData.get("railersScore"),
    opponentScore: formData.get("opponentScore"),
    quarterScores,
    mvpPlayerSeasonId: formData.get("mvpPlayerSeasonId") || null,
    gameReport: formData.get("gameReport") || null,
    highlightUrl: formData.get("highlightUrl") || null,
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid result data." };
  }

  const game = await prisma.game.findUnique({ where: { id: gameId } });
  if (!game) return { success: false, error: "Game not found." };

  try {
    await prisma.$transaction(async (tx) => {
      await tx.game.update({
        where: { id: gameId },
        data: {
          railersScore: parsed.data.railersScore,
          opponentScore: parsed.data.opponentScore,
          status: "COMPLETED",
          mvpPlayerSeasonId: parsed.data.mvpPlayerSeasonId || null,
          gameReport: parsed.data.gameReport || null,
          highlightUrl: parsed.data.highlightUrl || null,
        },
      });

      await tx.gameQuarterScore.deleteMany({ where: { gameId } });
      if (parsed.data.quarterScores.length > 0) {
        await tx.gameQuarterScore.createMany({
          data: parsed.data.quarterScores.map((q) => ({
            gameId,
            quarter: q.quarter,
            railersScore: q.railersScore,
            opponentScore: q.opponentScore,
          })),
        });
      }

      await tx.playerGameStat.deleteMany({ where: { gameId } });
      const validStats = (playerStats as Record<string, unknown>[]).filter(
        (s) => s.playerSeasonId
      );
      if (validStats.length > 0) {
        await tx.playerGameStat.createMany({
          data: validStats.map((s) => ({
            gameId,
            playerSeasonId: String(s.playerSeasonId),
            minutes: s.minutes ? Number(s.minutes) : null,
            points: Number(s.points ?? 0),
            rebounds: Number(s.rebounds ?? 0),
            assists: Number(s.assists ?? 0),
            steals: Number(s.steals ?? 0),
            blocks: Number(s.blocks ?? 0),
            turnovers: Number(s.turnovers ?? 0),
            fouls: Number(s.fouls ?? 0),
            fieldGoalsMade: Number(s.fieldGoalsMade ?? 0),
            fieldGoalsAttempted: Number(s.fieldGoalsAttempted ?? 0),
            threePointersMade: Number(s.threePointersMade ?? 0),
            threePointersAttempted: Number(s.threePointersAttempted ?? 0),
            freeThrowsMade: Number(s.freeThrowsMade ?? 0),
            freeThrowsAttempted: Number(s.freeThrowsAttempted ?? 0),
          })),
        });
      }

      const teamRebounds = validStats.reduce((sum, s) => sum + Number(s.rebounds ?? 0), 0);
      const teamAssists = validStats.reduce((sum, s) => sum + Number(s.assists ?? 0), 0);
      const teamTurnovers = validStats.reduce((sum, s) => sum + Number(s.turnovers ?? 0), 0);
      const teamFgMade = validStats.reduce((sum, s) => sum + Number(s.fieldGoalsMade ?? 0), 0);
      const teamFgAttempted = validStats.reduce((sum, s) => sum + Number(s.fieldGoalsAttempted ?? 0), 0);

      await tx.teamGameStat.upsert({
        where: { gameId },
        create: {
          gameId,
          seasonId: game.seasonId,
          rebounds: teamRebounds,
          assists: teamAssists,
          turnovers: teamTurnovers,
          fieldGoals: teamFgMade,
          fieldGoalAttempts: teamFgAttempted,
        },
        update: {
          rebounds: teamRebounds,
          assists: teamAssists,
          turnovers: teamTurnovers,
          fieldGoals: teamFgMade,
          fieldGoalAttempts: teamFgAttempted,
        },
      });
    });
  } catch {
    return { success: false, error: "Could not save the result. Please try again." };
  }

  await logAction({ userId: user.id, action: "RESULT_SUBMITTED", entity: "Game", entityId: gameId });
  revalidatePath("/admin/games");
  revalidatePath(`/admin/games/${gameId}`);
  revalidatePath(`/games/${gameId}`);
  revalidatePath("/results");
  revalidatePath("/stats");
  revalidatePath("/");

  return { success: true };
}
