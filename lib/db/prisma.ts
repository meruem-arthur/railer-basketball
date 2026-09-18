import { PrismaClient } from "@prisma/client";

// Prevents exhausting Neon's connection limit under Next.js hot-reload /
// serverless function reuse. In production on Vercel, DATABASE_URL should
// point at Neon's pooled connection string (PgBouncer, port 6543) and
// DIRECT_URL should point at the unpooled connection for migrations.

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
