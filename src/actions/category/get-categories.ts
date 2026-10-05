// src/actions/category/get-categories.ts
"use server";

// ============================================================
// Server Actions — Categories
//   - getCategories()      → PUBLIC. No auth. Navbar + footer.
//   - getCategoriesAdmin() → ADMIN only. Admin pages.
//
// IMPORTANT: never call auth() from the public read — it calls
// headers() under the hood, which breaks static prerendering.
// ============================================================

import { cacheTag, cacheLife } from "next/cache";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/clients/prisma-client";
import { CACHE_TAGS } from "@/lib/cache-keys";

// ============================================================
// TYPES
// ============================================================

export type CategorySubcategoryListItem = {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
};

export type CategoryListItem = {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  subcategories: CategorySubcategoryListItem[];
};

export type GetCategoriesResult =
  | { success: true; categories: CategoryListItem[] }
  | { success: false; error: string };

// ============================================================
// CACHED PUBLIC READ
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
      isActive: true,
      subcategories: {
        orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
        select: {
          id: true,
          name: true,
          slug: true,
          isActive: true,
        },
      },
    },
  });

  return rows;
}

// ============================================================
// PUBLIC — navbar, footer, site pages. NO auth() call.
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

// ============================================================
// ADMIN — validates role, then returns the same data.
// Do NOT use this from the navbar / footer / public pages.
// ============================================================

export async function getCategoriesAdmin(): Promise<GetCategoriesResult> {
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

    const categories = await getCachedCategories();
    return { success: true, categories };
  } catch (error) {
    console.error("[getCategoriesAdmin] Error:", error);
    return { success: false, error: "Failed to load categories." };
  }
}