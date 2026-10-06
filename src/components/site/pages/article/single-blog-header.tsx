// src/components/blog/blog-header.tsx
// ============================================================
// BlogHeader — ALENTAH
// Article hero: category, title, description, meta, banner.
// Compact mobile scale — reads like a magazine column on phones.
//
// Performance:
//   - Banner image uses priority + fetchPriority="high" + quality=85.
//     It is the LCP element on every article page.
// ============================================================

import { CalendarDays, Clock3 } from "lucide-react";
import Image from "next/image";

// ============================================================
// TYPES
// ============================================================

export type BlogHeaderProps = {
  title: string;
  shortDescription: string | null;
  publishedAt: Date | null;
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

function formatBlogType(type: string): string {
  return String(type).replace(/_/g, " ").trim();
}

function getInitials(name: string): string {
  const parts = name.split(" ").filter(Boolean);

  if (parts.length === 0) return "A";

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return (
    parts[0].charAt(0) + parts[parts.length - 1].charAt(0)
  ).toUpperCase();
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
  category,
  subcategory,
}: BlogHeaderProps) {
  const authorName = getAuthorName(author);
  const formattedDate = formatPublishedDate(publishedAt);

  const categoryLabel = subcategory?.name || category.name;
  const categorySlug = subcategory?.slug || category.slug;

  const initials = getInitials(authorName);

  return (
    <header className="relative w-full min-w-0 overflow-hidden pt-6 sm:pt-10 lg:pt-14">
      {/* Ambient background glow */}
      <div
        aria-hidden="true"
        className={[
          "pointer-events-none absolute inset-x-0 top-0 -z-10 h-[420px]",
          "bg-[radial-gradient(ellipse_50%_70%_at_50%_0%,color-mix(in_oklab,var(--primary)_6%,transparent),transparent_75%)]",
          "dark:bg-[radial-gradient(ellipse_50%_70%_at_50%_0%,color-mix(in_oklab,var(--primary)_10%,transparent),transparent_75%)]",
        ].join(" ")}
      />

      <div className="w-full min-w-0">
        {/* =====================================================
            CATEGORY KICKER
        ====================================================== */}
        <div className="flex min-w-0 items-center gap-2 sm:gap-2.5">
          <span
            aria-hidden="true"
            className="inline-block size-1.5 shrink-0 rounded-full bg-primary"
          />

          <p
            className="min-w-0 truncate text-[9.5px] font-bold uppercase tracking-[0.16em] text-primary sm:text-[10px] sm:tracking-[0.2em]"
            aria-label="Category"
          >
            {categoryLabel}
            {subcategory && category?.name && (
              <span className="sr-only"> — {category.name}</span>
            )}
          </p>

          <span
            aria-hidden="true"
            className="h-px min-w-0 flex-1 bg-linear-to-r from-primary/40 to-transparent"
          />
        </div>

        {/* =====================================================
            TITLE
               mobile  → 18px
               sm 640  → 22px
               md 768  → 28px
               lg 1024 → 36px
               xl 1280 → 42px
        ====================================================== */}
        <h1
          className={[
            "mt-3 w-full max-w-none wrap-break-word font-bold tracking-[-0.02em] text-foreground sm:mt-4",
            "text-[1.125rem] leading-tight",
            "sm:text-[1.375rem] sm:leading-[1.22] sm:tracking-[-0.025em]",
            "md:text-[1.75rem] md:leading-[1.18] md:tracking-[-0.03em]",
            "lg:text-[2.25rem] lg:leading-[1.15] lg:tracking-[-0.035em]",
            "xl:text-[2.625rem] xl:leading-[1.12]",
          ].join(" ")}
        >
          {title}
        </h1>

        {/* =====================================================
            DESCRIPTION
        ====================================================== */}
        {shortDescription && (
          <p
            className={[
              "mt-3 w-full max-w-none wrap-break-word text-muted-foreground sm:mt-4",
              "text-[13.5px] leading-[1.6]",
              "sm:text-[14.5px] sm:leading-[1.65]",
              "md:text-[15.5px] md:leading-[1.7]",
              "lg:text-[1rem] lg:leading-[1.75]",
            ].join(" ")}
          >
            {shortDescription}
          </p>
        )}

        {/* =====================================================
            AUTHOR + META
        ====================================================== */}
        <div className="mt-6 flex flex-wrap items-center gap-x-3.5 gap-y-2.5 border-t border-border/70 pt-4 sm:mt-8 sm:gap-x-4 sm:gap-y-3 sm:pt-5">
          {/* Author chip */}
          <div className="flex min-w-0 items-center gap-2.5">
            <span
              aria-hidden="true"
              className={[
                "flex size-8 shrink-0 items-center justify-center rounded-full",
                "border border-border bg-muted/60",
                "text-[10px] font-bold tracking-wide text-foreground sm:size-9 sm:text-[11px]",
              ].join(" ")}
            >
              {initials}
            </span>

            <div className="flex min-w-0 flex-col leading-tight">
              <span className="text-[9px] font-semibold uppercase tracking-[0.14em] text-muted-foreground/80 sm:text-[10px] sm:tracking-[0.16em]">
                Written by
              </span>

              <span className="truncate text-[12.5px] font-semibold text-foreground sm:text-sm">
                {authorName}
              </span>
            </div>
          </div>

          {/* Divider */}
          <span
            aria-hidden="true"
            className="hidden h-7 w-px bg-border sm:block sm:h-8"
          />

          {/* Date */}
          {formattedDate && (
            <div className="flex items-center gap-1.5 text-[12px] text-muted-foreground sm:gap-2 sm:text-sm">
              <CalendarDays
                className="size-3 shrink-0 opacity-70 sm:size-3.5"
                aria-hidden="true"
              />

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
            <>
              <span
                aria-hidden="true"
                className="hidden size-1 rounded-full bg-muted-foreground/40 sm:block"
              />

              <div className="flex items-center gap-1.5 text-[12px] text-muted-foreground sm:gap-2 sm:text-sm">
                <Clock3
                  className="size-3 shrink-0 opacity-70 sm:size-3.5"
                  aria-hidden="true"
                />
                <span>{readingTime} min read</span>
              </div>
            </>
          )}

          {/* Article type badge */}
          {type && (
            <span
              className={[
                "ml-auto hidden sm:inline-flex",
                "items-center rounded-full",
                "border border-border/70 bg-muted/40",
                "px-2.5 py-0.5 sm:px-3 sm:py-1",
                "text-[9px] font-bold uppercase tracking-[0.16em] sm:text-[10px] sm:tracking-[0.18em]",
                "text-muted-foreground",
              ].join(" ")}
            >
              {formatBlogType(type)}
            </span>
          )}
        </div>

        {/* =====================================================
            HERO BANNER
        ====================================================== */}
        {bannerImage && (
          <figure className="mt-7 w-full sm:mt-9 lg:mt-12">
            <div
              className={[
                "group relative w-full overflow-hidden",
                "rounded-lg border border-border sm:rounded-xl lg:rounded-2xl",
                "bg-muted shadow-[0_1px_0_0_rgba(255,255,255,0.03)_inset,0_20px_50px_-30px_rgba(0,0,0,0.6)]",
              ].join(" ")}
            >
              <div className="relative aspect-video w-full">
                <Image
                  src={bannerImage}
                  alt={bannerImageAlt || title}
                  fill
                  priority
                  fetchPriority="high"
                  quality={85}
                  sizes="100vw"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02]"
                />

                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-linear-to-b from-black/20 to-transparent"
                />

                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-linear-to-t from-black/35 via-black/10 to-transparent"
                />

                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 rounded-lg ring-1 ring-inset ring-white/5 sm:rounded-xl lg:rounded-2xl"
                />
              </div>
            </div>

            {bannerImageAlt && (
              <figcaption className="mt-2.5 text-center text-[10.5px] leading-relaxed tracking-wide text-muted-foreground/80 sm:mt-3 sm:text-[11px]">
                {bannerImageAlt}
              </figcaption>
            )}
          </figure>
        )}

        <span className="sr-only">{categorySlug}</span>
      </div>
    </header>
  );
}