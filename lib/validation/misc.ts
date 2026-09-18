import { z } from "zod";

export const announcementPriorityEnum = z.enum(["NORMAL", "IMPORTANT", "URGENT"]);
export const announcementStatusEnum = z.enum(["DRAFT", "ACTIVE", "EXPIRED", "ARCHIVED"]);

export const announcementSchema = z.object({
  title: z.string().min(3).max(200),
  content: z.string().min(5).max(4000),
  priority: announcementPriorityEnum.default("NORMAL"),
  status: announcementStatusEnum.default("DRAFT"),
  publishedAt: z.coerce.date().optional().nullable(),
  expiresAt: z.coerce.date().optional().nullable(),
});

export const galleryAlbumCategoryEnum = z.enum([
  "GAME_DAY",
  "TRAINING",
  "TEAM",
  "TOURNAMENTS",
  "EVENTS",
  "BEHIND_THE_SCENES",
]);

export const galleryAlbumSchema = z.object({
  title: z.string().min(2).max(150),
  slug: z.string().min(2).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  category: galleryAlbumCategoryEnum,
  description: z.string().max(1000).optional().nullable(),
  gameId: z.string().optional().nullable(),
});

export const galleryImageSchema = z.object({
  albumId: z.string().min(1),
  cloudinaryPublicId: z.string().min(1),
  secureUrl: z.string().url(),
  width: z.number().int().optional().nullable(),
  height: z.number().int().optional().nullable(),
  altText: z.string().min(1, "Alt text is required for accessibility").max(300),
  caption: z.string().max(300).optional().nullable(),
});

export const siteSettingSchema = z.object({
  teamName: z.string().min(2).max(120),
  slogan: z.string().min(2).max(200),
  aboutText: z.string().max(5000).optional().nullable(),
  contactEmail: z.string().email().optional().nullable().or(z.literal("")),
  contactPhone: z.string().max(30).optional().nullable(),
  venue: z.string().max(200).optional().nullable(),
  logoUrl: z.string().url().optional().nullable().or(z.literal("")),
  currentSeasonId: z.string().optional().nullable(),
});

export const socialLinkSchema = z.object({
  platform: z.enum(["instagram", "facebook", "tiktok", "x", "youtube"]),
  url: z.string().url(),
  active: z.boolean().default(true),
});

export const seasonSchema = z
  .object({
    label: z
      .string()
      .regex(/^\d{4}\/\d{2}$/, "Use the format 2026/27"),
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
    isCurrent: z.boolean().default(false),
  })
  .refine((data) => data.endDate > data.startDate, {
    message: "End date must be after start date",
    path: ["endDate"],
  });

export const contactFormSchema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email(),
  subject: z.string().min(2).max(200),
  message: z.string().min(10).max(3000),
  // Honeypot field — must stay empty. Bots that fill every field trip
  // this; kept unconstrained here so a filled value doesn't itself
  // surface as a validation error (the server action checks it silently).
  website: z.string().optional(),
});

export type AnnouncementInput = z.infer<typeof announcementSchema>;
export type GalleryAlbumInput = z.infer<typeof galleryAlbumSchema>;
export type GalleryImageInput = z.infer<typeof galleryImageSchema>;
export type SiteSettingInput = z.infer<typeof siteSettingSchema>;
export type SocialLinkInput = z.infer<typeof socialLinkSchema>;
export type SeasonInput = z.infer<typeof seasonSchema>;
export type ContactFormInput = z.infer<typeof contactFormSchema>;
