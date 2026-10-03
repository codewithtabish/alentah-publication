import { uploadOgImage } from "@/lib/images/upload-og-image";

export type UploadGeneratedOgResult = {
  url: string;
  key: string;
  width: number;
  height: number;
  format: string;
};

/**
 * Takes an AI-generated image URL and uploads it
 * through the existing OG image pipeline.
 *
 * Flow:
 * AI image URL
 * → fetch
 * → Buffer
 * → Sharp
 * → S3
 * → CloudFront URL
 */
export async function uploadGeneratedOg(
  imageUrl: string,
  fileName: string,
): Promise<UploadGeneratedOgResult> {
  if (!imageUrl || typeof imageUrl !== "string") {
    throw new Error("A valid AI-generated OG image URL is required.");
  }

  if (!fileName || typeof fileName !== "string") {
    throw new Error("A valid OG file name is required.");
  }

  let parsedUrl: URL;

  try {
    parsedUrl = new URL(imageUrl);
  } catch {
    throw new Error("The AI-generated OG image URL is invalid.");
  }

  if (!["http:", "https:"].includes(parsedUrl.protocol)) {
    throw new Error("The AI-generated OG image URL must use HTTP or HTTPS.");
  }

  console.log("[AI OG] Downloading generated image:", imageUrl);

  const response = await fetch(imageUrl, {
    method: "GET",
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(
      `Failed to download AI-generated OG image. HTTP ${response.status}.`,
    );
  }

  const arrayBuffer = await response.arrayBuffer();

  if (arrayBuffer.byteLength === 0) {
    throw new Error("The AI-generated OG image is empty.");
  }

  const buffer = Buffer.from(arrayBuffer);

  console.log("[AI OG] Image downloaded:", {
    bytes: buffer.length,
    contentType: response.headers.get("content-type"),
  });

  const result = await uploadOgImage({
    file: buffer,
    fileName,
  });

  console.log("[AI OG] Uploaded successfully:", {
    url: result.url,
    key: result.key,
    width: result.width,
    height: result.height,
    format: result.format,
  });

  return result;
}