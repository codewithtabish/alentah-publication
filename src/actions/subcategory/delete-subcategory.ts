// src/actions/subcategory/delete-subcategory.ts
"use server";

// ============================================================
// Server Action — Delete Subcategory (FULL CASCADE)
// Deletes: subcategory + all its articles + all their
// SEO, tags, comments, bookmarks, likes.
// ============================================================

import { auth } from "@clerk/nextjs/server";
import { revalidatePath, revalidateTag } from "next/cache";
import prisma from "@/lib/clients/prisma-client";
import { CACHE_TAGS } from "@/lib/cache-keys";

// ============================================================
// TYPES
// ============================================================

export type DeleteSubcategoryResult =
  | {
      success: true;
      deleted: {
        id: string;
        name: string;
        slug: string;
        articlesDeleted: number;
      };
    }
  | { success: false; error: string };

// ============================================================
// AUTH HELPER
// ============================================================

async function requireAdmin(): Promise<
  { ok: true; userId: string } | { ok: false; error: string }
> {
  const { auth: clerkAuth } = await import("@clerk/nextjs/server");
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

        if (role === "ADMIN") {
          return { ok: true, userId };
        }

        return {
          ok: false,
          error: "Only admins can delete subcategories.",
        };
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
    // ─── Auth ───
    const authCheck = await requireAdmin();

    if (!authCheck.ok) {
      return { success: false, error: authCheck.error };
    }

    // ─── Load subcategory + its articles + parent category ───
    const existing = await prisma.subcategory.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        slug: true,
        category: {
          select: { id: true, name: true, slug: true },
        },
        blogs: {
          select: { id: true, slug: true },
        },
      },
    });

    if (!existing) {
      return { success: false, error: "Subcategory not found." };
    }

    const articleIds = existing.blogs.map((b) => b.id);
    const articleSlugs = existing.blogs.map((b) => b.slug);
    const categorySlug = existing.category.slug;

    console.log(
      `[deleteSubcategory] Cascade deleting "${existing.name}": ` +
        `${articleIds.length} articles under "${existing.category.name}"`,
    );

    // ─── Delete everything in a transaction ───
    // Order matters: children first, then the subcategory.
    await prisma.$transaction(async (tx) => {
      if (articleIds.length > 0) {
        // 1. Engagement + relations on all articles
        await tx.bookmark.deleteMany({
          where: { blogId: { in: articleIds } },
        });

        await tx.blogLike.deleteMany({
          where: { blogId: { in: articleIds } },
        });

        await tx.comment.deleteMany({
          where: { blogId: { in: articleIds } },
        });

        await tx.blogTag.deleteMany({
          where: { blogId: { in: articleIds } },
        });

        await tx.blogSEO.deleteMany({
          where: { blogId: { in: articleIds } },
        });

        // 2. Delete the articles themselves
        await tx.blog.deleteMany({
          where: { id: { in: articleIds } },
        });
      }

      // 3. Delete the subcategory
      await tx.subcategory.delete({
        where: { id },
      });
    });

    // ─── Invalidate EVERYTHING affected ───
    // Paths
    revalidatePath("/admin/categories");
    revalidatePath("/admin/articles");
    revalidatePath("/admin");
    revalidatePath("/");
    revalidatePath(`/category/${categorySlug}`);
    revalidatePath(`/category/${categorySlug}/${existing.slug}`);

    for (const slug of articleSlugs) {
      revalidatePath(`/article/${slug}`);
    }

    // Cache tags
    revalidateTag(CACHE_TAGS.categories, "max");
    revalidateTag(CACHE_TAGS.category(categorySlug), "max");
    revalidateTag(CACHE_TAGS.categoryPageBlogs(categorySlug), "max");
    revalidateTag(CACHE_TAGS.subcategoryPageBlogs(existing.slug), "max");
    revalidateTag(CACHE_TAGS.dashboardCategories, "max");

    revalidateTag(CACHE_TAGS.blogs, "max");
    revalidateTag(CACHE_TAGS.dashboardBlogs, "max");
    revalidateTag(CACHE_TAGS.home, "max");
    revalidateTag(CACHE_TAGS.homeScreen, "max");

    for (const slug of articleSlugs) {
      revalidateTag(CACHE_TAGS.blog(slug), "max");
    }

    return {
      success: true,
      deleted: {
        id: existing.id,
        name: existing.name,
        slug: existing.slug,
        articlesDeleted: articleIds.length,
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
          "Cannot delete this subcategory — it has related records. Please try again.",
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