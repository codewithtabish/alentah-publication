// src/app/admin/editors/[id]/edit/page.tsx

import { Suspense } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { notFound } from "next/navigation";
import { getEditor } from "@/actions/editor/get-editor";
import { EditEditorForm } from "@/components/site/admim/editor/edit-editor-form";


export const metadata = {
  title: "Edit Editor — Alentah Admin",
};

interface EditEditorPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function EditEditorPage({ params }: EditEditorPageProps) {
  return (
    <div className="mx-auto w-full max-w-[1600px] px-4 py-8 sm:px-6 lg:px-8">
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
          href="/admin/editors"
          className="transition-colors hover:text-foreground"
        >
          Editors
        </Link>

        <ChevronRight
          className="h-3 w-3 text-muted-foreground/50"
          strokeWidth={1.75}
          aria-hidden="true"
        />

        <span className="font-semibold text-primary">Edit</span>
      </nav>

      <Suspense fallback={<EditEditorSkeleton />}>
        <EditEditorContent params={params} />
      </Suspense>
    </div>
  );
}

interface EditEditorContentProps {
  params: Promise<{
    id: string;
  }>;
}

async function EditEditorContent({ params }: EditEditorContentProps) {
  const { id } = await params;

  const result = await getEditor(id);

  if (!result.success) {
    if (result.error === "Editor not found.") {
      notFound();
    }

    return (
      <div className="rounded-2xl border border-destructive/40 bg-destructive/5 p-8 text-center">
        <p className="mb-2 font-serif text-xl tracking-tight">
          Couldn&apos;t load editor
        </p>

        <p className="text-sm text-muted-foreground">{result.error}</p>
      </div>
    );
  }

  const editor = result.editor;

  // Unique key from updatedAt ensures the form remounts
  // whenever the editor data changes.
  const formKey = `${editor.id}:${editor.updatedAt.getTime()}`;

  return (
    <>
      <div className="mb-8">
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.25em] text-primary">
          Editing
        </p>

        <h1 className="font-serif text-4xl tracking-tight">{editor.name}</h1>

        <p className="mt-2 max-w-lg text-sm text-muted-foreground">
          Update this editor&apos;s profile. Changes appear across Alentah
          immediately.
        </p>
      </div>

      <EditEditorForm
        key={formKey}
        editor={{
          id: editor.id,
          name: editor.name,
          email: editor.email,
          imageUrl: editor.imageUrl,
          bio: editor.bio,
          experience: editor.experience,
          location: editor.location,
          website: editor.website,
          twitter: editor.twitter,
          linkedin: editor.linkedin,
          facebook: editor.facebook,
          instagram: editor.instagram,
          github: editor.github,
          isActive: editor.isActive,
        }}
      />
    </>
  );
}

function EditEditorSkeleton() {
  return (
    <>
      <div className="mb-8 space-y-3">
        <div className="h-2.5 w-20 animate-pulse rounded-full bg-muted" />
        <div className="h-9 w-64 animate-pulse rounded-md bg-muted" />
        <div className="h-3 w-80 animate-pulse rounded-full bg-muted/70" />
      </div>

      <div className="grid grid-cols-1 gap-8 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-8 rounded-2xl border border-border bg-card p-6 sm:p-8">
          <div>
            <div className="mb-4 h-2.5 w-20 animate-pulse rounded-full bg-muted" />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {[0, 1, 2].map((item) => (
                <div key={item} className="space-y-2">
                  <div className="h-2.5 w-16 animate-pulse rounded-full bg-muted" />
                  <div className="h-11 w-full animate-pulse rounded-xl bg-muted" />
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-border" />

          <div>
            <div className="mb-4 h-2.5 w-28 animate-pulse rounded-full bg-muted" />
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[200px_1fr]">
              <div className="aspect-square w-full animate-pulse rounded-2xl bg-muted" />
              <div className="space-y-4">
                <div className="h-11 w-full animate-pulse rounded-xl bg-muted" />
                <div className="h-12 w-40 animate-pulse rounded-full bg-muted" />
              </div>
            </div>
          </div>

          <div className="border-t border-border" />

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="space-y-3">
              <div className="h-2.5 w-12 animate-pulse rounded-full bg-muted" />
              <div className="h-32 w-full animate-pulse rounded-xl bg-muted" />
            </div>
            <div className="space-y-3">
              <div className="h-2.5 w-24 animate-pulse rounded-full bg-muted" />
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {[0, 1, 2, 3].map((item) => (
                  <div
                    key={item}
                    className="h-11 w-full animate-pulse rounded-xl bg-muted"
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="border-t border-border" />

          <div>
            <div className="mb-4 h-2.5 w-14 animate-pulse rounded-full bg-muted" />
            <div className="flex gap-4">
              <div className="h-6 w-20 animate-pulse rounded-full bg-muted" />
              <div className="h-6 w-20 animate-pulse rounded-full bg-muted" />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-muted/40 p-6">
          <div className="mb-5 h-2.5 w-16 animate-pulse rounded-full bg-muted" />
          <div className="space-y-4 rounded-2xl border border-border bg-card p-6 text-center">
            <div className="mx-auto h-24 w-24 animate-pulse rounded-full bg-muted" />
            <div className="mx-auto h-6 w-32 animate-pulse rounded-md bg-muted" />
            <div className="mx-auto h-3 w-24 animate-pulse rounded-full bg-muted/70" />
            <div className="space-y-2 pt-2">
              <div className="mx-auto h-3 w-full animate-pulse rounded-full bg-muted/60" />
              <div className="mx-auto h-3 w-4/5 animate-pulse rounded-full bg-muted/60" />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}