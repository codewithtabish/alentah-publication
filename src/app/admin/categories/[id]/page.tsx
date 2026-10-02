// src/app/admin/categories/[id]/page.tsx
// ============================================================
// Category Detail Page — ALENTAH Admin
// params read INSIDE Suspense so the shell can prerender.
// ============================================================

import { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronRight, Plus } from "lucide-react";
import { notFound } from "next/navigation";
import { getCategoryWithSubs } from "@/actions/subcategory/get-category-with-subs";
import { SubcategoriesList } from "@/components/site/admim/subcategory/subcategories-list";


export const metadata = {
  title: "Category — Alentah Admin",
};

// ============================================================
// PAGE — no params access here
// ============================================================

export default function CategoryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <div className="mx-auto w-full max-w-[1600px] px-4 py-8 sm:px-6 lg:px-8">
      <Suspense fallback={<CategoryDetailSkeleton />}>
        <CategoryDetailContent params={params} />
      </Suspense>
    </div>
  );
}

// ============================================================
// ASYNC CONTENT — params accessed here (inside Suspense)
// ============================================================

async function CategoryDetailContent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const result = await getCategoryWithSubs(id);

  if (!result.success) {
    if (result.error === "Category not found.") {
      notFound();
    }

    return (
      <div className="rounded-2xl border border-destructive/40 bg-destructive/5 p-8 text-center">
        <p className="mb-2 font-serif text-xl tracking-tight">
          Couldn&apos;t load category
        </p>
        <p className="text-sm text-muted-foreground">{result.error}</p>
      </div>
    );
  }

  const category = result.category;

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
        <span className="font-semibold text-primary">{category.name}</span>
      </nav>

      {/* HEADER */}
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl border border-border bg-muted">
            {category.coverImage ? (
              <Image
                src={category.coverImage}
                alt={category.name}
                fill
                sizes="64px"
                className="object-cover"
                unoptimized
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center font-serif text-xl text-muted-foreground">
                {category.name.charAt(0)}
              </div>
            )}
          </div>

          <div>
            <h1 className="font-serif text-4xl tracking-tight">
              {category.name}
            </h1>
            <p className="mt-1 font-mono text-[11px] text-muted-foreground">
              /category/{category.slug}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={`/admin/categories/${category.id}/edit`}
            className="inline-flex h-10 items-center justify-center rounded-full border border-border bg-transparent px-5 text-[11px] font-semibold uppercase tracking-[0.15em] text-foreground transition-colors hover:bg-accent"
          >
            Edit Category
          </Link>

          <Link
            href={`/admin/subcategories/new?categoryId=${category.id}`}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-primary px-5 text-primary-foreground text-[11px] font-semibold uppercase tracking-[0.15em] transition-colors hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" strokeWidth={2.25} />
            New Subcategory
          </Link>
        </div>
      </div>

      {/* STATS */}
      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatCard
          label="Subcategories"
          value={category.subcategoryCount}
          accent
        />
        <StatCard label="Articles" value={category.blogCount} />
        <StatCard label="Status" value="Active" />
      </div>

      {/* SUBCATEGORIES */}
      <SubcategoriesList
        categoryId={category.id}
        categoryName={category.name}
        subcategories={category.subcategories}
      />
    </>
  );
}

// ============================================================
// SUB-COMPONENTS
// ============================================================

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: number | string;
  accent?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card px-5 py-4">
      <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
        {label}
      </p>
      <p
        className={`font-serif text-3xl tracking-tight ${
          accent ? "text-primary" : ""
        }`}
      >
        {value}
      </p>
    </div>
  );
}

// ============================================================
// SKELETON
// ============================================================

function CategoryDetailSkeleton() {
  return (
    <>
      <div className="mb-6 flex items-center gap-2">
        <div className="h-2.5 w-14 animate-pulse rounded-full bg-muted" />
        <div className="h-3 w-3 animate-pulse rounded-full bg-muted" />
        <div className="h-2.5 w-20 animate-pulse rounded-full bg-muted" />
        <div className="h-3 w-3 animate-pulse rounded-full bg-muted" />
        <div className="h-2.5 w-24 animate-pulse rounded-full bg-muted" />
      </div>

      <div className="mb-8 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 animate-pulse rounded-2xl bg-muted" />
          <div className="space-y-2">
            <div className="h-9 w-48 animate-pulse rounded-md bg-muted" />
            <div className="h-3 w-32 animate-pulse rounded-full bg-muted/70" />
          </div>
        </div>
        <div className="flex gap-2">
          <div className="h-10 w-32 animate-pulse rounded-full bg-muted" />
          <div className="h-10 w-40 animate-pulse rounded-full bg-muted" />
        </div>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
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

      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <div className="border-b border-border bg-muted/40 px-6 py-3">
          <div className="h-2.5 w-24 animate-pulse rounded-full bg-muted" />
        </div>
        <ul className="divide-y divide-border">
          {[0, 1, 2].map((i) => (
            <li key={i} className="flex items-center gap-4 px-6 py-4">
              <div className="h-4 w-4 animate-pulse rounded bg-muted" />
              <div className="h-3 flex-1 animate-pulse rounded-full bg-muted" />
              <div className="flex gap-1">
                <div className="h-8 w-8 animate-pulse rounded-lg bg-muted" />
                <div className="h-8 w-8 animate-pulse rounded-lg bg-muted" />
                <div className="h-8 w-8 animate-pulse rounded-lg bg-muted" />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}