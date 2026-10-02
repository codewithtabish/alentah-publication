"use server";

// ============================================================
// Server Action — Upload Editor Image
// Validates → Converts to Buffer → Uploads via uploadEditorImage
// ============================================================

import { uploadEditorImage } from "@/lib/images/upload-editor-image";

type UploadEditorSuccess = {
  success: true;
  data: {
    url: string;
    key: string;
    width: number;
    height: number;
    format: string;
  };
};

type UploadEditorError = {
  success: false;
  error: string;
};

export type UploadEditorResult = UploadEditorSuccess | UploadEditorError;

// 5 MB maximum for headshots
const MAX_FILE_SIZE = 5 * 1024 * 1024;

const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/tiff",
]);

export async function uploadEditorAction(
  formData: FormData,
): Promise<UploadEditorResult> {
  try {
    // -------------------------------------------------------
    // 1. Get file from FormData
    // -------------------------------------------------------

    const value = formData.get("file");

    if (!(value instanceof File)) {
      return {
        success: false,
        error: "No valid editor image was provided.",
      };
    }

    // -------------------------------------------------------
    // 2. Validate size
    // -------------------------------------------------------

    if (value.size === 0) {
      return {
        success: false,
        error: "The selected editor image is empty.",
      };
    }

    if (value.size > MAX_FILE_SIZE) {
      return {
        success: false,
        error: "Editor image must be smaller than 5 MB.",
      };
    }

    // -------------------------------------------------------
    // 3. Validate MIME type
    // -------------------------------------------------------

    if (!ALLOWED_TYPES.has(value.type)) {
      return {
        success: false,
        error:
          "Unsupported editor image type. Please upload JPEG, PNG, WebP, AVIF, or TIFF.",
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
        error: "The uploaded editor image contains no data.",
      };
    }

    // -------------------------------------------------------
    // 5. Debug log
    // -------------------------------------------------------

    console.log("Editor upload received:", {
      name: value.name,
      type: value.type,
      size: value.size,
      bufferSize: buffer.length,
    });

    // -------------------------------------------------------
    // 6. Process + upload
    // -------------------------------------------------------

    const result = await uploadEditorImage({
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
    console.error("Editor image upload failed:", error);

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to upload editor image. Please try again.",
    };
  }
}