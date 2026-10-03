// src/actions/category/delete-category.ts
"use server";

// ============================================================
// Server Action — Delete Category (FULL CASCADE)
// Deletes: category + its subcategories + all articles under
// both, + all their SEO, tags, comments, bookmarks, likes.
// ============================================================

import { auth } from "@clerk/nextjs/server";
import { revalidatePath, revalidateTag } from "next/cache";
import prisma from "@/lib/clients/prisma-client";
import { CACHE_TAGS } from "@/lib/cache-keys";

// ============================================================
// TYPES
// ============================================================

export type DeleteCategoryResult =
  | {
      success: true;
      deleted: {
        id: string;
        name: string;
        slug: string;
        subcategoriesDeleted: number;
        articlesDeleted: number;
      };
    }
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

    // ─── Load everything we need to invalidate later ───
    const existing = await prisma.category.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        slug: true,
        subcategories: {
          select: { id: true, slug: true },
        },
        blogs: {
          select: { id: true, slug: true },
        },
      },
    });

    if (!existing) {
      return { success: false, error: "Category not found." };
    }

    // ─── Collect all article slugs (both direct + under subcategories) ───
    const subcategoryIds = existing.subcategories.map((s) => s.id);

    const allArticles = await prisma.blog.findMany({
      where: {
        OR: [
          { categoryId: id },
          ...(subcategoryIds.length > 0
            ? [{ subcategoryId: { in: subcategoryIds } }]
            : []),
        ],
      },
      select: { slug: true },
    });

    const articleSlugs = allArticles.map((a) => a.slug);
    const subcategorySlugs = existing.subcategories.map((s) => s.slug);

    console.log(
      `[deleteCategory] Cascade deleting "${existing.name}": ` +
        `${subcategoryIds.length} subcategories, ` +
        `${articleSlugs.length} articles`,
    );

    // ─── Delete everything in a transaction ───
    // Order matters: children first.
    await prisma.$transaction(async (tx) => {
      // 1. Delete engagement + relations on all articles
      if (articleSlugs.length > 0) {
        const blogIds = await tx.blog.findMany({
          where: { slug: { in: articleSlugs } },
          select: { id: true },
        });
        const ids = blogIds.map((b) => b.id);

        if (ids.length > 0) {
          await tx.bookmark.deleteMany({ where: { blogId: { in: ids } } });
          await tx.blogLike.deleteMany({ where: { blogId: { in: ids } } });
          await tx.comment.deleteMany({ where: { blogId: { in: ids } } });
          await tx.blogTag.deleteMany({ where: { blogId: { in: ids } } });
          await tx.blogSEO.deleteMany({ where: { blogId: { in: ids } } });
        }

        // 2. Delete the articles
        await tx.blog.deleteMany({ where: { id: { in: ids } } });
      }

      // 3. Delete subcategories
      await tx.subcategory.deleteMany({ where: { categoryId: id } });

      // 4. Delete the category
      await tx.category.delete({ where: { id } });
    });

    // ─── Invalidate EVERYTHING affected ───
    // Paths
    revalidatePath("/admin/categories");
    revalidatePath("/admin/articles");
    revalidatePath("/admin");
    revalidatePath("/");

    for (const slug of subcategorySlugs) {
      revalidatePath(`/category/${existing.slug}/${slug}`);
    }

    for (const slug of articleSlugs) {
      revalidatePath(`/article/${slug}`);
    }

    // Tags
    revalidateTag(CACHE_TAGS.categories, "max");
    revalidateTag(CACHE_TAGS.category(existing.slug), "max");
    revalidateTag(CACHE_TAGS.dashboardCategories, "max");
    revalidateTag(CACHE_TAGS.blogs, "max");
    revalidateTag(CACHE_TAGS.dashboardBlogs, "max");
    revalidateTag(CACHE_TAGS.home, "max");
    revalidateTag(CACHE_TAGS.homeScreen, "max");

    revalidateTag(
      CACHE_TAGS.categoryPageBlogs(existing.slug),
      "max",
    );

    for (const slug of subcategorySlugs) {
      revalidateTag(CACHE_TAGS.subcategoryPageBlogs(slug), "max");
    }

    for (const slug of articleSlugs) {
      revalidateTag(CACHE_TAGS.blog(slug), "max");
    }

    return {
      success: true,
      deleted: {
        id: existing.id,
        name: existing.name,
        slug: existing.slug,
        subcategoriesDeleted: subcategoryIds.length,
        articlesDeleted: articleSlugs.length,
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
          "Cannot delete this category — it has related records. Please try again.",
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