import { format, formatDistanceToNowStrict, isFuture, isPast } from "date-fns";

export function formatGameDate(date: Date): string {
  return format(date, "EEE d MMM yyyy");
}

export function formatGameTime(date: Date): string {
  return format(date, "h:mm a");
}

export function formatDateTimeLong(date: Date): string {
  return format(date, "EEEE d MMMM yyyy 'at' h:mm a");
}

export function formatShortDate(date: Date): string {
  return format(date, "d MMM");
}

export function relativeTime(date: Date): string {
  return formatDistanceToNowStrict(date, { addSuffix: true });
}

export { isFuture, isPast };

export function playerFullName(p: { firstName: string; lastName: string }): string {
  return `${p.firstName} ${p.lastName}`;
}

export function initials(p: { firstName: string; lastName: string }): string {
  return `${p.firstName[0] ?? ""}${p.lastName[0] ?? ""}`.toUpperCase();
}

export function positionLabel(position: string): string {
  const map: Record<string, string> = {
    POINT_GUARD: "Point Guard",
    SHOOTING_GUARD: "Shooting Guard",
    SMALL_FORWARD: "Small Forward",
    POWER_FORWARD: "Power Forward",
    CENTER: "Center",
  };
  return map[position] ?? position;
}

export function positionShort(position: string): string {
  const map: Record<string, string> = {
    POINT_GUARD: "PG",
    SHOOTING_GUARD: "SG",
    SMALL_FORWARD: "SF",
    POWER_FORWARD: "PF",
    CENTER: "C",
  };
  return map[position] ?? position;
}

export function academicLevelLabel(level: string): string {
  const map: Record<string, string> = {
    LEVEL_100: "Level 100",
    LEVEL_200: "Level 200",
    LEVEL_300: "Level 300",
    LEVEL_400: "Level 400",
    LEVEL_500: "Level 500",
    GRADUATE: "Graduate",
    ALUMNI: "Alumni",
  };
  return map[level] ?? level;
}

export function heightDisplay(cm?: number | null): string | null {
  if (!cm) return null;
  const totalInches = cm / 2.54;
  const feet = Math.floor(totalInches / 12);
  const inches = Math.round(totalInches % 12);
  return `${cm}cm (${feet}'${inches}")`;
}

export function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

export function safeDiv(numerator: number, denominator: number): number {
  return denominator > 0 ? numerator / denominator : 0;
}
