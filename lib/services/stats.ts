import "server-only";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { round1, safeDiv } from "@/lib/utils/format";

export interface TeamRecord {
  gamesPlayed: number;
  wins: number;
  losses: number;
  winPct: number;
  avgPointsFor: number;
  avgPointsAgainst: number;
  avgRebounds: number;
  avgAssists: number;
}

/** Team record and averages for a season, derived entirely from completed games. */
export async function getTeamRecord(seasonId: string): Promise<TeamRecord> {
  // Independent queries — run them together rather than one after the other.
  const [completed, teamGameStats] = await Promise.all([
    prisma.game.findMany({
      where: { seasonId, status: "COMPLETED" },
      select: { railersScore: true, opponentScore: true },
    }),
    prisma.teamGameStat.findMany({
      where: { seasonId },
      select: { rebounds: true, assists: true },
    }),
  ]);

  const gamesPlayed = completed.length;
  let wins = 0;
  let pointsFor = 0;
  let pointsAgainst = 0;

  for (const g of completed) {
    const rs = g.railersScore ?? 0;
    const os = g.opponentScore ?? 0;
    pointsFor += rs;
    pointsAgainst += os;
    if (rs > os) wins += 1;
  }

  const totalRebounds = teamGameStats.reduce((sum, s) => sum + s.rebounds, 0);
  const totalAssists = teamGameStats.reduce((sum, s) => sum + s.assists, 0);

  return {
    gamesPlayed,
    wins,
    losses: gamesPlayed - wins,
    winPct: round1(safeDiv(wins, gamesPlayed) * 100),
    avgPointsFor: round1(safeDiv(pointsFor, gamesPlayed)),
    avgPointsAgainst: round1(safeDiv(pointsAgainst, gamesPlayed)),
    avgRebounds: round1(safeDiv(totalRebounds, teamGameStats.length)),
    avgAssists: round1(safeDiv(totalAssists, teamGameStats.length)),
  };
}

export interface PlayerSeasonTotals {
  playerSeasonId: string;
  playerId: string;
  firstName: string;
  lastName: string;
  slug: string;
  photoUrl: string | null;
  jerseyNumber: number;
  gamesPlayed: number;
  points: number;
  rebounds: number;
  assists: number;
  steals: number;
  blocks: number;
  ppg: number;
  rpg: number;
  apg: number;
}

/** Per-player season aggregates, rolled up from individual PlayerGameStat rows. */
export async function getPlayerSeasonTotals(seasonId: string): Promise<PlayerSeasonTotals[]> {
  const playerSeasons = await prisma.playerSeason.findMany({
    where: { seasonId },
    include: {
      player: true,
      gameStats: true,
    },
  });

  return playerSeasons
    .map((ps) => {
      const gamesPlayed = ps.gameStats.length;
      const points = ps.gameStats.reduce((s, g) => s + g.points, 0);
      const rebounds = ps.gameStats.reduce((s, g) => s + g.rebounds, 0);
      const assists = ps.gameStats.reduce((s, g) => s + g.assists, 0);
      const steals = ps.gameStats.reduce((s, g) => s + g.steals, 0);
      const blocks = ps.gameStats.reduce((s, g) => s + g.blocks, 0);

      return {
        playerSeasonId: ps.id,
        playerId: ps.playerId,
        firstName: ps.player.firstName,
        lastName: ps.player.lastName,
        slug: ps.player.slug,
        photoUrl: ps.player.photoUrl,
        jerseyNumber: ps.jerseyNumber,
        gamesPlayed,
        points,
        rebounds,
        assists,
        steals,
        blocks,
        ppg: round1(safeDiv(points, gamesPlayed)),
        rpg: round1(safeDiv(rebounds, gamesPlayed)),
        apg: round1(safeDiv(assists, gamesPlayed)),
      };
    })
    .filter((p) => p.gamesPlayed > 0);
}

export async function getStatLeaders(seasonId: string) {
  const totals = await getPlayerSeasonTotals(seasonId);
  const topBy = <K extends keyof PlayerSeasonTotals>(key: K) =>
    [...totals].sort((a, b) => (b[key] as number) - (a[key] as number))[0] ?? null;

  return {
    topScorer: topBy("ppg"),
    topRebounder: topBy("rpg"),
    topAssister: topBy("apg"),
    topStealer: topBy("steals"),
    topBlocker: topBy("blocks"),
  };
}

/** A single player's season-by-season history across their whole career. */
export async function getPlayerCareerHistory(playerId: string) {
  const seasons = await prisma.playerSeason.findMany({
    where: { playerId },
    include: { season: true, gameStats: true },
    orderBy: { season: { startDate: "desc" } },
  });

  return seasons.map((ps) => {
    const gamesPlayed = ps.gameStats.length;
    const points = ps.gameStats.reduce((s, g) => s + g.points, 0);
    const rebounds = ps.gameStats.reduce((s, g) => s + g.rebounds, 0);
    const assists = ps.gameStats.reduce((s, g) => s + g.assists, 0);

    return {
      seasonLabel: ps.season.label,
      seasonId: ps.seasonId,
      jerseyNumber: ps.jerseyNumber,
      gamesPlayed,
      ppg: round1(safeDiv(points, gamesPlayed)),
      rpg: round1(safeDiv(rebounds, gamesPlayed)),
      apg: round1(safeDiv(assists, gamesPlayed)),
    };
  });
}

/**
 * Re-derives the stored team totals for the given games from whatever
 * player stat rows remain. Call after deleting player stats (e.g. when a
 * player is deleted) so team rebound/assist averages don't keep counting
 * numbers that no longer exist.
 */
export async function recomputeTeamGameStats(tx: Prisma.TransactionClient, gameIds: string[]) {
  if (gameIds.length === 0) return;

  const sums = await tx.playerGameStat.groupBy({
    by: ["gameId"],
    where: { gameId: { in: gameIds } },
    _sum: {
      rebounds: true,
      assists: true,
      turnovers: true,
      fieldGoalsMade: true,
      fieldGoalsAttempted: true,
    },
  });
  const byGame = new Map(sums.map((row) => [row.gameId, row._sum]));

  await Promise.all(
    gameIds.map((gameId) => {
      const sum = byGame.get(gameId);
      return tx.teamGameStat.updateMany({
        where: { gameId },
        data: {
          rebounds: sum?.rebounds ?? 0,
          assists: sum?.assists ?? 0,
          turnovers: sum?.turnovers ?? 0,
          fieldGoals: sum?.fieldGoalsMade ?? 0,
          fieldGoalAttempts: sum?.fieldGoalsAttempted ?? 0,
        },
      });
    })
  );
}
