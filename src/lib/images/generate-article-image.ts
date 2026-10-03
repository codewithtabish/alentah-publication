const HIVE_API_URL = "https://api.thehive.ai/api/v3";

const DEFAULT_MODEL =
  process.env.HIVE_IMAGE_MODEL || "hive/flux-schnell-enhanced";

const ALENTAH_PRIMARY = "oklch(0.4341 0.0392 41.9938)";

type GenerateArticleImageOptions = {
  title: string;
  shortDescription: string;
  visualDirection?: string;
  width?: number;
  height?: number;
  seed?: number;
};

type HiveImageResponse = {
  id?: string;
  model?: string;
  version?: string;
  input?: unknown;
  output?: Array<{
    url?: string;
  }>;
  return_code?: number;
  status_code?: number;
  message?: string;
  data?: unknown;
};

export type GenerateArticleImageResult = {
  url: string;
  model: string;
  width: number;
  height: number;
  prompt: string;
};

function buildEditorialImagePrompt({
  title,
  shortDescription,
  visualDirection,
}: GenerateArticleImageOptions): string {
  return `
Create a premium photorealistic editorial photograph for ALENTAH.

ARTICLE TITLE:
${title}

ARTICLE DESCRIPTION:
${shortDescription}

VISUAL DIRECTION:
${visualDirection || "Create the strongest visual interpretation of the article topic."}

Create a sophisticated cinematic photograph suitable for a premium international publication.

The image should feel intelligent, modern, sophisticated, credible, realistic, cinematic, premium, editorial, and timeless.

Use a subtle warm-brown editorial character inspired by the ALENTAH brand color:
${ALENTAH_PRIMARY}

Use the warm-brown influence naturally through lighting, shadows, materials, environmental tones, and subtle color grading.

Do not make the image entirely brown.
Do not make it monochromatic.
Do not use a heavy brown filter.
Keep realistic natural colors.

Create a strong magazine-quality composition with one clear primary subject, realistic perspective, cinematic depth, natural lighting, sophisticated contrast, and tasteful negative space.

Use high-end editorial photography aesthetics, realistic materials, natural textures, physically believable lighting, realistic reflections and shadows, subtle depth of field, and professional photographic framing.

Do not include text, headlines, logos, watermarks, captions, UI elements, typography, posters, advertisements, or product-listing layouts.

Avoid cartoon, anime, illustration, cheap stock photography, oversaturation, excessive neon, distorted objects, plastic surfaces, artificial HDR, extreme lens effects, visual clutter, and generic AI-art appearance.

The final image should look like a professionally commissioned editorial photograph created specifically for ALENTAH.
`.trim();
}

export async function generateArticleImage(
  options: GenerateArticleImageOptions,
): Promise<GenerateArticleImageResult> {
  const apiKey = process.env.HIVE_API_KEY;

  if (!apiKey) {
    throw new Error(
      "HIVE_API_KEY is not configured. Add it to your .env file.",
    );
  }

  const title = options.title?.trim();
  const shortDescription = options.shortDescription?.trim();

  if (!title) {
    throw new Error("Article title is required to generate an image.");
  }

  if (!shortDescription) {
    throw new Error(
      "Article short description is required to generate an image.",
    );
  }

  const width = options.width ?? 1344;
  const height = options.height ?? 768;

  const prompt = buildEditorialImagePrompt(options);

  /*
   * Keep this request intentionally minimal.
   *
   * Hive's V3 documentation supports these core fields:
   * - prompt
   * - image_size
   * - num_inference_steps
   * - num_images
   *
   * We will add JPEG/output-quality settings after the
   * first successful generation.
   */
  const input: Record<string, unknown> = {
    prompt,
    image_size: {
      width,
      height,
    },
    num_inference_steps: 15,
    num_images: 1,
  };

  if (typeof options.seed === "number") {
    input.seed = options.seed;
  }

  const requestBody = {
    input,
  };

  console.log("\n========================================");
  console.log("ALENTAH AI IMAGE GENERATION");
  console.log("========================================");
  console.log("Model:", DEFAULT_MODEL);
  console.log("Title:", title);
  console.log("Size:", `${width}x${height}`);
  console.log("Steps:", 15);
  console.log("Images:", 1);
  console.log("========================================\n");

  console.log("[ALENTAH AI Image] Request body:");

  console.log(
    JSON.stringify(
      requestBody,
      null,
      2,
    ),
  );

  console.log("\n[ALENTAH AI Image] Sending request to Hive...");

  let response: Response;

  try {
    response = await fetch(`${HIVE_API_URL}/${DEFAULT_MODEL}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(requestBody),
    });
  } catch (error) {
    console.error(
      "[ALENTAH AI Image] Network request failed:",
      error,
    );

    throw new Error(
      "Could not connect to Hive. Check your internet connection and Hive API availability.",
    );
  }

  const rawResponse = await response.text();

  console.log("\n[ALENTAH AI Image] HTTP Status:", response.status);

  let data: HiveImageResponse;

  try {
    data = JSON.parse(rawResponse) as HiveImageResponse;
  } catch {
    console.error(
      "[ALENTAH AI Image] Non-JSON response:",
    );

    console.error(rawResponse);

    throw new Error(
      `Hive returned an invalid response. HTTP ${response.status}.`,
    );
  }

  if (!response.ok) {
    console.error(
      "\n[ALENTAH AI Image] Hive request failed:",
    );

    console.error(
      JSON.stringify(
        data,
        null,
        2,
      ),
    );

    throw new Error(
      data.message ||
        `Hive image generation failed with HTTP ${response.status}.`,
    );
  }

  if (
    typeof data.return_code === "number" &&
    data.return_code !== 0
  ) {
    console.error(
      "\n[ALENTAH AI Image] Hive returned an error:",
    );

    console.error(
      JSON.stringify(
        data,
        null,
        2,
      ),
    );

    throw new Error(
      data.message ||
        `Hive image generation failed with return code ${data.return_code}.`,
    );
  }

  const imageUrl = data.output?.[0]?.url;

  if (!imageUrl) {
    console.error(
      "\n[ALENTAH AI Image] No image URL returned.",
    );

    console.error(
      JSON.stringify(
        data,
        null,
        2,
      ),
    );

    throw new Error(
      "Hive processed the request but did not return an image URL.",
    );
  }

  const model = data.model || DEFAULT_MODEL;

  console.log("\n========================================");
  console.log("ALENTAH AI IMAGE GENERATED");
  console.log("========================================");
  console.log("Model:", model);
  console.log("Image URL:", imageUrl);
  console.log("Width:", width);
  console.log("Height:", height);
  console.log("========================================\n");

  return {
    url: imageUrl,
    model,
    width,
    height,
    prompt,
  };
}