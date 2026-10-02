// src/lib/images/upload-category-banner.ts
// ============================================================
// Upload Category Banner — ALENTAH
// Handles: cover image → Sharp optimize → S3 → CloudFront URL
// Output: 1600 × 900 (16:9) WebP — matches the category hero
// ============================================================

import { PutObjectCommand } from "@aws-sdk/client-s3";
import { randomUUID } from "crypto";
import sharp from "sharp";
import s3Client from "../clients/s3-client";

interface UploadCategoryBannerOptions {
  file: Buffer;
  fileName?: string;
  folder?: string;
}

export async function uploadCategoryBanner({
  file,
  fileName,
  folder = process.env.AWS_S3_CATEGORIES_FOLDER || "categories",
}: UploadCategoryBannerOptions) {
  // ---------------------------------------------------------
  // 1. Basic buffer validation
  // ---------------------------------------------------------

  if (!Buffer.isBuffer(file)) {
    throw new Error("Uploaded cover image is not a valid Buffer.");
  }

  if (file.length === 0) {
    throw new Error("Uploaded cover image is empty.");
  }

  // ---------------------------------------------------------
  // 2. Verify original image with Sharp
  // ---------------------------------------------------------

  let metadata;

  try {
    metadata = await sharp(file).metadata();
  } catch (error) {
    console.error("Sharp could not read cover image:", error);
    throw new Error(
      "The uploaded cover file is not a valid or supported image.",
    );
  }

  if (!metadata.format) {
    throw new Error("Unable to detect the cover image format.");
  }

  if (!metadata.width || !metadata.height) {
    throw new Error("Unable to detect the cover image dimensions.");
  }

  console.log("Category cover detected:", {
    format: metadata.format,
    width: metadata.width,
    height: metadata.height,
    size: file.length,
  });

  // ---------------------------------------------------------
  // 3. Reject SVG (security — no scripting in covers)
  // ---------------------------------------------------------

  if (metadata.format === "svg") {
    throw new Error("SVG files are not supported for cover images.");
  }

  // ---------------------------------------------------------
  // 4. Process image → 1600 × 900 (16:9) WebP
  // ---------------------------------------------------------

  let processedImage: Buffer;

  try {
    processedImage = await sharp(file)
      // Respect EXIF orientation (phone photos)
      .rotate()

      // 16:9 landscape crop for hero banner
      .resize(1600, 900, {
        fit: "cover",
        position: "center",
      })

      // Optimized WebP
      .webp({
        quality: 88,
        effort: 4,
      })

      .toBuffer();
  } catch (error) {
    console.error("Category cover processing failed:", error);
    throw new Error("Failed to process the cover image.");
  }

  if (!processedImage || processedImage.length === 0) {
    throw new Error("Category cover processing produced an empty image.");
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
    : "category-cover";

  const finalFileName = `${cleanFileName}-${uniqueId}.webp`;

  // ---------------------------------------------------------
  // 6. S3 key
  // ---------------------------------------------------------

  const key = `${folder}/covers/${finalFileName}`;

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
    console.error("Category cover S3 upload failed:", error);
    throw new Error("Failed to upload the cover image to storage.");
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
    width: 1600,
    height: 900,
    format: "webp",
  };
}