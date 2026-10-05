// src/app/admin/categories/page.tsx
// ============================================================
// Admin Categories Page — ALENTAH
//
// Next 16 / Cache Components pattern:
//   - Page shell renders instantly (no runtime data)
//   - <Suspense> wraps the async content that awaits auth()
//   - The async child does the auth check + data fetch
// ============================================================

import { Suspense } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { auth } from "@clerk/nextjs/server";

import { cn } from "@/lib/utils";
import { CategoriesTable } from "@/components/site/admim/category/categories-table";
import { getAdminCategories } from "@/actions/category/get-categories-admin";

export const metadata = {
  title: "Categories — Alentah Admin",
};

// ============================================================
// PAGE SHELL — no runtime data
// ============================================================

export default function AdminCategoriesPage() {
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
        <span className="font-semibold text-primary">Categories</span>
      </nav>

      {/* HEADER */}
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-serif text-4xl tracking-tight">Categories</h1>
          <p className="mt-2 max-w-lg text-sm text-muted-foreground">
            Manage every section and subcategory across Alentah.
          </p>
        </div>

        <Link
          href="/admin/categories/new"
          className={cn(
            "inline-flex h-10 items-center justify-center gap-2 rounded-full px-5",
            "bg-primary text-primary-foreground",
            "text-[11px] font-semibold uppercase tracking-[0.15em]",
            "transition-colors hover:bg-primary/90",
          )}
        >
          New Category
        </Link>
      </div>

      {/* CONTENT — everything runtime goes inside Suspense */}
      <Suspense fallback={<CategoriesSkeleton />}>
        <CategoriesContent />
      </Suspense>
    </div>
  );
}

// ============================================================
// ASYNC CONTENT — auth + data, inside Suspense
// ============================================================

async function CategoriesContent() {
  // Auth is now INSIDE the Suspense boundary.
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

  const result = await getAdminCategories();

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
// SKELETON
// ============================================================

function CategoriesSkeleton() {
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

      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <div className="border-b border-border px-6 py-4">
          <div className="h-3 w-32 animate-pulse rounded-full bg-muted" />
        </div>
        <ul className="divide-y divide-border">
          {[0, 1, 2, 3, 4].map((i) => (
            <li key={i} className="flex items-center gap-3 px-6 py-4">
              <div className="h-6 w-6 animate-pulse rounded-md bg-muted" />
              <div className="h-12 w-12 animate-pulse rounded-xl bg-muted" />
              <div className="flex-1 space-y-2">
                <div className="h-3.5 w-40 animate-pulse rounded-full bg-muted" />
                <div className="h-2.5 w-24 animate-pulse rounded-full bg-muted/70" />
              </div>
              <div className="h-6 w-20 animate-pulse rounded-full bg-muted" />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}