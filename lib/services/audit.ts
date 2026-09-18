import "server-only";
import { prisma } from "@/lib/db/prisma";

interface LogActionArgs {
  userId: string | null | undefined;
  action: string;
  entity: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
}

/** Fire-and-forget audit log write. Never throws — logging failures must not break the admin action itself. */
export async function logAction({ userId, action, entity, entityId, metadata }: LogActionArgs) {
  try {
    await prisma.auditLog.create({
      data: {
        userId: userId ?? null,
        action,
        entity,
        entityId,
        metadata: metadata ? JSON.stringify(metadata) : undefined,
      },
    });
  } catch {
    // Audit logging is best-effort; the calling mutation has already succeeded.
  }
}

export async function getRecentAuditLogs(take = 20) {
  return prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take,
    include: { user: { select: { name: true, email: true } } },
  });
}
