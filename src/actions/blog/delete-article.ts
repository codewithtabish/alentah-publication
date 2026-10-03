// src/actions/blog/delete-article.ts
"use server";

// ============================================================
// Server Action — Delete Article
// Invalidates ALL related caches so counts stay fresh.
// ============================================================

import { auth } from "@clerk/nextjs/server";
import { revalidatePath, revalidateTag } from "next/cache";
import prisma from "@/lib/clients/prisma-client";
import { CACHE_TAGS } from "@/lib/cache-keys";

export type DeleteArticleResult =
  | { success: true; deleted: { id: string; title: string; slug: string } }
  | { success: false; error: string };

export async function deleteArticle(
  id: string,
): Promise<DeleteArticleResult> {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { success: false, error: "You must be signed in." };
    }

    // ─── Load the article first so we know its category/subcategory slugs ───
    const existing = await prisma.blog.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        slug: true,
        category: { select: { slug: true } },
        subcategory: { select: { slug: true } },
      },
    });

    if (!existing) {
      return { success: false, error: "Article not found." };
    }

    // ─── Delete ───
    await prisma.blog.delete({ where: { id } });

    // ─── Invalidate EVERY related cache ───
    // Paths (force fresh render on next visit)
    revalidatePath("/admin/articles");
    revalidatePath("/admin/articles/" + id);
    revalidatePath("/admin/categories");        // ← CRITICAL: refreshes article counts
    revalidatePath("/admin");                    // dashboard
    revalidatePath("/");                         // homepage
    revalidatePath(`/article/${existing.slug}`); // public article

    // Tags — articles
    revalidateTag(CACHE_TAGS.blogs, "max");
    revalidateTag(CACHE_TAGS.blog(existing.slug), "max");
    revalidateTag(CACHE_TAGS.dashboardBlogs, "max");

    // Tags — categories (article counts, sub counts)
    revalidateTag(CACHE_TAGS.categories, "max");           // ← CRITICAL
    revalidateTag(CACHE_TAGS.category(existing.category.slug), "max");
    revalidateTag(CACHE_TAGS.categoryPageBlogs(existing.category.slug), "max");
    revalidateTag(CACHE_TAGS.subcategoryPageBlogs(existing.subcategory.slug), "max");
    revalidateTag(CACHE_TAGS.dashboardCategories, "max");  // ← CRITICAL

    // Tags — home
    revalidateTag(CACHE_TAGS.home, "max");
    revalidateTag(CACHE_TAGS.homeScreen, "max");

    return {
      success: true,
      deleted: {
        id: existing.id,
        title: existing.title,
        slug: existing.slug,
      },
    };
  } catch (error) {
    console.error("[deleteArticle] Error:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to delete article.",
    };
  }
}