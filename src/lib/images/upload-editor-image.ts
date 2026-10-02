// src/lib/images/upload-editor-image.ts
// ============================================================
// Upload Editor Image — ALENTAH
// Handles: headshot upload → Sharp optimize → S3 → CloudFront URL
// Output: 400 × 400 square WebP (matches the editor preview)
// ============================================================

import { PutObjectCommand } from "@aws-sdk/client-s3";
import { randomUUID } from "crypto";
import sharp from "sharp";
import s3Client from "../clients/s3-client";

interface UploadEditorImageOptions {
  file: Buffer;
  fileName?: string;
  folder?: string;
}

export async function uploadEditorImage({
  file,
  fileName,
  folder = process.env.AWS_S3_EDITORS_FOLDER || "editors",
}: UploadEditorImageOptions) {
  // ---------------------------------------------------------
  // 1. Basic buffer validation
  // ---------------------------------------------------------

  if (!Buffer.isBuffer(file)) {
    throw new Error("Uploaded editor image is not a valid Buffer.");
  }

  if (file.length === 0) {
    throw new Error("Uploaded editor image is empty.");
  }

  // ---------------------------------------------------------
  // 2. Verify original image with Sharp
  // ---------------------------------------------------------

  let metadata;

  try {
    metadata = await sharp(file).metadata();
  } catch (error) {
    console.error("Sharp could not read editor image:", error);
    throw new Error(
      "The uploaded editor file is not a valid or supported image.",
    );
  }

  if (!metadata.format) {
    throw new Error("Unable to detect the editor image format.");
  }

  if (!metadata.width || !metadata.height) {
    throw new Error("Unable to detect the editor image dimensions.");
  }

  console.log("Editor image detected:", {
    format: metadata.format,
    width: metadata.width,
    height: metadata.height,
    size: file.length,
  });

  // ---------------------------------------------------------
  // 3. Reject SVG (security — no scripting in avatars)
  // ---------------------------------------------------------

  if (metadata.format === "svg") {
    throw new Error("SVG files are not supported for editor images.");
  }

  // ---------------------------------------------------------
  // 4. Process image → 400 × 400 square WebP
  // ---------------------------------------------------------

  let processedImage: Buffer;

  try {
    processedImage = await sharp(file)
      // Respect EXIF orientation (phone photos)
      .rotate()

      // Square crop for avatar — centered
      .resize(400, 400, {
        fit: "cover",
        position: "center",
      })

      // Optimized WebP
      .webp({
        quality: 90,
        effort: 4,
      })

      .toBuffer();
  } catch (error) {
    console.error("Editor image processing failed:", error);
    throw new Error("Failed to process the editor image.");
  }

  if (!processedImage || processedImage.length === 0) {
    throw new Error("Editor image processing produced an empty image.");
  }

  // ---------------------------------------------------------
  // 5. Unique filename
  // ---------------------------------------------------------

  const uniqueId = randomUUID().split("-")[0];

  const cleanFileName = fileName
    ? fileName
        .replace(/\.[^/.]+$/, "")
        .replace(/[^a-zA-Z0-9-_]/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "")
        .slice(0, 60)
    : "editor";

  const finalFileName = `${cleanFileName}-${uniqueId}.webp`;

  // ---------------------------------------------------------
  // 6. S3 key
  // ---------------------------------------------------------

  const key = `${folder}/avatars/${finalFileName}`;

  // ---------------------------------------------------------
  // 7. Upload to S3
  // ---------------------------------------------------------

  try {
    await s3Client.send(
      new PutObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET!,
        Key: key,
        Body: processedImage,
        ContentType: "image/webp",
        CacheControl: "public, max-age=31536000, immutable",
      }),
    );
  } catch (error) {
    console.error("Editor image S3 upload failed:", error);
    throw new Error("Failed to upload the editor image to storage.");
  }

  // ---------------------------------------------------------
  // 8. CloudFront URL
  // ---------------------------------------------------------

  const cloudFrontUrl = process.env.AWS_CLOUDFRONT_URL?.replace(/\/$/, "");

  if (!cloudFrontUrl) {
    throw new Error("AWS_CLOUDFRONT_URL is not configured.");
  }

  const url = `${cloudFrontUrl}/${key}`;

  // ---------------------------------------------------------
  // 9. Return result
  // ---------------------------------------------------------

  return {
    url,
    key,
    width: 400,
    height: 400,
    format: "webp",
  };
}