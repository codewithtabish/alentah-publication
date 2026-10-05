// src/app/admin/editors/new/page.tsx

// ============================================================
// New Editor Page — ALENTAH Admin
// ============================================================

import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { NewEditorForm } from "@/components/site/admim/editor/new-editor-form";

export const metadata = {
  title: "New Editor — Alentah Admin",
  description: "Add a new writer or editor to the Alentah team.",
};

export default function NewEditorPage() {
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

        <Link
          href="/admin/editors"
          className="transition-colors hover:text-foreground"
        >
          Editors
        </Link>

        <ChevronRight
          className="h-3 w-3 text-muted-foreground/50"
          strokeWidth={1.75}
        />

        <span className="font-semibold text-primary">New</span>
      </nav>

      {/* HEADER */}
      <div className="mb-8">
        <h1 className="font-serif text-4xl tracking-tight">New Editor</h1>

        <p className="mt-2 max-w-lg text-sm text-muted-foreground">
          Add a new writer or editor to the Alentah team. Their profile appears
          on every article they publish.
        </p>
      </div>

      {/* FORM */}
      <NewEditorForm />
    </div>
  );
}