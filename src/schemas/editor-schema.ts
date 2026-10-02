// src/schemas/editor-schema.ts
// ============================================================
// Editor Schema — ALENTAH
// Input type === output type so RHF + zodResolver agree.
// ============================================================

import { z } from "zod";

// ============================================================
// HELPERS
// ============================================================

const optionalUrl = (message = "Please enter a valid URL") =>
  z
    .string()
    .trim()
    .url(message)
    .optional()
    .or(z.literal(""));

const optionalText = (max: number, message?: string) =>
  z
    .string()
    .trim()
    .max(max, message ?? `Must be ${max} characters or fewer`)
    .optional()
    .or(z.literal(""));

// ============================================================
// EDITOR SCHEMA
// ============================================================

export const editorSchema = z.object({
  // ─── Identity ───
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(60, "Name must be 60 characters or fewer"),

  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Please enter a valid email address"),

  experience: optionalText(120, "Role must be 120 characters or fewer"),

  // ─── Bio ───
  bio: optionalText(300, "Bio must be 300 characters or fewer"),

  // ─── Location / credit ───
  location: optionalText(80, "Location must be 80 characters or fewer"),

  // ─── Social links ───
  website: optionalUrl(),
  twitter: optionalText(60),
  linkedin: optionalText(120),
  facebook: optionalText(120),
  instagram: optionalText(60),
  github: optionalText(60),

  // ─── Status ───
  // Simple boolean. The form always provides it via defaultValues
  // or the Controller — no preprocessing needed.
  isActive: z.boolean(),
});

// ============================================================
// TYPES
// ============================================================

export type EditorFormValues = z.infer<typeof editorSchema>;
export type EditorFormInput = z.input<typeof editorSchema>;

// ============================================================
// PARTIAL SCHEMA FOR UPDATES
// ============================================================

export const editorUpdateSchema = editorSchema.partial();

export type EditorUpdateValues = z.infer<typeof editorUpdateSchema>;