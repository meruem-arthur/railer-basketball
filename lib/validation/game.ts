import { z } from "zod";

export const gameStatusEnum = z.enum([
  "UPCOMING",
  "LIVE",
  "COMPLETED",
  "POSTPONED",
  "CANCELLED",
]);

export const homeAwayEnum = z.enum(["HOME", "AWAY", "NEUTRAL"]);

export const gameSchema = z.object({
  seasonId: z.string().min(1),
  opponentId: z.string().optional().nullable(),
  opponentName: z.string().min(1, "Opponent name is required"),
  opponentLogoUrl: z.string().url().optional().nullable(),
  dateTime: z.coerce.date(),
  venue: z.string().min(1, "Venue is required"),
  homeAway: homeAwayEnum.default("HOME"),
  competition: z.string().min(1).default("Friendly"),
  status: gameStatusEnum.default("UPCOMING"),
  gameReport: z.string().optional().nullable(),
  highlightUrl: z.string().url().optional().nullable().or(z.literal("")),
});

export const quarterScoreSchema = z.object({
  quarter: z.coerce.number().int().min(1).max(10),
  railersScore: z.coerce.number().int().min(0),
  opponentScore: z.coerce.number().int().min(0),
});

export const resultSchema = z.object({
  gameId: z.string().min(1),
  railersScore: z.coerce.number().int().min(0),
  opponentScore: z.coerce.number().int().min(0),
  quarterScores: z.array(quarterScoreSchema).optional().default([]),
  mvpPlayerSeasonId: z.string().optional().nullable(),
  gameReport: z.string().optional().nullable(),
  highlightUrl: z.string().url().optional().nullable().or(z.literal("")),
});

export const playerGameStatSchema = z.object({
  playerSeasonId: z.string().min(1),
  minutes: z.coerce.number().int().min(0).max(60).optional().nullable(),
  points: z.coerce.number().int().min(0).default(0),
  rebounds: z.coerce.number().int().min(0).default(0),
  assists: z.coerce.number().int().min(0).default(0),
  steals: z.coerce.number().int().min(0).default(0),
  blocks: z.coerce.number().int().min(0).default(0),
  turnovers: z.coerce.number().int().min(0).default(0),
  fouls: z.coerce.number().int().min(0).max(6).default(0),
  fieldGoalsMade: z.coerce.number().int().min(0).default(0),
  fieldGoalsAttempted: z.coerce.number().int().min(0).default(0),
  threePointersMade: z.coerce.number().int().min(0).default(0),
  threePointersAttempted: z.coerce.number().int().min(0).default(0),
  freeThrowsMade: z.coerce.number().int().min(0).default(0),
  freeThrowsAttempted: z.coerce.number().int().min(0).default(0),
});

export type GameInput = z.infer<typeof gameSchema>;
export type ResultInput = z.infer<typeof resultSchema>;
export type PlayerGameStatInput = z.infer<typeof playerGameStatSchema>;
