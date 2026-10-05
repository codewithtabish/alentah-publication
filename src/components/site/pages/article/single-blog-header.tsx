// src/components/blog/blog-header.tsx
// ============================================================
// BlogHeader — ALENTAH
// Article hero: category, title, description, meta, banner.
// Fully responsive. Editorial premium styling.
// Title + description span full width on every screen size.
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

  /**
   * Article type as a string.
   * Compatible with the Prisma `BlogType` enum AND with the
   * widened `string` returned by the DB action.
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
    <header className="relative w-full min-w-0 overflow-hidden pt-10 sm:pt-14 lg:pt-16">
      {/* =====================================================
          AMBIENT BACKGROUND
          Soft top glow + bottom fade for depth
      ====================================================== */}
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
            Small dot + uppercase label + hairline
        ====================================================== */}
        <div className="flex min-w-0 items-center gap-3">
          <span
            aria-hidden="true"
            className="inline-block size-1.5 shrink-0 rounded-full bg-primary"
          />

          <p
            className="min-w-0 truncate text-[10px] font-bold uppercase tracking-[0.2em] text-primary sm:text-[11px] sm:tracking-[0.24em]"
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
            TITLE — full width, breaks long words
        ====================================================== */}
        <h1
          className={[
            "mt-5 w-full max-w-none wrap-break-word font-bold tracking-[-0.03em] text-foreground",
            "text-[1.75rem] leading-[1.15]",
            "sm:text-4xl sm:leading-[1.12] sm:tracking-[-0.035em]",
            "md:text-5xl md:leading-[1.1]",
            "lg:text-[3.5rem] lg:leading-[1.06]",
            "xl:text-[4rem] xl:leading-[1.05]",
          ].join(" ")}
        >
          {title}
        </h1>

        {/* =====================================================
            DESCRIPTION — full width, breaks long words
        ====================================================== */}
        {shortDescription && (
          <p
            className={[
              "mt-6 w-full max-w-none wrap-break-word text-muted-foreground",
              "text-[15px] leading-7",
              "sm:text-base sm:leading-7",
              "md:text-[1.0625rem] md:leading-8",
              "lg:text-lg lg:leading-9",
            ].join(" ")}
          >
            {shortDescription}
          </p>
        )}

        {/* =====================================================
            AUTHOR + META
        ====================================================== */}
        <div className="mt-9 flex flex-wrap items-center gap-x-4 gap-y-3 border-t border-border/70 pt-6 sm:mt-10">
          {/* Author chip */}
          <div className="flex min-w-0 items-center gap-3">
            <span
              aria-hidden="true"
              className={[
                "flex size-9 shrink-0 items-center justify-center rounded-full",
                "border border-border bg-muted/60",
                "text-[11px] font-bold tracking-wide text-foreground",
              ].join(" ")}
            >
              {initials}
            </span>

            <div className="flex min-w-0 flex-col leading-tight">
              <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground/80">
                Written by
              </span>

              <span className="truncate text-sm font-semibold text-foreground">
                {authorName}
              </span>
            </div>
          </div>

          {/* Divider */}
          <span
            aria-hidden="true"
            className="hidden h-8 w-px bg-border sm:block"
          />

          {/* Date */}
          {formattedDate && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CalendarDays
                className="size-3.5 shrink-0 opacity-70"
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

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock3
                  className="size-3.5 shrink-0 opacity-70"
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
                "px-3 py-1",
                "text-[10px] font-bold uppercase tracking-[0.18em]",
                "text-muted-foreground",
              ].join(" ")}
            >
              {formatBlogType(type)}
            </span>
          )}
        </div>

        {/* =====================================================
            HERO BANNER — full width
        ====================================================== */}
        {bannerImage && (
          <figure className="mt-10 w-full sm:mt-12 lg:mt-14">
            <div
              className={[
                "group relative w-full overflow-hidden",
                "rounded-xl border border-border sm:rounded-2xl lg:rounded-3xl",
                "bg-muted shadow-[0_1px_0_0_rgba(255,255,255,0.03)_inset,0_20px_50px_-30px_rgba(0,0,0,0.6)]",
              ].join(" ")}
            >
              <div className="relative aspect-video w-full">
                <Image
                  src={bannerImage}
                  alt={bannerImageAlt || title}
                  fill
                  priority
                  sizes="100vw"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02]"
                />

                {/* Top fade */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-linear-to-b from-black/20 to-transparent"
                />

                {/* Bottom fade */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-linear-to-t from-black/35 via-black/10 to-transparent"
                />

                {/* Hairline inner border */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-inset ring-white/5 sm:rounded-2xl lg:rounded-3xl"
                />
              </div>
            </div>

            {bannerImageAlt && (
              <figcaption className="mt-3 text-center text-[11px] leading-relaxed tracking-wide text-muted-foreground/80">
                {bannerImageAlt}
              </figcaption>
            )}
          </figure>
        )}

        {/* Screen-reader safety: category slug */}
        <span className="sr-only">{categorySlug}</span>
      </div>
    </header>
  );
}