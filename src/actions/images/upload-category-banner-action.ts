// src/lib/actions/category/upload-category-banner-action.ts
"use server";

// ============================================================
// Server Action — Upload Category Banner
// Validates → Converts to Buffer → Uploads via uploadCategoryBanner
// ============================================================

import { uploadCategoryBanner } from "@/lib/images/upload-category-banner";

// ============================================================
// TYPES
// ============================================================

type UploadBannerSuccess = {
  success: true;
  data: {
    url: string;
    key: string;
    width: number;
    height: number;
    format: string;
  };
};

type UploadBannerError = {
  success: false;
  error: string;
};

export type UploadCategoryBannerResult =
  | UploadBannerSuccess
  | UploadBannerError;

// ============================================================
// CONSTANTS
// ============================================================

// 5 MB maximum for cover images
const MAX_FILE_SIZE = 5 * 1024 * 1024;

const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/tiff",
]);

// ============================================================
// MAIN ACTION
// ============================================================

export async function uploadCategoryBannerAction(
  formData: FormData,
): Promise<UploadCategoryBannerResult> {
  try {
    // -------------------------------------------------------
    // 1. Get file from FormData
    // -------------------------------------------------------

    const value = formData.get("file");

    if (!(value instanceof File)) {
      return {
        success: false,
        error: "No valid cover image was provided.",
      };
    }

    // -------------------------------------------------------
    // 2. Validate size
    // -------------------------------------------------------

    if (value.size === 0) {
      return {
        success: false,
        error: "The selected cover image is empty.",
      };
    }

    if (value.size > MAX_FILE_SIZE) {
      return {
        success: false,
        error: "Cover image must be smaller than 5 MB.",
      };
    }

    // -------------------------------------------------------
    // 3. Validate MIME type
    // -------------------------------------------------------

    if (!ALLOWED_TYPES.has(value.type)) {
      return {
        success: false,
        error:
          "Unsupported cover image type. Please upload JPEG, PNG, WebP, AVIF, or TIFF.",
      };
    }

    // -------------------------------------------------------
    // 4. Convert File → Buffer
    // -------------------------------------------------------

    const arrayBuffer = await value.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    if (buffer.length === 0) {
      return {
        success: false,
        error: "The uploaded cover image contains no data.",
      };
    }

    // -------------------------------------------------------
    // 5. Debug log
    // -------------------------------------------------------

    console.log("Category cover upload received:", {
      name: value.name,
      type: value.type,
      size: value.size,
      bufferSize: buffer.length,
    });

    // -------------------------------------------------------
    // 6. Process + upload
    // -------------------------------------------------------

    const result = await uploadCategoryBanner({
      file: buffer,
      fileName: value.name,
    });

    // -------------------------------------------------------
    // 7. Success
    // -------------------------------------------------------

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    console.error("Category cover upload failed:", error);

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to upload cover image. Please try again.",
    };
  }
}