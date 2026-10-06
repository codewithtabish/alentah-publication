// src/app/admin/articles/page.tsx
// ============================================================
// Admin Articles Page — ALENTAH
//
// Next 16 / Cache Components pattern:
//   - Page shell renders instantly (no runtime data)
//   - <Suspense> wraps the async child that awaits auth()
//   - The async child does the auth check + data fetch
// ============================================================

import { Suspense } from "react";
import Link from "next/link";
import { ChevronRight, Plus, Upload } from "lucide-react";
import { auth } from "@clerk/nextjs/server";

import { cn } from "@/lib/utils";
import { ArticlesTable } from "@/components/site/admim/article/articles-table";
import { getAdminArticles } from "@/actions/blog/get-admin-articles";

export const metadata = {
  title: "Articles — Alentah Admin",
};

// ============================================================
// PAGE SHELL — no runtime data
// ============================================================

export default function AdminArticlesPage() {
  return (
    <div className="mx-auto w-full max-w-[1600px]">
      {/* BREADCRUMBS */}
      <nav
        aria-label="Breadcrumb"
        className="mb-6 flex items-center gap-1.5 text-[10px] uppercase tracking-[0.2em] text-muted-foreground"
      >
        <Link href="/admin" className="transition-colors hover:text-foreground">
          Admin
        </Link>
        <ChevronRight
          className="h-3 w-3 text-muted-foreground/50"
          strokeWidth={1.75}
        />
        <span className="font-semibold text-primary">Articles</span>
      </nav>

      {/* HEADER */}
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-serif text-4xl tracking-tight">Articles</h1>
          <p className="mt-2 max-w-lg text-sm text-muted-foreground">
            Manage every story across Alentah — drafts, scheduled, and
            published.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className={cn(
              "inline-flex h-10 items-center justify-center gap-2 rounded-full px-5",
              "border border-border bg-transparent text-foreground",
              "text-[11px] font-semibold uppercase tracking-[0.15em]",
              "transition-colors hover:bg-accent",
            )}
          >
            <Upload className="h-3.5 w-3.5" strokeWidth={2} />
            Import
          </button>

          <Link
            href="/admin/articles/new"
            className={cn(
              "inline-flex h-10 items-center justify-center gap-2 rounded-full px-5",
              "bg-primary text-primary-foreground",
              "text-[11px] font-semibold uppercase tracking-[0.15em]",
              "transition-colors hover:bg-primary/90",
            )}
          >
            <Plus className="h-4 w-4" strokeWidth={2.25} />
            New Article
          </Link>
        </div>
      </div>

      {/* CONTENT — everything runtime goes inside Suspense */}
      <Suspense fallback={<ArticlesSkeleton />}>
        <ArticlesContent />
      </Suspense>
    </div>
  );
}

// ============================================================
// ASYNC CONTENT — auth + data, inside Suspense
// ============================================================

async function ArticlesContent() {
  const { userId, sessionClaims } = await auth();

  if (!userId) {
    return (
      <div className="rounded-2xl border border-destructive/40 bg-destructive/5 p-8 text-center">
        <p className="mb-2 font-serif text-xl tracking-tight">
          Not authenticated
        </p>
        <p className="text-sm text-muted-foreground">
          Please sign in to continue.
        </p>
      </div>
    );
  }

  const role = (sessionClaims?.metadata as { role?: string } | undefined)?.role;

  if (role !== "ADMIN") {
    return (
      <div className="rounded-2xl border border-destructive/40 bg-destructive/5 p-8 text-center">
        <p className="mb-2 font-serif text-xl tracking-tight">
          Not authorized
        </p>
        <p className="text-sm text-muted-foreground">
          You don&apos;t have access to this page.
        </p>
      </div>
    );
  }

  const result = await getAdminArticles();

  if (!result.success) {
    return (
      <div className="rounded-2xl border border-destructive/40 bg-destructive/5 p-8 text-center">
        <p className="mb-2 font-serif text-xl tracking-tight">
          Couldn&apos;t load articles
        </p>
        <p className="text-sm text-muted-foreground">{result.error}</p>
      </div>
    );
  }

  return (
    <ArticlesTable
      articles={result.articles}
      stats={result.stats}
      total={result.total}
    />
  );
}

// ============================================================
// SKELETON
// ============================================================

function ArticlesSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="rounded-2xl border border-border bg-card px-5 py-4"
          >
            <div className="mb-3 h-2.5 w-24 animate-pulse rounded-full bg-muted" />
            <div className="h-8 w-16 animate-pulse rounded-md bg-muted" />
          </div>
        ))}
      </div>

      <div className="h-14 animate-pulse rounded-2xl bg-muted" />

      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <ul className="divide-y divide-border">
          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
            <li
              key={i}
              className="grid grid-cols-1 items-center gap-4 px-4 py-4 md:grid-cols-[32px_80px_minmax(0,2.5fr)_140px_160px_120px_80px_100px_100px]"
            >
              <div className="h-4 w-4 animate-pulse rounded bg-muted" />
              <div className="h-14 w-20 animate-pulse bg-muted" />
              <div className="space-y-2">
                <div className="h-3 w-40 animate-pulse rounded-full bg-muted" />
                <div className="h-2.5 w-56 animate-pulse rounded-full bg-muted/70" />
              </div>
              <div className="h-5 w-20 animate-pulse rounded-full bg-muted" />
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 animate-pulse rounded-full bg-muted" />
                <div className="h-3 w-24 animate-pulse rounded-full bg-muted" />
              </div>
              <div className="h-5 w-20 animate-pulse rounded-full bg-muted" />
              <div className="h-3 w-12 animate-pulse rounded-full bg-muted" />
              <div className="h-3 w-12 animate-pulse rounded-full bg-muted" />
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