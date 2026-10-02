"use client";

// ============================================================
// Categories Table — ALENTAH
// Expandable tree with subcategories.
// Subcategories: add + delete only (no edit).
// ============================================================

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ChevronRight,
  Plus,
  Trash2,
  GripVertical,
  FolderTree,
  Layers,
  Pencil,
  Loader2,
  AlertTriangle,
} from "lucide-react";

import { cn } from "@/lib/utils";
import {
  DeleteCategoryDialog,
  type DeleteCategoryTarget,
} from "./delete-category-dialog";
import { CategoryListItem, SubcategoryItem } from "@/actions/category/get-categories";
import { deleteSubcategory } from "@/actions/subcategory/delete-subcategory";


// ============================================================
// TYPES
// ============================================================

interface CategoriesTableProps {
  categories: CategoryListItem[];
}

// ============================================================
// COMPONENT
// ============================================================

export function CategoriesTable({ categories }: CategoriesTableProps) {
  const router = useRouter();

  const [deleteCategoryTarget, setDeleteCategoryTarget] =
    React.useState<DeleteCategoryTarget | null>(null);

  const [deleteSubTarget, setDeleteSubTarget] = React.useState<{
    sub: SubcategoryItem;
    category: CategoryListItem;
  } | null>(null);

  // All categories expanded by default
  const [expanded, setExpanded] = React.useState<Set<string>>(
    () => new Set(categories.map((c) => c.id)),
  );

  const toggle = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  if (categories.length === 0) {
    return <EmptyState />;
  }

  // ─── Aggregates ───
  const totalCategories = categories.length;
  const totalSubcategories = categories.reduce(
    (sum, c) => sum + c.subcategoryCount,
    0,
  );
  const totalArticles = categories.reduce((sum, c) => sum + c.blogCount, 0);
  const avgPerCategory =
    totalCategories > 0 ? Math.round(totalArticles / totalCategories) : 0;

  return (
    <>
      <div className="space-y-6">
        {/* STATS */}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard
            label="Total Categories"
            value={totalCategories}
            sub="all active"
            icon={<Layers className="h-4 w-4" strokeWidth={1.75} />}
          />
          <StatCard
            label="Subcategories"
            value={totalSubcategories}
            sub="across sections"
            icon={<FolderTree className="h-4 w-4" strokeWidth={1.75} />}
          />
          <StatCard
            label="Articles"
            value={totalArticles}
            sub="across all sections"
            icon={<span className="font-serif text-[11px]">Aa</span>}
          />
          <StatCard
            label="Avg. per Category"
            value={avgPerCategory}
            sub="articles"
            icon={
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
                className="h-4 w-4"
              >
                <path d="M3 20h18M6 20V8m6 12V4m6 16v-8" />
              </svg>
            }
          />
        </div>

        {/* TREE */}
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-6 py-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              All Categories
            </p>
            <div className="flex items-center gap-1">
              {["All", "Active", "Hidden", "Archived"].map((tab) => (
                <button
                  key={tab}
                  type="button"
                  className={cn(
                    "inline-flex h-7 items-center rounded-full px-3",
                    "text-[10px] font-semibold uppercase tracking-[0.12em]",
                    tab === "All"
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent",
                  )}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Rows */}
          <ul className="divide-y divide-border">
            {categories.map((category) => {
              const isExpanded = expanded.has(category.id);

              return (
                <li key={category.id}>
                  {/* ─── Category row ─── */}
                  <div className="flex items-center gap-3 px-6 py-4 transition-colors hover:bg-accent/30">
                    {/* Expand chevron */}
                    <button
                      type="button"
                      onClick={() => toggle(category.id)}
                      aria-label={isExpanded ? "Collapse" : "Expand"}
                      className={cn(
                        "inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md",
                        "text-muted-foreground transition-colors",
                        "hover:bg-accent hover:text-foreground",
                      )}
                    >
                      <ChevronRight
                        className={cn(
                          "h-3.5 w-3.5 transition-transform duration-200",
                          isExpanded && "rotate-90",
                        )}
                        strokeWidth={2}
                      />
                    </button>

                    {/* Drag */}
                    <button
                      type="button"
                      aria-label="Reorder"
                      className="cursor-grab text-muted-foreground/40 hover:text-muted-foreground"
                    >
                      <GripVertical className="h-4 w-4" strokeWidth={1.75} />
                    </button>

                    {/* Cover */}
                    <Link
                      href={`/admin/categories/${category.id}`}
                      className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-border bg-muted transition-opacity hover:opacity-90"
                    >
                      {category.coverImage ? (
                        <Image
                          src={category.coverImage}
                          alt={category.name}
                          fill
                          sizes="48px"
                          className="object-cover"
                          unoptimized
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <FolderTree
                            className="h-5 w-5 text-muted-foreground/60"
                            strokeWidth={1.75}
                          />
                        </div>
                      )}
                    </Link>

                    {/* Name + slug */}
                    <Link
                      href={`/admin/categories/${category.id}`}
                      className="group min-w-[140px] flex-1"
                    >
                      <p className="truncate font-serif text-[15px] leading-tight text-foreground transition-colors group-hover:text-primary">
                        {category.name}
                      </p>
                      <p className="mt-0.5 truncate font-mono text-[10px] text-muted-foreground">
                        /{category.slug}
                      </p>
                    </Link>

                    {/* Description */}
                    <div className="hidden min-w-0 flex-[1.2] xl:block">
                      <p className="truncate text-[12px] text-muted-foreground">
                        {category.description || "No description"}
                      </p>
                    </div>

                    {/* Editor */}
                    <div className="hidden w-28 shrink-0 items-center gap-2 lg:flex">
                      {category.editor ? (
                        <>
                          <div className="h-6 w-6 shrink-0 overflow-hidden rounded-full border border-border bg-muted">
                            {category.editor.imageUrl ? (
                              <Image
                                src={category.editor.imageUrl}
                                alt={category.editor.name}
                                width={24}
                                height={24}
                                className="h-full w-full object-cover"
                                unoptimized
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center bg-primary text-[9px] font-semibold text-primary-foreground">
                                {category.editor.name.charAt(0).toUpperCase()}
                              </div>
                            )}
                          </div>
                          <span className="truncate text-[11px] text-foreground/80">
                            {category.editor.name}
                          </span>
                        </>
                      ) : (
                        <span className="text-[10px] italic text-muted-foreground">
                          Unassigned
                        </span>
                      )}
                    </div>

                    {/* Counts */}
                    <div className="hidden w-24 shrink-0 text-center md:block">
                      <p className="text-[11px] text-foreground/80">
                        {category.subcategoryCount} subs
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {category.blogCount} articles
                      </p>
                    </div>

                    {/* Status */}
                    <div className="hidden w-20 shrink-0 justify-center md:flex">
                      <StatusBadge active={category.isActive} />
                    </div>

                    {/* Actions */}
                    <div className="flex shrink-0 items-center justify-end gap-0.5">
                      <Link
                        href={`/admin/categories/${category.id}/edit`}
                        aria-label="Edit category"
                        title="Edit category"
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                      >
                        <Pencil className="h-3.5 w-3.5" strokeWidth={1.75} />
                      </Link>

                      <Link
                        href={`/category/${category.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        aria-label="View public page"
                        title="View public page"
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                      >
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.75"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="h-3.5 w-3.5"
                        >
                          <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      </Link>

                      <button
                        type="button"
                        onClick={() =>
                          setDeleteCategoryTarget({
                            id: category.id,
                            name: category.name,
                            slug: category.slug,
                            blogCount: category.blogCount,
                            subcategoryCount: category.subcategoryCount,
                          })
                        }
                        aria-label="Delete category"
                        title="Delete category"
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                      >
                        <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} />
                      </button>
                    </div>
                  </div>

                  {/* ─── Subcategory rows ─── */}
                  {isExpanded && (
                    <div className="bg-muted/20">
                      <ul className="relative ml-[124px] mr-6">
                        <span
                          aria-hidden
                          className="absolute bottom-0 left-0 top-0 w-px bg-border"
                        />

                        {category.subcategories.map((sub) => (
                          <li
                            key={sub.id}
                            className="relative flex items-center gap-3 border-b border-border/60 py-3 pl-6 pr-2 transition-colors last:border-b-0 hover:bg-accent/30"
                          >
                            <span
                              aria-hidden
                              className="absolute left-0 top-1/2 h-px w-4 bg-border"
                            />

                            <button
                              type="button"
                              aria-label="Reorder"
                              className="cursor-grab text-muted-foreground/40 hover:text-muted-foreground"
                            >
                              <GripVertical
                                className="h-3.5 w-3.5"
                                strokeWidth={1.75}
                              />
                            </button>

                            <div className="min-w-0 flex-1">
                              <p className="truncate text-[13px] text-foreground">
                                {sub.name}
                              </p>
                            </div>

                            <div className="hidden w-24 text-right md:block">
                              <p className="text-[11px] text-muted-foreground">
                                {sub.articleCount} article
                                {sub.articleCount === 1 ? "" : "s"}
                              </p>
                            </div>

                            <div className="hidden w-20 justify-center md:flex">
                              <MiniStatusBadge active={sub.isActive} />
                            </div>

                            <div className="flex items-center justify-end gap-1">
                              <button
                                type="button"
                                onClick={() =>
                                  setDeleteSubTarget({ sub, category })
                                }
                                aria-label="Delete subcategory"
                                title="Delete subcategory"
                                className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                              >
                                <Trash2
                                  className="h-3.5 w-3.5"
                                  strokeWidth={1.75}
                                />
                              </button>
                            </div>
                          </li>
                        ))}

                        {/* Add subcategory */}
                        <li className="py-3 pl-6">
                          <Link
                            href={`/admin/subcategories/new?categoryId=${category.id}`}
                            className={cn(
                              "inline-flex h-8 items-center gap-1.5 rounded-full px-3.5",
                              "border border-dashed border-border",
                              "text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground",
                              "hover:border-primary/40 hover:bg-primary/5 hover:text-primary",
                              "transition-colors",
                            )}
                          >
                            <Plus className="h-3 w-3" strokeWidth={2.5} />
                            Add subcategory
                          </Link>
                        </li>
                      </ul>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      {/* Category delete dialog */}
      <DeleteCategoryDialog
        category={deleteCategoryTarget}
        onClose={() => setDeleteCategoryTarget(null)}
      />

      {/* Subcategory delete dialog */}
      {deleteSubTarget && (
        <DeleteSubcategoryDialog
          subcategory={deleteSubTarget.sub}
          categoryName={deleteSubTarget.category.name}
          onClose={() => setDeleteSubTarget(null)}
          onDeleted={() => {
            setDeleteSubTarget(null);
            router.refresh();
          }}
        />
      )}
    </>
  );
}

// ============================================================
// STAT CARD
// ============================================================

function StatCard({
  label,
  value,
  sub,
  icon,
}: {
  label: string;
  value: number;
  sub?: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card px-5 py-4">
      <div className="flex items-start justify-between gap-2">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          {label}
        </p>
        {icon && <span className="text-muted-foreground/60">{icon}</span>}
      </div>
      <p className="mt-2 font-serif text-3xl tracking-tight">{value}</p>
      {sub && <p className="mt-1 text-[10px] text-muted-foreground">{sub}</p>}
    </div>
  );
}

// ============================================================
// BADGES
// ============================================================

function StatusBadge({ active }: { active: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1",
        "text-[10px] font-semibold uppercase tracking-[0.12em]",
        active
          ? "bg-primary text-primary-foreground"
          : "bg-amber-600 text-white",
      )}
    >
      {active ? "Active" : "Hidden"}
    </span>
  );
}

function MiniStatusBadge({ active }: { active: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5",
        "text-[9px] font-semibold uppercase tracking-[0.1em]",
        active
          ? "bg-primary text-primary-foreground"
          : "bg-amber-600 text-white",
      )}
    >
      {active ? "Active" : "Hidden"}
    </span>
  );
}

// ============================================================
// EMPTY
// ============================================================

function EmptyState() {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-muted/20 p-12 text-center">
      <p className="mb-2 font-serif text-2xl tracking-tight">
        No categories yet
      </p>
      <p className="mx-auto max-w-md text-sm text-muted-foreground">
        Click{" "}
        <Link
          href="/admin/categories/new"
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          New Category
        </Link>{" "}
        to add your first section.
      </p>
    </div>
  );
}

// ============================================================
// DELETE SUBCATEGORY DIALOG
// ============================================================

function DeleteSubcategoryDialog({
  subcategory,
  categoryName,
  onClose,
  onDeleted,
}: {
  subcategory: SubcategoryItem;
  categoryName: string;
  onClose: () => void;
  onDeleted: () => void;
}) {
  const [deleting, setDeleting] = React.useState(false);
  const [confirmText, setConfirmText] = React.useState("");
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 80);
  }, []);

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !deleting) onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [deleting, onClose]);

  React.useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const canDelete = confirmText.trim() === subcategory.slug;

  const handleDelete = async () => {
    if (!canDelete) return;

    setDeleting(true);
    const toastId = toast.loading("Deleting subcategory…");

    try {
      const result = await deleteSubcategory(subcategory.id);

      if (!result.success) {
        toast.error(result.error, { id: toastId });
        setDeleting(false);
        return;
      }

      toast.success(`Subcategory "${result.deleted.name}" deleted.`, {
        id: toastId,
        description: `It's been removed from ${categoryName}.`,
      });

      onDeleted();
    } catch (err) {
      console.error("[DeleteSubcategoryDialog] error:", err);
      toast.error(
        err instanceof Error ? err.message : "Something went wrong.",
        { id: toastId },
      );
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
        className="mx-4 w-full max-w-md rounded-3xl border border-border bg-background p-6 shadow-2xl sm:p-8"
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
          </span>{" "}
          from{" "}
          <span className="font-medium text-foreground">{categoryName}</span>.
        </p>

        {subcategory.articleCount > 0 && (
          <div className="mt-5 rounded-2xl border border-destructive/40 bg-destructive/5 p-4">
            <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.15em] text-destructive">
              Cannot delete
            </p>
            <p className="text-[12px] text-foreground/80">
              This subcategory has{" "}
              <span className="font-medium text-foreground">
                {subcategory.articleCount} article(s)
              </span>
              . Move or delete them first.
            </p>
          </div>
        )}

        {subcategory.articleCount === 0 && (
          <div className="mt-5">
            <label className="mb-2 block text-[11px] font-medium text-foreground">
              Type{" "}
              <span className="font-mono text-primary">
                {subcategory.slug}
              </span>{" "}
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
        )}

        <div className="mt-6 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={deleting}
            className="inline-flex h-10 items-center justify-center rounded-full border border-border bg-transparent px-5 text-[11px] font-semibold uppercase tracking-[0.15em] text-foreground transition-colors hover:bg-accent disabled:opacity-50"
          >
            Cancel
          </button>

          {subcategory.articleCount === 0 && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={!canDelete || deleting}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-destructive px-5 text-destructive-foreground text-[11px] font-semibold uppercase tracking-[0.15em] transition-colors hover:bg-destructive/90 disabled:cursor-not-allowed disabled:opacity-50"
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
          )}
        </div>
      </div>
    </div>
  );
}