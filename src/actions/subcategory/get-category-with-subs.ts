// src/lib/actions/subcategory/get-category-with-subs.ts
"use server";

// ============================================================
// Server Action — Get Category with Subcategories
// Auth handled by proxy.ts. cacheLife("max") + revalidateTag.
// ============================================================

import { cacheTag, cacheLife } from "next/cache";
import prisma from "@/lib/clients/prisma-client";
import { CACHE_TAGS } from "@/lib/cache-keys";

// ============================================================
// TYPES
// ============================================================

export type CategoryWithSubs = {
  id: string;
  name: string;
  slug: string;
  coverImage: string | null;
  subcategoryCount: number;
  blogCount: number;
  subcategories: { id: string; name: string; slug: string }[];
};

export type GetCategoryWithSubsResult =
  | { success: true; category: CategoryWithSubs }
  | { success: false; error: string };

// ============================================================
// CACHED READ
// ============================================================

async function getCachedCategoryWithSubs(
  categoryId: string,
): Promise<CategoryWithSubs | null> {
  "use cache";
  cacheLife("max");
  cacheTag(CACHE_TAGS.categories);
  cacheTag(CACHE_TAGS.category(categoryId));

  const category = await prisma.category.findUnique({
    where: { id: categoryId },
    select: {
      id: true,
      name: true,
      slug: true,
      coverImage: true,
      _count: {
        select: { subcategories: true, blogs: true },
      },
      subcategories: {
        orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
        select: { id: true, name: true, slug: true },
      },
    },
  });

  if (!category) return null;

  return {
    id: category.id,
    name: category.name,
    slug: category.slug,
    coverImage: category.coverImage,
    subcategoryCount: category._count.subcategories,
    blogCount: category._count.blogs,
    subcategories: category.subcategories,
  };
}

// ============================================================
// MAIN ACTION
// ============================================================

export async function getCategoryWithSubs(
  categoryId: string,
): Promise<GetCategoryWithSubsResult> {
  try {
    const category = await getCachedCategoryWithSubs(categoryId);

    if (!category) {
      return { success: false, error: "Category not found." };
    }

    return { success: true, category };
  } catch (error) {
    console.error("[getCategoryWithSubs] Error:", error);
    return { success: false, error: "Failed to load category." };
  }
}