"use client";

// ============================================================
// HomeScreen — ALENTAH
// Editorial homepage matching the Meridian mockup.
// Layout: 8/4 grid — Hero+cards left, Trending+Newsletter right.
// ============================================================

import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { HomeBlogCard } from "@/actions/blog/get-home-blogs";

// ============================================================
// TYPES
// ============================================================

export interface HomeScreenProps {
  blogs: HomeBlogCard[];
}

// ============================================================
// HELPERS
// ============================================================

function getAuthorName(article: HomeBlogCard): string {
  return (
    [article.author.firstName, article.author.lastName]
      .filter(Boolean)
      .join(" ") || "Alentah Editors"
  );
}

/**
 * Builds the canonical article URL.
 *
 * Format:
 *   /category/subcategory/slug
 *
 * If the article has no subcategory, falls back to:
 *   /category/slug
 */
function getArticleHref(article: HomeBlogCard): string {
  const categorySlug =
    (article.category as { slug?: string }).slug || "article";

  const subcategorySlug = (
    article as unknown as {
      subcategory?: { slug?: string } | null;
    }
  ).subcategory?.slug;

  if (subcategorySlug) {
    return `/${categorySlug}/${subcategorySlug}/${article.slug}`;
  }

  return `/${categorySlug}/${article.slug}`;
}

// ============================================================
// ROOT
// ============================================================

export function HomeScreen({ blogs }: HomeScreenProps) {
  if (blogs.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center sm:py-32">
        <p className="font-serif text-3xl tracking-tight text-foreground sm:text-4xl">
          Coming soon.
        </p>
        <p className="mt-3 text-sm text-muted-foreground">
          The first stories will appear here.
        </p>
      </div>
    );
  }

  // Split data
  const [hero, ...rest] = blogs;
  const trending = [...blogs]
    .sort((a, b) => b.viewCount - a.viewCount)
    .slice(0, 5);
  const cards = rest.slice(0, 3);

  return (
    <div className="mx-auto w-full max-w-[1500px] px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-10">
        {/* ═══════════════════════════════════════
            LEFT: HERO + CARDS (8/12)
            ═══════════════════════════════════════ */}
        <div className="lg:col-span-8">
          {/* Hero */}
          <Hero article={hero} />

          {/* Divider */}
          <div className="my-10 border-t border-border sm:my-12" />

          {/* 3-card grid */}
          {cards.length > 0 && (
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-3 sm:gap-6 lg:gap-8">
              {cards.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          )}
        </div>

        {/* ═══════════════════════════════════════
            RIGHT: TRENDING + NEWSLETTER (4/12)
            ═══════════════════════════════════════ */}
        <aside className="space-y-10 lg:col-span-4">
          {trending.length > 0 && <Trending articles={trending} />}
          <NewsletterBox />
        </aside>
      </div>
    </div>
  );
}

// ============================================================
// HERO — image left, content right
// ============================================================

function Hero({ article }: { article: HomeBlogCard }) {
  const authorName = getAuthorName(article);
  const href = getArticleHref(article);

  return (
    <article className="grid grid-cols-1 gap-6 md:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] md:items-start md:gap-8">
      {/* Image */}
      <Link
        href={href}
        className="group relative aspect-4/3 w-full overflow-hidden bg-muted"
      >
        <Image
          src={article.bannerImage}
          alt={article.title}
          fill
          priority
          sizes="(max-width: 768px) 100vw, 40vw"
          className="object-cover transition-transform duration-700 group-hover:scale-[1.02]"
          unoptimized
        />
      </Link>

      {/* Content */}
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-primary">
          {article.category.name}
        </p>

        <Link href={href} className="group">
          <h1
            className={cn(
              "mt-3 font-serif tracking-tight text-foreground",
              "text-xl leading-[1.2]",
              "sm:text-2xl",
              "lg:text-[2rem] lg:leading-[1.15]",
              "line-clamp-3",
              "transition-colors group-hover:text-primary",
            )}
          >
            {article.title}
          </h1>
        </Link>

        {article.shortDescription && (
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground line-clamp-2 lg:text-[14px]">
            {article.shortDescription}
          </p>
        )}

        {/* Byline */}
        <div className="mt-5 flex items-center gap-3">
          <div className="h-8 w-8 shrink-0 overflow-hidden rounded-full border border-border bg-muted">
            {article.author.imageUrl ? (
              <Image
                src={article.author.imageUrl}
                alt={authorName}
                width={32}
                height={32}
                className="h-full w-full object-cover"
                unoptimized
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-primary text-[10px] font-semibold text-primary-foreground">
                {authorName.charAt(0)}
              </div>
            )}
          </div>

          <p className="text-[11px] text-muted-foreground lg:text-[12px]">
            By{" "}
            <span className="font-medium text-foreground">{authorName}</span>
            {article.readingTime && (
              <>
                <span className="mx-2 text-muted-foreground/40">·</span>
                {article.readingTime} min read
              </>
            )}
          </p>
        </div>
      </div>
    </article>
  );
}

// ============================================================
// ARTICLE CARD — for the 3-col row
// ============================================================

function ArticleCard({ article }: { article: HomeBlogCard }) {
  const authorName = getAuthorName(article);
  const href = getArticleHref(article);

  return (
    <article className="group flex flex-col">
      <Link
        href={href}
        className="relative aspect-16/10 w-full overflow-hidden bg-muted"
      >
        <Image
          src={article.bannerImage}
          alt={article.title}
          fill
          sizes="(max-width: 640px) 100vw, 30vw"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          unoptimized
        />
      </Link>

      <div className="mt-4 flex flex-1 flex-col">
        <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-primary">
          {article.category.name}
        </p>

        <Link href={href}>
          <h3 className="mt-2 font-serif text-base leading-snug tracking-tight text-foreground transition-colors group-hover:text-primary line-clamp-2 lg:text-lg">
            {article.title}
          </h3>
        </Link>

        {article.shortDescription && (
          <p className="mt-2 text-[12px] leading-relaxed text-muted-foreground line-clamp-2 lg:text-[13px]">
            {article.shortDescription}
          </p>
        )}

        <div className="mt-auto flex items-center gap-2.5 pt-5">
          <div className="h-6 w-6 shrink-0 overflow-hidden rounded-full border border-border bg-muted">
            {article.author.imageUrl ? (
              <Image
                src={article.author.imageUrl}
                alt={authorName}
                width={24}
                height={24}
                className="h-full w-full object-cover"
                unoptimized
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-primary text-[9px] font-semibold text-primary-foreground">
                {authorName.charAt(0)}
              </div>
            )}
          </div>

          <p className="text-[10px] text-muted-foreground lg:text-[11px]">
            By {authorName}
            {article.readingTime && (
              <>
                <span className="mx-1.5 text-muted-foreground/40">·</span>
                {article.readingTime} min read
              </>
            )}
          </p>
        </div>
      </div>
    </article>
  );
}

// ============================================================
// TRENDING
// ============================================================

function Trending({ articles }: { articles: HomeBlogCard[] }) {
  return (
    <section className="border-t-2 border-foreground pt-5">
      <h2 className="font-serif text-3xl tracking-tight text-foreground">
        Trending
      </h2>

      <ol className="mt-6 space-y-5">
        {articles.map((article, index) => (
          <li key={article.id}>
            <Link
              href={getArticleHref(article)}
              className="group grid grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-3 border-b border-border pb-5 last:border-b-0 last:pb-0"
            >
              <span className="mt-0.5 shrink-0 font-serif text-2xl leading-none text-muted-foreground/50 tabular-nums">
                {String(index + 1).padStart(2, "0")}
              </span>

              <div className="min-w-0">
                <h3 className="font-serif text-[15px] leading-snug tracking-tight text-foreground transition-colors group-hover:text-primary line-clamp-2">
                  {article.title}
                </h3>
                <p className="mt-1.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                  {article.category.name}
                </p>
              </div>

              <div className="relative h-14 w-14 shrink-0 overflow-hidden bg-muted">
                <Image
                  src={article.bannerImage}
                  alt={article.title}
                  fill
                  sizes="56px"
                  className="object-cover"
                  unoptimized
                />
              </div>
            </Link>
          </li>
        ))}
      </ol>
    </section>
  );
}

// ============================================================
// NEWSLETTER BOX — sidebar version
// ============================================================

function NewsletterBox() {
  return (
    <section className="rounded-lg bg-muted/60 p-6">
      <h3 className="font-serif text-lg leading-tight tracking-tight text-foreground">
        Get the best stories, once a week.
      </h3>

      <p className="mt-2 text-[12px] leading-relaxed text-muted-foreground">
        Sign up for our newsletter and never miss a thing.
      </p>

      <form className="mt-4 flex flex-col gap-2 sm:flex-row">
        <input
          type="email"
          placeholder="Your email address"
          className={cn(
            "h-10 min-w-0 flex-1 rounded-md px-3",
            "border border-border bg-background",
            "text-[12px] text-foreground placeholder:text-muted-foreground/60",
            "focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/30",
          )}
        />
        <button
          type="submit"
          className={cn(
            "inline-flex h-10 items-center justify-center rounded-md px-4",
            "bg-primary text-primary-foreground",
            "text-[10px] font-semibold uppercase tracking-[0.15em]",
            "hover:bg-primary/90 transition-colors whitespace-nowrap",
          )}
        >
          Subscribe
        </button>
      </form>
    </section>
  );
}

// ============================================================
// SKELETON
// ============================================================

export function HomeScreenSkeleton() {
  return (
    <div className="mx-auto w-full max-w-[1500px] px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-10">
        {/* Left */}
        <div className="lg:col-span-8">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] md:gap-8">
            <div className="aspect-4/3 w-full animate-pulse bg-muted" />
            <div className="space-y-4">
              <div className="h-3 w-24 animate-pulse rounded-full bg-muted" />
              <div className="h-7 w-full animate-pulse rounded-md bg-muted" />
              <div className="h-7 w-4/5 animate-pulse rounded-md bg-muted" />
              <div className="h-3 w-full animate-pulse rounded-full bg-muted/70" />
              <div className="h-3 w-2/3 animate-pulse rounded-full bg-muted/70" />
            </div>
          </div>

          <div className="my-10 border-t border-border sm:my-12" />

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3 sm:gap-6 lg:gap-8">
            {[0, 1, 2].map((i) => (
              <div key={i} className="space-y-3">
                <div className="aspect-16/10 w-full animate-pulse bg-muted" />
                <div className="h-3 w-20 animate-pulse rounded-full bg-muted" />
                <div className="h-5 w-full animate-pulse rounded-md bg-muted" />
                <div className="h-3 w-24 animate-pulse rounded-full bg-muted/70" />
              </div>
            ))}
          </div>
        </div>

        {/* Right */}
        <aside className="space-y-10 lg:col-span-4">
          <div className="border-t-2 border-foreground pt-5">
            <div className="h-8 w-32 animate-pulse rounded-md bg-muted" />
            <div className="mt-6 space-y-5">
              {[0, 1, 2, 3, 4].map((i) => (
                <div key={i} className="grid grid-cols-[auto_1fr_auto] items-start gap-3 border-b border-border pb-5">
                  <div className="h-6 w-6 animate-pulse rounded bg-muted" />
                  <div className="space-y-2">
                    <div className="h-3 w-full animate-pulse rounded-full bg-muted" />
                    <div className="h-2.5 w-20 animate-pulse rounded-full bg-muted/70" />
                  </div>
                  <div className="h-14 w-14 animate-pulse bg-muted" />
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}