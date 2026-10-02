// src/lib/actions/editor/get-editors.ts
"use server";

// ============================================================
// Server Action — Get All Editors
// Uses cacheLife("max") + revalidateTag for instant invalidation.
// ============================================================

import { cacheTag, cacheLife } from "next/cache";
import prisma from "@/lib/clients/prisma-client";
import { CACHE_TAGS } from "@/lib/cache-keys";

// ============================================================
// TYPES
// ============================================================

export type EditorListItem = {
  id: string;
  name: string;
  email: string;
  imageUrl: string | null;
  experience: string | null;
  bio: string | null;
  isActive: boolean;
  createdAt: Date;
  categoryCount: number;
  categories: { id: string; name: string; slug: string }[];
};

export type GetEditorsResult =
  | { success: true; editors: EditorListItem[] }
  | { success: false; error: string };

// ============================================================
// CACHED READ
// ============================================================

async function getCachedEditors(): Promise<EditorListItem[]> {
  "use cache";
  cacheLife("max");
  cacheTag(CACHE_TAGS.editors);

  const rows = await prisma.editor.findMany({
    orderBy: [{ isActive: "desc" }, { createdAt: "desc" }],
    select: {
      id: true,
      name: true,
      email: true,
      imageUrl: true,
      experience: true,
      bio: true,
      isActive: true,
      createdAt: true,
      _count: { select: { categories: true } },
      categories: {
        select: { id: true, name: true, slug: true },
        take: 3,
        orderBy: { sortOrder: "asc" },
      },
    },
  });

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    email: row.email,
    imageUrl: row.imageUrl,
    experience: row.experience,
    bio: row.bio,
    isActive: row.isActive,
    createdAt: row.createdAt,
    categoryCount: row._count.categories,
    categories: row.categories,
  }));
}

// ============================================================
// MAIN ACTION
// ============================================================

export async function getEditors(): Promise<GetEditorsResult> {
  try {
    const editors = await getCachedEditors();
    return { success: true, editors };
  } catch (error) {
    console.error("[getEditors] Error:", error);
    return { success: false, error: "Failed to load editors." };
  }
}