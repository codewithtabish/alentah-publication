// src/components/blog/blog-header.tsx
// ============================================================
// BlogHeader — ALENTAH
// Article hero: type badge, title, description, meta, banner.
// ============================================================

import { CalendarDays, Clock3, UserRound } from "lucide-react";
import Image from "next/image";

// ============================================================
// TYPES
// ============================================================

export type BlogHeaderProps = {
  title: string;
  shortDescription: string | null;
  publishedAt: Date | null;

  /**
   * Article type as a string.
   *
   * Accepted for compatibility with the Prisma `BlogType` enum
   * (e.g. "BLOG_POST", "NEWS_ARTICLE") AND with the widened
   * `string` returned by the DB action, so this component never
   * triggers a TypeScript "string is not assignable to enum"
   * error at the call site.
   */
  type: string;

  readingTime: number | null;

  bannerImage: string;
  bannerImageAlt: string | null;

  author: {
    id: string;
    firstName: string | null;
    lastName: string | null;
  };

  category: {
    id: string;
    name: string;
    slug: string;
  };

  /**
   * Optional. Articles without a subcategory receive `null`.
   */
  subcategory?: {
    id: string;
    name: string;
    slug: string;
  } | null;
};

// ============================================================
// HELPERS
// ============================================================

function getAuthorName(author: BlogHeaderProps["author"]): string {
  return (
    [author.firstName, author.lastName].filter(Boolean).join(" ") ||
    "Alentah Editors"
  );
}

function formatPublishedDate(date: Date | null): string | null {
  if (!date) return null;

  try {
    return new Intl.DateTimeFormat("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    }).format(new Date(date));
  } catch {
    return null;
  }
}

/**
 * Turns "BLOG_POST" into "BLOG POST".
 * Safe for any string input.
 */
function formatBlogType(type: string): string {
  return String(type)
    .replace(/_/g, " ")
    .trim();
}

// ============================================================
// COMPONENT
// ============================================================

export default function BlogHeader({
  title,
  shortDescription,
  publishedAt,
  type,
  readingTime,
  bannerImage,
  bannerImageAlt,
  author,
}: BlogHeaderProps) {
  const authorName = getAuthorName(author);
  const formattedDate = formatPublishedDate(publishedAt);

  return (
    <header className="pb-10 pt-8 sm:pb-12 lg:pb-16">
      {/* =====================================================
          ARTICLE TYPE
      ====================================================== */}
      <div className="mb-5">
        <span className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-primary">
          {formatBlogType(type)}
        </span>
      </div>

      {/* =====================================================
          TITLE
      ====================================================== */}
      <h1 className="max-w-5xl text-4xl font-bold leading-[1.05] tracking-[-0.035em] text-foreground sm:text-5xl lg:text-6xl xl:text-[4.25rem]">
        {title}
      </h1>

      {/* =====================================================
          DESCRIPTION
      ====================================================== */}
      {shortDescription && (
        <p className="mt-6 max-w-3xl text-lg leading-8 text-muted-foreground sm:text-xl sm:leading-9">
          {shortDescription}
        </p>
      )}

      {/* =====================================================
          AUTHOR + META
      ====================================================== */}
      <div className="mt-8 flex flex-col gap-5 border-t border-dashed border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
          {/* Author */}
          <div className="flex items-center gap-2.5">
            <div className="flex size-8 items-center justify-center rounded-full bg-muted">
              <UserRound className="size-4 text-muted-foreground" />
            </div>

            <span className="text-sm font-semibold text-foreground">
              {authorName}
            </span>
          </div>

          {/* Date */}
          {formattedDate && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CalendarDays className="size-4" />

              <time
                dateTime={
                  publishedAt
                    ? new Date(publishedAt).toISOString()
                    : undefined
                }
              >
                {formattedDate}
              </time>
            </div>
          )}

          {/* Reading time */}
          {readingTime !== null && readingTime > 0 && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock3 className="size-4" />
              <span>{readingTime} min read</span>
            </div>
          )}
        </div>
      </div>

      {/* =====================================================
          HERO BANNER
      ====================================================== */}
      <div className="mt-10 sm:mt-12 lg:mt-14">
        <div className="group relative overflow-hidden rounded-2xl border border-border bg-muted shadow-sm sm:rounded-3xl">
          <div className="relative aspect-video w-full">
            <Image
              src={bannerImage}
              alt={bannerImageAlt || title}
              fill
              priority
              sizes="(max-width: 640px) 100vw, (max-width: 1280px) 100vw, 1600px"
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.015]"
            />

            {/* Image readability overlay */}
            <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/25 via-transparent to-black/5" />

            {/* Bottom subtle vignette */}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-linear-to-t from-black/15 to-transparent" />
          </div>
        </div>

        {/* Image caption / alt context */}
        {bannerImageAlt && (
          <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
            {bannerImageAlt}
          </p>
        )}
      </div>
    </header>
  );
}