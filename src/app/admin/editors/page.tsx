// src/app/admin/editors/page.tsx
// ============================================================
// Editors List Page — ALENTAH Admin
// Uses cached getEditors() server action with Suspense + skeleton.
// ============================================================

import { Suspense } from "react";
import Link from "next/link";
import { ChevronRight, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { getEditors } from "@/actions/editor/get-editors";
import { EditorsTable } from "@/components/site/admim/editor/editors-table";

export const metadata = {
  title: "Editors — Alentah Admin",
  description: "Manage the Alentah editorial team.",
};

// ============================================================
// PAGE
// ============================================================

export default function EditorsPage() {
  return (
    <div className="mx-auto w-full max-w-[1600px] px-4 sm:px-6 lg:px-8 py-8">
      {/* BREADCRUMBS */}
      <nav
        aria-label="Breadcrumb"
        className="mb-6 flex items-center gap-1.5 text-[10px] uppercase tracking-[0.2em] text-muted-foreground"
      >
        <Link href="/admin" className="hover:text-foreground transition-colors">
          Admin
        </Link>
        <ChevronRight
          className="h-3 w-3 text-muted-foreground/50"
          strokeWidth={1.75}
        />
        <span className="text-primary font-semibold">Editors</span>
      </nav>

      {/* HEADER */}
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-serif text-4xl tracking-tight">Editors</h1>
          <p className="mt-2 text-sm text-muted-foreground max-w-lg">
            Manage the writers and editors whose bylines appear across Alentah.
          </p>
        </div>

        <Link
          href="/admin/editors/new"
          className={cn(
            "inline-flex h-10 items-center justify-center gap-2 rounded-full px-5",
            "bg-primary text-primary-foreground",
            "text-[11px] font-semibold uppercase tracking-[0.15em]",
            "hover:bg-primary/90 transition-colors",
          )}
        >
          <Plus className="h-4 w-4" strokeWidth={2.25} />
          New Editor
        </Link>
      </div>

      {/* CONTENT — with Suspense */}
      <Suspense fallback={<EditorsSkeleton />}>
        <EditorsContent />
      </Suspense>
    </div>
  );
}

// ============================================================
// ASYNC CONTENT (loaded inside Suspense)
// ============================================================

async function EditorsContent() {
  const result = await getEditors();

  if (!result.success) {
    return (
      <div className="rounded-2xl border border-destructive/40 bg-destructive/5 p-8 text-center">
        <p className="font-serif text-xl tracking-tight mb-2">
          Couldn&apos;t load editors
        </p>
        <p className="text-sm text-muted-foreground">{result.error}</p>
      </div>
    );
  }

  return <EditorsTable editors={result.editors} />;
}

// ============================================================
// SKELETON FALLBACK
// ============================================================

function EditorsSkeleton() {
  return (
    <div className="space-y-6">
      {/* Stats skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="rounded-2xl border border-border bg-card px-5 py-4"
          >
            <div className="h-2.5 w-24 rounded-full bg-muted animate-pulse mb-3" />
            <div className="h-8 w-16 rounded-md bg-muted animate-pulse" />
          </div>
        ))}
      </div>

      {/* Table skeleton */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        {/* Header */}
        <div className="hidden md:grid grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1.4fr)_120px_140px_120px] gap-4 px-6 py-3 border-b border-border bg-muted/40">
          {[
            "Editor",
            "Role",
            "Assigned to",
            "Status",
            "Added",
            "Actions",
          ].map((label) => (
            <div
              key={label}
              className="h-2.5 w-16 rounded-full bg-muted animate-pulse"
            />
          ))}
        </div>

        {/* Rows */}
        <ul className="divide-y divide-border">
          {[0, 1, 2, 3, 4].map((i) => (
            <li
              key={i}
              className="grid grid-cols-1 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1.4fr)_120px_140px_120px] gap-4 px-6 py-4 items-center"
            >
              {/* Editor */}
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-muted animate-pulse shrink-0" />
                <div className="flex-1 space-y-2 min-w-0">
                  <div className="h-3 w-32 rounded-full bg-muted animate-pulse" />
                  <div className="h-2.5 w-40 rounded-full bg-muted/70 animate-pulse" />
                </div>
              </div>

              {/* Role */}
              <div className="h-3 w-24 rounded-full bg-muted animate-pulse" />

              {/* Categories */}
              <div className="flex gap-1.5">
                <div className="h-5 w-16 rounded-full bg-muted animate-pulse" />
                <div className="h-5 w-14 rounded-full bg-muted animate-pulse" />
              </div>

              {/* Status */}
              <div className="h-6 w-20 rounded-full bg-muted animate-pulse" />

              {/* Date */}
              <div className="h-3 w-20 rounded-full bg-muted animate-pulse" />

              {/* Actions */}
              <div className="flex items-center justify-end gap-1.5">
                <div className="h-8 w-8 rounded-lg bg-muted animate-pulse" />
                <div className="h-8 w-8 rounded-lg bg-muted animate-pulse" />
                <div className="h-8 w-8 rounded-lg bg-muted animate-pulse" />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}