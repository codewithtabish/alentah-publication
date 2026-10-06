// src/app/admin/articles/[id]/edit/page.tsx
// ============================================================
// Admin Edit Article Page — ALENTAH
// ============================================================

import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";

import { UpdateArticleForm } from "@/components/site/admim/article/update-article-form";
import { getAdminCategories } from "@/actions/category/get-categories-admin";
import { getBlogForEdit } from "@/actions/blog/get-blog-for-edit";

export const metadata = {
  title: "Edit Article — Alentah Admin",
};

// ============================================================
// TYPES
// ============================================================

type PageProps = {
  params: Promise<{ id: string }>;
};

// ============================================================
// PAGE
// ============================================================

export default function EditArticlePage({ params }: PageProps) {
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
        <ChevronRight className="h-3 w-3 text-muted-foreground/50" strokeWidth={1.75} />
        <Link
          href="/admin/articles"
          className="transition-colors hover:text-foreground"
        >
          Articles
        </Link>
        <ChevronRight className="h-3 w-3 text-muted-foreground/50" strokeWidth={1.75} />
        <span className="font-semibold text-primary">Edit</span>
      </nav>

      {/* HEADER */}
      <div className="mb-8">
        <h1 className="font-serif text-4xl tracking-tight">Edit Article</h1>
        <p className="mt-2 max-w-lg text-sm text-muted-foreground">
          Update the story, change its classification, or republish.
        </p>
      </div>

      {/* CONTENT */}
      <Suspense fallback={<EditSkeleton />}>
        <EditContent params={params} />
      </Suspense>
    </div>
  );
}

// ============================================================
// CONTENT
// ============================================================

async function EditContent({ params }: PageProps) {
  const { id } = await params;

  const [blogResult, categoriesResult] = await Promise.all([
    getBlogForEdit(id),
    getAdminCategories(),
  ]);

  if (!blogResult.success) {
    notFound();
  }

  if (!categoriesResult.success) {
    return (
      <div className="rounded-2xl border border-destructive/40 bg-destructive/5 p-8 text-center">
        <p className="mb-2 font-serif text-xl tracking-tight">
          Couldn&apos;t load categories
        </p>
        <p className="text-sm text-muted-foreground">
          {categoriesResult.error}
        </p>
      </div>
    );
  }

  return (
    <UpdateArticleForm
      categories={categoriesResult.categories}
      initialBlog={blogResult.blog}
    />
  );
}

// ============================================================
// SKELETON
// ============================================================

function EditSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-8 xl:grid-cols-[minmax(0,1fr)_320px]">
      <div className="space-y-6">
        <div className="h-40 animate-pulse rounded-2xl bg-muted" />
        <div className="h-96 animate-pulse rounded-2xl bg-muted" />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
          <div className="h-64 animate-pulse rounded-2xl bg-muted lg:col-span-3" />
          <div className="h-64 animate-pulse rounded-2xl bg-muted lg:col-span-2" />
        </div>
      </div>
      <aside>
        <div className="h-96 animate-pulse rounded-2xl bg-muted" />
      </aside>
    </div>
  );
}