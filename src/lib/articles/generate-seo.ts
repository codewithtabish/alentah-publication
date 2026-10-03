// src/lib/actions/blog/generate-seo.ts

// ============================================================
// SEO Generator — ALENTAH
// ============================================================
//
// Uses Google Gemini through the modern @google/genai SDK.
//
// Designed for:
// - Gemini API free tier
// - Lightweight SEO generation
// - Retry on temporary 429/5xx errors
// - No unnecessary model switching
// - Safe fallback when Gemini is unavailable
//
// ============================================================

import { GoogleGenAI } from "@google/genai";

// ============================================================
// CONFIG
// ============================================================

// Lightweight model for SEO generation.
//
// Google currently lists Gemini 3.5 Flash-Lite as a stable,
// cost-efficient Flash model suitable for high-throughput tasks.
const GEMINI_MODEL = "gemini-3.5-flash-lite";

const MAX_RETRIES = 2;

const gemini = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY ?? "",
});

// ============================================================
// TYPES
// ============================================================

export type SEOResult = {
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  excerpt: string;
};

// ============================================================
// UTILS
// ============================================================

function sleep(ms: number) {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });
}

function getErrorStatus(
  error: unknown,
): number | undefined {
  if (
    typeof error !== "object" ||
    error === null
  ) {
    return undefined;
  }

  if (
    "status" in error &&
    typeof error.status === "number"
  ) {
    return error.status;
  }

  if (
    "code" in error &&
    typeof error.code === "number"
  ) {
    return error.code;
  }

  return undefined;
}

function getErrorMessage(
  error: unknown,
): string {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "string") {
    return error;
  }

  try {
    return JSON.stringify(error);
  } catch {
    return "Unknown Gemini error";
  }
}

function isRetryable(
  error: unknown,
): boolean {
  const status = getErrorStatus(error);

  if (status !== undefined) {
    return [
      429,
      500,
      502,
      503,
      504,
    ].includes(status);
  }

  const message =
    getErrorMessage(error).toLowerCase();

  return (
    message.includes("429") ||
    message.includes("500") ||
    message.includes("502") ||
    message.includes("503") ||
    message.includes("504") ||
    message.includes("service unavailable") ||
    message.includes("temporarily unavailable") ||
    message.includes("rate limit") ||
    message.includes("resource exhausted") ||
    message.includes("high demand")
  );
}

function cleanJsonText(
  text: string,
): string {
  return text
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
}

// ============================================================
// FALLBACK
// ============================================================

export function createFallbackSEO(
  title: string,
  contentText: string,
): SEOResult {
  const cleanTitle = title.trim();

  const plainText = contentText
    .replace(/\s+/g, " ")
    .trim();

  const metaDescription =
    plainText.length > 155
      ? `${plainText
          .slice(0, 152)
          .trim()}...`
      : plainText || cleanTitle;

  const excerpt =
    plainText.length > 220
      ? `${plainText
          .slice(0, 217)
          .trim()}...`
      : plainText || cleanTitle;

  const keywords = cleanTitle
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .split(/\s+/)
    .filter(
      (word) => word.length > 3,
    )
    .slice(0, 8);

  return {
    metaTitle:
      cleanTitle.length > 60
        ? `${cleanTitle
            .slice(0, 57)
            .trim()}...`
        : cleanTitle,

    metaDescription,

    keywords,

    excerpt,
  };
}

// ============================================================
// MAIN — GENERATE SEO
// ============================================================

export async function generateSEO(
  title: string,
  contentText: string,
): Promise<SEOResult> {
  const fallback =
    createFallbackSEO(
      title,
      contentText,
    );

  // ----------------------------------------------------------
  // API KEY CHECK
  // ----------------------------------------------------------

  if (!process.env.GEMINI_API_KEY) {
    console.warn(
      "[Gemini SEO] GEMINI_API_KEY missing → using fallback",
    );

    return fallback;
  }

  // ----------------------------------------------------------
  // PROMPT
  // ----------------------------------------------------------

  const prompt = `
You are the SEO editor for Alentah, a modern editorial publication.

Analyze the article below and generate concise SEO metadata.

ARTICLE TITLE:
${title}

ARTICLE CONTENT:
${contentText.slice(0, 3500)}

Generate:

1. metaTitle
2. metaDescription
3. keywords
4. excerpt

Requirements:

metaTitle:
- 50-60 characters when possible
- Clear and natural
- Include the primary topic
- No clickbait

metaDescription:
- Around 140-160 characters
- Accurate and informative
- Describe the article clearly
- Do not invent information

keywords:
- 5-10 relevant search terms
- No duplicate keywords
- Natural phrases only

excerpt:
- 1-2 concise editorial sentences
- Summarize the article
- Do not invent information

Return ONLY JSON.

Do not return Markdown.
Do not return code fences.
Do not return explanations.
`;

  // ==========================================================
  // RETRY LOOP
  // ==========================================================

  for (
    let attempt = 0;
    attempt <= MAX_RETRIES;
    attempt++
  ) {
    try {
      console.log(
        `[Gemini SEO] ${GEMINI_MODEL} attempt ${
          attempt + 1
        }/${MAX_RETRIES + 1}`,
      );

      const response =
        await gemini.models.generateContent({
          model: GEMINI_MODEL,

          contents: prompt,

          config: {
            responseMimeType:
              "application/json",

            responseSchema: {
              type: "object",

              properties: {
                metaTitle: {
                  type: "string",
                },

                metaDescription: {
                  type: "string",
                },

                keywords: {
                  type: "array",

                  items: {
                    type: "string",
                  },
                },

                excerpt: {
                  type: "string",
                },
              },

              required: [
                "metaTitle",
                "metaDescription",
                "keywords",
                "excerpt",
              ],
            },

            temperature: 0.3,

            maxOutputTokens: 400,
          },
        });

      // --------------------------------------------------------
      // RESPONSE
      // --------------------------------------------------------

      const raw =
        response.text?.trim();

      if (!raw) {
        throw new Error(
          "Gemini returned an empty response.",
        );
      }

      // --------------------------------------------------------
      // PARSE JSON
      // --------------------------------------------------------

      let parsed: Partial<SEOResult>;

      try {
        parsed = JSON.parse(
          cleanJsonText(raw),
        ) as Partial<SEOResult>;
      } catch (parseError) {
        console.warn(
          "[Gemini SEO] Invalid JSON response.",
          {
            error:
              parseError instanceof Error
                ? parseError.message
                : String(parseError),

            raw: raw.slice(0, 300),
          },
        );

        throw new Error(
          "Gemini returned invalid JSON.",
        );
      }

      // --------------------------------------------------------
      // VALIDATE RESULT
      // --------------------------------------------------------

      const keywords =
        Array.isArray(
          parsed.keywords,
        )
          ? parsed.keywords
              .filter(
                (
                  keyword,
                ): keyword is string =>
                  typeof keyword ===
                    "string" &&
                  keyword.trim().length >
                    0,
              )
              .map((keyword) =>
                keyword.trim(),
              )
              .filter(
                (
                  keyword,
                  index,
                  array,
                ) =>
                  array.indexOf(
                    keyword,
                  ) === index,
              )
              .slice(0, 10)
          : fallback.keywords;

      const result: SEOResult = {
        metaTitle:
          typeof parsed.metaTitle ===
            "string" &&
          parsed.metaTitle.trim()
            ? parsed.metaTitle.trim()
            : fallback.metaTitle,

        metaDescription:
          typeof parsed.metaDescription ===
            "string" &&
          parsed.metaDescription.trim()
            ? parsed.metaDescription.trim()
            : fallback.metaDescription,

        keywords,

        excerpt:
          typeof parsed.excerpt ===
            "string" &&
          parsed.excerpt.trim()
            ? parsed.excerpt.trim()
            : fallback.excerpt,
      };

      // --------------------------------------------------------
      // SUCCESS
      // --------------------------------------------------------

      console.log(
        `[Gemini SEO] ✓ Generated successfully with ${GEMINI_MODEL}`,
      );

      return result;
    } catch (error) {
      const status =
        getErrorStatus(error);

      const message =
        getErrorMessage(error);

      console.warn(
        `[Gemini SEO] ${GEMINI_MODEL} attempt ${
          attempt + 1
        }/${MAX_RETRIES + 1} failed`,
        {
          status,
          message:
            message.slice(0, 200),
        },
      );

      // --------------------------------------------------------
      // LAST ATTEMPT
      // --------------------------------------------------------

      if (
        attempt === MAX_RETRIES
      ) {
        break;
      }

      // --------------------------------------------------------
      // NON-RETRYABLE ERROR
      // --------------------------------------------------------

      if (!isRetryable(error)) {
        console.warn(
          "[Gemini SEO] Non-retryable error → using fallback",
        );

        break;
      }

      // --------------------------------------------------------
      // EXPONENTIAL BACKOFF
      // --------------------------------------------------------

      const delay = Math.min(
        1000 *
          2 ** attempt,
        5000,
      );

      console.log(
        `[Gemini SEO] Retrying in ${delay}ms...`,
      );

      await sleep(delay);
    }
  }

  // ==========================================================
  // FALLBACK
  // ==========================================================

  console.warn(
    `[Gemini SEO] ${GEMINI_MODEL} unavailable → using fallback`,
  );

  return fallback;
}