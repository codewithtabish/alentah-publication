// src/lib/actions/category/create-category.ts
"use server";

// ============================================================
// Server Action — Create Category
// ============================================================

import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/clients/prisma-client";
import {
  revalidateCategory,
  revalidateCategories,
  revalidateDashboardSection,
  revalidateHome,
} from "@/lib/cache-keys";

// ============================================================
// TYPES
// ============================================================

export type CreateCategoryResult =
  | {
      success: true;
      category: {
        id: string;
        name: string;
        slug: string;
      };
    }
  | { success: false; error: string; field?: string };

// ============================================================
// HELPERS
// ============================================================

function getString(formData: FormData, key: string): string {
  const v = formData.get(key);
  return typeof v === "string" ? v.trim() : "";
}

function getStringOrNull(formData: FormData, key: string): string | null {
  const v = getString(formData, key);
  return v.length > 0 ? v : null;
}

function getNumber(formData: FormData, key: string, fallback = 0): number {
  const v = formData.get(key);
  if (v === null) return fallback;
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function getBoolean(formData: FormData, key: string, fallback = true): boolean {
  const v = formData.get(key);
  if (v === null) return fallback;
  const s = String(v).trim().toLowerCase();
  if (s === "true" || s === "on" || s === "1" || s === "yes") return true;
  if (s === "false" || s === "off" || s === "0" || s === "no") return false;
  return fallback;
}

function toSlug(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// ============================================================
// MAIN ACTION
// ============================================================

export async function createCategory(
  formData: FormData,
): Promise<CreateCategoryResult> {
  try {
    // ─── Auth ───
    const { userId, sessionClaims } = await auth();

    if (!userId) {
      return { success: false, error: "You must be signed in." };
    }

    const role = (sessionClaims?.metadata as { role?: string } | undefined)
      ?.role;

    if (role !== "ADMIN") {
      return { success: false, error: "Only admins can create categories." };
    }

    // ─── Extract ───
    const name = getString(formData, "name");
    const rawSlug = getString(formData, "slug");
    const description = getStringOrNull(formData, "description");
    const coverImage = getStringOrNull(formData, "coverImage");
    const editorId = getStringOrNull(formData, "editorId");
    const sortOrder = getNumber(formData, "sortOrder", 0);
    const isActive = getBoolean(formData, "isActive", true);

    // ─── Validate ───
    if (!name || name.length < 2) {
      return {
        success: false,
        error: "Name must be at least 2 characters.",
        field: "name",
      };
    }

    if (name.length > 60) {
      return {
        success: false,
        error: "Name must be 60 characters or fewer.",
        field: "name",
      };
    }

    const slug = rawSlug ? toSlug(rawSlug) : toSlug(name);

    if (!slug || slug.length < 2) {
      return {
        success: false,
        error: "Slug must be at least 2 characters.",
        field: "slug",
      };
    }

    // ─── Slug uniqueness ───
    const conflict = await prisma.category.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (conflict) {
      return {
        success: false,
        error: "A category with this slug already exists.",
        field: "slug",
      };
    }

    // ─── Validate editor if provided ───
    if (editorId) {
      const editor = await prisma.editor.findUnique({
        where: { id: editorId },
        select: { id: true, isActive: true },
      });

      if (!editor) {
        return {
          success: false,
          error: "Selected editor not found.",
          field: "editorId",
        };
      }
    }

    // ─── Create ───
    const category = await prisma.category.create({
      data: {
        name,
        slug,
        description,
        // Note: `coverImage` field must exist on your Category model.
        // If not, remove this line.
        ...(coverImage ? { coverImage } : {}),
        editorId: editorId || null,
        sortOrder,
        isActive,
      },
      select: {
        id: true,
        name: true,
        slug: true,
      },
    });

    // ─── Invalidate caches ───
    revalidateCategory(category.slug);
    revalidateCategories();
    revalidateDashboardSection("categories");
    revalidateHome();

    return {
      success: true,
      category: {
        id: category.id,
        name: category.name,
        slug: category.slug,
      },
    };
  } catch (error) {
    console.error("[createCategory] Error:", error);

    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code: string }).code === "P2002"
    ) {
      return {
        success: false,
        error: "A category with this slug already exists.",
        field: "slug",
      };
    }

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to create category. Please try again.",
    };
  }
}