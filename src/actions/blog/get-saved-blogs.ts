// src/actions/bookmarks/get-saved-blogs.ts
"use server";

// ============================================================
// Server Action — Get the signed-in user's saved blogs
// ============================================================

import { auth } from "@clerk/nextjs/server";
import { cacheTag, cacheLife } from "next/cache";
import prisma from "@/lib/clients/prisma-client";
import { CACHE_TAGS } from "@/lib/cache-keys";

// ============================================================
// TYPES
// ============================================================

export type SavedBlogItem = {
  bookmarkId: string;
  savedAt: Date;
  blog: {
    id: string;
    title: string;
    slug: string;
    shortDescription: string | null;
    bannerImage: string;
    readingTime: number | null;
    publishedAt: Date | null;
    category: { slug: string; name: string };
    subcategory: { slug: string; name: string } | null;
    author: {
      firstName: string | null;
      lastName: string | null;
      imageUrl: string | null;
    };
  };
};

export type GetSavedBlogsResult =
  | { success: true; items: SavedBlogItem[]; total: number }
  | { success: false; error: string; authenticated: boolean };

// ============================================================
// CACHED READ
// ============================================================

async function readSaved(
  clerkId: string,
  userId: string,
): Promise<SavedBlogItem[]> {
  "use cache";
  cacheLife("max");
  cacheTag(CACHE_TAGS.userSaved(clerkId));
  cacheTag(CACHE_TAGS.bookmarks(userId));

  const rows = await prisma.bookmark.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      createdAt: true,
      blog: {
        select: {
          id: true,
          title: true,
          slug: true,
          shortDescription: true,
          bannerImage: true,
          readingTime: true,
          publishedAt: true,
          category: { select: { slug: true, name: true } },
          subcategory: { select: { slug: true, name: true } },
          author: {
            select: {
              firstName: true,
              lastName: true,
              imageUrl: true,
            },
          },
        },
      },
    },
  });

  return rows.map((r) => ({
    bookmarkId: r.id,
    savedAt: r.createdAt,
    blog: r.blog,
  }));
}

// ============================================================
// MAIN ACTION
// ============================================================

export async function getSavedBlogs(): Promise<GetSavedBlogsResult> {
  try {
    const { userId: clerkId } = await auth();

    if (!clerkId) {
      return {
        success: false,
        error: "Sign in to view your saved articles.",
        authenticated: false,
      };
    }

    const user = await prisma.user.findUnique({
      where: { clerkId },
      select: { id: true },
    });

    if (!user) {
      return { success: true, items: [], total: 0 };
    }

    const items = await readSaved(clerkId, user.id);
    return { success: true, items, total: items.length };
  } catch (error) {
    console.error("[getSavedBlogs] Error:", error);
    return {
      success: false,
      error: "Failed to load saved articles.",
      authenticated: true,
    };
  }
}