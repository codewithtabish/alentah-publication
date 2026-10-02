"use client";

// ============================================================
// Delete Category Dialog — ALENTAH
// Confirmation modal with type-to-confirm.
// ============================================================

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Trash2, AlertTriangle, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { deleteCategory } from "./delete-category";

// ============================================================
// TYPES
// ============================================================

export type DeleteCategoryTarget = {
  id: string;
  name: string;
  slug: string;
  blogCount: number;
  subcategoryCount: number;
};

interface DeleteCategoryDialogProps {
  category: DeleteCategoryTarget | null;
  onClose: () => void;
}

// ============================================================
// COMPONENT
// ============================================================

export function DeleteCategoryDialog({
  category,
  onClose,
}: DeleteCategoryDialogProps) {
  const router = useRouter();
  const inputRef = React.useRef<HTMLInputElement>(null);

  const [confirmText, setConfirmText] = React.useState("");
  const [deleting, setDeleting] = React.useState(false);

  // Reset when target changes
  React.useEffect(() => {
    if (category) {
      setConfirmText("");
      setDeleting(false);
      // Autofocus after a tiny delay so the dialog is mounted
      setTimeout(() => inputRef.current?.focus(), 80);
    }
  }, [category]);

  // Escape to close
  React.useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !deleting) onClose();
    };
    if (category) document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [category, deleting, onClose]);

  // Lock body scroll
  React.useEffect(() => {
    document.body.style.overflow = category ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [category]);

  if (!category) return null;

  const canDelete =
    confirmText.trim() === category.slug && category.blogCount === 0;

  const handleDelete = async () => {
    if (!canDelete) return;

    setDeleting(true);
    const toastId = toast.loading("Deleting category…");

    try {
      const result = await deleteCategory(category.id);

      if (!result.success) {
        toast.error(result.error, { id: toastId });
        setDeleting(false);
        return;
      }

      toast.success(`Category "${result.deleted.name}" deleted.`, {
        id: toastId,
        description: "It's been removed from Alentah.",
      });

      onClose();
      router.refresh();
    } catch (err) {
      console.error("[DeleteCategoryDialog] error:", err);
      toast.error(
        err instanceof Error ? err.message : "Something went wrong.",
        { id: toastId },
      );
      setDeleting(false);
    }
  };

  return (
    <div
      className={cn(
        "fixed inset-0 z-100 flex items-center justify-center",
        "bg-black/50 backdrop-blur-sm",
        "animate-in fade-in duration-200",
      )}
      onClick={() => !deleting && onClose()}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={cn(
          "relative w-full max-w-md mx-4",
          "bg-background border border-border rounded-3xl",
          "shadow-[0_40px_120px_-20px_rgba(0,0,0,0.45)]",
          "animate-in zoom-in-95 duration-200",
          "p-6 sm:p-8",
        )}
      >
        {/* Close */}
        <button
          type="button"
          onClick={onClose}
          disabled={deleting}
          aria-label="Close"
          className={cn(
            "absolute right-4 top-4 inline-flex h-8 w-8 items-center justify-center",
            "rounded-full text-muted-foreground",
            "hover:bg-accent hover:text-foreground",
            "transition-colors",
            "disabled:opacity-50",
          )}
        >
          <X className="h-4 w-4" />
        </button>

        {/* Icon */}
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10">
          <AlertTriangle
            className="h-6 w-6 text-destructive"
            strokeWidth={1.75}
          />
        </div>

        {/* Title */}
        <h2 className="text-center font-serif text-2xl tracking-tight">
          Delete category?
        </h2>

        <p className="mt-3 text-center text-sm text-muted-foreground">
          You&apos;re about to permanently delete{" "}
          <span className="font-medium text-foreground">
            {category.name}
          </span>
          . This action cannot be undone.
        </p>

        {/* Warnings */}
        {(category.blogCount > 0 || category.subcategoryCount > 0) && (
          <div className="mt-5 rounded-2xl border border-destructive/40 bg-destructive/5 p-4 text-left">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.15em] text-destructive">
              Heads up
            </p>
            <ul className="space-y-1.5 text-[12px] text-foreground/80">
              {category.blogCount > 0 && (
                <li>
                  • This category has{" "}
                  <span className="font-medium text-foreground">
                    {category.blogCount} article(s)
                  </span>
                  . You must move or delete them first.
                </li>
              )}
              {category.subcategoryCount > 0 && (
                <li>
                  • This category has{" "}
                  <span className="font-medium text-foreground">
                    {category.subcategoryCount} subcategor
                    {category.subcategoryCount === 1 ? "y" : "ies"}
                  </span>
                  . They will be deleted too.
                </li>
              )}
            </ul>
          </div>
        )}

        {/* Type-to-confirm */}
        {category.blogCount === 0 && (
          <div className="mt-5">
            <label className="mb-2 block text-[11px] font-medium text-foreground">
              Type{" "}
              <span className="font-mono text-primary">{category.slug}</span>{" "}
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
              placeholder={category.slug}
              className={cn(
                "h-11 w-full rounded-xl px-3.5",
                "border border-border bg-background",
                "font-mono text-[13px] text-foreground",
                "placeholder:text-muted-foreground/40",
                "focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/30",
                "transition-all duration-200",
              )}
            />
          </div>
        )}

        {/* Actions */}
        <div className="mt-6 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={deleting}
            className={cn(
              "inline-flex h-10 items-center justify-center rounded-full px-5",
              "border border-border bg-transparent text-foreground",
              "text-[11px] font-semibold uppercase tracking-[0.15em]",
              "hover:bg-accent transition-colors",
              "disabled:opacity-50",
            )}
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleDelete}
            disabled={!canDelete || deleting}
            className={cn(
              "inline-flex h-10 items-center justify-center gap-2 rounded-full px-5",
              "bg-destructive text-destructive-foreground",
              "text-[11px] font-semibold uppercase tracking-[0.15em]",
              "hover:bg-destructive/90 transition-colors",
              "disabled:cursor-not-allowed disabled:opacity-50",
            )}
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