import { z } from "zod";

const optionalText = (max: number) =>
  z.string().trim().max(max).optional().transform((v) => (v ? v : null));

// Only our own Cloudinary uploads (or nothing) are accepted as images.
const cloudinaryUrl = z.string().url().refine((u) => u.startsWith("https://res.cloudinary.com/"), "Image must be uploaded through the uploader.");

// Buttons may point to a page on this site ("/team") or to a full web address.
const linkHref = z
  .string()
  .trim()
  .max(300)
  .optional()
  .transform((v) => (v ? v : null))
  .refine((v) => v === null || v.startsWith("/") || /^https?:\/\//.test(v), "Button link must start with / or https://");

export const heroSlideSchema = z.object({
  heading: optionalText(120),
  subheading: optionalText(300),
  imageUrl: cloudinaryUrl,
  imagePublicId: optionalText(300),
  ctaLabel: optionalText(40),
  ctaHref: linkHref,
  displayOrder: z.coerce.number().int().min(0).max(999).default(0),
  active: z.coerce.boolean().default(true),
});

export const pageHeroSchema = z.object({
  title: optionalText(100),
  subtitle: optionalText(250),
  imageUrl: cloudinaryUrl.optional().or(z.literal("")).transform((v) => (v ? v : null)),
  imagePublicId: optionalText(300),
});
