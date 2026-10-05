// src/app/admin/articles/new/page.tsx
// ============================================================
// New Article Page — ALENTAH Admin
// ============================================================

import { Suspense } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { CreateArticleForm } from "@/components/site/admim/article/create-article-form";
import { getCategories } from "@/actions/category/get-categories";

export const metadata = {
  title: "New Article — Alentah Admin",
  description: "Write, format, and publish your story to Alentah.",
};

// ============================================================
// PAGE
// ============================================================

export default function NewArticlePage() {
  return (
    <div className="mx-auto w-full max-w-[1600px]">
      {/* BREADCRUMBS */}
      <nav
        aria-label="Breadcrumb"
        className="mb-6 flex flex-wrap items-center gap-1.5 text-[10px] uppercase tracking-[0.2em] text-muted-foreground"
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
        <Link
          href="/admin/articles"
          className="transition-colors hover:text-foreground"
        >
          Articles
        </Link>
        <ChevronRight
          className="h-3 w-3 text-muted-foreground/50"
          strokeWidth={1.75}
        />
        <span className="font-semibold text-primary">New</span>
      </nav>

      {/* HEADER */}
      <div className="mb-8">
        <h1 className="font-serif text-4xl tracking-tight">New Article</h1>
        <p className="mt-2 max-w-lg text-sm text-muted-foreground">
          Write, format, and publish your story to Alentah.
        </p>
      </div>

      {/* CONTENT */}
      <Suspense fallback={<NewArticleSkeleton />}>
        <NewArticleContent />
      </Suspense>
    </div>
  );
}

// ============================================================
// ASYNC CONTENT
// ============================================================

async function NewArticleContent() {
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

  return <CreateArticleForm categories={result.categories} />;
}

// ============================================================
// SKELETON
// ============================================================

function NewArticleSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-8 xl:grid-cols-[minmax(0,1fr)_320px]">
      <div className="min-w-0 space-y-6">
        {/* Tabs */}
        <div className="h-10 w-48 animate-pulse rounded-lg bg-muted" />

        {/* Title block */}
        <div className="h-32 animate-pulse rounded-2xl bg-muted" />

        {/* Editor */}
        <div className="h-96 animate-pulse rounded-2xl bg-muted" />

        {/* Media + Classification */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
          <div className="h-48 animate-pulse rounded-2xl bg-muted lg:col-span-3" />
          <div className="h-48 animate-pulse rounded-2xl bg-muted lg:col-span-2" />
        </div>

        {/* TOC */}
        <div className="h-32 animate-pulse rounded-2xl bg-muted" />

        {/* Action bar */}
        <div className="h-20 animate-pulse rounded-2xl bg-muted" />
      </div>

      {/* Sidebar */}
      <div className="h-fit rounded-2xl border border-border bg-muted/40 p-6">
        <div className="mb-5 h-2.5 w-16 animate-pulse rounded-full bg-muted" />
        <div className="aspect-video w-full animate-pulse rounded-xl bg-muted" />
        <div className="mt-4 space-y-2">
          <div className="h-5 w-32 animate-pulse rounded-md bg-muted" />
          <div className="h-3 w-40 animate-pulse rounded-full bg-muted/70" />
        </div>
      </div>
    </div>
  );
}