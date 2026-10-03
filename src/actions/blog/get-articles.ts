// src/actions/blog/get-articles.ts
"use server";

// ============================================================
// Server Action — Get All Articles
// For the /admin/articles list page.
// Uses cacheLife("max") + cacheTags for instant revalidation.
// ============================================================

import { cacheTag, cacheLife } from "next/cache";
import prisma from "@/lib/clients/prisma-client";
import { CACHE_TAGS } from "@/lib/cache-keys";

// ============================================================
// TYPES
// ============================================================

export type ArticleListItem = {
  id: string;
  title: string;
  slug: string;
  shortDescription: string | null;
  bannerImage: string;
  status: string;
  type: string;
  featured: boolean;
  viewCount: number;
  readingTime: number | null;
  publishedAt: Date | null;
  scheduledAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  author: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    imageUrl: string | null;
  };
  category: {
    id: string;
    name: string;
    slug: string;
  };
  subcategory: {
    id: string;
    name: string;
    slug: string;
  };
};

export type ArticleStats = {
  total: number;
  published: number;
  inReview: number;
  draft: number;
  scheduled: number;
  archived: number;
};

export type GetArticlesResult =
  | {
      success: true;
      articles: ArticleListItem[];
      stats: ArticleStats;
      total: number;
    }
  | { success: false; error: string };

// ============================================================
// CACHED READ — LIST
// ============================================================

async function getCachedArticles(): Promise<{
  articles: ArticleListItem[];
  stats: ArticleStats;
}> {
  "use cache";
  cacheLife("max");
  cacheTag(CACHE_TAGS.blogs);
  cacheTag(CACHE_TAGS.dashboardBlogs);

  const [rows, total, published, inReview, draft, scheduled, archived] =
    await Promise.all([
      prisma.blog.findMany({
        orderBy: [{ updatedAt: "desc" }],
        take: 100,
        select: {
          id: true,
          title: true,
          slug: true,
          shortDescription: true,
          bannerImage: true,
          status: true,
          type: true,
          featured: true,
          viewCount: true,
          readingTime: true,
          publishedAt: true,
          scheduledAt: true,
          createdAt: true,
          updatedAt: true,
          author: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              imageUrl: true,
            },
          },
          category: {
            select: { id: true, name: true, slug: true },
          },
          subcategory: {
            select: { id: true, name: true, slug: true },
          },
        },
      }),
      prisma.blog.count(),
      prisma.blog.count({ where: { status: "PUBLISHED" } }),
      prisma.blog.count({ where: { status: "IN_REVIEW" } }),
      prisma.blog.count({ where: { status: "DRAFT" } }),
      prisma.blog.count({ where: { status: "SCHEDULED" } }),
      prisma.blog.count({ where: { status: "ARCHIVED" } }),
    ]);

  return {
    articles: rows,
    stats: {
      total,
      published,
      inReview,
      draft,
      scheduled,
      archived,
    },
  };
}

// ============================================================
// MAIN ACTION
// ============================================================

export async function getArticles(): Promise<GetArticlesResult> {
  try {
    const { articles, stats } = await getCachedArticles();

    return {
      success: true,
      articles,
      stats,
      total: stats.total,
    };
  } catch (error) {
    console.error("[getArticles] Error:", error);
    return { success: false, error: "Failed to load articles." };
  }
}