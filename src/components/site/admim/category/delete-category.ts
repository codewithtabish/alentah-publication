// src/lib/actions/category/delete-category.ts
"use server";

// ============================================================
// Server Action — Delete Category
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

export type DeleteCategoryResult =
  | { success: true; deleted: { id: string; name: string; slug: string } }
  | { success: false; error: string };

// ============================================================
// MAIN ACTION
// ============================================================

export async function deleteCategory(
  id: string,
): Promise<DeleteCategoryResult> {
  try {
    // ─── Auth ───
    const { userId, sessionClaims } = await auth();

    if (!userId) {
      return { success: false, error: "You must be signed in." };
    }

    const role = (sessionClaims?.metadata as { role?: string } | undefined)
      ?.role;

    if (role !== "ADMIN") {
      return { success: false, error: "Only admins can delete categories." };
    }

    // ─── Load existing ───
    const existing = await prisma.category.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        slug: true,
        _count: {
          select: { blogs: true, subcategories: true },
        },
      },
    });

    if (!existing) {
      return { success: false, error: "Category not found." };
    }

    // ─── Safety check: block if it has blogs ───
    if (existing._count.blogs > 0) {
      return {
        success: false,
        error: `This category has ${existing._count.blogs} article(s). Move or delete them first.`,
      };
    }

    // ─── Delete ───
    await prisma.category.delete({ where: { id } });

    // ─── Invalidate caches ───
    revalidateCategory(existing.slug);
    revalidateCategories();
    revalidateDashboardSection("categories");
    revalidateHome();

    return {
      success: true,
      deleted: {
        id: existing.id,
        name: existing.name,
        slug: existing.slug,
      },
    };
  } catch (error) {
    console.error("[deleteCategory] Error:", error);

    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code: string }).code === "P2003"
    ) {
      return {
        success: false,
        error:
          "Cannot delete this category — it has related records. Remove them first.",
      };
    }

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to delete category. Please try again.",
    };
  }
}