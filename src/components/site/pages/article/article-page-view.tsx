// src/components/article/article-page-view.tsx
// ============================================================
// Shared article renderer — ALENTAH
//
// Used by:
//   app/[category]/[slug]/page.tsx
//   app/[category]/[subcategory]/[slug]/page.tsx
//
// Exposes:
//   - ArticlePageRecord          (type)
//   - ArticlePageView            (main renderer)
//   - ArticlePageSkeleton        (Suspense fallback)
//   - buildArticleMetadata()     (for generateMetadata)
//   - getAuthorName()            (helper)
//   - formatPublishedDate()      (helper)
//   - parseArticleHtml()         (helper)
//   - parseArticleToc()          (helper)
// ============================================================

import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { cn } from "@/lib/utils";

// ------------------------------------------------------------
// TYPES
// ------------------------------------------------------------

export type ArticlePageRecord = {
  id: string;
  title: string;
  slug: string;
  shortDescription: string | null;
  content: unknown;
  tableOfContents: unknown;
  bannerImage: string;
  bannerImageAlt: string | null;
  readingTime: number | null;
  viewCount: number;
  publishedAt: Date | null;
  author: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    imageUrl: string | null;
    bio: string | null;
  };
  category: {
    id: string;
    name: string;
    slug: string;
  };
  subcategory: {
    id: string;
    name: string;
    slug: string;
  } | null;
  seo: {
    metaTitle: string | null;
    metaDescription: string | null;
    canonicalUrl: string | null;
    ogImage: string | null;
    ogDescription: string | null;
    twitterImage: string | null;
    twitterDescription: string | null;
  } | null;
};

type TocItem = {
  id: string;
  title: string;
  level: 2 | 3;
};

// ------------------------------------------------------------
// HELPERS
// ------------------------------------------------------------

export function getAuthorName(article: ArticlePageRecord): string {
  return (
    [article.author.firstName, article.author.lastName]
      .filter(Boolean)
      .join(" ") || "Alentah Editors"
  );
}

export function formatPublishedDate(value: Date | null): string {
  if (!value) return "";

  try {
    return new Date(value).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return "";
  }
}

/**
 * Extracts a safe HTML string from the article `content` field.
 * Supports several storage shapes.
 */
export function parseArticleHtml(content: unknown): string {
  if (!content) return "";

  if (typeof content === "string") {
    return content;
  }

  if (
    typeof content === "object" &&
    content !== null &&
    "html" in content &&
    typeof (content as { html: unknown }).html === "string"
  ) {
    return (content as { html: string }).html;
  }

  if (
    typeof content === "object" &&
    content !== null &&
    "sections" in content &&
    Array.isArray(
      (content as { sections: unknown }).sections,
    )
  ) {
    const sections = (
      content as {
        sections: Array<{ html?: unknown }>;
      }
    ).sections;

    return sections
      .map((section) =>
        typeof section?.html === "string"
          ? section.html
          : "",
      )
      .filter(Boolean)
      .join("\n\n");
  }

  return "";
}

/**
 * Safely extracts the table of contents.
 */
export function parseArticleToc(value: unknown): TocItem[] {
  if (!Array.isArray(value)) return [];

  return value
    .filter(
      (item): item is TocItem =>
        Boolean(item) &&
        typeof item === "object" &&
        typeof (item as TocItem).id === "string" &&
        typeof (item as TocItem).title === "string",
    )
    .map((item) => ({
      id: item.id,
      title: item.title,
      level: item.level === 3 ? 3 : 2,
    }));
}

/**
 * Builds Next.js metadata from an article record.
 */
export function buildArticleMetadata(
  article: ArticlePageRecord,
): Metadata {
  const title = article.seo?.metaTitle || article.title;

  const description =
    article.seo?.metaDescription ||
    article.shortDescription ||
    undefined;

  return {
    title: `${title} — Alentah`,
    description,

    openGraph: {
      title,
      description,
      type: "article",
      publishedTime: article.publishedAt
        ? new Date(article.publishedAt).toISOString()
        : undefined,
      images: article.seo?.ogImage
        ? [article.seo.ogImage]
        : article.bannerImage
          ? [article.bannerImage]
          : undefined,
    },

    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: article.seo?.twitterImage
        ? [article.seo.twitterImage]
        : article.bannerImage
          ? [article.bannerImage]
          : undefined,
    },

    alternates: article.seo?.canonicalUrl
      ? { canonical: article.seo.canonicalUrl }
      : undefined,
  };
}

// ------------------------------------------------------------
// MAIN VIEW
// ------------------------------------------------------------

export function ArticlePageView({
  article,
}: {
  article: ArticlePageRecord;
}) {
  const authorName = getAuthorName(article);

  const publishedLabel = formatPublishedDate(
    article.publishedAt,
  );

  const html = parseArticleHtml(article.content);

  const toc = parseArticleToc(
    article.tableOfContents,
  );

  const categoryHref = `/${article.category.slug}`;

  const subcategoryHref = article.subcategory
    ? `/${article.category.slug}/${article.subcategory.slug}`
    : null;

  const subcategoryName =
    article.subcategory?.name ?? null;

  return (
    <article className="mx-auto w-full max-w-[1200px] py-8 sm:py-12 lg:py-16">
      {/* ============================================================
          BREADCRUMB
          ============================================================ */}
      <nav
        aria-label="Breadcrumb"
        className="mb-6 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] font-medium uppercase tracking-[0.15em] text-muted-foreground"
      >
        <Link
          href={categoryHref}
          className="transition-colors hover:text-foreground"
        >
          {article.category.name}
        </Link>

        {subcategoryHref && subcategoryName && (
          <>
            <span className="text-muted-foreground/40">
              /
            </span>
            <Link
              href={subcategoryHref}
              className="transition-colors hover:text-foreground"
            >
              {subcategoryName}
            </Link>
          </>
        )}
      </nav>

      {/* ============================================================
          HERO
          ============================================================ */}
      <header className="space-y-6">
        <h1
          className={cn(
            "font-serif tracking-tight text-foreground",
            "text-3xl leading-[1.15]",
            "sm:text-4xl sm:leading-[1.12]",
            "lg:text-[3rem] lg:leading-[1.08]",
          )}
        >
          {article.title}
        </h1>

        {article.shortDescription && (
          <p className="max-w-3xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            {article.shortDescription}
          </p>
        )}

        {/* Byline */}
        <div className="flex flex-wrap items-center gap-4 pt-2">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full border border-border bg-muted">
              {article.author.imageUrl ? (
                <Image
                  src={article.author.imageUrl}
                  alt={authorName}
                  width={40}
                  height={40}
                  className="h-full w-full object-cover"
                  unoptimized
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-primary text-xs font-semibold text-primary-foreground">
                  {authorName.charAt(0)}
                </div>
              )}
            </div>

            <div className="text-[12px] leading-tight">
              <p className="font-medium text-foreground">
                {authorName}
              </p>
              <p className="mt-0.5 text-muted-foreground">
                {publishedLabel}
                {article.readingTime && (
                  <>
                    <span className="mx-1.5 text-muted-foreground/40">
                      ·
                    </span>
                    {article.readingTime} min read
                  </>
                )}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* ============================================================
          BANNER
          ============================================================ */}
      {article.bannerImage && (
        <div className="relative mt-8 aspect-video w-full overflow-hidden rounded-lg bg-muted sm:mt-10">
          <Image
            src={article.bannerImage}
            alt={article.bannerImageAlt || article.title}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 1200px"
            className="object-cover"
            unoptimized
          />
        </div>
      )}

      {/* ============================================================
          CONTENT + TOC
          ============================================================ */}
      <div className="mt-10 grid grid-cols-1 gap-10 sm:mt-12 lg:mt-14 lg:grid-cols-[minmax(0,1fr)_240px] lg:gap-14">
        {/* ---------- BODY ---------- */}
        <div className="min-w-0">
          {html ? (
            <div
              className={cn(
                "article-content",
                "[&_p]:text-lg [&_p]:leading-8 [&_p]:text-foreground",
                "[&_h2]:mt-12 [&_h2]:font-serif [&_h2]:text-3xl [&_h2]:tracking-tight [&_h2]:text-foreground",
                "[&_h3]:mt-8 [&_h3]:font-serif [&_h3]:text-2xl [&_h3]:tracking-tight [&_h3]:text-foreground",
                "[&_a]:text-primary [&_a]:underline [&_a]:decoration-primary/40 [&_a]:underline-offset-4 hover:[&_a]:decoration-primary",
                "[&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-2",
                "[&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:space-y-2",
                "[&_li]:text-lg [&_li]:leading-8 [&_li]:text-foreground",
                "[&_strong]:font-semibold [&_strong]:text-foreground",
                "[&_code]:rounded [&_code]:bg-muted [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:text-sm",
                "[&_blockquote]:border-l-2 [&_blockquote]:border-primary/40 [&_blockquote]:pl-5 [&_blockquote]:italic [&_blockquote]:text-muted-foreground",
              )}
              dangerouslySetInnerHTML={{ __html: html }}
            />
          ) : (
            <p className="text-lg leading-8 text-muted-foreground">
              The content of this article is not yet available.
            </p>
          )}

          {/* ---------- AUTHOR BIO ---------- */}
          {article.author.bio && (
            <aside className="mt-14 rounded-lg border border-border bg-muted/40 p-6">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full border border-border bg-muted">
                  {article.author.imageUrl ? (
                    <Image
                      src={article.author.imageUrl}
                      alt={authorName}
                      width={48}
                      height={48}
                      className="h-full w-full object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-primary text-sm font-semibold text-primary-foreground">
                      {authorName.charAt(0)}
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">
                    Written by
                  </p>
                  <p className="mt-1 font-serif text-lg tracking-tight text-foreground">
                    {authorName}
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {article.author.bio}
                  </p>
                </div>
              </div>
            </aside>
          )}

          {/* ---------- BACK LINK ---------- */}
          <div className="mt-12">
            <Link
              href={
                subcategoryHref ?? categoryHref
              }
              className="inline-flex items-center gap-2 text-sm font-medium text-primary transition-colors hover:text-primary/80"
            >
              <span aria-hidden="true">←</span>
              Back to{" "}
              {subcategoryName ??
                article.category.name}
            </Link>
          </div>
        </div>

        {/* ---------- TOC ---------- */}
        {toc.length > 0 && (
          <aside className="hidden lg:block">
            <div className="sticky top-8">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">
                On this page
              </p>

              <nav className="mt-4">
                <ol className="space-y-2.5">
                  {toc.map((item) => (
                    <li
                      key={item.id}
                      className={cn(
                        item.level === 3 && "pl-4",
                      )}
                    >
                      <a
                        href={`#${item.id}`}
                        className={cn(
                          "block border-l border-transparent pl-3",
                          "text-[13px] leading-snug text-muted-foreground",
                          "transition-colors hover:border-primary/40 hover:text-foreground",
                        )}
                      >
                        {item.title}
                      </a>
                    </li>
                  ))}
                </ol>
              </nav>
            </div>
          </aside>
        )}
      </div>
    </article>
  );
}

// ------------------------------------------------------------
// SKELETON
// ------------------------------------------------------------

export function ArticlePageSkeleton() {
  return (
    <div className="mx-auto w-full max-w-[1200px] animate-pulse py-8 sm:py-12 lg:py-16">
      <div className="mb-6 flex gap-2">
        <div className="h-3 w-20 rounded-full bg-muted" />
        <div className="h-3 w-3 rounded-full bg-muted/60" />
        <div className="h-3 w-16 rounded-full bg-muted" />
      </div>

      <div className="space-y-3">
        <div className="h-10 w-full rounded-md bg-muted" />
        <div className="h-10 w-4/5 rounded-md bg-muted" />
      </div>

      <div className="mt-5 space-y-2">
        <div className="h-4 w-full rounded-full bg-muted/70" />
        <div className="h-4 w-3/4 rounded-full bg-muted/70" />
      </div>

      <div className="mt-6 flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-muted" />
        <div className="space-y-2">
          <div className="h-3 w-24 rounded-full bg-muted" />
          <div className="h-2.5 w-32 rounded-full bg-muted/70" />
        </div>
      </div>

      <div className="mt-10 aspect-video w-full rounded-lg bg-muted" />

      <div className="mt-12 grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_240px] lg:gap-14">
        <div className="space-y-4">
          <div className="h-4 w-full rounded-full bg-muted/70" />
          <div className="h-4 w-11/12 rounded-full bg-muted/70" />
          <div className="h-4 w-full rounded-full bg-muted/70" />
          <div className="h-4 w-4/5 rounded-full bg-muted/70" />
          <div className="mt-6 h-6 w-1/2 rounded-md bg-muted" />
          <div className="h-4 w-full rounded-full bg-muted/70" />
          <div className="h-4 w-10/12 rounded-full bg-muted/70" />
          <div className="h-4 w-full rounded-full bg-muted/70" />
        </div>

        <div className="hidden lg:block">
          <div className="space-y-3">
            <div className="h-3 w-24 rounded-full bg-muted" />
            <div className="h-3 w-full rounded-full bg-muted/70" />
            <div className="h-3 w-5/6 rounded-full bg-muted/70" />
            <div className="h-3 w-full rounded-full bg-muted/70" />
            <div className="h-3 w-3/4 rounded-full bg-muted/70" />
          </div>
        </div>
      </div>
    </div>
  );
}