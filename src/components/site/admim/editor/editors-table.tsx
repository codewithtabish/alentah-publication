// src/components/site/admin/editor/editors-table.tsx
// ============================================================
// Editors Table — ALENTAH Admin
// Full table with stats, avatars, status badges, actions.
// ============================================================

import Link from "next/link";
import { Pencil, Eye, Mail } from "lucide-react";
import { cn } from "@/lib/utils";
import { EditorListItem } from "@/actions/editor/get-editors";

interface EditorsTableProps {
  editors: EditorListItem[];
}

export function EditorsTable({ editors }: EditorsTableProps) {
  const total = editors.length;
  const active = editors.filter((e) => e.isActive).length;
  const inactive = total - active;

  if (editors.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="space-y-6">
      {/* STATS ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <StatCard label="Total Editors" value={total} />
        <StatCard label="Active" value={active} accent />
        <StatCard label="Inactive" value={inactive} muted />
      </div>

      {/* TABLE */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        {/* Header (desktop) */}
        <div className="hidden md:grid grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1.4fr)_120px_140px_120px] gap-4 px-6 py-3 border-b border-border bg-muted/40">
          <HeaderCell>Editor</HeaderCell>
          <HeaderCell>Role</HeaderCell>
          <HeaderCell>Assigned to</HeaderCell>
          <HeaderCell>Status</HeaderCell>
          <HeaderCell>Added</HeaderCell>
          <HeaderCell align="right">Actions</HeaderCell>
        </div>

        {/* Rows */}
        <ul className="divide-y divide-border">
          {editors.map((editor) => (
            <li
              key={editor.id}
              className="grid grid-cols-1 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1.4fr)_120px_140px_120px] gap-4 px-6 py-4 items-center hover:bg-accent/40 transition-colors"
            >
              {/* Editor: avatar + name + email */}
              <div className="flex items-center gap-3 min-w-0">
                <div className="h-10 w-10 rounded-full overflow-hidden border border-border shrink-0 bg-muted">
                  {editor.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={editor.imageUrl}
                      alt={editor.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center bg-primary text-primary-foreground text-xs font-semibold">
                      {editor.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-serif text-[15px] leading-tight text-foreground truncate">
                    {editor.name}
                  </p>
                  <p className="text-[11px] text-muted-foreground truncate">
                    {editor.email}
                  </p>
                </div>
              </div>

              {/* Role */}
              <div className="min-w-0">
                <p className="text-[12px] text-foreground/80 truncate">
                  {editor.experience || (
                    <span className="text-muted-foreground italic">
                      No role set
                    </span>
                  )}
                </p>
              </div>

              {/* Categories */}
              <div className="flex flex-wrap gap-1.5 min-w-0">
                {editor.categories.length === 0 ? (
                  <span className="text-[11px] text-muted-foreground italic">
                    None assigned
                  </span>
                ) : (
                  <>
                    {editor.categories.map((cat) => (
                      <span
                        key={cat.id}
                        className={cn(
                          "inline-flex items-center px-2 py-0.5 rounded-full",
                          "text-[10px] uppercase tracking-[0.1em] font-medium",
                          "bg-primary/10 text-primary border border-primary/20",
                        )}
                      >
                        {cat.name}
                      </span>
                    ))}
                    {editor.categoryCount > 3 && (
                      <span className="inline-flex items-center px-2 py-0.5 text-[10px] text-muted-foreground">
                        +{editor.categoryCount - 3}
                      </span>
                    )}
                  </>
                )}
              </div>

              {/* Status */}
              <div>
                <StatusBadge active={editor.isActive} />
              </div>

              {/* Added date */}
              <div>
                <p className="text-[11px] text-muted-foreground">
                  {formatDate(editor.createdAt)}
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-1">
                <ActionButton
                  href={`/admin/editors/${editor.id}/edit`}
                  label="Edit"
                >
                  <Pencil className="h-3.5 w-3.5" strokeWidth={1.75} />
                </ActionButton>
                <ActionButton
                  href={`/editor/${slugify(editor.name)}`}
                  label="View public profile"
                  external
                >
                  <Eye className="h-3.5 w-3.5" strokeWidth={1.75} />
                </ActionButton>
                <ActionButton
                  href={`mailto:${editor.email}`}
                  label="Send email"
                  external
                >
                  <Mail className="h-3.5 w-3.5" strokeWidth={1.75} />
                </ActionButton>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// ============================================================
// SUB-COMPONENTS
// ============================================================

function StatCard({
  label,
  value,
  accent,
  muted,
}: {
  label: string;
  value: number;
  accent?: boolean;
  muted?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card px-5 py-4">
      <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-semibold mb-2">
        {label}
      </p>
      <p
        className={cn(
          "font-serif text-3xl tracking-tight",
          accent && "text-primary",
          muted && "text-muted-foreground",
        )}
      >
        {value}
      </p>
    </div>
  );
}

function HeaderCell({
  children,
  align = "left",
}: {
  children: React.ReactNode;
  align?: "left" | "right";
}) {
  return (
    <p
      className={cn(
        "text-[10px] uppercase tracking-[0.2em] font-semibold text-muted-foreground",
        align === "right" && "text-right",
      )}
    >
      {children}
    </p>
  );
}

function StatusBadge({ active }: { active: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full",
        "text-[10px] uppercase tracking-[0.12em] font-semibold",
        active
          ? "bg-primary/15 text-primary border border-primary/30"
          : "bg-muted text-muted-foreground border border-border",
      )}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          active ? "bg-primary" : "bg-muted-foreground",
        )}
      />
      {active ? "Active" : "Inactive"}
    </span>
  );
}

function ActionButton({
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
      className={cn(
        "inline-flex h-8 w-8 items-center justify-center rounded-lg",
        "text-muted-foreground hover:text-foreground hover:bg-accent",
        "transition-colors duration-200",
      )}
    >
      {children}
    </Link>
  );
}

function EmptyState() {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-muted/20 p-12 text-center">
      <p className="font-serif text-2xl tracking-tight mb-2">No editors yet</p>
      <p className="text-sm text-muted-foreground max-w-md mx-auto">
        Click{" "}
        <Link
          href="/admin/editors/new"
          className="text-primary hover:underline underline-offset-4 font-medium"
        >
          New Editor
        </Link>{" "}
        to add your first team member.
      </p>
    </div>
  );
}

// ============================================================
// HELPERS
// ============================================================

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}