import { z } from "zod";
import { positionEnum, academicLevelEnum } from "./player";

export const tryoutStatusEnum = z.enum([
  "PENDING",
  "SHORTLISTED",
  "APPROVED",
  "REJECTED",
  "CONTACTED",
]);

export const tryoutApplicationSchema = z.object({
  fullName: z.string().min(2, "Full name is required").max(120),
  studentId: z.string().min(2, "Student ID is required").max(40),
  programme: z.string().min(2, "Programme is required").max(120),
  level: academicLevelEnum,
  phone: z
    .string()
    .min(7, "Enter a valid phone number")
    .max(20)
    .regex(/^[0-9+\s-]+$/, "Enter a valid phone number"),
  email: z.string().email("Enter a valid email address"),
  dateOfBirth: z.coerce.date(),
  position: positionEnum,
  heightCm: z.coerce.number().int().min(120).max(250).optional().nullable(),
  previousExperience: z.string().max(2000).optional().nullable(),
  yearsPlayed: z.coerce.number().int().min(0).max(30).optional().nullable(),
  preferredJerseyNumber: z.coerce.number().int().min(0).max(99).optional().nullable(),
  motivation: z.string().min(20, "Tell us a bit more (at least 20 characters)").max(2000),
  emergencyContactName: z.string().min(2, "Emergency contact name is required").max(120),
  emergencyContactPhone: z
    .string()
    .min(7, "Enter a valid emergency contact phone number")
    .max(20),
  photoUrl: z.string().url().optional().nullable().or(z.literal("")),
  photoPublicId: z.string().optional().nullable(),
});

export type TryoutApplicationInput = z.infer<typeof tryoutApplicationSchema>;
