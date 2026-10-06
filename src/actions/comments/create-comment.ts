// src/actions/blog/create-comment.ts
"use server";

// ============================================================
// Server Action — Create Comment
// Requires Clerk auth. Posts as the signed-in user.
// Auto-approves so comments appear immediately.
// ============================================================

import { auth, currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import prisma from "@/lib/clients/prisma-client";
import { revalidateComments } from "@/lib/cache-keys";

// ============================================================
// TYPES
// ============================================================

export type CreateCommentResult =
  | {
      success: true;
      comment: {
        id: string;
        content: string;
        createdAt: Date;
        parentId: string | null;
        user: {
          id: string;
          clerkId: string;
          firstName: string | null;
          lastName: string | null;
          imageUrl: string | null;
        };
      };
    }
  | { success: false; error: string };

// ============================================================
// MAIN ACTION
// ============================================================

export async function createComment(input: {
  blogId: string;
  blogSlug: string;
  content: string;
  parentId?: string | null;
}): Promise<CreateCommentResult> {
  try {
    // ─── Auth ───
    const { userId: clerkId } = await auth();

    if (!clerkId) {
      return { success: false, error: "You must sign in to comment." };
    }

    // ─── Validate ───
    const content = input.content?.trim();

    if (!content) {
      return { success: false, error: "Comment cannot be empty." };
    }

    if (content.length < 2) {
      return { success: false, error: "Comment is too short." };
    }

    if (content.length > 2000) {
      return {
        success: false,
        error: "Comment is too long (max 2000 characters).",
      };
    }

    if (!input.blogId || !input.blogSlug) {
      return { success: false, error: "Missing blog reference." };
    }

    // ─── Ensure user row exists (Clerk → DB sync) ───
    let user = await prisma.user.findUnique({
      where: { clerkId },
      select: { id: true },
    });

    if (!user) {
      const clerkUser = await currentUser();

      if (!clerkUser) {
        return { success: false, error: "Could not load your account." };
      }

      const email = clerkUser.primaryEmailAddress?.emailAddress ?? "";

      user = await prisma.user.create({
        data: {
          clerkId,
          email,
          firstName: clerkUser.firstName ?? null,
          lastName: clerkUser.lastName ?? null,
          imageUrl: clerkUser.imageUrl ?? null,
        },
        select: { id: true },
      });
    }

    // ─── Validate parent (if this is a reply) ───
    if (input.parentId) {
      const parent = await prisma.comment.findUnique({
        where: { id: input.parentId },
        select: { id: true, blogId: true },
      });

      if (!parent || parent.blogId !== input.blogId) {
        return { success: false, error: "Parent comment not found." };
      }
    }

    // ─── Create comment ───
    const comment = await prisma.comment.create({
      data: {
        content,
        blogId: input.blogId,
        userId: user.id,
        parentId: input.parentId ?? null,
        status: "APPROVED",
      },
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

    // ─── Invalidate caches ───
    revalidateComments(input.blogId, input.blogSlug);
    revalidatePath(`/${input.blogSlug}`);

    return { success: true, comment };
  } catch (error) {
    console.error("[createComment] Error:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to post comment. Please try again.",
    };
  }
}