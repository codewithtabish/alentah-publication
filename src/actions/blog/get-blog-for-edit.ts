// src/actions/blog/get-blog-for-edit.ts
"use server";

// ============================================================
// Server Action — Get Blog for Edit
// ============================================================

import { auth } from "@clerk/nextjs/server";
import { cacheTag, cacheLife } from "next/cache";
import prisma from "@/lib/clients/prisma-client";
import { CACHE_TAGS } from "@/lib/cache-keys";

// ============================================================
// TYPES
// ============================================================

export type EditableBlog = {
  id: string;
  title: string;
  slug: string;
  shortDescription: string | null;

  content: { blocks: Array<Record<string, unknown>> };

  tableOfContents: {
    id: string;
    title: string;
    slug: string;
    level?: number;
  }[];

  bannerImage: string;
  bannerImageAlt: string | null;

  ogImage: string;

  type: string;
  status: string;
  featured: boolean;

  publishedAt: Date | null;
  scheduledAt: Date | null;

  categoryId: string;
  subcategoryId: string;

  categorySlug: string;
  subcategorySlug: string;
};

export type GetBlogForEditResult =
  | { success: true; blog: EditableBlog }
  | { success: false; error: string };

// ============================================================
// CACHED READ
// ============================================================

async function readBlog(id: string): Promise<EditableBlog | null> {
  "use cache";
  cacheLife("max");
  cacheTag(CACHE_TAGS.blogs);

  const row = await prisma.blog.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      slug: true,
      shortDescription: true,
      content: true,
      tableOfContents: true,
      bannerImage: true,
      bannerImageAlt: true,
      type: true,
      status: true,
      featured: true,
      publishedAt: true,
      scheduledAt: true,
      categoryId: true,
      subcategoryId: true,
      category: { select: { slug: true } },
      subcategory: { select: { slug: true } },
      seo: { select: { ogImage: true } },
    },
  });

  if (!row) return null;

  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    shortDescription: row.shortDescription,

    content:
      (row.content as { blocks: Array<Record<string, unknown>> }) ?? {
        blocks: [],
      },

    tableOfContents:
      (row.tableOfContents as {
        id: string;
        title: string;
        slug: string;
        level?: number;
      }[]) ?? [],

    bannerImage: row.bannerImage,
    bannerImageAlt: row.bannerImageAlt,

    ogImage: row.seo?.ogImage ?? row.bannerImage,

    type: row.type,
    status: row.status,
    featured: row.featured,

    publishedAt: row.publishedAt,
    scheduledAt: row.scheduledAt,

    categoryId: row.categoryId,
    subcategoryId: row.subcategoryId,

    categorySlug: row.category.slug,
    subcategorySlug: row.subcategory.slug,
  };
}

// ============================================================
// MAIN ACTION
// ============================================================

export async function getBlogForEdit(
  id: string,
): Promise<GetBlogForEditResult> {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { success: false, error: "Not authenticated." };
    }

    if (!id) {
      return { success: false, error: "Missing blog id." };
    }

    const blog = await readBlog(id);

    if (!blog) {
      return { success: false, error: "Blog not found." };
    }

    return { success: true, blog };
  } catch (error) {
    console.error("[getBlogForEdit] Error:", error);
    return { success: false, error: "Failed to load blog." };
  }
}