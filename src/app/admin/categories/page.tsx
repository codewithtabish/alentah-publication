// src/app/admin/categories/page.tsx
// ============================================================
// Categories List Page — ALENTAH Admin
// Uses cached getCategories() with Suspense + skeleton.
// ============================================================

import { Suspense } from "react";
import Link from "next/link";
import { ChevronRight, Plus } from "lucide-react";

import { cn } from "@/lib/utils";
import { getCategories } from "@/actions/category/get-categories";
import { CategoriesTable } from "@/components/site/admim/category/categories-table";

export const metadata = {
  title: "Categories — Alentah Admin",
  description: "Manage the sections of Alentah.",
};

// ============================================================
// PAGE
// ============================================================

export default function CategoriesPage() {
  return (
    <div className="mx-auto w-full max-w-[1600px] px-4 py-8 sm:px-6 lg:px-8">
      {/* BREADCRUMBS */}
      <nav
        aria-label="Breadcrumb"
        className="mb-6 flex items-center gap-1.5 text-[10px] uppercase tracking-[0.2em] text-muted-foreground"
      >
        <Link
          href="/admin"
          className="transition-colors hover:text-foreground"
        >
          Admin
        </Link>
        <ChevronRight
          className="h-3 w-3 text-muted-foreground/50"
          strokeWidth={1.75}
        />
        <span className="font-semibold text-primary">Categories</span>
      </nav>

      {/* HEADER */}
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-serif text-4xl tracking-tight">Categories</h1>
          <p className="mt-2 max-w-lg text-sm text-muted-foreground">
            Manage the sections and subcategories that shape Alentah.
          </p>
        </div>

        <Link
          href="/admin/categories/new"
          className={cn(
            "inline-flex h-10 items-center justify-center gap-2 rounded-full px-5",
            "bg-primary text-primary-foreground",
            "text-[11px] font-semibold uppercase tracking-[0.15em]",
            "hover:bg-primary/90 transition-colors",
          )}
        >
          <Plus className="h-4 w-4" strokeWidth={2.25} />
          New Category
        </Link>
      </div>

      {/* CONTENT */}
      <Suspense fallback={<CategoriesSkeleton />}>
        <CategoriesContent />
      </Suspense>
    </div>
  );
}

// ============================================================
// ASYNC CONTENT
// ============================================================

async function CategoriesContent() {
  const result = await getCategories();

  if (!result.success) {
    return (
      <div className="rounded-2xl border border-destructive/40 bg-destructive/5 p-8 text-center">
        <p className="mb-2 font-serif text-xl tracking-tight">
          Couldn&apos;t load categories
        </p>
        <p className="text-sm text-muted-foreground">{result.error}</p>
      </div>
    );
  }

  return <CategoriesTable categories={result.categories} />;
}

// ============================================================
// SKELETON FALLBACK
// ============================================================

function CategoriesSkeleton() {
  return (
    <div className="space-y-6">
      {/* Stats skeleton */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="rounded-2xl border border-border bg-card px-5 py-4"
          >
            <div className="mb-3 h-2.5 w-24 animate-pulse rounded-full bg-muted" />
            <div className="h-8 w-16 animate-pulse rounded-md bg-muted" />
          </div>
        ))}
      </div>

      {/* Table skeleton */}
      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <div className="hidden border-b border-border bg-muted/40 px-6 py-3 md:grid md:grid-cols-[80px_minmax(0,2fr)_minmax(0,1.4fr)_120px_120px_120px] md:gap-4">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="h-2.5 w-16 animate-pulse rounded-full bg-muted"
            />
          ))}
        </div>

        <ul className="divide-y divide-border">
          {[0, 1, 2, 3, 4].map((i) => (
            <li
              key={i}
              className="grid grid-cols-1 items-center gap-4 px-6 py-4 md:grid-cols-[80px_minmax(0,2fr)_minmax(0,1.4fr)_120px_120px_120px]"
            >
              <div className="h-14 w-14 animate-pulse rounded-xl bg-muted" />

              <div className="space-y-2">
                <div className="h-3 w-32 animate-pulse rounded-full bg-muted" />
                <div className="h-2.5 w-40 animate-pulse rounded-full bg-muted/70" />
              </div>

              <div className="flex items-center gap-2">
                <div className="h-7 w-7 animate-pulse rounded-full bg-muted" />
                <div className="h-3 w-24 animate-pulse rounded-full bg-muted" />
              </div>

              <div className="h-3 w-20 animate-pulse rounded-full bg-muted" />

              <div className="h-6 w-20 animate-pulse rounded-full bg-muted" />

              <div className="flex justify-end gap-1.5">
                <div className="h-8 w-8 animate-pulse rounded-lg bg-muted" />
                <div className="h-8 w-8 animate-pulse rounded-lg bg-muted" />
                <div className="h-8 w-8 animate-pulse rounded-lg bg-muted" />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}