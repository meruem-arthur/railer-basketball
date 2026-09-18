import "server-only";
import { auth } from "@/auth";

export type Role = "SUPER_ADMIN" | "ADMIN" | "EDITOR";

export async function getSession() {
  return auth();
}

export async function requireUser() {
  const session = await auth();
  if (!session?.user) throw new AuthError("Not authenticated");
  return session.user;
}

/**
 * Throws if the current user's role isn't in `roles`. Used at the top of
 * every mutating server action — the frontend hiding a button is never
 * sufficient on its own.
 */
export async function requireRole(roles: Role[]) {
  const user = await requireUser();
  const role = user.role as Role;
  if (!roles.includes(role)) {
    throw new AuthError("You do not have permission to perform this action.");
  }
  return user;
}

export class AuthError extends Error {}

export const ROLE_PERMISSIONS = {
  players: ["SUPER_ADMIN", "ADMIN"] as Role[],
  seasons: ["SUPER_ADMIN", "ADMIN"] as Role[],
  games: ["SUPER_ADMIN", "ADMIN"] as Role[],
  news: ["SUPER_ADMIN", "ADMIN", "EDITOR"] as Role[],
  gallery: ["SUPER_ADMIN", "ADMIN", "EDITOR"] as Role[],
  announcements: ["SUPER_ADMIN", "ADMIN", "EDITOR"] as Role[],
  tryouts: ["SUPER_ADMIN", "ADMIN"] as Role[],
  users: ["SUPER_ADMIN"] as Role[],
  settings: ["SUPER_ADMIN", "ADMIN"] as Role[],
};
