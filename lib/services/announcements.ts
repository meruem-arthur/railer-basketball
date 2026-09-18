import "server-only";
import { prisma } from "@/lib/db/prisma";

/**
 * Active announcements are PUBLISHED (status=ACTIVE), have a publishedAt in
 * the past, and either have no expiry or an expiry still in the future.
 * Expired announcements are never returned here even if their stored
 * status hasn't been swept to EXPIRED yet.
 */
export async function getActiveAnnouncements() {
  const now = new Date();
  return prisma.announcement.findMany({
    where: {
      status: "ACTIVE",
      publishedAt: { lte: now },
      OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
    },
    orderBy: [{ priority: "desc" }, { publishedAt: "desc" }],
  });
}

/** Sweeps announcements whose expiresAt has passed into EXPIRED status. Safe to call often. */
export async function sweepExpiredAnnouncements() {
  const now = new Date();
  return prisma.announcement.updateMany({
    where: { status: "ACTIVE", expiresAt: { lte: now } },
    data: { status: "EXPIRED" },
  });
}
