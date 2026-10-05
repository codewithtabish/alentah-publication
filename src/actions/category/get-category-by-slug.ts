// src/lib/actions/category/get-category-by-slug.ts
"use server";

// ============================================================
// Server Action — Get a single category by slug
// Returns the category with its editor, its subcategories, and
// every published blog under it.
//
// Cache tags used (all defined in src/lib/cache-keys.ts):
//   - CACHE_TAGS.category(slug)
//   - CACHE_TAGS.categoryPageBlogs(slug)
//   - CACHE_TAGS.categories
//   - CACHE_TAGS.blogs
//   - CACHE_TAGS.editors
//
// Invalidate this action's output from your admin mutations by
// calling `revalidateCategory(slug, { previousSlug })` after any
// category write, or `revalidateBlog(slug, context)` after any
// blog write that affects this category.
// ============================================================

import { cacheTag, cacheLife } from "next/cache";
import prisma from "@/lib/clients/prisma-client";
import { CACHE_TAGS } from "@/lib/cache-keys";

// ============================================================
// TYPES
// ============================================================

export type CategoryEditor = {
  id: string;
  name: string;
  imageUrl: string | null;
};

export type CategorySubcategory = {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  articleCount: number;
};

export type CategoryBlog = {
  id: string;
  title: string;
  slug: string;
  shortDescription: string | null;
  bannerImage: string;
  readingTime: number | null;
  viewCount: number;
  featured: boolean;
  publishedAt: Date | null;
  category: {
    id: string;
    name: string;
    slug: string;
    editor: CategoryEditor | null;
  };
  subcategory: {
    id: string;
    name: string;
    slug: string;
  };
  author: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    imageUrl: string | null;
  };
};

export type CategoryPageData = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  coverImage: string | null;
  editor: CategoryEditor | null;
  subcategories: CategorySubcategory[];
  blogs: CategoryBlog[];
  blogCount: number;
};

export type GetCategoryBySlugResult =
  | { success: true; category: CategoryPageData }
  | { success: false; error: string };

// ============================================================
// CACHED READ
// ============================================================

async function getCachedCategoryBySlug(
  slug: string,
): Promise<CategoryPageData | null> {
  "use cache";
  cacheLife("max");
  cacheTag(CACHE_TAGS.category(slug));
  cacheTag(CACHE_TAGS.categoryPageBlogs(slug));
  cacheTag(CACHE_TAGS.categories);
  cacheTag(CACHE_TAGS.blogs);
  cacheTag(CACHE_TAGS.editors);

  const row = await prisma.category.findUnique({
    where: { slug },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      coverImage: true,
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
          _count: { select: { blogs: true } },
        },
      },
      blogs: {
        where: {
          status: "PUBLISHED",
          publishedAt: { not: null },
        },
        orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
        select: {
          id: true,
          title: true,
          slug: true,
          shortDescription: true,
          bannerImage: true,
          readingTime: true,
          viewCount: true,
          featured: true,
          publishedAt: true,
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
              editor: {
                select: { id: true, name: true, imageUrl: true, bio:true },
              },
            },
          },
          subcategory: {
            select: { id: true, name: true, slug: true },
          },
          author: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              imageUrl: true,
            },
          },
        },
      },
    },
  });

  if (!row) return null;

  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    coverImage: row.coverImage,
    editor: row.editor ?? null,
    subcategories: row.subcategories.map((sub) => ({
      id: sub.id,
      name: sub.name,
      slug: sub.slug,
      isActive: sub.isActive,
      articleCount: sub._count.blogs,
    })),
    blogs: row.blogs as CategoryBlog[],
    blogCount: row.blogs.length,
  };
}

// ============================================================
// MAIN ACTION
// ============================================================

export async function getCategoryBySlug(
  slug: string,
): Promise<GetCategoryBySlugResult> {
  if (!slug || typeof slug !== "string") {
    return { success: false, error: "Invalid category slug." };
  }

  try {
    const category = await getCachedCategoryBySlug(slug);

    if (!category) {
      return { success: false, error: "Category not found." };
    }

    return { success: true, category };
  } catch (error) {
    console.error("[getCategoryBySlug] Error:", error);
    return { success: false, error: "Failed to load category." };
  }
}