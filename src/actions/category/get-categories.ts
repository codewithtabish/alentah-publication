// src/lib/actions/category/get-categories.ts
"use server";

// ============================================================
// Server Action — Get All Categories (with subcategories)
// Uses cacheLife("max") + revalidateTag for instant invalidation.
// ============================================================

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
};

export type CategoryListItem = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  coverImage: string | null;
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
  editor: { id: string; name: string; imageUrl: string | null } | null;
  subcategoryCount: number;
  blogCount: number;
  subcategories: SubcategoryItem[];
};

export type GetCategoriesResult =
  | { success: true; categories: CategoryListItem[] }
  | { success: false; error: string };

// ============================================================
// CACHED READ
// ============================================================

async function getCachedCategories(): Promise<CategoryListItem[]> {
  "use cache";
  cacheLife("max");
  cacheTag(CACHE_TAGS.categories);

  const rows = await prisma.category.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      coverImage: true,
      isActive: true,
      sortOrder: true,
      createdAt: true,
      editor: {
        select: { id: true, name: true, imageUrl: true },
      },
      _count: {
        select: { subcategories: true, blogs: true },
      },
      subcategories: {
        orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
        select: {
          id: true,
          name: true,
          slug: true,
          isActive: true,
          _count: { select: { blogs: true } },
        },
      },
    },
  });

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    coverImage: row.coverImage,
    isActive: row.isActive,
    sortOrder: row.sortOrder,
    createdAt: row.createdAt,
    editor: row.editor,
    subcategoryCount: row._count.subcategories,
    blogCount: row._count.blogs,
    subcategories: row.subcategories.map((sub) => ({
      id: sub.id,
      name: sub.name,
      slug: sub.slug,
      isActive: sub.isActive,
      articleCount: sub._count.blogs,
    })),
  }));
}

// ============================================================
// MAIN ACTION
// ============================================================

export async function getCategories(): Promise<GetCategoriesResult> {
  try {
    const categories = await getCachedCategories();
    return { success: true, categories };
  } catch (error) {
    console.error("[getCategories] Error:", error);
    return { success: false, error: "Failed to load categories." };
  }
}