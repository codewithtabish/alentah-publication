// src/app/(site)/[category]/page.tsx
// ============================================================
// Category Page — ALENTAH
// URL: /[category]
//
// Renders the category hero, its editor, and the interactive
// body (subcategory filter + featured article + responsive
// article grid).
//
// Cache invalidation is handled by `revalidateCategory` and
// `revalidateBlog` from src/lib/cache-keys.ts.
// ============================================================

import { Suspense } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { CategoryHero } from "@/components/site/pages/category/category-hero";
import { CategoryBody } from "@/components/site/pages/category/category-body";
import { CategoryPageSkeleton } from "@/components/site/pages/category/category-skeleton";
import { getCategoryBySlug } from "@/actions/category/get-category-by-slug";

// ============================================================
// TYPES
// ============================================================

type PageParams = {
  category: string;
};

type PageProps = {
  params: Promise<PageParams>;
};

// ============================================================
// METADATA
// ============================================================

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { category } = await params;

  const result = await getCategoryBySlug(decodeURIComponent(category));

  if (!result.success) {
    return { title: "Category not found — Alentah" };
  }

  const cat = result.category;

  return {
    title: `${cat.name} — Alentah`,
    description: cat.description ?? undefined,
  };
}

// ============================================================
// PAGE
// ============================================================

export default function CategoryPage({ params }: PageProps) {
  return (
    <Suspense fallback={<CategoryPageSkeleton />}>
      <CategoryContent params={params} />
    </Suspense>
  );
}

// ============================================================
// CONTENT
// ============================================================

async function CategoryContent({
  params,
}: {
  params: Promise<PageParams>;
}) {
  const { category } = await params;
  const decodedSlug = decodeURIComponent(category);

  const result = await getCategoryBySlug(decodedSlug);

  if (!result.success) {
    notFound();
  }

  const cat = result.category;

  return (
    <main className="w-full">
      <CategoryHero
        name={cat.name}
        description={cat.description}
        blogCount={cat.blogCount}
        editor={cat.editor}
      />

      <CategoryBody
        categorySlug={cat.slug}
        subcategories={cat.subcategories}
        blogs={cat.blogs}
      />
    </main>
  );
}