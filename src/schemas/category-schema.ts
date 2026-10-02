// src/schemas/category-schema.ts
// ============================================================
// Category Schema — ALENTAH
// No .default() — defaults live in useForm's defaultValues.
// ============================================================

import { z } from "zod";

// ============================================================
// HELPERS
// ============================================================

const optionalText = (max: number, message?: string) =>
  z
    .string()
    .trim()
    .max(max, message ?? `Must be ${max} characters or fewer`)
    .optional()
    .or(z.literal(""));

// ============================================================
// CATEGORY SCHEMA
// ============================================================

export const categorySchema = z.object({
  // ─── Essentials ───
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(60, "Name must be 60 characters or fewer"),

  slug: z
    .string()
    .trim()
    .min(2, "Slug must be at least 2 characters")
    .max(60, "Slug must be 60 characters or fewer")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug must be lowercase, alphanumeric, hyphen-separated",
    ),

  description: optionalText(
    200,
    "Description must be 200 characters or fewer",
  ),

  // ─── Presentation ───
  coverImage: z
    .string()
    .trim()
    .url("Please enter a valid URL")
    .optional()
    .or(z.literal("")),

  editorId: z.string().trim().optional().or(z.literal("")),

  // ─── Organization ───
  // NO .default() — RHF defaultValues handles the initial value.
  // .coerce.number() keeps input & output aligned as `number`.
  sortOrder: z.coerce.number().int().min(0).max(999),

  isActive: z.boolean(),

  // ─── Optional ───
  accentColor: optionalText(7, "Must be a hex color like #6B5744"),
  metaTitle: optionalText(60, "Meta title must be 60 characters or fewer"),
  metaDescription: optionalText(
    160,
    "Meta description must be 160 characters or fewer",
  ),
});

// ============================================================
// TYPES
// ============================================================

export type CategoryFormValues = z.infer<typeof categorySchema>;

// ============================================================
// PARTIAL FOR UPDATES
// ============================================================

export const categoryUpdateSchema = categorySchema.partial();
export type CategoryUpdateValues = z.infer<typeof categoryUpdateSchema>;