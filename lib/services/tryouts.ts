import "server-only";
import { prisma } from "@/lib/db/prisma";

export interface TryoutFilters {
  status?: string;
  position?: string;
  level?: string;
  page?: number;
  pageSize?: number;
}

export async function getTryoutApplications(filters: TryoutFilters = {}) {
  const page = filters.page ?? 1;
  const pageSize = filters.pageSize ?? 20;

  const where: Record<string, unknown> = {};
  if (filters.status) where.status = filters.status;
  if (filters.position) where.position = filters.position;
  if (filters.level) where.level = filters.level;

  const [items, total] = await Promise.all([
    prisma.tryoutApplication.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.tryoutApplication.count({ where }),
  ]);

  return { items, total, page, pageSize, totalPages: Math.max(1, Math.ceil(total / pageSize)) };
}

export async function getTryoutCounts() {
  const grouped = await prisma.tryoutApplication.groupBy({
    by: ["status"],
    _count: { _all: true },
  });

  const counts: Record<string, number> = {
    PENDING: 0,
    SHORTLISTED: 0,
    APPROVED: 0,
    REJECTED: 0,
    CONTACTED: 0,
  };
  for (const g of grouped) counts[g.status] = g._count._all;

  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  return { ...counts, total };
}

export async function getTryoutById(id: string) {
  return prisma.tryoutApplication.findUnique({ where: { id } });
}
