"use client";

// ============================================================
// Articles Table — ALENTAH Admin
// Matches the mockup exactly.
//
// Types come from the server action (single source of truth):
//   AdminArticleRow, AdminArticleStats
// ============================================================

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Pencil,
  Trash2,
  Eye,
  LayoutGrid,
  List,
  AlertTriangle,
  Loader2,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { deleteArticle } from "@/actions/blog/delete-article";
import type {
  AdminArticleRow,
  AdminArticleStats,
} from "@/actions/blog/get-admin-articles";

// ============================================================
// TYPES
// ============================================================

interface ArticlesTableProps {
  articles: AdminArticleRow[];
  stats: AdminArticleStats;
  total: number;
}

// ============================================================
// COMPONENT
// ============================================================

export function ArticlesTable({
  articles,
  stats,
  total,
}: ArticlesTableProps) {
  const router = useRouter();

  const [activeFilter, setActiveFilter] = React.useState<string>("All");
  const [view, setView] = React.useState<"list" | "grid">("list");
  const [deleteTarget, setDeleteTarget] =
    React.useState<AdminArticleRow | null>(null);

  // Filter articles
  const filtered = React.useMemo(() => {
    if (activeFilter === "All") return articles;
    return articles.filter(
      (a) => a.status === activeFilter.toUpperCase().replace(" ", "_"),
    );
  }, [articles, activeFilter]);

  const filters = [
    { label: "All", value: "All", count: stats.total },
    { label: "Published", value: "Published", count: stats.published },
    { label: "In Review", value: "In Review", count: stats.inReview },
    { label: "Drafts", value: "Drafts", count: stats.draft },
    { label: "Scheduled", value: "Scheduled", count: stats.scheduled },
  ];

  return (
    <>
      <div className="space-y-6">
        {/* STATS */}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard
            label="Total Articles"
            value={stats.total}
            trend="+12%"
            trendUp
          />
          <StatCard
            label="Published"
            value={stats.published}
            trend="+18%"
            trendUp
            accent="olive"
          />
          <StatCard
            label="In Review"
            value={stats.inReview}
            trend="+2%"
            trendUp
            accent="amber"
          />
          <StatCard
            label="Drafts"
            value={stats.draft}
            trend="-5%"
            accent="rust"
          />
        </div>

        {/* FILTER BAR */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card p-3">
          <div className="flex flex-wrap items-center gap-1">
            {filters.map((f) => (
              <button
                key={f.value}
                type="button"
                onClick={() => setActiveFilter(f.value)}
                className={cn(
                  "inline-flex h-8 items-center gap-1.5 rounded-full px-3",
                  "text-[11px] font-semibold uppercase tracking-[0.12em]",
                  "transition-colors",
                  activeFilter === f.value
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent",
                )}
              >
                {f.label}
                <span
                  className={cn(
                    "text-[9px] opacity-70",
                    activeFilter === f.value && "opacity-100",
                  )}
                >
                  {f.count}
                </span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <FilterSelect label="Category" options={["All", "Technology"]} />
            <FilterSelect label="Subcategory" options={["All", "AI"]} />
            <FilterSelect
              label="Type"
              options={["All", "Article", "News", "Opinion"]}
            />
            <FilterSelect
              label="Sort"
              options={["Newest", "Oldest", "Most viewed"]}
            />

            <div className="flex items-center gap-0.5 rounded-lg border border-border p-0.5">
              <button
                type="button"
                onClick={() => setView("grid")}
                aria-label="Grid view"
                className={cn(
                  "inline-flex h-7 w-7 items-center justify-center rounded-md transition-colors",
                  view === "grid"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent",
                )}
              >
                <LayoutGrid className="h-3.5 w-3.5" strokeWidth={1.75} />
              </button>
              <button
                type="button"
                onClick={() => setView("list")}
                aria-label="List view"
                className={cn(
                  "inline-flex h-7 w-7 items-center justify-center rounded-md transition-colors",
                  view === "list"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent",
                )}
              >
                <List className="h-3.5 w-3.5" strokeWidth={1.75} />
              </button>
            </div>
          </div>
        </div>

        {/* TABLE */}
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          {/* Header row */}
          <div className="hidden items-center gap-4 border-b border-border bg-muted/40 px-4 py-3 md:grid md:grid-cols-[32px_80px_minmax(0,2.5fr)_140px_160px_120px_80px_100px_100px]">
            <div />
            <HeaderCell>Thumbnail</HeaderCell>
            <HeaderCell>Title</HeaderCell>
            <HeaderCell>Category</HeaderCell>
            <HeaderCell>Author</HeaderCell>
            <HeaderCell>Status</HeaderCell>
            <HeaderCell>Views</HeaderCell>
            <HeaderCell>Date</HeaderCell>
            <HeaderCell align="right">Actions</HeaderCell>
          </div>

          {filtered.length === 0 ? (
            <div className="p-12 text-center">
              <p className="mb-2 font-serif text-xl tracking-tight">
                No articles in this filter
              </p>
              <p className="text-sm text-muted-foreground">
                Try a different filter or{" "}
                <Link
                  href="/admin/articles/new"
                  className="text-primary hover:underline underline-offset-4"
                >
                  create a new article
                </Link>
                .
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {filtered.map((article) => (
                <li
                  key={article.id}
                  className="grid grid-cols-1 items-center gap-4 px-4 py-4 transition-colors hover:bg-accent/30 md:grid-cols-[32px_80px_minmax(0,2.5fr)_140px_160px_120px_80px_100px_100px]"
                >
                  <input
                    type="checkbox"
                    aria-label="Select"
                    className="h-4 w-4 rounded border-border accent-primary"
                  />

                  {/* Thumbnail */}
                  <Link
                    href={`/article/${article.slug}`}
                    className="relative h-14 w-20 shrink-0 overflow-hidden border border-border bg-muted"
                  >
                    <Image
                      src={article.bannerImage}
                      alt={article.title}
                      fill
                      sizes="80px"
                      className="object-cover"
                      unoptimized
                    />
                  </Link>

                  {/* Title + desc */}
                  <Link
                    href={`/article/${article.slug}`}
                    className="group min-w-0"
                  >
                    <p className="truncate font-serif text-[15px] leading-tight text-foreground transition-colors group-hover:text-primary">
                      {article.title}
                    </p>
                    {article.shortDescription && (
                      <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
                        {article.shortDescription}
                      </p>
                    )}
                  </Link>

                  {/* Category */}
                  <div className="min-w-0">
                    <p
                      className={cn(
                        "inline-flex items-center rounded-full px-2 py-0.5",
                        "text-[9px] font-semibold uppercase tracking-[0.12em]",
                        "bg-primary/10 text-primary border border-primary/20",
                      )}
                    >
                      {article.category.name}
                    </p>
                    {article.subcategory && (
                      <p className="mt-1 text-[10px] text-muted-foreground truncate">
                        {article.subcategory.name}
                      </p>
                    )}
                  </div>

                  {/* Author */}
                  <div className="flex min-w-0 items-center gap-2">
                    <div className="h-6 w-6 shrink-0 overflow-hidden rounded-full border border-border bg-muted">
                      {article.author.imageUrl ? (
                        <Image
                          src={article.author.imageUrl}
                          alt="Author"
                          width={24}
                          height={24}
                          className="h-full w-full object-cover"
                          unoptimized
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-primary text-[9px] font-semibold text-primary-foreground">
                          {(
                            article.author.firstName?.[0] ??
                            article.author.lastName?.[0] ??
                            "?"
                          ).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <span className="truncate text-[11px] text-foreground/80">
                      {article.author.firstName} {article.author.lastName}
                    </span>
                  </div>

                  {/* Status */}
                  <StatusBadge status={article.status} />

                  {/* Views */}
                  <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                    {article.viewCount > 0 ? (
                      <>
                        <Eye className="h-3 w-3" strokeWidth={1.75} />
                        {article.viewCount.toLocaleString()}
                      </>
                    ) : (
                      <span className="text-muted-foreground/40">—</span>
                    )}
                  </div>

                  {/* Date */}
                  <span className="text-[11px] text-muted-foreground">
                    {formatDate(
                      article.publishedAt ??
                        article.scheduledAt ??
                        article.updatedAt,
                    )}
                  </span>

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-0.5">
                    <ActionIcon
                      href={`/admin/articles/${article.id}/edit`}
                      label="Edit"
                    >
                      <Pencil className="h-3.5 w-3.5" strokeWidth={1.75} />
                    </ActionIcon>
                    <ActionIcon
                      href={`/article/${article.slug}`}
                      label="View"
                      external
                    >
                      <Eye className="h-3.5 w-3.5" strokeWidth={1.75} />
                    </ActionIcon>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(article)}
                      aria-label="Delete"
                      title="Delete"
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {/* Pagination */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border px-6 py-4">
            <p className="text-[11px] text-muted-foreground">
              Showing 1–{filtered.length} of {total}
            </p>

            <div className="flex items-center gap-1">
              <PageButton active>1</PageButton>
              <PageButton>2</PageButton>
              <PageButton>3</PageButton>
              <span className="px-1 text-[11px] text-muted-foreground">…</span>
              <PageButton>43</PageButton>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                className="inline-flex h-8 items-center rounded-full border border-border px-4 text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground hover:bg-accent transition-colors"
              >
                Previous
              </button>
              <button
                type="button"
                className="inline-flex h-8 items-center rounded-full border border-border px-4 text-[10px] font-semibold uppercase tracking-[0.15em] text-foreground hover:bg-accent transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* DELETE DIALOG */}
      {deleteTarget && (
        <DeleteArticleDialog
          article={deleteTarget}
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
// SUB-COMPONENTS
// ============================================================

function StatCard({
  label,
  value,
  trend,
  trendUp,
  accent,
}: {
  label: string;
  value: number;
  trend?: string;
  trendUp?: boolean;
  accent?: "olive" | "amber" | "rust";
}) {
  return (
    <div className="rounded-2xl border border-border bg-card px-5 py-4">
      <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </p>
      <div className="flex items-end justify-between gap-2">
        <p className="font-serif text-3xl tracking-tight">{value}</p>
        {trend && (
          <span
            className={cn(
              "text-[10px] font-semibold",
              trendUp ? "text-primary" : "text-destructive",
              accent === "amber" && "text-amber-600",
              accent === "rust" && "text-orange-700",
            )}
          >
            {trend}
          </span>
        )}
      </div>
    </div>
  );
}

function HeaderCell({
  children,
  align = "left",
}: {
  children?: React.ReactNode;
  align?: "left" | "right";
}) {
  return (
    <p
      className={cn(
        "text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground",
        align === "right" && "text-right",
      )}
    >
      {children}
    </p>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    PUBLISHED: "bg-primary text-primary-foreground",
    IN_REVIEW: "bg-amber-500 text-white",
    DRAFT: "bg-orange-700 text-white",
    SCHEDULED: "bg-slate-500 text-white",
    ARCHIVED: "bg-muted text-muted-foreground",
  };

  const labels: Record<string, string> = {
    PUBLISHED: "Published",
    IN_REVIEW: "In Review",
    DRAFT: "Draft",
    SCHEDULED: "Scheduled",
    ARCHIVED: "Archived",
  };

  return (
    <span
      className={cn(
        "inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1",
        "text-[9px] font-semibold uppercase tracking-[0.12em]",
        styles[status] ?? "bg-muted text-muted-foreground",
      )}
    >
      {labels[status] ?? status}
    </span>
  );
}

function ActionIcon({
  href,
  label,
  children,
  external,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
  external?: boolean;
}) {
  const props = external ? { target: "_blank", rel: "noreferrer" } : {};
  return (
    <Link
      href={href}
      aria-label={label}
      title={label}
      {...props}
      className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
    >
      {children}
    </Link>
  );
}

function PageButton({
  children,
  active,
}: {
  children: React.ReactNode;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      className={cn(
        "inline-flex h-8 min-w-8 items-center justify-center rounded-full px-2",
        "text-[11px] font-medium transition-colors",
        active
          ? "bg-primary text-primary-foreground"
          : "text-muted-foreground hover:bg-accent",
      )}
    >
      {children}
    </button>
  );
}

function FilterSelect({
  label,
  options,
}: {
  label: string;
  options: string[];
}) {
  return (
    <select
      aria-label={label}
      className={cn(
        "h-8 rounded-lg border border-border bg-background px-2.5",
        "text-[11px] text-foreground cursor-pointer",
        "focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/30",
      )}
      defaultValue={options[0]}
    >
      {options.map((opt) => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>
  );
}

function formatDate(date: Date | null): string {
  if (!date) return "—";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(new Date(date));
}

// ============================================================
// DELETE DIALOG
// ============================================================

function DeleteArticleDialog({
  article,
  onClose,
  onDeleted,
}: {
  article: AdminArticleRow;
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

  const canDelete = confirmText.trim() === article.slug;

  const handleDelete = async () => {
    if (!canDelete) return;

    setDeleting(true);
    const toastId = toast.loading("Deleting article…");

    try {
      const result = await deleteArticle(article.id);

      if (!result.success) {
        toast.error(result.error, { id: toastId });
        setDeleting(false);
        return;
      }

      toast.success(`"${result.deleted.title}" deleted.`, { id: toastId });
      onDeleted();
    } catch (err) {
      console.error("[DeleteArticleDialog] error:", err);
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
          Delete article?
        </h2>

        <p className="mt-3 text-center text-sm text-muted-foreground">
          You&apos;re about to permanently delete{" "}
          <span className="font-medium text-foreground">{article.title}</span>.
        </p>

        <div className="mt-5">
          <label className="mb-2 block text-[11px] font-medium text-foreground">
            Type{" "}
            <span className="font-mono text-primary">{article.slug}</span> to
            confirm
          </label>
          <input
            ref={inputRef}
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            disabled={deleting}
            autoComplete="off"
            spellCheck={false}
            placeholder={article.slug}
            className="h-11 w-full rounded-xl border border-border bg-background px-3.5 font-mono text-[13px] text-foreground placeholder:text-muted-foreground/40 focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>

        <div className="mt-6 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={deleting}
            className="inline-flex h-10 items-center justify-center rounded-full border border-border bg-transparent px-5 text-[11px] font-semibold uppercase tracking-[0.15em] text-foreground transition-colors hover:bg-accent disabled:opacity-50"
          >
            Cancel
          </button>

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
        </div>
      </div>
    </div>
  );
}