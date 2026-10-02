// src/lib/actions/editor/get-editor.ts
"use server";

// ============================================================
// Server Action — Get Single Editor
// Uses cacheLife("max") + revalidateTag for instant invalidation.
// ============================================================

import { cacheTag, cacheLife } from "next/cache";
import prisma from "@/lib/clients/prisma-client";
import { CACHE_TAGS } from "@/lib/cache-keys";

// ============================================================
// TYPES
// ============================================================

export type EditorDetail = {
  id: string;
  name: string;
  email: string;
  imageUrl: string | null;
  bio: string | null;
  experience: string | null;
  location: string | null;
  website: string | null;
  twitter: string | null;
  linkedin: string | null;
  facebook: string | null;
  instagram: string | null;
  github: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type GetEditorResult =
  | { success: true; editor: EditorDetail }
  | { success: false; error: string };

// ============================================================
// CACHED READ
// ============================================================

async function getCachedEditor(id: string): Promise<EditorDetail | null> {
  "use cache";
  cacheLife("max");
  cacheTag(CACHE_TAGS.editor(id));
  cacheTag(CACHE_TAGS.editors);

  const editor = await prisma.editor.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      imageUrl: true,
      bio: true,
      experience: true,
      location: true,
      website: true,
      twitter: true,
      linkedin: true,
      facebook: true,
      instagram: true,
      github: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return editor ?? null;
}

// ============================================================
// MAIN ACTION
// ============================================================

export async function getEditor(id: string): Promise<GetEditorResult> {
  try {
    const editor = await getCachedEditor(id);

    if (!editor) {
      return { success: false, error: "Editor not found." };
    }

    return { success: true, editor };
  } catch (error) {
    console.error("[getEditor] Error:", error);
    return { success: false, error: "Failed to load editor." };
  }
}