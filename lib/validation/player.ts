import { z } from "zod";

export const positionEnum = z.enum([
  "POINT_GUARD",
  "SHOOTING_GUARD",
  "SMALL_FORWARD",
  "POWER_FORWARD",
  "CENTER",
]);

export const academicLevelEnum = z.enum([
  "LEVEL_100",
  "LEVEL_200",
  "LEVEL_300",
  "LEVEL_400",
  "LEVEL_500",
  "GRADUATE",
  "ALUMNI",
]);

export const playerSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  dateOfBirth: z.coerce.date().optional().nullable(),
  heightCm: z.coerce.number().int().min(120).max(250).optional().nullable(),
  hometown: z.string().optional().nullable(),
  academicLevel: academicLevelEnum.optional().nullable(),
  programme: z.string().optional().nullable(),
  bio: z.string().max(4000).optional().nullable(),
  yearJoined: z.coerce.number().int().min(2000).max(2100).optional().nullable(),
  active: z.boolean().default(true),
});

export const playerSeasonSchema = z.object({
  playerId: z.string().min(1),
  seasonId: z.string().min(1),
  jerseyNumber: z.coerce.number().int().min(0).max(99),
  position: positionEnum,
  active: z.boolean().default(true),
});

export type PlayerInput = z.infer<typeof playerSchema>;
export type PlayerSeasonInput = z.infer<typeof playerSeasonSchema>;
