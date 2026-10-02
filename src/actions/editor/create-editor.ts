// src/lib/actions/editor/create-editor.ts
"use server";

// ============================================================
// Server Action — Create Editor
// Validates → Uploads photo (optional) → Creates editor in DB
// → Invalidates caches → Returns structured result
// ============================================================

import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/clients/prisma-client";
import {
  revalidateEditor,
  revalidateEditors,
  revalidateDashboardSection,
} from "@/lib/cache-keys";
import { uploadEditorAction } from "../images/upload-editor-image-action";

// ============================================================
// TYPES
// ============================================================

export type CreateEditorResult =
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

// ============================================================
// MAIN ACTION
// ============================================================

export async function createEditor(
  formData: FormData,
): Promise<CreateEditorResult> {
  try {
    // ---------------------------------------------------------
    // 1. Auth — must be signed in
    // ---------------------------------------------------------
    const { userId, sessionClaims } = await auth();

    if (!userId) {
      return { success: false, error: "You must be signed in." };
    }

    const role = (sessionClaims?.metadata as { role?: string } | undefined)
      ?.role;

    if (role !== "ADMIN") {
      return {
        success: false,
        error: "Only admins can create editors.",
      };
    }

    // ---------------------------------------------------------
    // 2. Extract + validate text fields
    // ---------------------------------------------------------
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
    const isActive = formData.get("isActive") !== "false";

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

    // ---------------------------------------------------------
    // 3. Check email uniqueness early (better UX)
    // ---------------------------------------------------------
    const existing = await prisma.editor.findUnique({
      where: { email },
      select: { id: true },
    });

    if (existing) {
      return {
        success: false,
        error: "An editor with this email already exists.",
        field: "email",
      };
    }

    // ---------------------------------------------------------
    // 4. Handle photo upload (optional)
    // ---------------------------------------------------------
    let imageUrl: string | null = null;
    const photo = formData.get("photo");

    if (photo instanceof File && photo.size > 0) {
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

      imageUrl = uploaded.data.url;
    }

    // ---------------------------------------------------------
    // 5. Create the editor
    // ---------------------------------------------------------
    const editor = await prisma.editor.create({
      data: {
        name,
        email,
        imageUrl,
        bio,
        experience,
        location,
        website,
        twitter,
        linkedin,
        facebook,
        instagram,
        github,
        isActive,
      },
      select: {
        id: true,
        name: true,
        email: true,
        imageUrl: true,
      },
    });

    // Editor has no slug field — generate for route purposes
    const slug = toSlug(editor.name);

    // ---------------------------------------------------------
    // 6. Invalidate caches
    // ---------------------------------------------------------
    revalidateEditors();
    revalidateEditor(editor.id, slug);
    revalidateDashboardSection("editors");

    // ---------------------------------------------------------
    // 7. Return success
    // ---------------------------------------------------------
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
    console.error("[createEditor] Error:", error);

    // Handle unique constraint race
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code: string }).code === "P2002"
    ) {
      return {
        success: false,
        error: "An editor with this email already exists.",
        field: "email",
      };
    }

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to create editor. Please try again.",
    };
  }
}