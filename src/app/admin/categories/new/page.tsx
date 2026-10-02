// src/app/admin/categories/new/page.tsx
// ============================================================
// New Category Page — ALENTAH Admin
// Reuses getEditors() for the editor dropdown.
// ============================================================

import { Suspense } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { getEditors } from "@/actions/editor/get-editors";
import { NewCategoryForm } from "@/components/site/admim/category/new-category-form";


export const metadata = {
  title: "New Category — Alentah Admin",
  description: "Create a new section for Alentah.",
};

// ============================================================
// PAGE
// ============================================================

export default function NewCategoryPage() {
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
          aria-hidden="true"
        />

        <Link
          href="/admin/categories"
          className="transition-colors hover:text-foreground"
        >
          Categories
        </Link>

        <ChevronRight
          className="h-3 w-3 text-muted-foreground/50"
          strokeWidth={1.75}
          aria-hidden="true"
        />

        <span className="font-semibold text-primary">New</span>
      </nav>

      {/* HEADER */}
      <div className="mb-8">
        <h1 className="font-serif text-4xl tracking-tight">New Category</h1>
        <p className="mt-2 max-w-lg text-sm text-muted-foreground">
          Create a new section for Alentah. You can add subcategories and
          assign an editor next.
        </p>
      </div>

      {/* CONTENT */}
      <Suspense fallback={<NewCategorySkeleton />}>
        <NewCategoryContent />
      </Suspense>
    </div>
  );
}

// ============================================================
// ASYNC CONTENT — reuses getEditors()
// ============================================================

async function NewCategoryContent() {
  const result = await getEditors();

  if (!result.success) {
    return (
      <div className="rounded-2xl border border-destructive/40 bg-destructive/5 p-8 text-center">
        <p className="mb-2 font-serif text-xl tracking-tight">
          Couldn&apos;t load editors
        </p>
        <p className="text-sm text-muted-foreground">{result.error}</p>
      </div>
    );
  }

  return <NewCategoryForm editors={result.editors} />;
}

// ============================================================
// SKELETON FALLBACK
// ============================================================

function NewCategorySkeleton() {
  return (
    <div className="grid grid-cols-1 gap-8 xl:grid-cols-[minmax(0,1fr)_320px]">
      <div className="min-w-0">
        <div className="space-y-8 rounded-2xl border border-border bg-card p-6 sm:p-8">
          {[0, 1, 2, 3].map((section) => (
            <div key={section}>
              <div className="mb-4 h-2.5 w-24 animate-pulse rounded-full bg-muted" />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="space-y-2">
                    <div className="h-2.5 w-16 animate-pulse rounded-full bg-muted" />
                    <div className="h-11 w-full animate-pulse rounded-xl bg-muted" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex items-center justify-between gap-4 rounded-2xl border border-border bg-card px-6 py-4">
          <div className="h-3 w-48 animate-pulse rounded-full bg-muted" />
          <div className="flex gap-2">
            <div className="h-10 w-24 animate-pulse rounded-full bg-muted" />
            <div className="h-10 w-36 animate-pulse rounded-full bg-muted" />
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-muted/40 p-6">
        <div className="mb-5 h-2.5 w-16 animate-pulse rounded-full bg-muted" />
        <div className="space-y-4">
          <div className="rounded-2xl border border-border bg-card p-4">
            <div className="mb-3 h-5 w-24 animate-pulse rounded-md bg-muted" />
          </div>
          <div className="overflow-hidden rounded-2xl border border-border bg-card">
            <div className="aspect-video w-full animate-pulse bg-muted" />
            <div className="space-y-2 p-4">
              <div className="h-5 w-32 animate-pulse rounded-md bg-muted" />
              <div className="h-3 w-20 animate-pulse rounded-full bg-muted/70" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}