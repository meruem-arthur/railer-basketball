import { z } from "zod";

export const newsCategoryEnum = z.enum([
  "TEAM_NEWS",
  "MATCH_REPORT",
  "TRAINING",
  "TOURNAMENT",
  "PLAYER_NEWS",
  "ANNOUNCEMENT",
]);

export const newsStatusEnum = z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]);

export const newsArticleSchema = z.object({
  title: z.string().min(4, "Title must be at least 4 characters").max(200),
  slug: z
    .string()
    .min(4)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase, hyphenated"),
  excerpt: z.string().min(10).max(400),
  content: z.string().min(20),
  featuredImageUrl: z.string().url().optional().nullable().or(z.literal("")),
  featuredImagePublicId: z.string().optional().nullable(),
  categoryName: newsCategoryEnum,
  status: newsStatusEnum.default("DRAFT"),
  publishedAt: z.coerce.date().optional().nullable(),
});

export type NewsArticleInput = z.infer<typeof newsArticleSchema>;

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}
