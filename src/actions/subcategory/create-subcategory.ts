// src/lib/actions/subcategory/create-subcategory.ts
"use server";

// ============================================================
// Server Action — Create Subcategory
// ============================================================

import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/clients/prisma-client";
import {
  revalidateCategory,
  revalidateSubcategory,
  revalidateCategories,
  revalidateDashboardSection,
} from "@/lib/cache-keys";

// ============================================================
// TYPES
// ============================================================

export type CreateSubcategoryResult =
  | {
      success: true;
      subcategory: {
        id: string;
        name: string;
        slug: string;
        categorySlug: string;
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

export async function createSubcategory(
  formData: FormData,
): Promise<CreateSubcategoryResult> {
  try {
    // ─── Auth ───
    const { userId, sessionClaims } = await auth();

    if (!userId) {
      return { success: false, error: "You must be signed in." };
    }

    const role = (sessionClaims?.metadata as { role?: string } | undefined)
      ?.role;

    if (role !== "ADMIN") {
      return {
        success: false,
        error: "Only admins can create subcategories.",
      };
    }

    // ─── Extract ───
    const categoryId = getString(formData, "categoryId");
    const name = getString(formData, "name");
    const rawSlug = getString(formData, "slug");
    const description = getStringOrNull(formData, "description");
    const sortOrder = getNumber(formData, "sortOrder", 0);
    const isActive = getBoolean(formData, "isActive", true);

    // ─── Validate ───
    if (!categoryId) {
      return {
        success: false,
        error: "Parent category is required.",
        field: "categoryId",
      };
    }

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

    // ─── Verify parent exists ───
    const parent = await prisma.category.findUnique({
      where: { id: categoryId },
      select: { id: true, slug: true, name: true },
    });

    if (!parent) {
      return {
        success: false,
        error: "Parent category not found.",
        field: "categoryId",
      };
    }

    // ─── Slug uniqueness (global, since Subcategory.slug is @unique) ───
    const conflict = await prisma.subcategory.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (conflict) {
      return {
        success: false,
        error: "A subcategory with this slug already exists.",
        field: "slug",
      };
    }

    // ─── Create ───
    const subcategory = await prisma.subcategory.create({
      data: {
        name,
        slug,
        description,
        categoryId,
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
    revalidateCategory(parent.slug);
    revalidateSubcategory(subcategory.slug, parent.slug);
    revalidateCategories();
    revalidateDashboardSection("categories");

    return {
      success: true,
      subcategory: {
        id: subcategory.id,
        name: subcategory.name,
        slug: subcategory.slug,
        categorySlug: parent.slug,
      },
    };
  } catch (error) {
    console.error("[createSubcategory] Error:", error);

    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code: string }).code === "P2002"
    ) {
      return {
        success: false,
        error: "A subcategory with this slug already exists.",
        field: "slug",
      };
    }

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to create subcategory. Please try again.",
    };
  }
}