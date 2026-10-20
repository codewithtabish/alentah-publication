// PATH: src/components/site/pages/article/article-page.tsx
// (use whatever path this file already has; the exports are unchanged:
//  buildArticleMetadata + ArticlePage)

import { Suspense } from "react";
import { notFound, permanentRedirect } from "next/navigation";
import { cacheLife, cacheTag } from "next/cache";
import type { Metadata } from "next";

import { cn } from "@/lib/utils";
import { getArticleBySlug } from "@/actions/blog/get-article-by-slug";

import type { TableOfContentsItem } from "@/schemas/blog-schema";
import BlogHeader from "@/components/site/pages/article/single-blog-header";
import { BlogPreviewer } from "@/components/site/admim/article/artcile-previewer";
import { ArticleTOC } from "@/components/site/pages/article/article-toc";
import { ArticleCommentsSkeleton } from "@/components/site/admim/article/article-comments-skeleton";
import { ArticleCommentsServer } from "@/components/site/admim/article/article-comments-server";
import { ArticleBookmarkServer } from "@/components/site/admim/article/article-bookmark-server";
import {
  ADS_ENABLED,
  Banner160x600,
  Banner300x250,
  Banner728x90,
  NativeAd,
} from "@/components/site/general/ads/site-ads";

// ---------- CONSTANTS ----------
const SITE_URL = "https://www.alentah.com";
const SITE_NAME = "Alentah";
const ORGANIZATION_ID = `${SITE_URL}/#organization`;
const WEBSITE_ID = `${SITE_URL}/#website`;
const FALLBACK_OG_IMAGE = `${SITE_URL}/seo/og-image.png`;

const ROBOTS_INDEXABLE: NonNullable<Metadata["robots"]> = {
  index: true,
  follow: true,
  googleBot: {
    index: true,
    follow: true,
    "max-image-preview": "large",
    "max-snippet": -1,
    "max-video-preview": -1,
  },
};

// ---------- HELPERS ----------
function safeDecode(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function truncate(text: string, max: number): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max - 1).replace(/\s+\S*$/, "")}…`;
}

function toIso(value: Date | string | null | undefined): string | undefined {
  if (!value) return undefined;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? undefined : d.toISOString();
}

function toAbsoluteUrl(pathOrUrl: string | null | undefined): string {
  if (!pathOrUrl) return FALLBACK_OG_IMAGE;
  if (pathOrUrl.startsWith("http://") || pathOrUrl.startsWith("https://")) {
    return pathOrUrl;
  }
  return `${SITE_URL}${pathOrUrl.startsWith("/") ? "" : "/"}${pathOrUrl}`;
}

function getAuthorName(author: {
  firstName: string | null;
  lastName: string | null;
}): string {
  return (
    [author.firstName, author.lastName].filter(Boolean).join(" ") ||
    "Alentah Editors"
  );
}

function jsonLd(data: object): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

function countWords(content: unknown): number | undefined {
  if (typeof content !== "string") return undefined;
  const text = content
    .replace(/<[^>]*>/g, " ")
    .replace(/[#*_`>~\-\[\]()!]/g, " ")
    .trim();
  if (!text) return undefined;
  return text.split(/\s+/).length;
}

function canonicalPathOf(a: {
  slug: string;
  category: { slug: string };
  subcategory?: { slug: string } | null;
}): string {
  return `/${a.category.slug}/${a.subcategory?.slug ? `${a.subcategory.slug}/` : ""}${a.slug}`;
}

// ============================================================
// DATA LOADING (cached, and 404 ONLY when the row truly does not exist)
// ============================================================

/**
 * Cached lookup. Tagged so publishing/editing can call
 * revalidateTag(`article:${slug}`) / updateTag(...) and the page refreshes.
 *
 * - Found article  -> cached for hours (Googlebot never waits on the DB).
 * - No such row    -> cached only briefly, so a newly published article
 *                     appears quickly even if someone hit the URL early.
 * - DB error       -> THROWS. Errors are never cached, the response is a 500,
 *                     and Google keeps the already-indexed copy.
 *
 * IMPORTANT: getArticleBySlug must NOT read cookies()/headers()/auth() inside,
 * because "use cache" cannot depend on request data. If it does (for example
 * to let admins preview drafts), keep drafts in a separate admin route.
 */
async function fetchArticle(slug: string) {
  "use cache";
  cacheTag(`article:${slug}`, "articles");

  const result = await getArticleBySlug(slug);

  if (result.success && result.article) {
    cacheLife("hours");
    return result.article;
  }

  // Not successful: decide between "really not found" and "something broke".
  const message = String(
    (result as { error?: unknown; message?: unknown }).error ??
      (result as { message?: unknown }).message ??
      "",
  ).toLowerCase();

  if (result.success || /not[\s_-]?found|no article|does not exist/.test(message)) {
    cacheLife("minutes");
    return null;
  }

  // Any other failure (DB down, timeout, pool exhausted) must be a 5xx.
  throw new Error(`Article lookup failed for "${slug}": ${message || "unknown error"}`);
}

async function loadArticle(rawSlug: string) {
  return fetchArticle(safeDecode(rawSlug));
}

// ============================================================
// METADATA
// ============================================================

export async function buildArticleMetadata(slug: string): Promise<Metadata> {
  const article = await loadArticle(slug);

  if (!article) {
    return {
      title: "Article not found",
      robots: { index: false, follow: false },
    };
  }

  const title = truncate(article.seo?.metaTitle || article.title, 70);
  const description = truncate(
    article.seo?.metaDescription ||
      article.shortDescription ||
      `${article.title}. Read the full story on ${SITE_NAME}.`,
    160,
  );
  const ogDescription = truncate(article.seo?.ogDescription || description, 200);
  const twitterDescription = truncate(
    article.seo?.twitterDescription || description,
    200,
  );

  const ogImage = toAbsoluteUrl(article.seo?.ogImage || article.bannerImage);
  const twitterImage = toAbsoluteUrl(
    article.seo?.twitterImage || article.seo?.ogImage || article.bannerImage,
  );

  // Canonical is built in code from the real category/subcategory/slug.
  const canonicalUrl = `${SITE_URL}${canonicalPathOf(article)}`;
  const authorName = getAuthorName(article.author);
  const tagNames = article.tags.map((t) => t.name);

  return {
    title,
    description,
    ...(tagNames.length > 0 && { keywords: tagNames }),
    authors: [{ name: authorName }],
    creator: authorName,
    publisher: SITE_NAME,
    alternates: { canonical: canonicalUrl },
    robots: ROBOTS_INDEXABLE,
    openGraph: {
      type: "article",
      url: canonicalUrl,
      siteName: SITE_NAME,
      locale: "en_US",
      title,
      description: ogDescription,
      publishedTime: toIso(article.publishedAt),
      modifiedTime: toIso(article.updatedAt),
      authors: [authorName],
      section: article.category.name,
      tags: tagNames,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: article.bannerImageAlt || article.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: twitterDescription,
      images: [twitterImage],
    },
  };
}

// ============================================================
// ADS (reserved heights so they never shift the layout)
// ============================================================

function AdSlot({
  children,
  className,
  label = "Advertisement",
}: {
  children: React.ReactNode;
  className?: string;
  label?: string;
}) {
  if (!ADS_ENABLED) return null;

  return (
    <aside
      aria-label={label}
      className={cn(
        "flex w-full min-w-0 max-w-full flex-col items-center overflow-hidden",
        className,
      )}
    >
      <span className="mb-1.5 text-[9px] font-medium uppercase tracking-[0.22em] text-muted-foreground/60">
        {label}
      </span>
      <div className="flex max-w-full justify-center">{children}</div>
    </aside>
  );
}

function SidebarAds() {
  if (!ADS_ENABLED) return null;

  return (
    <div className="hidden w-full flex-col items-stretch gap-6 lg:sticky lg:top-24 lg:flex">
      <AdSlot className="min-h-[600px] w-full">
        <Banner160x600 variant={0} />
      </AdSlot>
      <AdSlot className="min-h-[250px] w-full">
        <Banner300x250 variant={1} />
      </AdSlot>
    </div>
  );
}

function BottomAds() {
  if (!ADS_ENABLED) return null;

  return (
    <div className="mt-10 space-y-8 px-4 sm:mt-12 lg:px-0">
      <AdSlot className="hidden min-h-[90px] md:flex">
        <Banner728x90 variant={0} />
      </AdSlot>
      <AdSlot className="min-h-[250px] md:hidden">
        <Banner300x250 variant={4} />
      </AdSlot>
    </div>
  );
}

// ============================================================
// PAGE
// ============================================================

/**
 * `segments` = raw URL segments, e.g.
 *   ["technology", "my-article"]
 *   ["technology", "software-development", "my-article"]
 * The last segment is always the article slug.
 */
export async function ArticlePage({ segments }: { segments: string[] }) {
  const slug = segments[segments.length - 1];

  // Lookup happens BEFORE any streamed UI, so the status code is correct:
  // real 404 only if the row does not exist, 5xx if the DB failed.
  const blog = await loadArticle(slug);
  if (!blog) notFound();

  // One URL per article: any other path 308s to the canonical one.
  const canonicalPath = canonicalPathOf(blog);
  const requestedPath = `/${segments.map(safeDecode).join("/")}`;
  if (requestedPath !== canonicalPath) permanentRedirect(canonicalPath);

  const canonicalUrl = `${SITE_URL}${canonicalPath}`;
  const articleImage = toAbsoluteUrl(blog.seo?.ogImage || blog.bannerImage);
  const authorName = getAuthorName(blog.author);
  const published = toIso(blog.publishedAt);
  const modified = toIso(blog.updatedAt) ?? published;
  const wordCount = countWords(blog.content);

  const tocItems: TableOfContentsItem[] = Array.isArray(blog.tableOfContents)
    ? (blog.tableOfContents as TableOfContentsItem[])
    : [];

  // Breadcrumb JSON-LD must mirror the visible breadcrumb in BlogHeader.
  // The subcategory item is added only when the article has one.
  // NOTE: only keep it if /{category}/{subcategory} is a real page (not a 404).
  const crumbs: { name: string; url: string }[] = [
    { name: "Home", url: SITE_URL },
    { name: blog.category.name, url: `${SITE_URL}/${blog.category.slug}` },
    ...(blog.subcategory?.slug
      ? [
          {
            name: blog.subcategory.name,
            url: `${SITE_URL}/${blog.category.slug}/${blog.subcategory.slug}`,
          },
        ]
      : []),
    { name: blog.title, url: canonicalUrl },
  ];

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "@id": `${canonicalUrl}#breadcrumb`,
    itemListElement: crumbs.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: c.url,
    })),
  };

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    "@id": `${canonicalUrl}#article`,
    mainEntityOfPage: { "@type": "WebPage", "@id": canonicalUrl },
    isPartOf: { "@id": WEBSITE_ID },
    headline: truncate(blog.title, 110),
    description: blog.shortDescription || blog.title,
    image: [articleImage],
    datePublished: published,
    dateModified: modified,
    author: {
      "@type": "Person",
      name: authorName,
      ...(blog.author.imageUrl && { image: blog.author.imageUrl }),
      // Add `url` here once /authors/{slug} pages exist.
    },
    // Reference only: the full Organization is defined once in the root layout.
    publisher: { "@id": ORGANIZATION_ID },
    articleSection: blog.category.name,
    ...(blog.tags.length > 0 && {
      keywords: blog.tags.map((t) => t.name).join(", "),
    }),
    ...(wordCount && { wordCount }),
    ...(blog.readingTime && { timeRequired: `PT${blog.readingTime}M` }),
    inLanguage: "en",
    isAccessibleForFree: true,
    url: canonicalUrl,
  };

  return (
    // overflow-x-clip (not -hidden) so position:sticky TOC and ads still work.
    <div className="w-full min-w-0 overflow-x-clip px-0">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(articleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(breadcrumbJsonLd) }}
      />

      <BlogHeader
        title={blog.title}
        shortDescription={blog.shortDescription}
        publishedAt={blog.publishedAt}
        // updatedAt={blog.updatedAt}
        type={blog.type}
        readingTime={blog.readingTime}
        bannerImage={blog.bannerImage}
        bannerImageAlt={blog.bannerImageAlt}
        author={blog.author}
        category={blog.category}
        subcategory={blog.subcategory}
      />

      <div className="mx-auto w-full min-w-0 max-w-[1440px] px-0 pb-10 pt-6 sm:pb-12 lg:px-8 lg:pb-16 xl:px-10">
        <div className="grid w-full min-w-0 grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-10 xl:grid-cols-[minmax(0,1fr)_340px] xl:gap-14">
          <div className="order-2 min-w-0 w-full lg:order-1">
            <article className="relative min-w-0 w-full max-w-none">
              {/* Body must be server-rendered so it is in the initial HTML. */}
              <BlogPreviewer
                content={blog.content}
                tableOfContents={undefined}
              />

              <div className="mt-8 px-4 lg:px-0">
                <AdSlot
                  label="Advertisement"
                  className="min-h-[250px] overflow-visible"
                >
                  <NativeAd variant={0} />
                </AdSlot>
              </div>

              <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-border px-4 pt-6 sm:mt-12 lg:px-0">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Enjoyed this story?
                </p>
                <Suspense
                  fallback={
                    <div className="h-9 w-24 animate-pulse rounded-full bg-muted" />
                  }
                >
                  <ArticleBookmarkServer blogId={blog.id} />
                </Suspense>
              </div>
            </article>

            {/* Comments are user content: kept outside <article> so they are
                not treated as part of the article body. */}
            <section aria-label="Comments">
              <Suspense fallback={<ArticleCommentsSkeleton />}>
                <ArticleCommentsServer blogId={blog.id} blogSlug={blog.slug} />
              </Suspense>
            </section>
          </div>

          <aside className="order-1 flex w-full min-w-0 flex-col gap-6 lg:order-2 lg:self-stretch">
            <div className="lg:sticky lg:top-24 lg:z-10">
              <ArticleTOC items={tocItems} className="w-full" />
            </div>
            <SidebarAds />
          </aside>
        </div>

        <BottomAds />
      </div>
    </div>
  );
}
