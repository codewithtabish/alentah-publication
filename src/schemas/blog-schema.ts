// src/schemas/blog-schema.ts
import { z } from "zod";

// ============================================================
// TABLE OF CONTENTS
// ============================================================

export type TableOfContentsItem = {
  id: string;
  title: string;
  slug: string;
  level?: number;
};

// ============================================================
// ENUMS
// ============================================================

export const BLOG_TYPES = [
  "ARTICLE",
  "NEWS",
  "OPINION",
  "ANALYSIS",
  "GUIDE",
  "REVIEW",
  "INTERVIEW",
] as const;

export const BLOG_STATUSES = [
  "DRAFT",
  "IN_REVIEW",
  "SCHEDULED",
  "PUBLISHED",
  "ARCHIVED",
] as const;

export type BlogType = (typeof BLOG_TYPES)[number];
export type BlogStatus = (typeof BLOG_STATUSES)[number];

// ============================================================
// CREATE BLOG INPUT (used in server action)
// ============================================================

export type CreateBlogInput = {
  title: string;
  slug: string;
  content: { blocks: Array<Record<string, unknown>> }; // Editor.js data
  bannerImage: string;
  bannerImageAlt?: string;
  ogImage: string;
  categoryId: string;
  subcategoryId: string;
  type?: BlogType;
  status?: BlogStatus;
  featured?: boolean;
  tableOfContents?: TableOfContentsItem[];
  scheduledAt?: string | null;
};

// ============================================================
// SERVER ACTION RESULT
// ============================================================

export type CreateBlogSuccess = {
  success: true;
  data: {
    blog: {
      id: string;
      title: string;
      slug: string;
      shortDescription: string | null;
      featured: boolean;
      status: string;
      publishedAt: Date | null;
      createdAt: Date;
    };
    seo: {
      metaTitle: string | undefined;
      metaDescription: string | undefined;
      canonicalUrl: string | undefined;
      ogDescription: string | undefined;
      twitterDescription: string | undefined;
    };
    aiGenerated: {
      shortDescription: string;
      keywords: string[];
      summary: string;
    };
  };
};

export type CreateBlogError = {
  success: false;
  error: string;
  field?: string;
};

export type CreateBlogResult = CreateBlogSuccess | CreateBlogError;

// ============================================================
// ZOD SCHEMA (for form validation)
// ⚠️ NOTE: RHF + zodResolver don't work well with `.default()`,
// so this schema doesn't use them. Defaults live in useForm.
// ============================================================

export const createBlogSchema = z.object({
  title: z
    .string()
    .trim()
    .min(5, "Title must be at least 5 characters")
    .max(120, "Title is too long"),

  slug: z
    .string()
    .trim()
    .min(3, "Slug is required")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug can only contain lowercase letters, numbers and hyphens",
    ),

  bannerImage: z.string().url("Banner image is required"),
  ogImage: z.string().url("OG image is required"),

  categoryId: z.string().min(1, "Category is required"),
  subcategoryId: z.string().min(1, "Subcategory is required"),

  type: z.enum(BLOG_TYPES),
  status: z.enum(BLOG_STATUSES),
  featured: z.boolean(),

  tableOfContents: z
    .array(
      z.object({
        id: z.string(),
        title: z.string().min(1),
        slug: z.string().min(1),
        level: z.number().optional(),
      }),
    )
    .optional(),
});

export type CreateBlogFormValues = z.infer<typeof createBlogSchema>;

// ============================================================
// DEFAULT VALUES (use in useForm)
// ============================================================

export const createBlogDefaultValues: CreateBlogFormValues = {
  title: "",
  slug: "",
  bannerImage: "",
  ogImage: "",
  categoryId: "",
  subcategoryId: "",
  type: "ARTICLE",
  status: "DRAFT",
  featured: false,
  tableOfContents: [],
};