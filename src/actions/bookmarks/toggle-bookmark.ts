// src/actions/bookmarks/toggle-bookmark.ts
"use server";

// ============================================================
// Server Action — Toggle Bookmark (Save / Unsave)
// Auth required. Idempotent: calling twice returns to the
// original state and returns `saved: false` the second time.
// ============================================================

import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/clients/prisma-client";
import { revalidateBookmark } from "@/lib/cache-keys";

// ============================================================
// TYPES
// ============================================================

export type ToggleBookmarkResult =
  | { success: true; saved: boolean }
  | { success: false; error: string };

// ============================================================
// MAIN ACTION
// ============================================================

export async function toggleBookmark(input: {
  blogId: string;
}): Promise<ToggleBookmarkResult> {
  try {
    const { userId: clerkId } = await auth();

    if (!clerkId) {
      return { success: false, error: "You must sign in to save." };
    }

    if (!input.blogId) {
      return { success: false, error: "Missing blog id." };
    }

    const user = await prisma.user.findUnique({
      where: { clerkId },
      select: { id: true },
    });

    if (!user) {
      return { success: false, error: "User not found." };
    }

    // Check if a bookmark already exists
    const existing = await prisma.bookmark.findUnique({
      where: {
        userId_blogId: {
          userId: user.id,
          blogId: input.blogId,
        },
      },
      select: { id: true },
    });

    if (existing) {
      await prisma.bookmark.delete({
        where: { id: existing.id },
      });

      revalidateBookmark(clerkId, user.id, input.blogId);

      return { success: true, saved: false };
    }

    await prisma.bookmark.create({
      data: {
        userId: user.id,
        blogId: input.blogId,
      },
    });

    revalidateBookmark(clerkId, user.id, input.blogId);

    return { success: true, saved: true };
  } catch (error) {
    console.error("[toggleBookmark] Error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to save blog.",
    };
  }
}