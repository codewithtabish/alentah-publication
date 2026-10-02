// src/schemas/subcategory-schema.ts
// ============================================================
// Subcategory Schema — ALENTAH
// Input type === output type for RHF compatibility.
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
// SUBCATEGORY SCHEMA
// ============================================================

export const subcategorySchema = z.object({
  // ─── Parent (locked from the page) ───
  categoryId: z.string().trim().min(1, "Parent category is required"),

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

  // ─── Organization ───
  sortOrder: z.coerce.number().int().min(0).max(999),
  isActive: z.boolean(),

  // ─── Optional SEO ───
  metaTitle: optionalText(60, "Meta title must be 60 characters or fewer"),
  metaDescription: optionalText(
    160,
    "Meta description must be 160 characters or fewer",
  ),
});

// ============================================================
// TYPES
// ============================================================

export type SubcategoryFormValues = z.infer<typeof subcategorySchema>;

// ============================================================
// PARTIAL FOR UPDATES
// ============================================================

export const subcategoryUpdateSchema = subcategorySchema.partial();
export type SubcategoryUpdateValues = z.infer<typeof subcategoryUpdateSchema>;