import { prisma } from "@/lib/db/prisma";

/** Pages that can have an admin-managed banner. `key` is what the page asks for; `label` is shown in the admin. */
export const PAGE_HERO_PAGES = [
  { key: "team", label: "Team" },
  { key: "schedule", label: "Schedule" },
  { key: "results", label: "Results" },
  { key: "stats", label: "Stats" },
  { key: "news", label: "News" },
  { key: "gallery", label: "Gallery" },
  { key: "tryouts", label: "Tryouts" },
  { key: "announcements", label: "Announcements" },
  { key: "about", label: "About" },
  { key: "contact", label: "Contact" },
] as const;
export type PageHeroKey = (typeof PAGE_HERO_PAGES)[number]["key"];

// The public readers never throw: if the tables don't exist yet (code deployed before the migration) the site
// simply falls back to the classic look instead of returning a 500.
export async function getHeroSlides() {
  try {
    return await prisma.heroSlide.findMany({ where: { active: true }, orderBy: [{ displayOrder: "asc" }, { createdAt: "asc" }] });
  } catch {
    return [];
  }
}

export async function getPageHero(pageKey: string) {
  try {
    return await prisma.pageHero.findUnique({ where: { pageKey } });
  } catch {
    return null;
  }
}
