// src/actions/blog/get-admin-articles.ts
"use server";

// ============================================================
// Admin articles list — pure data. No auth here.
// Auth is handled by the admin page (inside Suspense).
// ============================================================

import { cacheTag, cacheLife } from "next/cache";
import prisma from "@/lib/clients/prisma-client";
import { CACHE_TAGS } from "@/lib/cache-keys";

// ============================================================
// TYPES
// ============================================================

export type AdminArticleRow = {
  id: string;
  title: string;
  slug: string;
  shortDescription: string | null;
  bannerImage: string;
  status: string;
  type: string;
  featured: boolean;
  viewCount: number;
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
  } | null;
};

export type AdminArticleStats = {
  total: number;
  published: number;
  inReview: number;
  draft: number;
  scheduled: number;
};

export type GetAdminArticlesResult =
  | {
      success: true;
      articles: AdminArticleRow[];
      stats: AdminArticleStats;
      total: number;
    }
  | { success: false; error: string };

// ============================================================
// CACHED READ
// ============================================================

async function readAdminArticles(): Promise<{
  articles: AdminArticleRow[];
  stats: AdminArticleStats;
}> {
  "use cache";
  cacheLife("max");
  cacheTag(CACHE_TAGS.blogs);

  const rows = await prisma.blog.findMany({
    orderBy: [{ updatedAt: "desc" }],
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
  });

  const stats: AdminArticleStats = {
    total: rows.length,
    published: rows.filter((r) => r.status === "PUBLISHED").length,
    inReview: rows.filter((r) => r.status === "IN_REVIEW").length,
    draft: rows.filter((r) => r.status === "DRAFT").length,
    scheduled: rows.filter((r) => r.status === "SCHEDULED").length,
  };

  return { articles: rows, stats };
}

// ============================================================
// MAIN ACTION
// ============================================================

export async function getAdminArticles(): Promise<GetAdminArticlesResult> {
  try {
    const { articles, stats } = await readAdminArticles();
    return { success: true, articles, stats, total: articles.length };
  } catch (error) {
    console.error("[getAdminArticles] Error:", error);
    return { success: false, error: "Failed to load articles." };
  }
}