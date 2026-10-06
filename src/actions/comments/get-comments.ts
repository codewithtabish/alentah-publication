// src/actions/blog/get-comments.ts
"use server";

// ============================================================
// Server Action — Get Comments for a Blog
// Cached. Auth NOT required to read.
// ============================================================

import { cacheTag, cacheLife } from "next/cache";
import prisma from "@/lib/clients/prisma-client";
import { CACHE_TAGS } from "@/lib/cache-keys";

// ============================================================
// TYPES
// ============================================================

export type CommentAuthor = {
  id: string;
  clerkId: string;
  firstName: string | null;
  lastName: string | null;
  imageUrl: string | null;
};

export type CommentItem = {
  id: string;
  content: string;
  createdAt: Date;
  parentId: string | null;
  user: CommentAuthor;
};

export type GetCommentsResult =
  | { success: true; comments: CommentItem[]; total: number }
  | { success: false; error: string };

// ============================================================
// CACHED READ
// ============================================================

async function readComments(blogId: string): Promise<CommentItem[]> {
  "use cache";
  cacheLife("max");
  cacheTag(CACHE_TAGS.comments(blogId));

  const rows = await prisma.comment.findMany({
    where: {
      blogId,
      status: "APPROVED",
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      content: true,
      createdAt: true,
      parentId: true,
      user: {
        select: {
          id: true,
          clerkId: true,
          firstName: true,
          lastName: true,
          imageUrl: true,
        },
      },
    },
  });

  return rows;
}

// ============================================================
// MAIN ACTION
// ============================================================

export async function getComments(
  blogId: string,
): Promise<GetCommentsResult> {
  try {
    if (!blogId) {
      return { success: false, error: "Missing blog id." };
    }

    const comments = await readComments(blogId);
    return { success: true, comments, total: comments.length };
  } catch (error) {
    console.error("[getComments] Error:", error);
    return { success: false, error: "Failed to load comments." };
  }
}