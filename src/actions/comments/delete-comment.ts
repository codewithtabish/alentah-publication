// src/actions/blog/delete-comment.ts
"use server";

// ============================================================
// Server Action — Delete Comment
// Only the comment author or an ADMIN can delete.
// ============================================================

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import prisma from "@/lib/clients/prisma-client";
import { revalidateComments } from "@/lib/cache-keys";

export type DeleteCommentResult =
  | { success: true }
  | { success: false; error: string };

export async function deleteComment(input: {
  commentId: string;
  blogId: string;
  blogSlug: string;
}): Promise<DeleteCommentResult> {
  try {
    const { userId: clerkId, sessionClaims } = await auth();

    if (!clerkId) {
      return { success: false, error: "You must be signed in." };
    }

    const role = (
      sessionClaims?.metadata as { role?: string } | undefined
    )?.role;

    const comment = await prisma.comment.findUnique({
      where: { id: input.commentId },
      select: {
        id: true,
        user: { select: { clerkId: true } },
      },
    });

    if (!comment) {
      return { success: false, error: "Comment not found." };
    }

    const isAuthor = comment.user.clerkId === clerkId;
    const isAdmin = role === "ADMIN";

    if (!isAuthor && !isAdmin) {
      return { success: false, error: "Not authorized." };
    }

    await prisma.comment.delete({
      where: { id: input.commentId },
    });

    revalidateComments(input.blogId, input.blogSlug);
    revalidatePath(`/${input.blogSlug}`);

    return { success: true };
  } catch (error) {
    console.error("[deleteComment] Error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to delete comment.",
    };
  }
}