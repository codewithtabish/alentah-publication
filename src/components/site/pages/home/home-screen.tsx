"use client";

// ============================================================
// HomeScreen — ALENTAH
//
// Layout (lg):
//   Row 1 — Hero (8/12) | Trending + Newsletter + 300x250 (4/12)
//   Row 2 — 3-card grid (8/12) + native ad under it
//   Row 3 — Full-width 728x90 (md+)
//   Row 4 — Latest Stories (full width, featured byline = editor)
//   Row 5 — Native ad after Latest Stories
//   Row 6 — Editor's Picks
//
// Sidebar is right-aligned inside its 4/12 track so no white
// gap appears on the right side of the page.
// ============================================================

import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { HomeBlogCard } from "@/actions/blog/get-home-blogs";
import { NewsletterBox } from "./newsletter-box";
import {
  ADS_ENABLED,
  Banner300x250,
  Banner728x90,
  NativeAd,
} from "../../general/ads/site-ads";

// ============================================================
// TYPES
// ============================================================

export interface HomeScreenProps {
  blogs: HomeBlogCard[];
}

// ============================================================
// HELPERS
// ============================================================

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
// AD SLOT — no background, no border, no padding box
// (the `framed` prop is kept so existing usages still compile)
// ============================================================

function AdSlot({
  children,
  className,
  label = "Advertisement",
}: {
  children: React.ReactNode;
  className?: string;
  label?: string;
  framed?: boolean;
}) {
  if (!ADS_ENABLED) return null;

  return (
    <aside
      aria-label={label}
      className={cn("flex w-full min-w-0 flex-col items-center", className)}
    >
      <span className="mb-1.5 text-[9px] font-medium uppercase tracking-[0.22em] text-muted-foreground/60">
        {label}
      </span>
      <div className="flex justify-center">{children}</div>
    </aside>
  );
}

// ============================================================
// ROOT
// ============================================================

export function HomeScreen({ blogs }: HomeScreenProps) {
  if (blogs.length === 0) {
    return (
      <div>
        <p className="font-serif text-3xl tracking-tight text-foreground sm:text-4xl">
          Coming soon.
        </p>
        <p className="mt-3 text-sm text-muted-foreground">
          The first stories will appear here.
        </p>
      </div>
    );
  }

  const EXCLUDED_SLUGS = new Set<string>([
    "ai-agents-explained-how-autonomous-ai-systems-actually-work",
    "artificial-intelligence-machine-learning-ai-news-tools-trends",
  ]);

  const filtered = blogs.filter((b) => !EXCLUDED_SLUGS.has(b.slug));

  if (filtered.length === 0) {
    return (
      <div>
        <p className="font-serif text-3xl tracking-tight text-foreground sm:text-4xl">
          Coming soon.
        </p>
        <p className="mt-3 text-sm text-muted-foreground">
          The first stories will appear here.
        </p>
      </div>
    );
  }

  const [hero, ...rest] = filtered;

  const trending = [...filtered]
    .sort((a, b) => b.viewCount - a.viewCount)
    .slice(0, 5);

  const cards = rest.slice(0, 3);
  const latestStories = rest.slice(3, 11);

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-10 px-4 sm:space-y-12 sm:px-6 lg:space-y-14 lg:px-8">
      {/* ROW 1 + 2 */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-8">
          <Hero article={hero} />

          <div className="my-6 border-t border-border sm:my-8" />

          {cards.length > 0 && (
            <>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 sm:gap-5 lg:gap-6">
                {cards.map((article) => (
                  <ArticleCard key={article.id} article={article} />
                ))}
              </div>

              <AdSlot className="mt-8" label="Sponsored">
                <NativeAd />
              </AdSlot>
            </>
          )}
        </div>

        {/* SIDEBAR — flush to the right edge of its 4/12 track */}
        <aside className="flex h-full w-full flex-col gap-4 lg:col-span-4 lg:justify-self-end lg:ml-auto lg:max-w-[420px]">
          {trending.length > 0 && <Trending articles={trending} />}
          <NewsletterBox />

          <AdSlot className="lg:sticky lg:top-24" label="Advertisement">
            <Banner300x250 />
          </AdSlot>
        </aside>
      </div>

      {/* AD — full-width 728x90 before Latest Stories (md+) */}
      {latestStories.length > 0 && (
        <AdSlot className="hidden md:flex" label="Advertisement">
          <Banner728x90 />
        </AdSlot>
      )}

      {/* ROW 3 — Latest Stories */}
      {latestStories.length > 0 && (
        <LatestStories articles={latestStories} />
      )}

      {/* AD — native after Latest Stories */}
      {latestStories.length > 0 && (
        <AdSlot className="mx-auto max-w-4xl" label="Sponsored">
          <NativeAd />
        </AdSlot>
      )}

      {/* ROW 4 — Editor's Picks */}
      {latestStories.length > 4 && (
        <EditorsPicks articles={latestStories.slice(4, 8)} />
      )}
    </div>
  );
}

// ============================================================
// HERO
// ============================================================

function Hero({ article }: { article: HomeBlogCard }) {
  const href = getArticleHref(article);

  return (
    <article className="grid grid-cols-1 gap-5 md:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] md:items-start md:gap-7">
      <Link
        href={href}
        className="relative block aspect-4/3 w-full overflow-hidden bg-background"
      >
        <Image
          src={article.bannerImage}
          alt={article.title}
          fill
          priority
          fetchPriority="high"
          sizes="(max-width: 768px) 100vw, 40vw"
          className="object-cover scale-[1.01]"
        />
      </Link>

      <div className="max-w-[46ch]">
        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-primary">
          {article.category.name}
        </p>

        <Link href={href} className="group">
          <h1
            className={cn(
              "mt-2.5 font-serif tracking-tight text-foreground",
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
          <p className="mt-2.5 max-w-[52ch] text-sm leading-relaxed text-muted-foreground line-clamp-2 lg:text-[14px]">
            {article.shortDescription}
          </p>
        )}
      </div>
    </article>
  );
}

// ============================================================
// ARTICLE CARD
// ============================================================

function ArticleCard({ article }: { article: HomeBlogCard }) {
  const href = getArticleHref(article);

  return (
    <article className="group flex flex-col">
      <Link
        href={href}
        className="relative block aspect-16/10 w-full overflow-hidden bg-background"
      >
        <Image
          src={article.bannerImage}
          alt={article.title}
          fill
          sizes="(max-width: 640px) 100vw, 30vw"
          className="object-cover scale-[1.01]"
        />
      </Link>

      <div className="mt-3 flex flex-1 flex-col">
        <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-primary">
          {article.category.name}
        </p>

        <Link href={href}>
          <h3 className="mt-1.5 max-w-[42ch] font-serif text-base leading-snug tracking-tight text-foreground transition-colors group-hover:text-primary line-clamp-2 lg:text-lg">
            {article.title}
          </h3>
        </Link>

        {article.shortDescription && (
          <p className="mt-1.5 max-w-[46ch] text-[12px] leading-relaxed text-muted-foreground line-clamp-2 lg:text-[13px]">
            {article.shortDescription}
          </p>
        )}
      </div>
    </article>
  );
}

// ============================================================
// LATEST STORIES
// ============================================================

function LatestStories({ articles }: { articles: HomeBlogCard[] }) {
  const featured = articles[0];
  const compactRows = articles.slice(1, 4);

  if (!featured) return null;

  const featuredHref = getArticleHref(featured);

  const editor = featured.category.editor;
  const editorName = editor?.name ?? null;
  const editorImage = editor?.imageUrl ?? null;

  const INLINE_AD_AFTER = 2;

  return (
    <section aria-labelledby="latest-stories-heading" className="w-full">
      <div className="flex items-end justify-between gap-6 border-b border-border pb-4">
        <h2
          id="latest-stories-heading"
          className="font-serif text-3xl tracking-tight text-foreground sm:text-4xl"
        >
          Latest Stories
        </h2>

        <Link
          href="/articles"
          className="group inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground transition-colors hover:text-foreground"
        >
          <span>View All</span>
          <span
            aria-hidden="true"
            className="transition-transform duration-200 group-hover:translate-x-0.5"
          >
            →
          </span>
        </Link>
      </div>

      <article className="group grid grid-cols-1 gap-6 pt-6 lg:grid-cols-12 lg:gap-10">
        <Link
          href={featuredHref}
          className="relative col-span-1 block aspect-16/10 w-full overflow-hidden bg-background lg:col-span-6 lg:aspect-4/3"
        >
          <Image
            src={featured.bannerImage}
            alt={featured.title}
            fill
            priority
            fetchPriority="high"
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover scale-[1.01]"
          />
        </Link>

        <div className="flex flex-col justify-center lg:col-span-6">
          <div className="max-w-[58ch]">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-primary">
              {featured.category.name}
            </p>

            <Link href={featuredHref} className="group/title">
              <h3
                className={cn(
                  "mt-2.5 font-serif tracking-tight text-foreground",
                  "text-2xl leading-[1.15]",
                  "sm:text-3xl",
                  "lg:text-[2.25rem] lg:leading-[1.12]",
                  "line-clamp-3",
                  "transition-colors group-hover/title:text-primary",
                )}
              >
                {featured.title}
              </h3>
            </Link>

            {featured.shortDescription && (
              <p className="mt-3 max-w-[62ch] text-base leading-relaxed text-muted-foreground line-clamp-3 lg:text-[15px]">
                {featured.shortDescription}
              </p>
            )}
          </div>

          {editorName && (
            <div className="mt-5 flex items-center gap-3">
              <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full border border-border bg-background">
                {editorImage ? (
                  <Image
                    src={editorImage}
                    alt={editorName}
                    fill
                    sizes="44px"
                    className="object-cover scale-[1.01]"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-primary text-[13px] font-semibold text-primary-foreground">
                    {editorName.charAt(0)}
                  </div>
                )}
              </div>

              <div className="flex flex-col leading-tight">
                <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground/80">
                  Written by
                </span>
                <span className="text-[14px] font-semibold uppercase tracking-[0.06em] text-foreground">
                  {editorName}
                </span>
              </div>
            </div>
          )}
        </div>
      </article>

      {compactRows.length > 0 && (
        <ul className="mt-8 divide-y divide-border border-t border-border">
          {compactRows.map((article, index) => {
            const href = getArticleHref(article);
            const showInlineAd = index === INLINE_AD_AFTER - 1;

            return (
              <li key={article.id}>
                <Link
                  href={href}
                  className="group grid grid-cols-[96px_minmax(0,1fr)] items-start gap-5 py-5 sm:grid-cols-[160px_minmax(0,1fr)] sm:gap-7"
                >
                  <div className="relative aspect-16/10 w-full overflow-hidden bg-background">
                    <Image
                      src={article.bannerImage}
                      alt={article.title}
                      fill
                      sizes="(max-width: 640px) 96px, 160px"
                      className="object-cover scale-[1.01]"
                    />
                  </div>

                  <div className="min-w-0 max-w-[62ch]">
                    <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-primary">
                      {article.category.name}
                    </p>

                    <h4 className="mt-1.5 font-serif text-base leading-snug tracking-tight text-foreground transition-colors group-hover:text-primary line-clamp-2 sm:text-lg">
                      {article.title}
                    </h4>

                    {article.shortDescription && (
                      <p className="mt-1.5 max-w-[60ch] text-[13px] leading-relaxed text-muted-foreground line-clamp-2">
                        {article.shortDescription}
                      </p>
                    )}
                  </div>
                </Link>

                {showInlineAd && (
                  <div className="py-5">
                    <AdSlot framed={false} label="Advertisement">
                      <Banner300x250 />
                    </AdSlot>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

// ============================================================
// EDITOR'S PICKS
// ============================================================

function EditorsPicks({ articles }: { articles: HomeBlogCard[] }) {
  if (articles.length === 0) return null;

  const INLINE_AD_AFTER = 2;

  return (
    <section aria-labelledby="editors-picks-heading" className="w-full">
      <div className="rounded-lg bg-muted/40 p-5 sm:p-6 lg:p-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Category Spotlight
        </p>

        <h2
          id="editors-picks-heading"
          className="mt-1.5 font-serif text-3xl tracking-tight text-foreground sm:text-[2rem]"
        >
          Editor&rsquo;s Picks
        </h2>

        <ol className="mt-6 divide-y divide-border">
          {articles.map((article, index) => {
            const href = getArticleHref(article);
            const showInlineAd = index === INLINE_AD_AFTER - 1;

            return (
              <li key={article.id} className="py-5 first:pt-0 last:pb-0">
                <Link
                  href={href}
                  className="group grid grid-cols-[auto_120px_minmax(0,1fr)] items-start gap-5 sm:grid-cols-[auto_160px_minmax(0,1fr)] sm:gap-6"
                >
                  <span
                    aria-hidden="true"
                    className="mt-1 shrink-0 font-serif text-2xl leading-none text-muted-foreground/70 tabular-nums"
                  >
                    {String(index + 1).padStart(2, "0")}
                  </span>

                  <div className="relative aspect-square w-[120px] overflow-hidden bg-background sm:w-[160px]">
                    <Image
                      src={article.bannerImage}
                      alt={article.title}
                      fill
                      sizes="(max-width: 640px) 120px, 160px"
                      className="object-cover scale-[1.01]"
                    />
                  </div>

                  <div className="min-w-0 max-w-[62ch] pt-1">
                    <h3 className="font-serif text-lg leading-snug tracking-tight text-foreground transition-colors group-hover:text-primary line-clamp-2 sm:text-xl">
                      {article.title}
                    </h3>
                    <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                      {article.category.name}
                    </p>
                  </div>
                </Link>

                {showInlineAd && (
                  <div className="mt-5">
                    <AdSlot className="mx-auto max-w-3xl" label="Sponsored">
                      <NativeAd />
                    </AdSlot>
                  </div>
                )}
              </li>
            );
          })}
        </ol>

        <div className="mt-6 flex justify-center">
          <Link
            href="/articles"
            className={cn(
              "inline-flex h-10 items-center justify-center rounded-md px-6",
              "bg-primary text-primary-foreground",
              "text-[11px] font-semibold uppercase tracking-[0.15em]",
              "hover:bg-primary/90 transition-colors",
            )}
          >
            Read More
          </Link>
        </div>
      </div>
    </section>
  );
}

// ============================================================
// TRENDING — consistent rows, titles fill the full sidebar width
// (text-wrap: wrap overrides any global "balance" on headings,
//  which was causing titles to break early and leave empty
//  space on the right)
// ============================================================

function Trending({ articles }: { articles: HomeBlogCard[] }) {
  return (
    <section
      aria-labelledby="trending-heading"
      className="w-full border-t-2 border-foreground pt-4"
    >
      <h2
        id="trending-heading"
        className="font-serif text-3xl tracking-tight text-foreground"
      >
        Trending
      </h2>

      <ol className="mt-4 w-full">
        {articles.map((article, index) => (
          <li key={article.id} className="w-full">
            <Link
              href={getArticleHref(article)}
              className={cn(
                "group grid w-full grid-cols-[2.25rem_minmax(0,1fr)] items-start gap-3",
                "border-b border-border py-3.5",
                "first:pt-0 last:border-b-0 last:pb-0",
              )}
            >
              <span
                aria-hidden="true"
                className="shrink-0 pt-0.5 font-serif text-2xl leading-none text-muted-foreground/50 tabular-nums"
              >
                {String(index + 1).padStart(2, "0")}
              </span>

              <div className="flex w-full min-w-0 flex-col">
                <h3
                  className={cn(
                    "w-full max-w-none font-serif tracking-tight text-foreground",
                    "text-[15px] leading-snug sm:text-base",
                    "text-wrap wrap-break-word",
                    "line-clamp-2 transition-colors group-hover:text-primary",
                  )}
                >
                  {article.title}
                </h3>

                <p className="mt-1.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                  {article.category.name}
                </p>
              </div>
            </Link>
          </li>
        ))}
      </ol>
    </section>
  );
}

// ============================================================
// SKELETON
// ============================================================

export function HomeScreenSkeleton() {
  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-10 px-4 sm:space-y-12 sm:px-6 lg:space-y-14 lg:px-8">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-8">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] md:gap-7">
            <div className="aspect-4/3 w-full animate-pulse bg-muted" />
            <div className="space-y-3">
              <div className="h-3 w-24 animate-pulse rounded-full bg-muted" />
              <div className="h-7 w-full animate-pulse rounded-md bg-muted" />
              <div className="h-7 w-4/5 animate-pulse rounded-md bg-muted" />
              <div className="h-3 w-full animate-pulse rounded-full bg-muted/70" />
              <div className="h-3 w-2/3 animate-pulse rounded-full bg-muted/70" />
            </div>
          </div>

          <div className="my-6 border-t border-border sm:my-8" />

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 sm:gap-5 lg:gap-6">
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

        <aside className="flex h-full w-full flex-col gap-4 lg:col-span-4 lg:ml-auto lg:max-w-[420px] lg:justify-self-end">
          <div className="w-full border-t-2 border-foreground pt-4">
            <div className="h-8 w-32 animate-pulse rounded-md bg-muted" />
            <div className="mt-4 space-y-3.5">
              {[0, 1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="grid w-full grid-cols-[2.25rem_minmax(0,1fr)] items-start gap-3 border-b border-border pb-3.5"
                >
                  <div className="h-6 w-6 animate-pulse rounded bg-muted" />
                  <div className="space-y-2">
                    <div className="h-3 w-full animate-pulse rounded-full bg-muted" />
                    <div className="h-3 w-4/5 animate-pulse rounded-full bg-muted" />
                    <div className="h-2.5 w-20 animate-pulse rounded-full bg-muted/70" />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="h-32 w-full animate-pulse rounded-lg bg-muted/40" />
        </aside>
      </div>

      <div>
        <div className="mb-4 flex items-end justify-between border-b border-border pb-4">
          <div className="h-9 w-48 animate-pulse rounded-md bg-muted" />
          <div className="h-4 w-20 animate-pulse rounded-full bg-muted" />
        </div>

        <div className="grid grid-cols-1 gap-6 pt-6 lg:grid-cols-12 lg:gap-10">
          <div className="col-span-1 lg:col-span-6">
            <div className="aspect-16/10 w-full animate-pulse bg-muted lg:aspect-4/3" />
          </div>
          <div className="col-span-1 space-y-3 lg:col-span-6">
            <div className="h-3 w-24 animate-pulse rounded-full bg-muted" />
            <div className="h-8 w-full animate-pulse rounded-md bg-muted" />
            <div className="h-8 w-4/5 animate-pulse rounded-md bg-muted" />
            <div className="h-3 w-full animate-pulse rounded-full bg-muted/70" />
            <div className="h-3 w-3/4 animate-pulse rounded-full bg-muted/70" />
            <div className="flex items-center gap-3 pt-2">
              <div className="h-11 w-11 animate-pulse rounded-full bg-muted" />
              <div className="flex flex-col gap-1.5">
                <div className="h-2.5 w-20 animate-pulse rounded-full bg-muted/70" />
                <div className="h-3.5 w-32 animate-pulse rounded-full bg-muted" />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 space-y-5 border-t border-border pt-5">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="grid grid-cols-[96px_1fr] items-start gap-5 sm:grid-cols-[160px_1fr] sm:gap-7"
            >
              <div className="aspect-16/10 w-full animate-pulse bg-muted" />
              <div className="space-y-2">
                <div className="h-3 w-16 animate-pulse rounded-full bg-muted" />
                <div className="h-5 w-full animate-pulse rounded-md bg-muted" />
                <div className="h-2.5 w-28 animate-pulse rounded-full bg-muted/70" />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-lg bg-muted/40 p-6 lg:p-8 space-y-5">
        <div className="h-3 w-28 animate-pulse rounded-full bg-muted" />
        <div className="h-8 w-48 animate-pulse rounded-md bg-muted" />
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="grid grid-cols-[auto_120px_1fr] items-start gap-5 border-b border-border pb-5 last:border-b-0 sm:grid-cols-[auto_160px_1fr]"
          >
            <div className="h-6 w-6 animate-pulse rounded bg-muted" />
            <div className="aspect-square w-[120px] animate-pulse bg-muted sm:w-[160px]" />
            <div className="space-y-2 pt-1">
              <div className="h-5 w-full animate-pulse rounded-md bg-muted" />
              <div className="h-3 w-20 animate-pulse rounded-full bg-muted/70" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}