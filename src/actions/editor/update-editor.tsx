// src/lib/actions/editor/update-editor.ts
"use server";

// ============================================================
// Server Action — Update Editor
// ============================================================

import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/clients/prisma-client";
import {
  revalidateEditor,
  revalidateEditors,
  revalidateDashboardSection,
  revalidateHome,
} from "@/lib/cache-keys";
import { uploadEditorAction } from "../images/upload-editor-image-action";

export type UpdateEditorResult =
  | {
      success: true;
      editor: {
        id: string;
        name: string;
        email: string;
        slug: string;
        imageUrl: string | null;
      };
    }
  | { success: false; error: string; field?: string };

// ============================================================
// HELPERS
// ============================================================

function toSlug(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function getString(formData: FormData, key: string): string {
  const v = formData.get(key);
  return typeof v === "string" ? v.trim() : "";
}

function getStringOrNull(formData: FormData, key: string): string | null {
  const v = getString(formData, key);
  return v.length > 0 ? v : null;
}

/**
 * Robust boolean parse — accepts "true", "false", "on", "1", "0", true, false.
 * Never crashes on unexpected input.
 */
function getBoolean(formData: FormData, key: string, fallback = true): boolean {
  const v = formData.get(key);
  if (v === null) return fallback;
  const s = String(v).trim().toLowerCase();
  if (s === "true" || s === "on" || s === "1" || s === "yes") return true;
  if (s === "false" || s === "off" || s === "0" || s === "no") return false;
  return fallback;
}

// ============================================================
// MAIN ACTION
// ============================================================

export async function updateEditor(
  id: string,
  formData: FormData,
): Promise<UpdateEditorResult> {
  try {
    // ─── Auth ───
    const { userId, sessionClaims } = await auth();

    if (!userId) {
      return { success: false, error: "You must be signed in." };
    }

    const role = (sessionClaims?.metadata as { role?: string } | undefined)
      ?.role;

    if (role !== "ADMIN") {
      return {
        success: false,
        error: "Only admins can update editors.",
      };
    }

    // ─── Load existing ───
    const existing = await prisma.editor.findUnique({
      where: { id },
      select: { id: true, name: true, email: true, imageUrl: true },
    });

    if (!existing) {
      return { success: false, error: "Editor not found." };
    }

    // ─── Extract fields ───
    const name = getString(formData, "name");
    const email = getString(formData, "email").toLowerCase();
    const experience = getStringOrNull(formData, "experience");
    const bio = getStringOrNull(formData, "bio");
    const location = getStringOrNull(formData, "location");
    const website = getStringOrNull(formData, "website");
    const twitter = getStringOrNull(formData, "twitter");
    const linkedin = getStringOrNull(formData, "linkedin");
    const facebook = getStringOrNull(formData, "facebook");
    const instagram = getStringOrNull(formData, "instagram");
    const github = getStringOrNull(formData, "github");

    // ─── Robust boolean parse ───
    const isActive = getBoolean(formData, "isActive", true);

    console.log("[updateEditor] Received:", {
      id,
      name,
      email,
      isActive,
      rawIsActive: formData.get("isActive"),
    });

    // ─── Validate ───
    if (!name || name.length < 2) {
      return {
        success: false,
        error: "Name must be at least 2 characters.",
        field: "name",
      };
    }

    if (name.length > 60) {
      return {
        success: false,
        error: "Name must be 60 characters or fewer.",
        field: "name",
      };
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return {
        success: false,
        error: "Please enter a valid email address.",
        field: "email",
      };
    }

    // ─── Email uniqueness ───
    if (email !== existing.email) {
      const conflict = await prisma.editor.findUnique({
        where: { email },
        select: { id: true },
      });

      if (conflict && conflict.id !== id) {
        return {
          success: false,
          error: "Another editor already uses this email.",
          field: "email",
        };
      }
    }

    // ─── Photo ───
    let nextImageUrl: string | null | undefined = undefined;
    const photo = formData.get("photo");
    const removePhoto = formData.get("removePhoto") === "true";

    if (removePhoto) {
      nextImageUrl = null;
    } else if (photo instanceof File && photo.size > 0) {
      const uploadFormData = new FormData();
      uploadFormData.append("file", photo);

      const uploaded = await uploadEditorAction(uploadFormData);

      if (!uploaded.success) {
        return {
          success: false,
          error: uploaded.error,
          field: "photo",
        };
      }

      nextImageUrl = uploaded.data.url;
    }

    // ─── Update ───
    const editor = await prisma.editor.update({
      where: { id },
      data: {
        name,
        email,
        experience,
        bio,
        location,
        website,
        twitter,
        linkedin,
        facebook,
        instagram,
        github,
        isActive,
        ...(nextImageUrl !== undefined ? { imageUrl: nextImageUrl } : {}),
      },
      select: {
        id: true,
        name: true,
        email: true,
        imageUrl: true,
      },
    });

    const slug = toSlug(editor.name);

    // ─── Invalidate caches ───
    //
    // Because the editor's name and avatar appear on the homepage
    // (author bylines on hero / cards / trending), we must also
    // revalidate the homepage and the "homeblogs" tag.

    revalidateEditor(editor.id, slug);
    revalidateEditors();
    revalidateDashboardSection("editors");

    // ─── Homepage + homeblogs ───
    // This covers:
    //   • CACHE_TAGS.home       ("homeblogs")
    //   • CACHE_TAGS.homeScreen ("home:screen")
    //   • revalidatePath("/")
    revalidateHome();

    console.log("[updateEditor] Success:", editor.id);

    return {
      success: true,
      editor: {
        id: editor.id,
        name: editor.name,
        email: editor.email,
        slug,
        imageUrl: editor.imageUrl,
      },
    };
  } catch (error) {
    console.error("[updateEditor] Error:", error);

    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code: string }).code === "P2002"
    ) {
      return {
        success: false,
        error: "Another editor already uses this email.",
        field: "email",
      };
    }

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to update editor. Please try again.",
    };
  }
}