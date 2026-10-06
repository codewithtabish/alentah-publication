// src/actions/bookmarks/get-bookmark-status.ts
"use server";

// ============================================================
// Server Action — Get Bookmark Status for a Blog
// Returns whether the signed-in user has saved this blog.
// Returns { saved: false } for signed-out visitors.
// Cached per user+blog pair.
// ============================================================

import { auth } from "@clerk/nextjs/server";
import { cacheTag, cacheLife } from "next/cache";
import prisma from "@/lib/clients/prisma-client";
import { CACHE_TAGS } from "@/lib/cache-keys";

// ============================================================
// TYPES
// ============================================================

export type BookmarkStatusResult =
  | { success: true; saved: boolean; authenticated: boolean }
  | { success: false; error: string };

// ============================================================
// CACHED READ
// ============================================================

async function readStatus(
  userId: string,
  blogId: string,
): Promise<boolean> {
  "use cache";
  cacheLife("max");
  cacheTag(CACHE_TAGS.bookmarkStatus(userId, blogId));

  const row = await prisma.bookmark.findUnique({
    where: {
      userId_blogId: {
        userId,
        blogId,
      },
    },
    select: { id: true },
  });

  return Boolean(row);
}

// ============================================================
// MAIN ACTION
// ============================================================

export async function getBookmarkStatus(
  blogId: string,
): Promise<BookmarkStatusResult> {
  try {
    const { userId: clerkId } = await auth();

    if (!clerkId) {
      return { success: true, saved: false, authenticated: false };
    }

    if (!blogId) {
      return { success: false, error: "Missing blog id." };
    }

    const user = await prisma.user.findUnique({
      where: { clerkId },
      select: { id: true },
    });

    if (!user) {
      return { success: true, saved: false, authenticated: true };
    }

    const saved = await readStatus(user.id, blogId);
    return { success: true, saved, authenticated: true };
  } catch (error) {
    console.error("[getBookmarkStatus] Error:", error);
    return { success: false, error: "Failed to load bookmark status." };
  }
}