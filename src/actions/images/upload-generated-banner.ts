import { uploadBannerImage } from "@/lib/images/upload-banner-image";

export type UploadGeneratedBannerResult = {
  url: string;
  key: string;
  width: number;
  height: number;
  format: string;
};

/**
 * Takes an AI-generated image URL and uploads it
 * through the existing banner image pipeline.
 *
 * Flow:
 * AI image URL
 * → fetch
 * → Buffer
 * → Sharp
 * → S3
 * → CloudFront URL
 */
export async function uploadGeneratedBanner(
  imageUrl: string,
  fileName: string,
): Promise<UploadGeneratedBannerResult> {
  if (!imageUrl || typeof imageUrl !== "string") {
    throw new Error("A valid AI-generated banner image URL is required.");
  }

  if (!fileName || typeof fileName !== "string") {
    throw new Error("A valid banner file name is required.");
  }

  let parsedUrl: URL;

  try {
    parsedUrl = new URL(imageUrl);
  } catch {
    throw new Error("The AI-generated banner image URL is invalid.");
  }

  if (!["http:", "https:"].includes(parsedUrl.protocol)) {
    throw new Error("The AI-generated banner image URL must use HTTP or HTTPS.");
  }

  console.log("[AI Banner] Downloading generated image:", imageUrl);

  const response = await fetch(imageUrl, {
    method: "GET",
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(
      `Failed to download AI-generated banner image. HTTP ${response.status}.`,
    );
  }

  const arrayBuffer = await response.arrayBuffer();

  if (arrayBuffer.byteLength === 0) {
    throw new Error("The AI-generated banner image is empty.");
  }

  const buffer = Buffer.from(arrayBuffer);

  console.log("[AI Banner] Image downloaded:", {
    bytes: buffer.length,
    contentType: response.headers.get("content-type"),
  });

  const result = await uploadBannerImage({
    file: buffer,
    fileName,
  });

  console.log("[AI Banner] Uploaded successfully:", {
    url: result.url,
    key: result.key,
    width: result.width,
    height: result.height,
    format: result.format,
  });

  return result;
}