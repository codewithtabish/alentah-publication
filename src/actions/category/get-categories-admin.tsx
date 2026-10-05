// src/actions/category/get-categories-admin.ts
"use server";

// ============================================================
// Admin categories
//
// Rule: server actions inherit the scope of their caller.
//   - Called from a request-scoped page → auth() is safe.
//   - Called from a prerendered page → auth() throws.
//
// This action must be called ONLY from pages that are already
// request-scoped (e.g. an /admin layout with `await connection()`).
// Do NOT call connection() inside the action itself — it throws.
// ============================================================

import { auth } from "@clerk/nextjs/server";
import { cacheTag, cacheLife } from "next/cache";
import prisma from "@/lib/clients/prisma-client";
import { CACHE_TAGS } from "@/lib/cache-keys";

// ============================================================
// TYPES
// ============================================================

export type SubcategoryItem = {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  articleCount: number;
  categoryId: string;
};

export type AdminCategoryEditor = {
  id: string;
  name: string;
  imageUrl: string | null;
};

export type AdminCategoryItem = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  coverImage: string | null;
  isActive: boolean;
  editor: AdminCategoryEditor | null;
  subcategoryCount: number;
  blogCount: number;
  subcategories: SubcategoryItem[];
};

export type GetAdminCategoriesResult =
  | { success: true; categories: AdminCategoryItem[] }
  | { success: false; error: string };

// ============================================================
// PURE CACHED READ — no auth, no headers, safe to prerender
// ============================================================

async function readCategories(): Promise<AdminCategoryItem[]> {
  "use cache";
  cacheLife("max");
  cacheTag(CACHE_TAGS.categories);
  cacheTag(CACHE_TAGS.editors);

  const rows = await prisma.category.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      coverImage: true,
      isActive: true,
      editor: {
        select: { id: true, name: true, imageUrl: true },
      },
      subcategories: {
        orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
        select: {
          id: true,
          name: true,
          slug: true,
          isActive: true,
          categoryId: true,
          _count: { select: { blogs: true } },
        },
      },
      _count: {
        select: { subcategories: true, blogs: true },
      },
    },
  });

  return rows.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    description: c.description,
    coverImage: c.coverImage,
    isActive: c.isActive,
    editor: c.editor ?? null,
    subcategoryCount: c._count.subcategories,
    blogCount: c._count.blogs,
    subcategories: c.subcategories.map((sub) => ({
      id: sub.id,
      name: sub.name,
      slug: sub.slug,
      isActive: sub.isActive,
      categoryId: sub.categoryId,
      articleCount: sub._count.blogs,
    })),
  }));
}

// ============================================================
// MAIN ACTION
// ============================================================

export async function getAdminCategories(): Promise<GetAdminCategoriesResult> {
  try {
    const { userId, sessionClaims } = await auth();

    if (!userId) {
      return { success: false, error: "Not authenticated." };
    }

    const role = (
      sessionClaims?.metadata as { role?: string } | undefined
    )?.role;

    if (role !== "ADMIN") {
      return { success: false, error: "Not authorized." };
    }

    const categories = await readCategories();
    return { success: true, categories };
  } catch (error) {
    console.error("[getAdminCategories] Error:", error);
    return { success: false, error: "Failed to load categories." };
  }
}