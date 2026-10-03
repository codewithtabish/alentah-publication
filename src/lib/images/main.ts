// src/lib/images/main.ts

import { uploadGeneratedBanner } from "@/actions/images/upload-generated-banner";
import { uploadGeneratedOg } from "@/actions/images/upload-generated-og";


const HIVE_API_KEY = process.env.HIVE_API_KEY;

if (!HIVE_API_KEY) {
  throw new Error("HIVE_API_KEY is missing from .env");
}

const MODEL = "hive/flux-schnell-enhanced";

const editorialPrompt = `
Premium photorealistic editorial photograph.

AI robotics.

A sophisticated humanoid robot working alongside advanced robotic machinery
inside a modern robotics research laboratory.

High-end international magazine photography.
Photorealistic.
Cinematic.
Sophisticated.
Credible.
Premium.
Timeless.

Contemporary laboratory architecture with deep warm-brown accents,
graphite, silver, glass and neutral materials.

Make the deep warm-brown color clearly visible as a refined visual accent
throughout the laboratory environment.

Natural realistic lighting.
Cinematic depth.
Professional photographic composition.
Clear primary subject.
Realistic reflections.
Tasteful negative space.

Elegant international technology publication aesthetic.
`.trim();

const requestBody = {
  input: {
    prompt: editorialPrompt,
    num_images: 1,
  },
};

type HiveImage = {
  url?: string;
};

type HiveResponse = {
  id?: string;
  model?: string;
  version?: string;
  input?: {
    prompt?: string;
    num_images?: number;
    image_size?: {
      width?: number;
      height?: number;
    };
    num_inference_steps?: number;
    seed?: number;
    output_format?: string;
    output_quality?: number;
  };
  output?: HiveImage[];
};

async function generateHiveImage(): Promise<HiveResponse> {
  console.log("\n========================================");
  console.log("ALENTA.COM — HIVE IMAGE GENERATION");
  console.log("========================================");
  console.log("Model:", MODEL);
  console.log("Images requested: 1");
  console.log("Configuration: Hive defaults");
  console.log("========================================\n");

  console.log("Sending request to Hive...\n");

  const response = await fetch(
    `https://api.thehive.ai/api/v3/${MODEL}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${HIVE_API_KEY}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(requestBody),
    },
  );

  const text = await response.text();

  console.log("HIVE HTTP STATUS:", response.status);

  if (!response.ok) {
    console.error("\n========================================");
    console.error("HIVE ERROR");
    console.error("========================================");
    console.error(text);

    throw new Error(
      `Hive request failed with HTTP ${response.status}`,
    );
  }

  let data: HiveResponse;

  try {
    data = JSON.parse(text) as HiveResponse;
  } catch {
    throw new Error("Hive returned invalid JSON.");
  }

  if (!Array.isArray(data.output) || data.output.length === 0) {
    throw new Error("Hive did not return any generated image.");
  }

  return data;
}

async function uploadGeneratedImage(
  hiveData: HiveResponse,
) {
  const imageUrl = hiveData.output?.[0]?.url;

  if (!imageUrl) {
    throw new Error("Hive did not return a valid image URL.");
  }

  console.log("\n========================================");
  console.log("HIVE IMAGE");
  console.log("========================================");

  console.log("\nMASTER IMAGE SOURCE:");
  console.log(imageUrl);

  console.log("\n========================================");
  console.log("UPLOADING TO S3 / CLOUDFRONT");
  console.log("========================================");

  const generationId = hiveData.id ?? String(Date.now());

  /*
   * We generate only ONE AI image.
   *
   * The same master image is sent to both pipelines:
   *
   * 1. Banner → 1600 × 900 WebP
   * 2. OG     → 1200 × 630 WebP
   *
   * Both uploads happen in parallel.
   */
  const [banner, og] = await Promise.all([
    uploadGeneratedBanner(
      imageUrl,
      `alenta-ai-banner-${generationId}.png`,
    ),

    uploadGeneratedOg(
      imageUrl,
      `alenta-ai-og-${generationId}.png`,
    ),
  ]);

  return {
    sourceImage: imageUrl,
    banner,
    og,
  };
}

async function main() {
  try {
    const hiveData = await generateHiveImage();

    console.log("\n========================================");
    console.log("HIVE GENERATION SUCCESS");
    console.log("========================================");

    console.log("Generation ID:", hiveData.id ?? "unknown");
    console.log("Model:", hiveData.model ?? MODEL);

    if (hiveData.input) {
      console.log("\nHive configuration:");
      console.log(JSON.stringify(hiveData.input, null, 2));
    }

    const uploaded = await uploadGeneratedImage(hiveData);

    console.log("\n========================================");
    console.log("ALENTA IMAGE PIPELINE COMPLETE");
    console.log("========================================");

    console.log("\nMASTER SOURCE IMAGE:");
    console.log(uploaded.sourceImage);

    console.log("\nBANNER IMAGE:");
    console.log(JSON.stringify(uploaded.banner, null, 2));

    console.log("\nOG IMAGE:");
    console.log(JSON.stringify(uploaded.og, null, 2));

    console.log("\n========================================");
    console.log("FINAL IMAGE DATA");
    console.log("========================================");

    const result = {
      generationId: hiveData.id ?? null,
      model: hiveData.model ?? MODEL,

      sourceImage: uploaded.sourceImage,

      banner: {
        url: uploaded.banner.url,
        key: uploaded.banner.key,
        width: uploaded.banner.width,
        height: uploaded.banner.height,
        format: uploaded.banner.format,
      },

      og: {
        url: uploaded.og.url,
        key: uploaded.og.key,
        width: uploaded.og.width,
        height: uploaded.og.height,
        format: uploaded.og.format,
      },
    };

    console.log(JSON.stringify(result, null, 2));

    console.log("\n========================================");
    console.log("DONE");
    console.log("========================================\n");

    return result;
  } catch (error: unknown) {
    console.error("\n========================================");
    console.error("IMAGE PIPELINE FAILED");
    console.error("========================================");

    if (error instanceof Error) {
      console.error(error.message);
      console.error("\nStack:");
      console.error(error.stack);
    } else {
      console.error(error);
    }

    process.exit(1);
  }
}

void main();