// src/lib/actions/subcategory/delete-subcategory.ts
"use server";

// ============================================================
// Server Action — Delete Subcategory
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

export type DeleteSubcategoryResult =
  | {
      success: true;
      deleted: { id: string; name: string; slug: string };
    }
  | { success: false; error: string };

// ============================================================
// AUTH HELPER
// ============================================================

async function requireAdmin(): Promise<
  { ok: true; userId: string } | { ok: false; error: string }
> {
  const { auth: clerkAuth, currentUser } = await import(
    "@clerk/nextjs/server"
  );
  const delays = [0, 200, 400, 700];

  for (const delay of delays) {
    if (delay > 0) {
      await new Promise((r) => setTimeout(r, delay));
    }

    try {
      const { userId, sessionClaims } = await clerkAuth();

      if (userId) {
        const role = (sessionClaims?.metadata as { role?: string } | undefined)
          ?.role;

        if (role === "ADMIN") return { ok: true, userId };

        try {
          const user = await currentUser();
          const metaRole = (
            user?.publicMetadata as { role?: string } | undefined
          )?.role;

          if (metaRole === "ADMIN") return { ok: true, userId };

          return { ok: false, error: "Only admins can delete subcategories." };
        } catch {
          continue;
        }
      }
    } catch {
      continue;
    }
  }

  return { ok: false, error: "You must be signed in." };
}

// ============================================================
// MAIN ACTION
// ============================================================

export async function deleteSubcategory(
  id: string,
): Promise<DeleteSubcategoryResult> {
  try {
    const authCheck = await requireAdmin();

    if (!authCheck.ok) {
      return { success: false, error: authCheck.error };
    }

    // ─── Load existing ───
    const existing = await prisma.subcategory.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        slug: true,
        category: {
          select: { id: true, slug: true, name: true },
        },
        _count: {
          select: { blogs: true },
        },
      },
    });

    if (!existing) {
      return { success: false, error: "Subcategory not found." };
    }

    // ─── Safety: block if it has articles ───
    if (existing._count.blogs > 0) {
      return {
        success: false,
        error: `This subcategory has ${existing._count.blogs} article(s). Move or delete them first.`,
      };
    }

    // ─── Delete ───
    await prisma.subcategory.delete({ where: { id } });

    // ─── Invalidate caches ───
    revalidateCategory(existing.category.slug);
    revalidateSubcategory(existing.slug, existing.category.slug);
    revalidateCategories();
    revalidateDashboardSection("categories");

    return {
      success: true,
      deleted: {
        id: existing.id,
        name: existing.name,
        slug: existing.slug,
      },
    };
  } catch (error) {
    console.error("[deleteSubcategory] Error:", error);

    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code: string }).code === "P2003"
    ) {
      return {
        success: false,
        error:
          "Cannot delete this subcategory — it has related records. Remove them first.",
      };
    }

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to delete subcategory. Please try again.",
    };
  }
}