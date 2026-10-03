// src/agent/generate-article.ts

import Exa from "exa-js";
import Cerebras from "@cerebras/cerebras_cloud_sdk";

/* =========================================================
   TYPES
========================================================= */

export type GenerateArticleInput = {
  title: string;
  shortDescription: string;
  category?: string;
  subcategory?: string;
  editorialFocus?: string;
  audience?: string;
  language?: string;
};

export type ArticleSource = {
  title: string;
  url: string;
  publisher: string;
  publishedAt?: string;
  accessedAt?: string;
};

export type ArticleImagePlan = {
  placement: "hero" | "section";
  sectionId?: string;
  prompt: string;
  alt: string;
  caption?: string;
};

export type ArticleSection = {
  id: string;
  level: 2 | 3;
  title: string;
  html: string;
  image?: ArticleImagePlan;
  hasTable: boolean;
  hasTabs: boolean;
  hasCode: boolean;
  hasDiagram: boolean;
};

export type GeneratedArticle = {
  title: string;
  shortDescription: string;
  category: string;
  subcategory?: string;
  slug: string;
  excerpt: string;
  readingTimeMinutes: number;
  html: string;
  tableOfContents: Array<{
    id: string;
    title: string;
    level: 2 | 3;
  }>;
  sections: ArticleSection[];
  heroImage: ArticleImagePlan;
  sectionImages: ArticleImagePlan[];
  seo: {
    metaTitle: string;
    metaDescription: string;
    keywords: string[];
  };
  sources: ArticleSource[];
  researchSummary: string[];
  editorNotes: string[];
};

/* =========================================================
   RESEARCH TYPES
========================================================= */

type ResearchFinding = {
  claim: string;
  evidence: string;
  sourceTitle: string;
  sourceUrl: string;
  publisher: string;
  publishedAt?: string;
  importance: "high" | "medium" | "low";
};

type ResearchDossier = {
  topic: string;
  centralQuestion: string;

  keyFacts: ResearchFinding[];

  importantNumbers: Array<{
    metric: string;
    value: string;
    context: string;
    sourceTitle: string;
    sourceUrl: string;
  }>;

  importantDevelopments: Array<{
    development: string;
    date?: string;
    significance: string;
    sourceTitle: string;
    sourceUrl: string;
  }>;

  competingPerspectives: Array<{
    perspective: string;
    explanation: string;
    sourceTitle?: string;
    sourceUrl?: string;
  }>;

  terminology: Array<{
    term: string;
    definition: string;
  }>;

  usefulExamples: Array<{
    example: string;
    explanation: string;
    sourceTitle?: string;
    sourceUrl?: string;
  }>;

  sourceList: ArticleSource[];

  researchWarnings: string[];
};

/* =========================================================
   FACT-CHECK TYPES
========================================================= */

type FlaggedClaim = {
  sentence: string;
  reason: string;
  severity: "high" | "medium" | "low";
};

type FactCheckResult = {
  flaggedClaims: FlaggedClaim[];
  overallRisk: "low" | "medium" | "high";
  summary: string;
};

/* =========================================================
   INTERNAL TYPES
========================================================= */

type ArticleDraft = {
  title?: unknown;
  shortDescription?: unknown;
  category?: unknown;
  subcategory?: unknown;
  slug?: unknown;
  excerpt?: unknown;
  sections?: unknown;
  heroImage?: unknown;
  seo?: unknown;
};

type ExaSearchResult = {
  title?: unknown;
  url?: unknown;
  publishedDate?: unknown;
  author?: unknown;
  highlights?: unknown;
  text?: unknown;
};

type WebResearchItem = {
  title: string;
  url: string;
  publisher: string;
  publishedAt?: string;
  author?: string;
  highlights: string[];
};

/* =========================================================
   ENVIRONMENT
========================================================= */

const EXA_API_KEY = process.env.EXA_API_KEY;

const CEREBRAS_API_KEY =
  process.env.CEREBRAS_API_KEY;

const CEREBRAS_MODEL =
  process.env.CEREBRAS_EDITORIAL_MODEL ||
  "gpt-oss-120b";

if (!EXA_API_KEY) {
  throw new Error(
    "Missing EXA_API_KEY environment variable.",
  );
}

if (!CEREBRAS_API_KEY) {
  throw new Error(
    "Missing CEREBRAS_API_KEY environment variable.",
  );
}

/* =========================================================
   CLIENTS
========================================================= */

const exa = new Exa(EXA_API_KEY);

const cerebras = new Cerebras({
  apiKey: CEREBRAS_API_KEY,
  maxRetries: 0,
});

/* =========================================================
   RATE LIMITERS
========================================================= */

class RateLimiter {
  private readonly minIntervalMs: number;
  private lastCallAt = 0;
  private chain: Promise<void> =
    Promise.resolve();

  constructor(minIntervalMs: number) {
    this.minIntervalMs = minIntervalMs;
  }

  async acquire(): Promise<void> {
    let release!: () => void;

    const previous = this.chain;

    this.chain = new Promise<void>(
      (resolve) => {
        release = resolve;
      },
    );

    await previous;

    const now = Date.now();
    const elapsed = now - this.lastCallAt;

    if (elapsed < this.minIntervalMs) {
      await sleep(
        this.minIntervalMs - elapsed,
      );
    }

    this.lastCallAt = Date.now();

    release();
  }
}

const exaLimiter = new RateLimiter(250);

const cerebrasLimiter =
  new RateLimiter(70000);

/* =========================================================
   ARTICLE QUALITY CONSTANTS
   ---------------------------------------------------------
   Sections are ADAPTIVE, not fixed.

   The AI decides the exact number of sections based on
   the complexity of the topic:

     • simple topic → ~14 sections
     • medium topic → ~16 sections
     • complex topic → ~18 sections

   The pipeline enforces the range, but does not force
   a fixed count.
========================================================= */

const MAX_EXA_SOURCES = 22;

const MAX_HIGHLIGHTS_PER_SOURCE = 4;

const MAX_HIGHLIGHT_CHARS = 900;

const MIN_ARTICLE_SECTIONS = 14;

const MAX_ARTICLE_SECTIONS = 18;

const MIN_SECTION_WORDS = 200;

const MIN_INTRO_WORDS = 200;

const MIN_CONCLUSION_WORDS = 200;

const MIN_SUMMARY_WORDS = 200;

const MIN_TOTAL_ARTICLE_WORDS = 3500;

const TARGET_TOTAL_ARTICLE_WORDS = 7000;

const ARTICLE_CALL_MAX_TOKENS = 14000;

const DOSSIER_CALL_MAX_TOKENS = 14000;

const FACT_CHECK_MAX_TOKENS = 6000;

/* =========================================================
   BASIC HELPERS
========================================================= */

function cleanText(value: unknown): string {
  if (typeof value !== "string") {
    return "";
  }

  return value
    .replace(/\s+/g, " ")
    .trim();
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) =>
    setTimeout(resolve, ms),
  );
}

function slugify(value: string): string {
  return cleanText(value)
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function escapeHtmlAttribute(
  value: string,
): string {
  return escapeHtml(value);
}

function normalizeUrl(value: unknown): string {
  if (typeof value !== "string") {
    return "";
  }

  const raw = value.trim();

  if (!raw) {
    return "";
  }

  try {
    const url = new URL(raw);

    if (
      url.protocol !== "https:" &&
      url.protocol !== "http:"
    ) {
      return "";
    }

    return url.toString();
  } catch {
    return "";
  }
}

function normalizeHttpsUrl(
  value: unknown,
): string {
  const url = normalizeUrl(value);

  if (!url) {
    return "";
  }

  try {
    const parsed = new URL(url);

    if (parsed.protocol !== "https:") {
      return "";
    }

    return parsed.toString();
  } catch {
    return "";
  }
}

function urlMatchKey(value: unknown): string {
  const normalized = normalizeUrl(value);

  if (!normalized) {
    return "";
  }

  try {
    const parsed = new URL(normalized);

    parsed.hash = "";
    parsed.protocol = "https:";

    let text = parsed
      .toString()
      .toLowerCase()
      .replace(/\/+$/, "");

    text = text.replace(/^https:\/\//, "");
    text = text.replace(/^www\./, "");

    return text;
  } catch {
    return "";
  }
}

function publisherFromUrl(url: string): string {
  try {
    return new URL(url)
      .hostname
      .replace(/^www\./, "");
  } catch {
    return "Web source";
  }
}

/* =========================================================
   HTML → PLAIN TEXT
========================================================= */

function htmlToPlainText(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<pre[\s\S]*?<\/pre>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&#x27;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function countWords(html: string): number {
  const text = htmlToPlainText(html);

  if (!text) {
    return 0;
  }

  return text.split(/\s+/).filter(Boolean).length;
}

function countParagraphs(html: string): number {
  return (html.match(/<p\b[^>]*>/gi) || []).length;
}

function calculateReadingTime(html: string): number {
  const words = countWords(html);

  if (!words) {
    return 1;
  }

  return Math.max(1, Math.ceil(words / 220));
}

/* =========================================================
   SAFE HTML HELPERS
========================================================= */

function escapeTagsInsidePreBlocks(
  html: string,
): string {
  return html.replace(
    /<pre\b([^>]*)>([\s\S]*?)<\/pre>/gi,
    (
      match,
      attributes: string,
      inner: string,
    ) => {
      const escaped = inner
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");

      return `<pre${attributes}>${escaped}</pre>`;
    },
  );
}

function stripPreBlocks(html: string): string {
  return html.replace(
    /<pre\b[^>]*>[\s\S]*?<\/pre>/gi,
    "",
  );
}

function removeUnsafeScriptTags(
  html: string,
): string {
  return html
    .replace(
      /<script\b[^>]*>[\s\S]*?<\/script>/gi,
      "",
    )
    .replace(/<\/?script\b[^>]*>/gi, "");
}

/* =========================================================
   JSON HELPERS
========================================================= */

function safeJsonParse<T>(
  value: string,
  label: string,
): T {
  const cleaned = value
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  try {
    return JSON.parse(cleaned) as T;
  } catch {
    throw new Error(
      `${label} returned invalid JSON.\n\nResponse:\n${cleaned.slice(
        0,
        5000,
      )}`,
    );
  }
}

/* =========================================================
   CEREBRAS RESPONSE
========================================================= */

function extractCerebrasText(
  response: unknown,
): string {
  const choices = (
    response as {
      choices?: unknown;
    }
  )?.choices;

  if (!Array.isArray(choices)) {
    throw new Error(
      "Cerebras returned a response without a valid choices array.",
    );
  }

  const firstChoice = choices[0] as
    | {
        message?: {
          content?: unknown;
        };
      }
    | undefined;

  const content =
    firstChoice?.message?.content;

  if (
    typeof content !== "string" ||
    !content.trim()
  ) {
    throw new Error(
      "Cerebras returned empty message content.",
    );
  }

  return content.trim();
}

/* =========================================================
   CEREBRAS CALL
========================================================= */

async function callCerebrasJson(
  systemPrompt: string,
  userPrompt: string,
  label: string,
  maxCompletionTokens = ARTICLE_CALL_MAX_TOKENS,
  attempt = 1,
): Promise<string> {
  await cerebrasLimiter.acquire();

  try {
    const response =
      await cerebras.chat.completions.create(
        {
          model: CEREBRAS_MODEL,

          messages: [
            {
              role: "system",
              content: systemPrompt,
            },
            {
              role: "user",
              content: userPrompt,
            },
          ],

          max_completion_tokens:
            maxCompletionTokens,

          response_format: {
            type: "json_object",
          },
        },
      );

    return extractCerebrasText(response);
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : String(error);

    const lower = message.toLowerCase();

    const isRateLimit =
      lower.includes("429") ||
      lower.includes("rate limit") ||
      lower.includes("tokens per minute") ||
      lower.includes("too many tokens");

    if (isRateLimit && attempt < 12) {
      const baseDelay = 70000 * attempt;

      const jitter = Math.floor(
        Math.random() * 10000,
      );

      const delay = baseDelay + jitter;

      console.warn(
        `${label} hit Cerebras rate limit. Waiting ${Math.round(
          delay / 1000,
        )}s before retry ${attempt} of 11...`,
      );

      await sleep(delay);

      return callCerebrasJson(
        systemPrompt,
        userPrompt,
        label,
        maxCompletionTokens,
        attempt + 1,
      );
    }

    throw new Error(
      `${label} failed using Cerebras model "${CEREBRAS_MODEL}": ${message}`,
    );
  }
}

/* =========================================================
   EXA SEARCH
========================================================= */

async function searchExa(
  query: string,
  numResults = 6,
  attempt = 1,
): Promise<WebResearchItem[]> {
  await exaLimiter.acquire();

  try {
    const result = await exa.search(query, {
      type: "auto",

      numResults,

      contents: {
        highlights: true,
      },
    });

    const results = Array.isArray(
      result.results,
    )
      ? result.results
      : [];

    return results
      .map((item) => {
        const source = item as ExaSearchResult;

        const title = cleanText(source.title);

        const url = normalizeHttpsUrl(
          source.url,
        );

        const highlights = Array.isArray(
          source.highlights,
        )
          ? source.highlights
              .filter(
                (value): value is string =>
                  typeof value === "string",
              )
              .map((value) => value.trim())
              .filter(Boolean)
              .slice(
                0,
                MAX_HIGHLIGHTS_PER_SOURCE,
              )
              .map((value) =>
                value.slice(
                  0,
                  MAX_HIGHLIGHT_CHARS,
                ),
              )
          : [];

        const author =
          typeof source.author === "string"
            ? cleanText(source.author)
            : undefined;

        const publishedAt =
          typeof source.publishedDate ===
          "string"
            ? cleanText(source.publishedDate)
            : undefined;

        return {
          title,
          url,
          publisher: publisherFromUrl(url),
          publishedAt,
          author,
          highlights,
        };
      })
      .filter(
        (item) =>
          Boolean(item.title) &&
          Boolean(item.url) &&
          item.highlights.length > 0,
      );
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : String(error);

    const lower = message.toLowerCase();

    const isRateLimit =
      lower.includes("rate limit") ||
      lower.includes("429") ||
      lower.includes("requests per second");

    if (isRateLimit && attempt < 10) {
      const delay =
        800 * attempt +
        Math.floor(Math.random() * 400);

      await sleep(delay);

      return searchExa(
        query,
        numResults,
        attempt + 1,
      );
    }

    console.error(
      `Exa search failed for "${query}": ${message}`,
    );

    return [];
  }
}

/* =========================================================
   DEDUPLICATE EXA RESULTS
========================================================= */

function deduplicateWebResearch(
  sources: WebResearchItem[],
): WebResearchItem[] {
  const map = new Map<
    string,
    WebResearchItem
  >();

  for (const source of sources) {
    const url = normalizeHttpsUrl(source.url);

    if (!url) {
      continue;
    }

    const key = url
      .toLowerCase()
      .replace(/\/+$/, "");

    const existing = map.get(key);

    if (!existing) {
      map.set(key, {
        ...source,

        url,

        highlights: source.highlights
          .slice(0, MAX_HIGHLIGHTS_PER_SOURCE)
          .map((text) =>
            text.slice(0, MAX_HIGHLIGHT_CHARS),
          ),
      });

      continue;
    }

    existing.highlights = Array.from(
      new Set([
        ...existing.highlights,
        ...source.highlights,
      ]),
    )
      .slice(0, MAX_HIGHLIGHTS_PER_SOURCE)
      .map((text) =>
        text.slice(0, MAX_HIGHLIGHT_CHARS),
      );
  }

  return Array.from(map.values());
}

/* =========================================================
   RESEARCH QUERIES
========================================================= */

function buildResearchQueries(
  input: GenerateArticleInput,
): string[] {
  const title = cleanText(input.title);

  const description = cleanText(
    input.shortDescription,
  );

  const today = new Date()
    .toISOString()
    .slice(0, 10);

  return [
    `${title} ${description} overview fundamentals`,

    `${title} official documentation primary sources`,

    `${title} research studies evidence academic`,

    `${title} latest developments 2025 2026`,

    `${title} statistics numbers data`,

    `${title} real world examples case studies`,

    `${title} risks limitations criticism competing perspectives`,

    `${title} practical implementation technical guide`,

    `${title} internal architecture deep dive`,

    `${title} performance optimization benchmarks`,

    `${title} historical evolution timeline`,

    `${title} common misconceptions mistakes`,

    `${title} comparison alternatives`,

    `${title} future trends predictions`,

    `${title} ${today} latest developments`,
  ];
}

/* =========================================================
   COLLECT WEB RESEARCH
========================================================= */

async function collectWebResearch(
  input: GenerateArticleInput,
): Promise<WebResearchItem[]> {
  const queries = buildResearchQueries(input);

  const results = await Promise.allSettled(
    queries.map((query) =>
      searchExa(query, 6),
    ),
  );

  const combined: WebResearchItem[] = [];

  for (const result of results) {
    if (result.status === "fulfilled") {
      combined.push(...result.value);
    }
  }

  const unique =
    deduplicateWebResearch(combined);

  if (unique.length === 0) {
    console.warn(
      "Exa returned no usable research sources. The LLM will write from its own knowledge.",
    );

    return [];
  }

  return unique.slice(0, MAX_EXA_SOURCES);
}

/* =========================================================
   SOURCE NORMALIZATION
========================================================= */

function deduplicateSources(
  sources: ArticleSource[],
): ArticleSource[] {
  const map = new Map<
    string,
    ArticleSource
  >();

  for (const source of sources) {
    const url = normalizeHttpsUrl(source.url);

    if (!url) {
      continue;
    }

    const key = url
      .toLowerCase()
      .replace(/\/+$/, "");

    if (!map.has(key)) {
      map.set(key, {
        title:
          cleanText(source.title) ||
          publisherFromUrl(url),

        url,

        publisher:
          cleanText(source.publisher) ||
          publisherFromUrl(url),

        publishedAt:
          cleanText(source.publishedAt) ||
          undefined,

        accessedAt:
          cleanText(source.accessedAt) ||
          undefined,
      });
    }
  }

  return Array.from(map.values());
}

function researchToSources(
  research: WebResearchItem[],
): ArticleSource[] {
  return deduplicateSources(
    research.map((item) => ({
      title:
        item.title ||
        publisherFromUrl(item.url),

      url: item.url,

      publisher:
        item.publisher ||
        publisherFromUrl(item.url),

      publishedAt: item.publishedAt,

      accessedAt: new Date().toISOString(),
    })),
  );
}

/* =========================================================
   RESEARCH DOSSIER
========================================================= */

async function buildResearchDossier(
  input: GenerateArticleInput,
  research: WebResearchItem[],
): Promise<ResearchDossier> {
  const researchPayload = research
    .slice(0, MAX_EXA_SOURCES)
    .map((item) => ({
      title: item.title,

      url: item.url,

      publisher: item.publisher,

      publishedAt: item.publishedAt,

      highlights: item.highlights
        .slice(0, MAX_HIGHLIGHTS_PER_SOURCE)
        .map((text) =>
          text.slice(0, MAX_HIGHLIGHT_CHARS),
        ),
    }));

  const systemPrompt = `
You are the senior research editor for ALENTA.COM.

You are building a RICH research dossier that a senior
editorial writer will use as a supporting reference.

==================================================
MOST IMPORTANT
==================================================

The dossier is a SUPPORTING reference, NOT a limit.

The writer is ALSO a domain expert and will write most
of the article from established general knowledge.

So:

- Extract as much useful detail as the research allows.
- Do NOT force every claim to have a specific URL.
- Do NOT omit a well-established concept because the
  research is thin.
- If the research is thin, use your own expert
  understanding to fill the dossier with
  well-established, general, non-controversial
  background knowledge.

You MUST NOT invent:

- statistics
- financial figures
- exact dates
- names of specific people
- names of specific companies
- names of specific studies
- quotes
- URLs

If a URL is provided for a fact, use the exact URL.
If a fact is general background knowledge, leave
sourceUrl as an empty string.

==================================================
EXACT OUTPUT FIELD NAMES
==================================================

Return ONLY valid JSON with EXACTLY these fields.

Top-level:

{
  "topic": "string",
  "centralQuestion": "string",
  "keyFacts": [],
  "importantNumbers": [],
  "importantDevelopments": [],
  "competingPerspectives": [],
  "terminology": [],
  "usefulExamples": [],
  "researchWarnings": []
}

Each keyFacts item:

{
  "claim": "string",
  "evidence": "string",
  "sourceTitle": "string",
  "sourceUrl": "string",
  "publisher": "string",
  "publishedAt": "string",
  "importance": "high"
}

Each importantNumbers item:

{
  "metric": "string",
  "value": "string",
  "context": "string",
  "sourceTitle": "string",
  "sourceUrl": "string"
}

Each importantDevelopments item:

{
  "development": "string",
  "date": "string",
  "significance": "string",
  "sourceTitle": "string",
  "sourceUrl": "string"
}

Each competingPerspectives item:

{
  "perspective": "string",
  "explanation": "string",
  "sourceTitle": "string",
  "sourceUrl": "string"
}

Each terminology item:

{
  "term": "string",
  "definition": "string"
}

Each usefulExamples item:

{
  "example": "string",
  "explanation": "string",
  "sourceTitle": "string",
  "sourceUrl": "string"
}

==================================================
TARGET QUANTITY
==================================================

Aim for:

- 25-45 keyFacts
- 8-15 importantNumbers
- 8-15 importantDevelopments
- 8-15 competingPerspectives
- 25-50 terminology items
- 12-25 usefulExamples

Return ONLY valid JSON.
`;

  const userPrompt = `
ARTICLE REQUEST

Title:
${input.title}

Short description:
${input.shortDescription}

Category:
${input.category || "Not specified"}

Subcategory:
${input.subcategory || "Not specified"}

Editorial focus:
${input.editorialFocus || "Not specified"}

Audience:
${input.audience || "General readers"}

Language:
${input.language || "English"}

CURRENT DATE:
${new Date().toISOString().slice(0, 10)}

==================================================
COMPACT EXA RESEARCH
==================================================

${JSON.stringify(researchPayload, null, 2)}
`;

  const raw = await callCerebrasJson(
    systemPrompt,
    userPrompt,
    "Research dossier generation",
    DOSSIER_CALL_MAX_TOKENS,
  );

  const dossier =
    safeJsonParse<ResearchDossier>(
      raw,
      "Research dossier",
    );

  return normalizeResearchDossier(
    dossier,
    research,
  );
}

/* =========================================================
   NORMALIZE RESEARCH DOSSIER
========================================================= */

function normalizeResearchDossier(
  value: ResearchDossier,
  research: WebResearchItem[],
): ResearchDossier {
  const allowedKeys = new Set<string>();

  const urlByKey = new Map<string, string>();

  for (const item of research) {
    const key = urlMatchKey(item.url);

    if (!key) {
      continue;
    }

    allowedKeys.add(key);

    if (!urlByKey.has(key)) {
      urlByKey.set(key, item.url);
    }
  }

  function resolveSourceUrl(
    rawUrl: unknown,
  ): string {
    const key = urlMatchKey(rawUrl);

    if (!key) {
      return "";
    }

    if (allowedKeys.has(key)) {
      return urlByKey.get(key) || "";
    }

    for (const candidate of allowedKeys) {
      if (
        candidate.endsWith(key) ||
        key.endsWith(candidate)
      ) {
        return urlByKey.get(candidate) || "";
      }
    }

    return "";
  }

  const keyFacts = Array.isArray(
    value.keyFacts,
  )
    ? value.keyFacts
        .map((item) => {
          if (
            !item ||
            typeof item.claim !== "string" ||
            typeof item.evidence !== "string"
          ) {
            return null;
          }

          const resolved = resolveSourceUrl(
            item.sourceUrl,
          );

          return {
            claim: cleanText(item.claim),

            evidence: cleanText(item.evidence),

            sourceTitle:
              cleanText(item.sourceTitle) ||
              (resolved
                ? publisherFromUrl(resolved)
                : "General knowledge"),

            sourceUrl: resolved,

            publisher:
              cleanText(item.publisher) ||
              (resolved
                ? publisherFromUrl(resolved)
                : "General knowledge"),

            publishedAt:
              cleanText(item.publishedAt) ||
              undefined,

            importance:
              item.importance === "high" ||
              item.importance === "medium" ||
              item.importance === "low"
                ? item.importance
                : "medium",
          } as ResearchFinding;
        })
        .filter(
          (item): item is ResearchFinding =>
            Boolean(item),
        )
        .slice(0, 80)
    : [];

  const importantNumbers = Array.isArray(
    value.importantNumbers,
  )
    ? value.importantNumbers
        .map((item) => {
          if (
            !item ||
            typeof item.metric !== "string" ||
            typeof item.value !== "string"
          ) {
            return null;
          }

          const resolved = resolveSourceUrl(
            item.sourceUrl,
          );

          return {
            metric: cleanText(item.metric),

            value: cleanText(item.value),

            context: cleanText(item.context),

            sourceTitle:
              cleanText(item.sourceTitle) ||
              (resolved
                ? publisherFromUrl(resolved)
                : "General knowledge"),

            sourceUrl: resolved,
          };
        })
        .filter(
          (
            item,
          ): item is NonNullable<typeof item> =>
            Boolean(item),
        )
        .slice(0, 60)
    : [];

  const importantDevelopments =
    Array.isArray(value.importantDevelopments)
      ? value.importantDevelopments
          .map((item) => {
            if (
              !item ||
              typeof item.development !== "string"
            ) {
              return null;
            }

            const resolved = resolveSourceUrl(
              item.sourceUrl,
            );

            return {
              development: cleanText(
                item.development,
              ),

              date:
                cleanText(item.date) || undefined,

              significance: cleanText(
                item.significance,
              ),

              sourceTitle:
                cleanText(item.sourceTitle) ||
                (resolved
                  ? publisherFromUrl(resolved)
                  : "General knowledge"),

              sourceUrl: resolved,
            };
          })
          .filter(
            (
              item,
            ): item is NonNullable<typeof item> =>
              Boolean(item),
          )
          .slice(0, 60)
      : [];

  const competingPerspectives = Array.isArray(
    value.competingPerspectives,
  )
    ? value.competingPerspectives
        .map((item) => {
          if (
            !item ||
            typeof item.perspective !== "string"
          ) {
            return null;
          }

          const resolved = resolveSourceUrl(
            item.sourceUrl,
          );

          return {
            perspective: cleanText(
              item.perspective,
            ),

            explanation: cleanText(
              item.explanation,
            ),

            sourceTitle:
              cleanText(item.sourceTitle) ||
              undefined,

            sourceUrl: resolved || undefined,
          };
        })
        .filter(
          (item): item is NonNullable<typeof item> =>
            Boolean(item),
        )
        .slice(0, 40)
    : [];

  const terminology = Array.isArray(
    value.terminology,
  )
    ? value.terminology
        .map((item) => {
          if (
            !item ||
            typeof item.term !== "string" ||
            typeof item.definition !== "string"
          ) {
            return null;
          }

          return {
            term: cleanText(item.term),

            definition: cleanText(
              item.definition,
            ),
          };
        })
        .filter(
          (item): item is NonNullable<typeof item> =>
            Boolean(item),
        )
        .slice(0, 80)
    : [];

  const usefulExamples = Array.isArray(
    value.usefulExamples,
  )
    ? value.usefulExamples
        .map((item) => {
          if (
            !item ||
            typeof item.example !== "string" ||
            typeof item.explanation !== "string"
          ) {
            return null;
          }

          const resolved = resolveSourceUrl(
            item.sourceUrl,
          );

          return {
            example: cleanText(item.example),

            explanation: cleanText(
              item.explanation,
            ),

            sourceTitle:
              cleanText(item.sourceTitle) ||
              undefined,

            sourceUrl: resolved || undefined,
          };
        })
        .filter(
          (item): item is NonNullable<typeof item> =>
            Boolean(item),
        )
        .slice(0, 60)
    : [];

  return {
    topic:
      cleanText(value.topic) ||
      research[0]?.title ||
      "the requested topic",

    centralQuestion:
      cleanText(value.centralQuestion) ||
      "What should readers understand about this topic?",

    keyFacts,

    importantNumbers,

    importantDevelopments,

    competingPerspectives,

    terminology,

    usefulExamples,

    sourceList: researchToSources(research),

    researchWarnings: Array.isArray(
      value.researchWarnings,
    )
      ? value.researchWarnings
          .filter(
            (item): item is string =>
              typeof item === "string",
          )
          .map(cleanText)
          .filter(Boolean)
          .slice(0, 40)
      : [],
  };
}

/* =========================================================
   IMAGE PLAN
========================================================= */

function normalizeImagePlan(
  value: unknown,
  placement: "hero" | "section",
  sectionId?: string,
): ArticleImagePlan | undefined {
  if (!value || typeof value !== "object") {
    return undefined;
  }

  const item = value as Record<string, unknown>;

  const prompt = cleanText(item.prompt);

  const alt = cleanText(item.alt);

  if (!prompt || !alt) {
    return undefined;
  }

  const image: ArticleImagePlan = {
    placement,
    prompt,
    alt,
  };

  if (placement === "section") {
    image.sectionId =
      cleanText(sectionId || item.sectionId) ||
      undefined;
  }

  const caption = cleanText(item.caption);

  if (caption) {
    image.caption = caption;
  }

  return image;
}

/* =========================================================
   NORMALIZE SECTION
========================================================= */

function normalizeArticleSection(
  value: unknown,
): ArticleSection | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const item = value as Record<string, unknown>;

  const title = cleanText(item.title);

  if (!title) {
    return null;
  }

  const rawLevel = Number(item.level);

  const level: 2 | 3 = rawLevel === 3 ? 3 : 2;

  const id =
    slugify(cleanText(item.id) || title) ||
    "article-section";

  let html =
    typeof item.html === "string"
      ? item.html.trim()
      : "";

  if (!html) {
    return null;
  }

  if (
    html.includes("```") ||
    /^#{1,6}\s/m.test(html)
  ) {
    return null;
  }

  html = escapeTagsInsidePreBlocks(html);

  html = removeUnsafeScriptTags(html);

  if (!/<section\b/i.test(html)) {
    const heading = level === 3 ? "h3" : "h2";

    html = `
<section class="my-12 space-y-6 sm:my-16">
  <p class="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
    ${escapeHtml(title)}
  </p>

  <${heading}
    id="${escapeHtmlAttribute(id)}"
    class="scroll-mt-24 text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-[2.7rem]"
  >
    ${escapeHtml(title)}
  </${heading}>

  ${html}
</section>
`.trim();
  }

  html = html.replace(
    /<section\b([^>]*)>/i,
    (match, attributes: string) => {
      const attrs = attributes || "";

      const classMatch = attrs.match(
        /\bclass=(["'])(.*?)\1/i,
      );

      if (!classMatch) {
        return `<section${attrs} class="my-12 space-y-6 sm:my-16">`;
      }

      const currentClass = classMatch[2];

      if (
        currentClass.includes("my-12") &&
        currentClass.includes("space-y-6")
      ) {
        return match;
      }

      const newClass =
        `${currentClass} my-12 space-y-6 sm:my-16`
          .replace(/\s+/g, " ")
          .trim();

      return match.replace(
        classMatch[0],
        `class="${escapeHtml(newClass)}"`,
      );
    },
  );

  const headingPattern =
    /<(h2|h3)\b([^>]*)>([\s\S]*?)<\/\1>/i;

  if (headingPattern.test(html)) {
    html = html.replace(
      headingPattern,
      (
        match,
        headingTag: string,
        attributes: string,
        content: string,
      ) => {
        let nextAttributes = attributes || "";

        if (
          /\bid=(["']).*?\1/i.test(
            nextAttributes,
          )
        ) {
          nextAttributes =
            nextAttributes.replace(
              /\bid=(["']).*?\1/i,
              `id="${escapeHtmlAttribute(id)}"`,
            );
        } else {
          nextAttributes += ` id="${escapeHtmlAttribute(
            id,
          )}"`;
        }

        return `<${headingTag}${nextAttributes}>${content}</${headingTag}>`;
      },
    );
  }

  const image = normalizeImagePlan(
    item.image,
    "section",
    id,
  );

  const section: ArticleSection = {
    id,

    level,

    title,

    html,

    hasTable: /<table\b/i.test(html),

    hasTabs: /data-tabs\b/i.test(html),

    hasCode:
      /data-code-switcher\b/i.test(html) ||
      /<pre\b/i.test(html) ||
      /<code\b/i.test(html),

    hasDiagram:
      /data-diagram\b/i.test(html) ||
      /<figure\b[^>]*\bdiagram\b/i.test(
        html,
      ),
  };

  if (image) {
    section.image = image;
  }

  return section;
}

/* =========================================================
   INTRODUCTION DETECTION
========================================================= */

function findIntroductionHtml(
  html: string,
): string {
  const match = html.match(
    /<section\b[^>]*>([\s\S]*?)<\/section>/i,
  );

  return match?.[1] || "";
}

/* =========================================================
   CONCLUSION DETECTION
========================================================= */

function findLastContentSection(
  html: string,
): string {
  const sections =
    html.match(
      /<section\b[^>]*>[\s\S]*?<\/section>/gi,
    ) || [];

  if (sections.length < 2) {
    return "";
  }

  const contentSections = sections.filter(
    (section) =>
      !/\bid=["']sources["']/i.test(section),
  );

  return (
    contentSections[
      contentSections.length - 1
    ] || ""
  );
}

/* =========================================================
   SOURCE HTML
========================================================= */

function cleanSourceTitle(value: string): string {
  return value
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function buildSourcesHtml(
  sources: ArticleSource[],
): string {
  const safeSources = deduplicateSources(
    sources,
  )
    .filter((source) =>
      Boolean(normalizeHttpsUrl(source.url)),
    )
    .slice(0, MAX_EXA_SOURCES);

  const items = safeSources
    .map((source) => {
      const title = escapeHtml(
        cleanSourceTitle(source.title),
      );

      const url = escapeHtml(source.url);

      const publisher = escapeHtml(
        cleanText(source.publisher),
      );

      const published = source.publishedAt
        ? ` · ${escapeHtml(
            source.publishedAt,
          )}`
        : "";

      return `
<li class="rounded-xl border border-border bg-muted/40 p-4">
  <a
    href="${url}"
    target="_blank"
    rel="noreferrer noopener"
    class="font-medium text-primary underline decoration-primary/40 underline-offset-4 hover:decoration-primary"
  >
    ${title}
  </a>

  <p class="mt-1 text-sm leading-6 text-muted-foreground">
    ${publisher}${published}
  </p>
</li>
`.trim();
    })
    .join("\n");

  return `
<section id="sources" class="my-12 space-y-6 sm:my-16">
  <p class="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
    Sources &amp; References
  </p>

  <h2
    id="sources-heading"
    class="scroll-mt-24 text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-[2.7rem]"
  >
    Sources &amp; References
  </h2>

  <p class="text-lg leading-8 text-muted-foreground">
    The following sources were used to research and verify this article.
  </p>

  <ol class="space-y-4">
    ${items}
  </ol>
</section>
`.trim();
}

/* =========================================================
   ENSURE SOURCES
========================================================= */

function ensureSourcesSection(
  html: string,
  sources: ArticleSource[],
): string {
  const sourcesHtml = buildSourcesHtml(sources);

  const sectionRegex =
    /<section\b[^>]*\bid=(["'])sources\1[^>]*>[\s\S]*?<\/section>/i;

  if (sectionRegex.test(html)) {
    return html.replace(
      sectionRegex,
      sourcesHtml,
    );
  }

  return `${html.trim()}\n\n${sourcesHtml}`;
}

/* =========================================================
   FACT-CHECK PASS
========================================================= */

async function factCheckArticle(
  html: string,
  dossier: ResearchDossier,
): Promise<FactCheckResult> {
  const systemPrompt = `
You are a strict fact-checker for ALENTA.COM.

You will receive:

1. An ARTICLE (HTML).
2. A DOSSIER of verified research facts.

Your task:

For every factual claim in the ARTICLE, decide whether
it is SUPPORTED by the DOSSIER.

If a claim is NOT supported, flag it.

You are NOT checking general common knowledge
(well-established facts about the world).

You are checking claims that:

- look like specific statistics or numbers
- look like specific dates
- name specific people or companies
- name specific studies
- quote someone
- mention specific financial figures
- reference specific events

Return ONLY valid JSON of this shape:

{
  "flaggedClaims": [
    {
      "sentence": "The exact sentence from the article.",
      "reason": "Why it is unsupported.",
      "severity": "high"
    }
  ],
  "overallRisk": "low",
  "summary": "One-sentence summary."
}

Rules:

- severity "high" = invented number / date / name / quote
- severity "medium" = plausible but unsupported specific claim
- severity "low" = vague but suspicious

If the article has no flagged claims, return an empty
flaggedClaims array and overallRisk "low".

Return ONLY valid JSON.
`;

  const userPrompt = `
ARTICLE (HTML):

${html.slice(0, 40000)}

==================================================
DOSSIER (verified research)
==================================================

${JSON.stringify(dossier, null, 2)}
`;

  const raw = await callCerebrasJson(
    systemPrompt,
    userPrompt,
    "Fact-check pass",
    FACT_CHECK_MAX_TOKENS,
  );

  return safeJsonParse<FactCheckResult>(
    raw,
    "Fact-check pass",
  );
}

/* =========================================================
   APPLY FACT-CHECK FIXES
========================================================= */

function applyFactCheckFixes(
  html: string,
  factCheck: FactCheckResult,
): {
  html: string;
  removed: number;
} {
  let nextHtml = html;

  let removed = 0;

  for (const claim of factCheck.flaggedClaims) {
    if (claim.severity !== "high") {
      continue;
    }

    const sentence = cleanText(claim.sentence);

    if (!sentence || sentence.length < 10) {
      continue;
    }

    const escaped = sentence.replace(
      /[.*+?^${}()|[\]\\]/g,
      "\\$&",
    );

    const pattern = new RegExp(escaped, "gi");

    if (pattern.test(nextHtml)) {
      nextHtml = nextHtml.replace(pattern, "");

      removed += 1;
    }
  }

  return {
    html: nextHtml,
    removed,
  };
}

/* =========================================================
   VALIDATION
========================================================= */

function validateContentDepth(
  html: string,
  sections: ArticleSection[],
): void {
  const contentSections = sections.filter(
    (section) =>
      !section.id.startsWith("sources"),
  );

  if (
    contentSections.length <
    MIN_ARTICLE_SECTIONS
  ) {
    throw new Error(
      `Article is too short structurally. Generated ${contentSections.length} content sections, but at least ${MIN_ARTICLE_SECTIONS} are required.`,
    );
  }

  if (
    contentSections.length >
    MAX_ARTICLE_SECTIONS
  ) {
    throw new Error(
      `Article contains too many sections (${contentSections.length}). Maximum allowed is ${MAX_ARTICLE_SECTIONS}.`,
    );
  }

  const totalWords = countWords(html);

  if (totalWords < MIN_TOTAL_ARTICLE_WORDS) {
    throw new Error(
      `Article is too short. Generated approximately ${totalWords} words, but at least ${MIN_TOTAL_ARTICLE_WORDS} words are required. Target is roughly ${TARGET_TOTAL_ARTICLE_WORDS} words.`,
    );
  }

  for (const section of contentSections) {
    const words = countWords(section.html);

    const paragraphs = countParagraphs(
      section.html,
    );

    if (words < MIN_SECTION_WORDS) {
      throw new Error(
        `Section "${section.title}" is too short (${words} words). Each section must contain at least ${MIN_SECTION_WORDS} words.`,
      );
    }

    if (paragraphs < 2) {
      throw new Error(
        `Section "${section.title}" does not contain enough paragraphs.`,
      );
    }
  }

  const introduction =
    findIntroductionHtml(html);

  const introductionWords =
    countWords(introduction);

  if (introductionWords < MIN_INTRO_WORDS) {
    throw new Error(
      `Introduction is too short (${introductionWords} words). It should contain at least ${MIN_INTRO_WORDS} words.`,
    );
  }

  const conclusion =
    findLastContentSection(html);

  const conclusionWords =
    countWords(conclusion);

  if (conclusionWords < MIN_CONCLUSION_WORDS) {
    throw new Error(
      `Conclusion is too short (${conclusionWords} words). It should contain at least ${MIN_CONCLUSION_WORDS} words.`,
    );
  }
}

function validateArticleHtml(
  html: string,
  sections: ArticleSection[],
  sources: ArticleSource[],
): void {
  if (!html.trim()) {
    throw new Error(
      "Generated article HTML is empty.",
    );
  }

  if (!/<section\b/i.test(html)) {
    throw new Error(
      "Generated article contains no sections.",
    );
  }

  const htmlWithoutPreBlocks =
    stripPreBlocks(html);

  if (
    /(?:href|src)\s*=\s*["']\s*javascript:/i.test(
      htmlWithoutPreBlocks,
    )
  ) {
    throw new Error(
      "Generated article contains an unsafe javascript URL.",
    );
  }

  if (
    /\sstyle\s*=/i.test(htmlWithoutPreBlocks)
  ) {
    throw new Error(
      "Generated article contains inline styles.",
    );
  }

  if (/```/.test(html)) {
    throw new Error(
      "Generated article contains Markdown fences.",
    );
  }

  if (
    /#[0-9a-f]{3,8}\b/i.test(
      htmlWithoutPreBlocks,
    ) ||
    /\brgba?\s*\(/i.test(
      htmlWithoutPreBlocks,
    ) ||
    /\bhsla?\s*\(/i.test(
      htmlWithoutPreBlocks,
    ) ||
    /\boklch\s*\(/i.test(
      htmlWithoutPreBlocks,
    )
  ) {
    throw new Error(
      "Generated article contains hardcoded colors.",
    );
  }

  const mainOrArticle = html.match(
    /<(main|article)\b[^>]*>/gi,
  ) || [];

  for (const tag of mainOrArticle) {
    if (
      /\b(?:px|sm:px|md:px|lg:px|xl:px|2xl:px)-\d+\b/.test(
        tag,
      )
    ) {
      throw new Error(
        "Generated article contains page-level horizontal padding.",
      );
    }
  }

  for (const section of sections) {
    if (!html.includes(`id="${section.id}"`)) {
      throw new Error(
        `Missing heading ID "${section.id}".`,
      );
    }
  }

  if (!/id=["']sources["']/i.test(html)) {
    throw new Error(
      "Sources section is missing.",
    );
  }

  for (const source of sources) {
    const url = normalizeHttpsUrl(source.url);

    if (!url) {
      throw new Error(
        `Invalid source URL: ${source.url}`,
      );
    }

    const escapedUrl = escapeHtml(url);

    if (
      !html.includes(url) &&
      !html.includes(escapedUrl)
    ) {
      throw new Error(
        `Source URL is missing from article HTML: ${url}`,
      );
    }
  }

  validateContentDepth(html, sections);
}

/* =========================================================
   SHARED PROMPT PIECES
========================================================= */

const ALENTA_STYLE_GUIDE = `
==================================================
ALENTA DESIGN SYSTEM
==================================================

Use semantic Tailwind classes:

text-foreground
text-muted-foreground
text-primary
border-border
border-primary/40
bg-background
bg-muted/40

Never use inline styles, hex colors, rgb(), rgba(),
hsl(), hsla(), or oklch().

Do not add page-level horizontal padding such as
px-4, sm:px-4, md:px-6, lg:px-8.

Local component padding (table cells, code blocks)
is allowed.

==================================================
CALLOUTS
==================================================

<div class="border-l-2 border-primary/40 pl-5">
  <p class="text-base leading-7 text-muted-foreground">
    <strong class="font-semibold text-foreground">
      In simple terms:
    </strong>
    Explanation...
  </p>
</div>

==================================================
TABLES
==================================================

<div class="my-8 overflow-x-auto rounded-2xl border border-border">
  <table class="w-full border-collapse text-left text-sm">
    <thead class="bg-muted/40 text-foreground">
      <tr>
        <th class="border-b border-border px-4 py-3 font-semibold">
          Column
        </th>
        <th class="border-b border-border px-4 py-3 font-semibold">
          Column
        </th>
      </tr>
    </thead>
    <tbody class="text-muted-foreground">
      <tr>
        <td class="border-b border-border px-4 py-3">
          Cell
        </td>
        <td class="border-b border-border px-4 py-3">
          Cell
        </td>
      </tr>
    </tbody>
  </table>
</div>

==================================================
TABS
==================================================

<div data-tabs class="my-10 overflow-hidden rounded-2xl border border-border bg-muted/40">
  <div class="flex flex-wrap gap-1 border-b border-border p-2">
    <button
      type="button"
      data-tab="a"
      aria-selected="true"
      class="rounded-lg bg-background px-3 py-2 text-sm font-medium text-foreground shadow-sm"
    >
      Variant A
    </button>

    <button
      type="button"
      data-tab="b"
      aria-selected="false"
      class="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
    >
      Variant B
    </button>
  </div>

  <div data-tab-content="a" class="p-5">
    ...
  </div>

  <div data-tab-content="b" class="hidden p-5">
    ...
  </div>
</div>

==================================================
CODE BLOCKS
==================================================

IMPORTANT: Do NOT HTML-escape the contents of <code>
yourself. The application escapes code blocks
automatically before the article is displayed.

Write code samples exactly as they would appear in a
real editor, with real < and > characters.

Example:

<div
  data-code-switcher
  class="my-8 overflow-hidden rounded-2xl border border-border bg-muted/40"
>
  <div class="flex items-center justify-between border-b border-border px-4 py-2">
    <div class="flex flex-wrap gap-1">
      <button
        type="button"
        data-code-language="javascript"
        aria-selected="true"
        class="rounded-lg bg-background px-3 py-1.5 text-xs font-medium text-foreground shadow-sm"
      >
        JavaScript
      </button>
    </div>

    <button
      type="button"
      data-code-copy
      data-copy-label="Copy"
      class="rounded-lg px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
    >
      Copy
    </button>
  </div>

  <div
    data-code-language-content="javascript"
    class="overflow-x-auto p-4"
  >
    <pre class="text-sm leading-6 text-foreground"><code>const x = 1;
console.log(x);</code></pre>
  </div>
</div>

==================================================
DIAGRAMS
==================================================

<figure
  data-diagram="unique-diagram-id"
  class="my-10 overflow-hidden rounded-2xl border border-border bg-muted/40 p-6"
>
  <div class="flex flex-col items-center gap-4 text-center">
    <div class="rounded-xl border border-border bg-background px-4 py-3 text-sm font-medium text-foreground">
      Step 1
    </div>

    <div class="text-muted-foreground">↓</div>

    <div class="rounded-xl border border-border bg-background px-4 py-3 text-sm font-medium text-foreground">
      Step 2
    </div>
  </div>

  <figcaption class="mt-4 text-center text-sm text-muted-foreground">
    Short caption describing the diagram.
  </figcaption>
</figure>

==================================================
FACTUAL DISCIPLINE
==================================================

You MUST NOT invent:

- statistics
- financial figures
- exact dates
- names of specific people
- names of specific companies
- names of specific studies
- quotes
- URLs

General, established, well-known facts are fine.

==================================================
SECTION HTML TEMPLATE
==================================================

Every substantive section must look like:

<section class="my-12 space-y-6 sm:my-16">
  <p class="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
    Category Label
  </p>

  <h2
    id="unique-section-id"
    class="scroll-mt-24 text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-[2.7rem]"
  >
    Section Title
  </h2>

  <p class="text-lg leading-8 text-muted-foreground">
    First substantial paragraph...
  </p>

  <p class="text-lg leading-8 text-muted-foreground">
    Second substantial paragraph...
  </p>

  <p class="text-lg leading-8 text-muted-foreground">
    Third substantial paragraph...
  </p>

  <p class="text-lg leading-8 text-muted-foreground">
    Fourth substantial paragraph...
  </p>
</section>
`;

/* =========================================================
   ARTICLE WRITER — PASS 1
========================================================= */

async function writeArticlePartOne(
  input: GenerateArticleInput,
  dossier: ResearchDossier,
  sectionsInPartOne: number,
): Promise<ArticleDraft> {
  const systemPrompt = `
You are a senior long-form editorial writer for
ALENTA.COM.

You are writing the FIRST HALF of a long-form article.

==================================================
WHAT YOU ARE WRITING
==================================================

This is PASS 1 of a TWO-PASS article.

You write the FIRST ${sectionsInPartOne} sections of
the article:

- Section 1: the Introduction
- Sections 2 through ${sectionsInPartOne}: the first
  batch of substantive body sections

Do NOT write a conclusion.

Do NOT write a summary.

==================================================
WRITE FROM YOUR OWN KNOWLEDGE + DOSSIER
==================================================

Write mostly from your own expert, general,
well-established knowledge of the subject.

The dossier below is a SUPPORTING reference.

==================================================
LENGTH IS NON-NEGOTIABLE
==================================================

Each section must contain:

- at least 3 substantial paragraphs
- at least ${MIN_SECTION_WORDS} words per section
- ideally 300-600 words per section

The introduction should be ${MIN_INTRO_WORDS}-300 words.

DO NOT TRUNCATE. DO NOT SUMMARIZE.

Write real, deep, informative content.

==================================================
OUTPUT FORMAT
==================================================

Return ONLY valid JSON of this shape:

{
  "title": "string",
  "shortDescription": "string",
  "category": "string",
  "subcategory": "string",
  "slug": "string",
  "excerpt": "string",
  "sections": [
    {
      "id": "string",
      "level": 2,
      "title": "string",
      "html": "<section>...</section>"
    }
  ],
  "heroImage": {
    "placement": "hero",
    "prompt": "string",
    "alt": "string",
    "caption": "string"
  },
  "seo": {
    "metaTitle": "string",
    "metaDescription": "string",
    "keywords": ["string"]
  }
}

${ALENTA_STYLE_GUIDE}

Return ONLY valid JSON.
`;

  const userPrompt = `
ARTICLE REQUEST

Title:
${input.title}

Short description:
${input.shortDescription}

Category:
${input.category || "Not specified"}

Subcategory:
${input.subcategory || "Not specified"}

Editorial focus:
${input.editorialFocus || "Not specified"}

Audience:
${input.audience || "General readers"}

Language:
${input.language || "English"}

==================================================
RESEARCH DOSSIER (SUPPORTING REFERENCE)
==================================================

${JSON.stringify(dossier, null, 2)}

==================================================
PASS 1 INSTRUCTION
==================================================

Write the FIRST ${sectionsInPartOne} sections of the
article now.

Section 1 is the Introduction.

Sections 2 through ${sectionsInPartOne} are substantive
body sections.

Do NOT write a conclusion.

Do NOT write a summary.

Do NOT stop early. Every section must be fully written.

Return ONLY valid JSON.
`;

  const raw = await callCerebrasJson(
    systemPrompt,
    userPrompt,
    "Article generation (pass 1)",
    ARTICLE_CALL_MAX_TOKENS,
  );

  return safeJsonParse<ArticleDraft>(
    raw,
    "Article generation (pass 1)",
  );
}

/* =========================================================
   ARTICLE WRITER — PASS 2
========================================================= */

async function writeArticlePartTwo(
  input: GenerateArticleInput,
  dossier: ResearchDossier,
  sectionsInPartTwo: number,
  previousSectionsSummary: string,
): Promise<ArticleDraft> {
  const systemPrompt = `
You are a senior long-form editorial writer for
ALENTA.COM.

You are writing the SECOND HALF of a long-form article.

==================================================
WHAT YOU ARE WRITING
==================================================

This is PASS 2 of a TWO-PASS article.

The first half has already been written. Its section
titles are listed below.

You now write the SECOND HALF:

- ${sectionsInPartTwo} NEW substantive body sections
  (do NOT repeat the titles from Pass 1)
- THEN a Conclusion section (id="conclusion")
- THEN a separate Summary section (id="summary",
  titled "Summary")

The Summary is DIFFERENT from the Conclusion.

==================================================
WRITE FROM YOUR OWN KNOWLEDGE + DOSSIER
==================================================

Write mostly from your own expert, general,
well-established knowledge of the subject.

The dossier below is a SUPPORTING reference.

==================================================
LENGTH IS NON-NEGOTIABLE
==================================================

Each new body section must contain:

- at least 3 substantial paragraphs
- at least ${MIN_SECTION_WORDS} words per section
- ideally 300-600 words per section

The Conclusion should be ${MIN_CONCLUSION_WORDS}-400 words.

The Summary should be ${MIN_SUMMARY_WORDS}-400 words.

DO NOT TRUNCATE. DO NOT SUMMARIZE.

==================================================
OUTPUT FORMAT
==================================================

Return ONLY valid JSON of this shape:

{
  "sections": [
    {
      "id": "string",
      "level": 2,
      "title": "string",
      "html": "<section>...</section>"
    }
  ]
}

${ALENTA_STYLE_GUIDE}

Return ONLY valid JSON.
`;

  const userPrompt = `
ARTICLE REQUEST

Title:
${input.title}

Short description:
${input.shortDescription}

Category:
${input.category || "Not specified"}

Subcategory:
${input.subcategory || "Not specified"}

Editorial focus:
${input.editorialFocus || "Not specified"}

Audience:
${input.audience || "General readers"}

Language:
${input.language || "English"}

==================================================
RESEARCH DOSSIER (SUPPORTING REFERENCE)
==================================================

${JSON.stringify(dossier, null, 2)}

==================================================
SECTIONS ALREADY WRITTEN IN PASS 1
==================================================

${previousSectionsSummary}

==================================================
PASS 2 INSTRUCTION
==================================================

Write the SECOND HALF of the article now:

1. ${sectionsInPartTwo} NEW substantive body sections.
   Do NOT reuse any of the titles from Pass 1.

2. A Conclusion section (id="conclusion").

3. A separate Summary section
   (id="summary", titled "Summary") that recaps the
   whole article in 200-400 words of flowing prose.

Do NOT repeat the introduction.

Do NOT stop early. Every section must be fully written.

Return ONLY valid JSON.
`;

  const raw = await callCerebrasJson(
    systemPrompt,
    userPrompt,
    "Article generation (pass 2)",
    ARTICLE_CALL_MAX_TOKENS,
  );

  return safeJsonParse<ArticleDraft>(
    raw,
    "Article generation (pass 2)",
  );
}

/* =========================================================
   COMBINE THE TWO PASSES
========================================================= */

function combineDrafts(
  partOne: ArticleDraft,
  partTwo: ArticleDraft,
): ArticleDraft {
  const partOneSections = Array.isArray(
    partOne.sections,
  )
    ? partOne.sections
    : [];

  const partTwoSections = Array.isArray(
    partTwo.sections,
  )
    ? partTwo.sections
    : [];

  return {
    title: partOne.title,
    shortDescription: partOne.shortDescription,
    category: partOne.category,
    subcategory: partOne.subcategory,
    slug: partOne.slug,
    excerpt: partOne.excerpt,
    heroImage: partOne.heroImage,
    seo: partOne.seo,
    sections: [
      ...partOneSections,
      ...partTwoSections,
    ],
  };
}

function summariseExistingSections(
  partOne: ArticleDraft,
): string {
  const sections = Array.isArray(
    partOne.sections,
  )
    ? partOne.sections
    : [];

  if (sections.length === 0) {
    return "(no sections yet)";
  }

  return sections
    .map((item, index) => {
      if (!item || typeof item !== "object") {
        return `${index + 1}. (unknown)`;
      }

      const record = item as Record<
        string,
        unknown
      >;

      const title = cleanText(record.title);

      const id = cleanText(record.id);

      return `${index + 1}. ${title} (id: "${id}")`;
    })
    .join("\n");
}

/* =========================================================
   NORMALIZE FINAL ARTICLE
========================================================= */

function buildNormalizedArticle(
  input: GenerateArticleInput,
  draft: ArticleDraft,
  dossier: ResearchDossier,
): GeneratedArticle {
  const rawSections = Array.isArray(
    draft.sections,
  )
    ? draft.sections
    : [];

  const sections: ArticleSection[] = [];

  for (const item of rawSections) {
    const normalized =
      normalizeArticleSection(item);

    if (normalized) {
      sections.push(normalized);
    }
  }

  if (sections.length === 0) {
    throw new Error(
      "Cerebras generated no valid article sections.",
    );
  }

  const limitedSections = sections.slice(
    0,
    MAX_ARTICLE_SECTIONS,
  );

  const usedIds = new Set<string>();

  for (const section of limitedSections) {
    let id = section.id;

    if (usedIds.has(id)) {
      let counter = 2;

      while (usedIds.has(`${id}-${counter}`)) {
        counter += 1;
      }

      id = `${id}-${counter}`;

      section.id = id;

      section.html = section.html.replace(
        /id=(["'])[^"']*\1/i,
        `id="${escapeHtmlAttribute(id)}"`,
      );

      if (section.image) {
        section.image.sectionId = id;
      }
    }

    usedIds.add(id);
  }

  const heroImage =
    normalizeImagePlan(
      draft.heroImage,
      "hero",
    ) || {
      placement: "hero",

      prompt: `Editorial hero image representing ${cleanText(
        input.title,
      )}. Sophisticated realistic composition, natural lighting, no text, no logos, no watermark.`,

      alt:
        cleanText(input.title) ||
        "Article hero image",
    };

  const sectionImages: ArticleImagePlan[] = [];

  for (const section of limitedSections) {
    if (section.image) {
      sectionImages.push(section.image);
    }
  }

  const tableOfContents = limitedSections.map(
    (section) => ({
      id: section.id,
      title: section.title,
      level: section.level,
    }),
  );

  const category =
    cleanText(draft.category) ||
    cleanText(input.category) ||
    "General";

  const subcategory =
    cleanText(draft.subcategory) ||
    cleanText(input.subcategory);

  const title =
    cleanText(draft.title) ||
    cleanText(input.title);

  const shortDescription =
    cleanText(draft.shortDescription) ||
    cleanText(input.shortDescription);

  const slug =
    slugify(cleanText(draft.slug)) ||
    slugify(title);

  const excerpt =
    cleanText(draft.excerpt) ||
    shortDescription;

  const seoValue =
    draft.seo && typeof draft.seo === "object"
      ? (draft.seo as Record<string, unknown>)
      : {};

  const metaTitle =
    cleanText(seoValue.metaTitle) || title;

  const metaDescription =
    cleanText(seoValue.metaDescription) ||
    excerpt;

  const keywords = Array.isArray(
    seoValue.keywords,
  )
    ? Array.from(
        new Set(
          seoValue.keywords
            .filter(
              (item): item is string =>
                typeof item === "string",
            )
            .map(cleanText)
            .filter(Boolean)
            .slice(0, 30),
        ),
      )
    : [];

  let html = limitedSections
    .map((section) => section.html)
    .join("\n\n");

  const sources = deduplicateSources(
    dossier.sourceList,
  );

  html = ensureSourcesSection(html, sources);

  validateArticleHtml(
    html,
    limitedSections,
    sources,
  );

  const researchSummary = dossier.keyFacts
    .filter(
      (item) => item.importance === "high",
    )
    .slice(0, 15)
    .map(
      (item) =>
        `${item.claim} ${item.evidence}`,
    );

  const editorNotes: string[] = [];

  if (dossier.researchWarnings.length) {
    editorNotes.push(
      ...dossier.researchWarnings,
    );
  }

  editorNotes.push(
    `Research synthesized from ${sources.length} sources.`,
  );

  editorNotes.push(
    `Article contains ${limitedSections.length} substantive content sections.`,
  );

  editorNotes.push(
    `Article contains approximately ${countWords(
      html,
    )} words.`,
  );

  editorNotes.push(
    `Sections with tables: ${limitedSections.filter((section) => section.hasTable).length}.`,
  );

  editorNotes.push(
    `Sections with tabs: ${limitedSections.filter((section) => section.hasTabs).length}.`,
  );

  editorNotes.push(
    `Sections with code: ${limitedSections.filter((section) => section.hasCode).length}.`,
  );

  editorNotes.push(
    `Sections with diagrams: ${limitedSections.filter((section) => section.hasDiagram).length}.`,
  );

  return {
    title,

    shortDescription,

    category,

    ...(subcategory ? { subcategory } : {}),

    slug,

    excerpt,

    readingTimeMinutes:
      calculateReadingTime(html),

    html,

    tableOfContents,

    sections: limitedSections,

    heroImage,

    sectionImages,

    seo: {
      metaTitle,
      metaDescription,
      keywords,
    },

    sources,

    researchSummary,

    editorNotes,
  };
}

/* =========================================================
   MAIN PIPELINE
========================================================= */

export async function generateEditorialArticle(
  input: GenerateArticleInput,
): Promise<GeneratedArticle> {
  const title = cleanText(input.title);

  const shortDescription = cleanText(
    input.shortDescription,
  );

  if (!title) {
    throw new Error(
      "Article title is required.",
    );
  }

  if (!shortDescription) {
    throw new Error(
      "Article short description is required.",
    );
  }

  console.log(
    "\n========================================",
  );

  console.log(
    "ALENTA EDITORIAL GENERATION",
  );

  console.log(
    "========================================\n",
  );

  console.log(`Title: ${title}`);

  /* -------------------------------------------------------
     STEP 1 — EXA
  ------------------------------------------------------- */

  console.log(
    "\n[1/5] Searching Exa (supporting research)...",
  );

  const research = await collectWebResearch({
    ...input,
    title,
    shortDescription,
  });

  console.log(
    `Found ${research.length} research sources.`,
  );

  /* -------------------------------------------------------
     STEP 2 — CEREBRAS DOSSIER
  ------------------------------------------------------- */

  console.log(
    "\n[2/5] Building research dossier with Cerebras...",
  );

  const dossier = await buildResearchDossier(
    {
      ...input,
      title,
      shortDescription,
    },
    research,
  );

  console.log(
    `Dossier contains ${dossier.keyFacts.length} key facts.`,
  );

  console.log(
    `Dossier contains ${dossier.importantNumbers.length} important numbers.`,
  );

  console.log(
    `Dossier contains ${dossier.importantDevelopments.length} important developments.`,
  );

  console.log(
    `Dossier contains ${dossier.terminology.length} terminology items.`,
  );

  console.log(
    `Dossier contains ${dossier.usefulExamples.length} useful examples.`,
  );

  /*
   * ADAPTIVE SECTION COUNT
   *
   * We pick a target between MIN and MAX based on
   * the richness of the dossier. Richer dossiers
   * get more sections.
   */
  const dossierRichness =
    dossier.keyFacts.length +
    dossier.terminology.length * 0.5 +
    dossier.usefulExamples.length * 0.5;

  const totalTargetSections = Math.min(
    MAX_ARTICLE_SECTIONS,
    Math.max(
      MIN_ARTICLE_SECTIONS,
      Math.round(
        MIN_ARTICLE_SECTIONS +
          (dossierRichness / 60) *
            (MAX_ARTICLE_SECTIONS -
              MIN_ARTICLE_SECTIONS),
      ),
    ),
  );

  const passOneSections = Math.max(
    4,
    Math.floor(totalTargetSections / 2),
  );

  const passTwoSections = Math.max(
    4,
    totalTargetSections - passOneSections,
  );

  console.log(
    `Adaptive target: ${totalTargetSections} sections (${passOneSections} in pass 1, ${passTwoSections} in pass 2).`,
  );

  /* -------------------------------------------------------
     STEP 3 — PASS 1
  ------------------------------------------------------- */

  console.log(
    `\n[3/5] Writing FIRST HALF with Cerebras (${passOneSections} sections)...`,
  );

  const partOneDraft = await writeArticlePartOne(
    {
      ...input,
      title,
      shortDescription,
    },
    dossier,
    passOneSections,
  );

  console.log(
    `First half returned ${Array.isArray(partOneDraft.sections) ? partOneDraft.sections.length : 0} raw sections.`,
  );

  console.log(
    "Cooling down before second half (70s)...",
  );

  await sleep(70000);

  /* -------------------------------------------------------
     STEP 4 — PASS 2
  ------------------------------------------------------- */

  console.log(
    `\n[4/5] Writing SECOND HALF with Cerebras (${passTwoSections} sections + conclusion + summary)...`,
  );

  const partTwoDraft = await writeArticlePartTwo(
    {
      ...input,
      title,
      shortDescription,
    },
    dossier,
    passTwoSections,
    summariseExistingSections(partOneDraft),
  );

  console.log(
    `Second half returned ${Array.isArray(partTwoDraft.sections) ? partTwoDraft.sections.length : 0} raw sections.`,
  );

  const combinedDraft = combineDrafts(
    partOneDraft,
    partTwoDraft,
  );

  console.log(
    `Combined draft has ${Array.isArray(combinedDraft.sections) ? combinedDraft.sections.length : 0} raw sections.`,
  );

  /* -------------------------------------------------------
     STEP 5 — FACT-CHECK + EDITOR
  ------------------------------------------------------- */

  const article = buildNormalizedArticle(
    {
      ...input,
      title,
      shortDescription,
    },
    combinedDraft,
    dossier,
  );

  console.log(
    "\n[5/5] Running fact-check pass with Cerebras...",
  );

  const factCheck = await factCheckArticle(
    article.html,
    dossier,
  );

  console.log(
    `Fact-check flagged ${factCheck.flaggedClaims.length} claims (overall risk: ${factCheck.overallRisk}).`,
  );

  if (factCheck.flaggedClaims.length > 0) {
    const applied = applyFactCheckFixes(
      article.html,
      factCheck,
    );

    console.log(
      `Removed ${applied.removed} high-severity unsupported claims.`,
    );

    article.html = applied.html;

    article.editorNotes.push(
      `Fact-check flagged ${factCheck.flaggedClaims.length} claims (overall risk: ${factCheck.overallRisk}).`,
    );

    article.editorNotes.push(
      `Removed ${applied.removed} high-severity unsupported claims.`,
    );

    if (factCheck.summary) {
      article.editorNotes.push(
        `Fact-check summary: ${factCheck.summary}`,
      );
    }
  } else {
    article.editorNotes.push(
      `Fact-check: no unsupported claims flagged.`,
    );
  }

  /* -------------------------------------------------------
     SUCCESS
  ------------------------------------------------------- */

  console.log(
    "\n========================================",
  );

  console.log(
    "ARTICLE GENERATED SUCCESSFULLY",
  );

  console.log(
    "========================================",
  );

  console.log(
    `Title: ${article.title}`,
  );

  console.log(
    `Slug: ${article.slug}`,
  );

  console.log(
    `Reading time: ${article.readingTimeMinutes} min`,
  );

  console.log(
    `Sections: ${article.sections.length}`,
  );

  console.log(
    `Sources: ${article.sources.length}`,
  );

  console.log(
    `Approx. words: ${countWords(
      article.html,
    )}`,
  );

  console.log(
    `HTML characters: ${article.html.length}`,
  );

  console.log(
    "========================================\n",
  );

  return article;
}

/* =========================================================
   LOCAL TEST
========================================================= */

async function main(): Promise<void> {
  const article =
    await generateEditorialArticle({
      title: "HOW DOES JS WORK",

      shortDescription:
        "An in-depth explanation of how JavaScript works, including the JavaScript engine, parsing, compilation, execution, the call stack, event loop, asynchronous operations, memory, and browser APIs.",

      category: "Technology",

      subcategory: "JavaScript",

      editorialFocus:
        "Explain JavaScript from the fundamentals to the runtime execution model in a technically accurate but beginner-friendly way. Go deep into how source code moves through parsing, compilation, execution, memory management, the call stack, queues, the event loop, browser APIs, promises, asynchronous operations, optimization, and practical execution behavior. Include real code examples, tables, tabs, and diagrams where they genuinely help.",

      audience:
        "Developers, students, and technically curious readers",

      language: "English",
    });

  console.log(
    "\n========== RESULT ==========\n",
  );

  console.log(
    JSON.stringify(article, null, 2),
  );
}

void main();