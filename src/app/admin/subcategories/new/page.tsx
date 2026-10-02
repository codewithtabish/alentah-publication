// src/app/admin/subcategories/new/page.tsx
// ============================================================
// New Subcategory Page — ALENTAH Admin
// searchParams read INSIDE Suspense.
// Form gets a `key` so it remounts fresh every navigation.
// ============================================================

import { Suspense } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { redirect } from "next/navigation";
import { NewSubcategoryForm } from "@/components/site/admim/subcategory/new-subcategory-form";
import { getCategoryWithSubs } from "@/actions/subcategory/get-category-with-subs";


export const metadata = {
  title: "New Subcategory — Alentah Admin",
};

// ============================================================
// PAGE — no searchParams access here
// ============================================================

export default function NewSubcategoryPage({
  searchParams,
}: {
  searchParams: Promise<{ categoryId?: string }>;
}) {
  return (
    <div className="mx-auto w-full max-w-[1600px] px-4 py-8 sm:px-6 lg:px-8">
      <Suspense fallback={<NewSubcategorySkeleton />}>
        <NewSubcategoryContent searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

// ============================================================
// ASYNC CONTENT
// ============================================================

async function NewSubcategoryContent({
  searchParams,
}: {
  searchParams: Promise<{ categoryId?: string }>;
}) {
  const { categoryId } = await searchParams;

  if (!categoryId) {
    redirect("/admin/categories");
  }

  const result = await getCategoryWithSubs(categoryId);

  if (!result.success) {
    return (
      <div className="rounded-2xl border border-destructive/40 bg-destructive/5 p-8 text-center">
        <p className="mb-2 font-serif text-xl tracking-tight">
          Couldn&apos;t load category
        </p>
        <p className="text-sm text-muted-foreground">{result.error}</p>
        <div className="mt-6">
          <Link
            href="/admin/categories"
            className="inline-flex h-10 items-center justify-center rounded-full border border-border bg-transparent px-5 text-[11px] font-semibold uppercase tracking-[0.15em] text-foreground transition-colors hover:bg-accent"
          >
            Back to Categories
          </Link>
        </div>
      </div>
    );
  }

  const category = result.category;

  // ─── KEY FIX ───
  // Give the form a key that changes with the parent category + its subs.
  // This forces React to unmount and remount the form → fresh defaultValues.
  const formKey = `${category.id}:${category.subcategoryCount}`;

  return (
    <>
      {/* BREADCRUMBS */}
      <nav
        aria-label="Breadcrumb"
        className="mb-6 flex flex-wrap items-center gap-1.5 text-[10px] uppercase tracking-[0.2em] text-muted-foreground"
      >
        <Link href="/admin" className="transition-colors hover:text-foreground">
          Admin
        </Link>

        <ChevronRight
          className="h-3 w-3 text-muted-foreground/50"
          strokeWidth={1.75}
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
        />

        <Link
          href={`/admin/categories/${category.id}`}
          className="transition-colors hover:text-foreground"
        >
          {category.name}
        </Link>

        <ChevronRight
          className="h-3 w-3 text-muted-foreground/50"
          strokeWidth={1.75}
        />

        <span className="font-semibold text-primary">New Subcategory</span>
      </nav>

      {/* HEADER */}
      <div className="mb-8">
        <h1 className="font-serif text-4xl tracking-tight">
          New Subcategory
        </h1>
        <p className="mt-2 max-w-lg text-sm text-muted-foreground">
          Add a new subcategory under {category.name}. It appears in the
          navigation and category page.
        </p>
      </div>

      {/* FORM — keyed for a clean remount */}
      <NewSubcategoryForm key={formKey} category={category} />
    </>
  );
}

// ============================================================
// SKELETON
// ============================================================

function NewSubcategorySkeleton() {
  return (
    <>
      <div className="mb-6 flex flex-wrap items-center gap-2">
        <div className="h-2.5 w-14 animate-pulse rounded-full bg-muted" />
        <div className="h-3 w-3 animate-pulse rounded-full bg-muted" />
        <div className="h-2.5 w-20 animate-pulse rounded-full bg-muted" />
        <div className="h-3 w-3 animate-pulse rounded-full bg-muted" />
        <div className="h-2.5 w-24 animate-pulse rounded-full bg-muted" />
      </div>

      <div className="mb-8 space-y-3">
        <div className="h-9 w-72 animate-pulse rounded-md bg-muted" />
        <div className="h-3 w-96 animate-pulse rounded-full bg-muted/70" />
      </div>

      <div className="grid grid-cols-1 gap-8 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-8 rounded-2xl border border-border bg-card p-6 sm:p-8">
          {[0, 1, 2, 3].map((s) => (
            <div key={s}>
              <div className="mb-4 h-2.5 w-24 animate-pulse rounded-full bg-muted" />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {[0, 1].map((i) => (
                  <div
                    key={i}
                    className="h-11 animate-pulse rounded-xl bg-muted"
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-border bg-muted/40 p-6">
          <div className="mb-5 h-2.5 w-16 animate-pulse rounded-full bg-muted" />
          <div className="space-y-4 rounded-2xl border border-border bg-card p-4">
            <div className="h-6 w-24 animate-pulse rounded-md bg-muted" />
            <div className="space-y-2">
              <div className="h-8 w-full animate-pulse rounded-md bg-muted" />
              <div className="h-8 w-full animate-pulse rounded-md bg-muted" />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}