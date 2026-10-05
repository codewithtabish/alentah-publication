// src/components/site/pages/category/category-body.tsx
"use client";

// ============================================================
// CategoryBody — ALENTAH
// Owns:
//   - subcategory filter state (synced with URL ?sub=)
//   - layout toggle (grid ↔ list, synced with URL ?view=)
//   - featured article + article grid/list
//
// Visiting /technology?sub=ai-machine-learning will:
//   - preselect the correct pill
//   - filter the list to that subcategory
// ============================================================

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { LayoutGrid, List } from "lucide-react";

import { CategoryFilter } from "./category-filter";
import { FeaturedArticle } from "./featured-article";
import { ArticleCard } from "./article-card";
import { ArticleListItem } from "./article-list-item";
import type {
  CategoryBlog,
  CategorySubcategory,
} from "@/actions/category/get-category-by-slug";

// ============================================================
// TYPES
// ============================================================

type Layout = "grid" | "list";

// ============================================================
// HELPERS
// ============================================================

function getArticleHref(article: CategoryBlog): string {
  const categorySlug = article.category.slug || "article";
  const subcategorySlug = article.subcategory?.slug;

  if (subcategorySlug) {
    return `/${categorySlug}/${subcategorySlug}/${article.slug}`;
  }
  return `/${categorySlug}/${article.slug}`;
}

// ============================================================
// COMPONENT
// ============================================================

export function CategoryBody({
  categorySlug,
  subcategories,
  blogs,
}: {
  categorySlug: string;
  subcategories: CategorySubcategory[];
  blogs: CategoryBlog[];
}) {
  const searchParams = useSearchParams();

  // ---------------------------------------------------------
  // Which subcategory slugs actually exist in this category?
  // ---------------------------------------------------------
  const validSubSlugs = useMemo(
    () => new Set(subcategories.map((s) => s.slug)),
    [subcategories],
  );

  // ---------------------------------------------------------
  // Subcategory filter — read from window.location on first
  // render so the correct pill is highlighted immediately when
  // landing on /technology?sub=ai-machine-learning
  // ---------------------------------------------------------
  const [activeSubcategory, setActiveSubcategory] = useState<string | null>(
    () => {
      if (typeof window === "undefined") return null;
      const raw = new URLSearchParams(window.location.search).get("sub");
      return raw && validSubSlugs.has(raw) ? raw : null;
    },
  );

  // Re-sync when the URL changes (back/forward, etc.)
  useEffect(() => {
    const next = searchParams.get("sub");
    const normalized = next && validSubSlugs.has(next) ? next : null;

    setActiveSubcategory((current) =>
      current === normalized ? current : normalized,
    );
  }, [searchParams, validSubSlugs]);

  const handleSelectSubcategory = useCallback((slug: string | null) => {
    setActiveSubcategory(slug);

    if (typeof window === "undefined") return;

    const url = new URL(window.location.href);

    if (slug) {
      url.searchParams.set("sub", slug);
    } else {
      url.searchParams.delete("sub");
    }

    window.history.replaceState(
      null,
      "",
      url.pathname + (url.search ? `?${url.searchParams}` : ""),
    );
  }, []);

  // ---------------------------------------------------------
  // Layout toggle — synced with ?view=
  // ---------------------------------------------------------
  const urlView = searchParams.get("view");
  const [layout, setLayout] = useState<Layout>(
    urlView === "list" ? "list" : "grid",
  );

  useEffect(() => {
    setLayout(urlView === "list" ? "list" : "grid");
  }, [urlView]);

  const handleSelectLayout = useCallback((next: Layout) => {
    setLayout(next);

    if (typeof window === "undefined") return;

    const url = new URL(window.location.href);

    if (next === "list") {
      url.searchParams.set("view", "list");
    } else {
      url.searchParams.delete("view");
    }

    window.history.replaceState(
      null,
      "",
      url.pathname + (url.search ? `?${url.searchParams}` : ""),
    );
  }, []);

  // ---------------------------------------------------------
  // Filter
  // ---------------------------------------------------------
  const filtered = useMemo(() => {
    if (!activeSubcategory) return blogs;
    return blogs.filter((b) => b.subcategory?.slug === activeSubcategory);
  }, [blogs, activeSubcategory]);

  const [featured, ...gridArticles] = filtered;

  return (
    <>
      {/* =====================================================
          FILTER
          ===================================================== */}
      <CategoryFilter
        subcategories={subcategories}
        activeSlug={activeSubcategory}
        onSelect={handleSelectSubcategory}
      />

      {/* =====================================================
          EMPTY STATE
          ===================================================== */}
      {filtered.length === 0 && (
        <section className="mt-20 flex flex-col items-center text-center">
          <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-primary">
            No articles yet
          </p>

          <p className="mt-4 font-serif text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Nothing here under this filter.
          </p>

          <p className="mt-3 max-w-md text-[14px] leading-6 text-muted-foreground">
            Try a different subcategory, or reset the filter to see everything
            in {categorySlug.replace(/-/g, " ")}.
          </p>

          <button
            type="button"
            onClick={() => handleSelectSubcategory(null)}
            className="mt-6 inline-flex h-10 items-center justify-center rounded-full border border-border px-5 text-[11px] font-bold uppercase tracking-[0.15em] text-foreground transition-colors hover:bg-muted"
          >
            Reset filter
          </button>
        </section>
      )}

      {/* =====================================================
          FEATURED
          ===================================================== */}
      {featured && (
        <FeaturedArticle
          article={featured}
          href={getArticleHref(featured)}
        />
      )}

      {/* =====================================================
          GRID / LIST
          ===================================================== */}
      {gridArticles.length > 0 && (
        <section className="mt-16 sm:mt-20">
          <div className="flex flex-wrap items-end justify-between gap-4 border-b border-border pb-6">
            <div className="flex items-baseline gap-3">
              <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-primary">
                Latest articles
              </p>
              <p className="text-[12px] text-muted-foreground">
                {gridArticles.length}{" "}
                {gridArticles.length === 1 ? "article" : "articles"}
              </p>
            </div>

            <div
              role="group"
              aria-label="Layout"
              className="flex items-center gap-1 rounded-full border border-border p-1"
            >
              <button
                type="button"
                onClick={() => handleSelectLayout("grid")}
                aria-pressed={layout === "grid"}
                aria-label="Grid layout"
                className={[
                  "inline-flex size-8 items-center justify-center rounded-full",
                  "transition-colors duration-200",
                  layout === "grid"
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground",
                ].join(" ")}
              >
                <LayoutGrid className="size-4" strokeWidth={1.75} />
              </button>

              <button
                type="button"
                onClick={() => handleSelectLayout("list")}
                aria-pressed={layout === "list"}
                aria-label="List layout"
                className={[
                  "inline-flex size-8 items-center justify-center rounded-full",
                  "transition-colors duration-200",
                  layout === "list"
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground",
                ].join(" ")}
              >
                <List className="size-4" strokeWidth={1.75} />
              </button>
            </div>
          </div>

          {layout === "grid" && (
            <div className="mt-10 grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-10 lg:gap-y-16">
              {gridArticles.map((article) => (
                <ArticleCard
                  key={article.id}
                  article={article}
                  href={getArticleHref(article)}
                />
              ))}
            </div>
          )}

          {layout === "list" && (
            <ul className="mt-10 divide-y divide-border border-t border-border">
              {gridArticles.map((article) => (
                <li key={article.id}>
                  <ArticleListItem
                    article={article}
                    href={getArticleHref(article)}
                  />
                </li>
              ))}
            </ul>
          )}

          <div className="mt-16 flex justify-center">
            <button
              type="button"
              className="text-[11px] font-bold uppercase tracking-[0.15em] text-primary transition-colors hover:text-foreground"
            >
              Load more →
            </button>
          </div>
        </section>
      )}

      {/* =====================================================
          CLOSING
          ===================================================== */}
      <section className="mt-24 pb-24 sm:mt-28 sm:pb-28 lg:mt-32 lg:pb-32">
        <div aria-hidden="true" className="h-px w-full bg-border" />

        <div className="mx-auto mt-16 max-w-3xl text-center">
          <p className="font-serif text-xl italic leading-snug tracking-tight text-foreground sm:text-2xl lg:text-3xl">
            Every story earns its place.
          </p>

          <p className="mt-8 text-[10px] font-bold uppercase tracking-[0.24em] text-muted-foreground">
            — The Editorial Team
          </p>
        </div>
      </section>
    </>
  );
}