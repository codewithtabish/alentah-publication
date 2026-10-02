"use client";

// ============================================================
// Subcategories List — ALENTAH
// ============================================================

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Pencil,
  Trash2,
  Eye,
  Plus,
  GripVertical,
  Loader2,
  AlertTriangle,
} from "lucide-react";

import { cn } from "@/lib/utils";

// ============================================================
// TYPES
// ============================================================

type Subcategory = {
  id: string;
  name: string;
  slug: string;
};

interface SubcategoriesListProps {
  categoryId: string;
  categoryName: string;
  subcategories: Subcategory[];
}

// ============================================================
// COMPONENT
// ============================================================

export function SubcategoriesList({
  categoryId,
  categoryName,
  subcategories,
}: SubcategoriesListProps) {
  const router = useRouter();
  const [deleteTarget, setDeleteTarget] =
    React.useState<Subcategory | null>(null);

  if (subcategories.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-muted/20 p-12 text-center">
        <p className="mb-2 font-serif text-2xl tracking-tight">
          No subcategories yet
        </p>
        <p className="mx-auto mb-6 max-w-md text-sm text-muted-foreground">
          Break {categoryName} into focused sections — like AI, Apps, or
          Hardware.
        </p>
        <Link
          href={`/admin/subcategories/new?categoryId=${categoryId}`}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-primary px-5 text-primary-foreground text-[11px] font-semibold uppercase tracking-[0.15em] hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" strokeWidth={2.25} />
          Add Subcategory
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border bg-muted/40 px-6 py-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Subcategories
          </p>
          <Link
            href={`/admin/subcategories/new?categoryId=${categoryId}`}
            className="inline-flex h-8 items-center gap-1.5 rounded-full bg-primary px-3.5 text-primary-foreground text-[10px] font-semibold uppercase tracking-[0.15em] hover:bg-primary/90 transition-colors"
          >
            <Plus className="h-3.5 w-3.5" strokeWidth={2.25} />
            Add
          </Link>
        </div>

        {/* Rows */}
        <ul className="divide-y divide-border">
          {subcategories.map((sub) => (
            <li
              key={sub.id}
              className="flex items-center gap-4 px-6 py-4 transition-colors hover:bg-accent/40"
            >
              {/* Drag handle (visual only for now) */}
              <button
                type="button"
                aria-label="Reorder"
                className="text-muted-foreground/40 hover:text-muted-foreground cursor-grab active:cursor-grabbing transition-colors"
              >
                <GripVertical className="h-4 w-4" strokeWidth={1.75} />
              </button>

              {/* Name + slug */}
              <div className="min-w-0 flex-1">
                <p className="truncate font-serif text-[15px] leading-tight text-foreground">
                  {sub.name}
                </p>
                <p className="mt-0.5 truncate font-mono text-[11px] text-muted-foreground">
                  /category/{categoryName.toLowerCase().replace(/\s+/g, "-")}/
                  {sub.slug}
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1">
                <Link
                  href={`/admin/subcategories/${sub.id}/edit`}
                  aria-label="Edit"
                  title="Edit"
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                >
                  <Pencil className="h-3.5 w-3.5" strokeWidth={1.75} />
                </Link>

                <Link
                  href={`/category/${categoryName
                    .toLowerCase()
                    .replace(/\s+/g, "-")}/${sub.slug}`}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="View public page"
                  title="View public page"
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                >
                  <Eye className="h-3.5 w-3.5" strokeWidth={1.75} />
                </Link>

                <button
                  type="button"
                  onClick={() => setDeleteTarget(sub)}
                  aria-label="Delete"
                  title="Delete"
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Delete confirm dialog */}
      {deleteTarget && (
        <DeleteSubcategoryDialog
          subcategory={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onDeleted={() => {
            setDeleteTarget(null);
            router.refresh();
          }}
        />
      )}
    </>
  );
}

// ============================================================
// DELETE DIALOG (local, small)
// ============================================================

function DeleteSubcategoryDialog({
  subcategory,
  onClose,
  onDeleted,
}: {
  subcategory: Subcategory;
  onClose: () => void;
  onDeleted: () => void;
}) {
  const [deleting, setDeleting] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [confirmText, setConfirmText] = React.useState("");

  React.useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 80);
  }, []);

  const canDelete = confirmText.trim() === subcategory.slug;

  const handleDelete = async () => {
    if (!canDelete) return;

    setDeleting(true);
    const toastId = toast.loading("Deleting subcategory…");

    try {
      const res = await fetch(`/api/subcategories/${subcategory.id}`, {
        method: "DELETE",
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        toast.error(json.error ?? "Failed to delete", { id: toastId });
        setDeleting(false);
        return;
      }

      toast.success(`"${subcategory.name}" deleted.`, { id: toastId });
      onDeleted();
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong.", { id: toastId });
      setDeleting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-100 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={() => !deleting && onClose()}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md mx-4 rounded-3xl border border-border bg-background p-6 shadow-2xl sm:p-8"
      >
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10">
          <AlertTriangle
            className="h-6 w-6 text-destructive"
            strokeWidth={1.75}
          />
        </div>

        <h2 className="text-center font-serif text-2xl tracking-tight">
          Delete subcategory?
        </h2>

        <p className="mt-3 text-center text-sm text-muted-foreground">
          You&apos;re about to permanently delete{" "}
          <span className="font-medium text-foreground">
            {subcategory.name}
          </span>
          . This cannot be undone.
        </p>

        <div className="mt-5">
          <label className="mb-2 block text-[11px] font-medium text-foreground">
            Type{" "}
            <span className="font-mono text-primary">{subcategory.slug}</span>{" "}
            to confirm
          </label>
          <input
            ref={inputRef}
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            disabled={deleting}
            autoComplete="off"
            spellCheck={false}
            placeholder={subcategory.slug}
            className="h-11 w-full rounded-xl border border-border bg-background px-3.5 font-mono text-[13px] text-foreground placeholder:text-muted-foreground/40 focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>

        <div className="mt-6 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={deleting}
            className="inline-flex h-10 items-center justify-center rounded-full border border-border bg-transparent px-5 text-[11px] font-semibold uppercase tracking-[0.15em] text-foreground hover:bg-accent transition-colors disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleDelete}
            disabled={!canDelete || deleting}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-destructive px-5 text-destructive-foreground text-[11px] font-semibold uppercase tracking-[0.15em] hover:bg-destructive/90 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
          >
            {deleting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Deleting…
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4" strokeWidth={2} />
                Delete
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}