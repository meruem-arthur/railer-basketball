/** Pure helpers for the players CSV import (no database access). */

/** Parses CSV text (quotes, commas and newlines inside quotes are handled) into rows of cells. */
export function parseCsv(text: string): string[][] {
  const src = text.replace(/^\uFEFF/, "");
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let inQuotes = false;

  for (let i = 0; i < src.length; i++) {
    const ch = src[i];
    if (inQuotes) {
      if (ch === '"') {
        if (src[i + 1] === '"') { cell += '"'; i++; } else inQuotes = false;
      } else cell += ch;
    } else if (ch === '"') inQuotes = true;
    else if (ch === ",") { row.push(cell); cell = ""; }
    else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && src[i + 1] === "\n") i++;
      row.push(cell); cell = "";
      if (row.some((c) => c.trim() !== "")) rows.push(row);
      row = [];
    } else cell += ch;
  }
  row.push(cell);
  if (row.some((c) => c.trim() !== "")) rows.push(row);
  return rows;
}

const HEADER_ALIASES: Record<string, string> = {
  firstname: "firstName", first: "firstName",
  lastname: "lastName", last: "lastName", surname: "lastName",
  programme: "programme", program: "programme",
  level: "level", academiclevel: "level",
  position: "position",
  jersey: "jersey", jerseynumber: "jersey", number: "jersey",
  heightcm: "height", height: "height",
  hometown: "hometown",
  yearjoined: "yearJoined",
};

/** Maps a header cell to one of our field names (or null for columns we don't use, e.g. index number). */
export function headerField(header: string): string | null {
  return HEADER_ALIASES[header.toLowerCase().replace(/[^a-z]/g, "")] ?? null;
}

export type Position = "POINT_GUARD" | "SHOOTING_GUARD" | "SMALL_FORWARD" | "POWER_FORWARD" | "CENTER";

const POSITION_WORDS: Record<string, Position> = {
  pg: "POINT_GUARD", pointguard: "POINT_GUARD",
  sg: "SHOOTING_GUARD", shootingguard: "SHOOTING_GUARD",
  sf: "SMALL_FORWARD", smallforward: "SMALL_FORWARD",
  pf: "POWER_FORWARD", powerforward: "POWER_FORWARD",
  c: "CENTER", center: "CENTER", centre: "CENTER",
};

/** "Point Guard", "PG", "centre" → enum. For "SF/PF" the first listed position is used. Unknown → null. */
export function parsePosition(value: string): Position | null {
  const first = value.split(/[\/,&]/)[0].toLowerCase().replace(/[^a-z]/g, "");
  return POSITION_WORDS[first] ?? null;
}

export type Level = "LEVEL_100" | "LEVEL_200" | "LEVEL_300" | "LEVEL_400" | "LEVEL_500" | "GRADUATE" | "ALUMNI";

/** "400", "L400", "Level 400", "graduate", "alumni" → enum. Unknown → null. */
export function parseLevel(value: string): Level | null {
  const v = value.toLowerCase().trim();
  if (v.startsWith("grad")) return "GRADUATE";
  if (v.startsWith("alum")) return "ALUMNI";
  const n = v.match(/\d{3}/)?.[0];
  if (n && ["100", "200", "300", "400", "500"].includes(n)) return `LEVEL_${n}` as Level;
  return null;
}
