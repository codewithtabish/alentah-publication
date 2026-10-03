// src/actions/blog/get-home-blogs.ts
"use server";

import { cacheTag, cacheLife } from "next/cache";
import prisma from "@/lib/clients/prisma-client";
import { CACHE_TAGS } from "@/lib/cache-keys";

// ============================================================
// TYPES
// ============================================================

export type HomeBlogCard = {
  id: string;
  title: string;
  slug: string;
  shortDescription: string | null;
  bannerImage: string;
  readingTime: number | null;
  viewCount: number;
  featured: boolean;
  publishedAt: Date | null;
  category: { id: string; name: string; slug: string };
  subcategory: { id: string; name: string; slug: string };
  author: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    imageUrl: string | null;
  };
};

export type GetHomeBlogsResult =
  | { success: true; blogs: HomeBlogCard[]; total: number }
  | { success: false; error: string };

// ============================================================
// CACHED READ
// ============================================================

async function getCachedHomeBlogs(): Promise<HomeBlogCard[]> {
  "use cache";
  cacheLife("max");
  cacheTag(CACHE_TAGS.home);
  cacheTag(CACHE_TAGS.homeScreen);
  cacheTag(CACHE_TAGS.blogs);

  return prisma.blog.findMany({
    where: {
      status: "PUBLISHED",
      publishedAt: { not: null },
    },
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
    take: 25,
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
      category: { select: { id: true, name: true, slug: true } },
      subcategory: { select: { id: true, name: true, slug: true } },
      author: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          imageUrl: true,
        },
      },
    },
  });
}

// ============================================================
// MAIN
// ============================================================

export async function getHomeBlogs(): Promise<GetHomeBlogsResult> {
  try {
    const blogs = await getCachedHomeBlogs();
    return { success: true, blogs, total: blogs.length };
  } catch (error) {
    console.error("[getHomeBlogs] Error:", error);
    return { success: false, error: "Failed to load articles." };
  }
}