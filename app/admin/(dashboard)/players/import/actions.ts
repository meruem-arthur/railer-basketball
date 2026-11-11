"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/session";
import { playerSchema } from "@/lib/validation/player";
import { logAction } from "@/lib/services/audit";
import { slugify, slugExists } from "@/lib/services/players";
import { headerField, parseCsv, parseLevel, parsePosition } from "@/lib/utils/player-csv";

export interface ImportState {
  done: boolean;
  error?: string;
  created?: number;
  updated?: number;
  assigned?: number;
  notes?: string[];
}

const MAX_ROWS = 200;
const MAX_BYTES = 1_000_000;

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

export async function importPlayersCsvAction(_prev: ImportState, formData: FormData): Promise<ImportState> {
  const user = await requireRole(["SUPER_ADMIN", "ADMIN"]);

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) return { done: false, error: "Choose a CSV file first." };
  if (file.size > MAX_BYTES) return { done: false, error: "That file is too large. Keep it under 1 MB." };

  const rows = parseCsv(await file.text());
  if (rows.length < 2) return { done: false, error: "The file needs a header row and at least one player." };

  const fields = rows[0].map((h) => headerField(h));
  if (!fields.includes("firstName") || !fields.includes("lastName")) {
    return { done: false, error: "The header row must include first_name and last_name columns." };
  }
  const data = rows.slice(1);
  if (data.length > MAX_ROWS) return { done: false, error: `Too many rows. Import at most ${MAX_ROWS} players at a time.` };

  const seasonId = String(formData.get("seasonId") || "");
  const season = seasonId ? await prisma.teamSeason.findUnique({ where: { id: seasonId } }) : null;

  let created = 0, updated = 0, assigned = 0;
  const notes: string[] = [];

  for (let i = 0; i < data.length; i++) {
    const line = i + 2; // spreadsheet row number (header is row 1)
    const rec: Record<string, string> = {};
    fields.forEach((f, idx) => { if (f) rec[f] = (data[i][idx] ?? "").trim(); });

    const levelRaw = rec.level ?? "";
    const level = levelRaw ? parseLevel(levelRaw) : null;
    if (levelRaw && !level) notes.push(`Row ${line}: level "${levelRaw}" not recognised, left blank.`);

    const parsed = playerSchema.safeParse({
      firstName: rec.firstName,
      lastName: rec.lastName,
      programme: rec.programme || undefined,
      academicLevel: level ?? undefined,
      heightCm: rec.height || undefined, // optional
      hometown: rec.hometown || undefined,
      yearJoined: rec.yearJoined || undefined,
      active: true,
    });
    if (!parsed.success) {
      notes.push(`Row ${line} skipped: ${parsed.error.issues[0]?.message ?? "invalid data"}.`);
      continue;
    }
    const p = parsed.data;

    try {
      // Re-importing the same name fills in blanks instead of creating a duplicate.
      const existing = await prisma.player.findFirst({
        where: {
          firstName: { equals: p.firstName, mode: "insensitive" },
          lastName: { equals: p.lastName, mode: "insensitive" },
        },
      });

      let playerId: string;
      if (existing) {
        const fill: Record<string, unknown> = {};
        if (!existing.programme && p.programme) fill.programme = p.programme;
        if (!existing.academicLevel && p.academicLevel) fill.academicLevel = p.academicLevel;
        if (existing.heightCm == null && p.heightCm != null) fill.heightCm = p.heightCm;
        if (!existing.hometown && p.hometown) fill.hometown = p.hometown;
        if (existing.yearJoined == null && p.yearJoined != null) fill.yearJoined = p.yearJoined;
        if (Object.keys(fill).length) await prisma.player.update({ where: { id: existing.id }, data: fill });
        playerId = existing.id;
        updated++;
      } else {
        const slug = await uniqueSlugFor(p.firstName, p.lastName);
        const player = await prisma.player.create({ data: { ...p, slug } });
        playerId = player.id;
        created++;
      }

      // Season entry needs both a jersey number and a position.
      const position = rec.position ? parsePosition(rec.position) : null;
      if (rec.position && !position) notes.push(`Row ${line}: position "${rec.position}" not recognised.`);
      const jersey = rec.jersey ? Number(rec.jersey) : null;
      if (season && position && jersey !== null && Number.isInteger(jersey) && jersey >= 0 && jersey <= 99) {
        const has = await prisma.playerSeason.findUnique({ where: { playerId_seasonId: { playerId, seasonId: season.id } } });
        if (!has) {
          try {
            await prisma.playerSeason.create({ data: { playerId, seasonId: season.id, jerseyNumber: jersey, position } });
            assigned++;
          } catch {
            notes.push(`Row ${line}: jersey #${jersey} is already taken in ${season.label}.`);
          }
        }
      } else if (position && season && jersey === null) {
        notes.push(`Row ${line}: ${p.firstName} ${p.lastName} has a position but no jersey number yet, so not added to ${season.label}.`);
      }
    } catch {
      notes.push(`Row ${line} skipped: could not save ${p.firstName} ${p.lastName}.`);
    }
  }

  await logAction({
    userId: user.id, action: "PLAYERS_IMPORTED", entity: "Player", entityId: "csv",
    metadata: { created, updated, assigned },
  });
  revalidatePath("/admin/players");
  revalidatePath("/team");

  return { done: true, created, updated, assigned, notes };
}
