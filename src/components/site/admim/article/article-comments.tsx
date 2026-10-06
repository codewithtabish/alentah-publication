"use client";

// ============================================================
// ArticleComments — ALENTAH
// Comment list + form. Auth required to post.
// Delete uses a styled confirmation dialog (not window.confirm).
// ============================================================

import * as React from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { SignInButton, useUser } from "@clerk/nextjs";
import { Loader2, Trash2, MessageSquare, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { CommentItem } from "@/actions/comments/get-comments";
import { createComment } from "@/actions/comments/create-comment";
import { deleteComment } from "@/actions/comments/delete-comment";

// ============================================================
// TYPES
// ============================================================

interface ArticleCommentsProps {
  blogId: string;
  blogSlug: string;
  initialComments: CommentItem[];
}

// ============================================================
// HELPERS
// ============================================================

function getAuthorName(c: CommentItem): string {
  return (
    [c.user.firstName, c.user.lastName].filter(Boolean).join(" ") ||
    "Anonymous Reader"
  );
}

function getInitials(name: string): string {
  const parts = name.split(" ").filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function formatRelative(date: Date): string {
  const d = new Date(date);
  const diff = Date.now() - d.getTime();
  const sec = Math.floor(diff / 1000);
  const min = Math.floor(sec / 60);
  const hr = Math.floor(min / 60);
  const day = Math.floor(hr / 24);

  if (sec < 60) return "just now";
  if (min < 60) return `${min}m ago`;
  if (hr < 24) return `${hr}h ago`;
  if (day < 7) return `${day}d ago`;

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(d);
}

// ============================================================
// COMPONENT
// ============================================================

export function ArticleComments({
  blogId,
  blogSlug,
  initialComments,
}: ArticleCommentsProps) {
  const pathname = usePathname();
  const { isSignedIn, user } = useUser();

  const [comments, setComments] =
    React.useState<CommentItem[]>(initialComments);
  const [content, setContent] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const [deletingId, setDeletingId] =
    React.useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] =
    React.useState<CommentItem | null>(null);

  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  React.useEffect(() => {
    setComments(initialComments);
  }, [initialComments]);

  // ---------------------------------------------------------
  // Redirect target — full current URL path (not just slug)
  // usePathname() returns e.g.
  //   /technology/software-development/how-cloud-...
  // Falls back to "/" if pathname is somehow empty.
  // ---------------------------------------------------------
  const redirectUrl = pathname || "/";

  // ---------------------------------------------------------
  // CREATE
  // ---------------------------------------------------------
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!isSignedIn) return;

    const trimmed = content.trim();

    if (!trimmed) {
      toast.error("Write something first.");
      return;
    }

    if (trimmed.length > 2000) {
      toast.error("Comment is too long (max 2000 characters).");
      return;
    }

    setSubmitting(true);

    try {
      const result = await createComment({
        blogId,
        blogSlug,
        content: trimmed,
      });

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      setComments((prev) => [
        {
          id: result.comment.id,
          content: result.comment.content,
          createdAt: result.comment.createdAt,
          parentId: result.comment.parentId,
          user: result.comment.user,
        },
        ...prev,
      ]);

      setContent("");
      toast.success("Comment posted.");
    } catch (err) {
      console.error("[ArticleComments] submit error:", err);
      toast.error("Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  // ---------------------------------------------------------
  // DELETE (actual — called from dialog)
  // ---------------------------------------------------------
  const performDelete = async (c: CommentItem) => {
    const snapshot = comments;
    setDeletingId(c.id);
    setComments((prev) => prev.filter((x) => x.id !== c.id));
    setDeleteTarget(null);

    try {
      const result = await deleteComment({
        commentId: c.id,
        blogId,
        blogSlug,
      });

      if (!result.success) {
        setComments(snapshot);
        toast.error(result.error);
        return;
      }

      toast.success("Comment deleted.");
    } catch (err) {
      console.error("[ArticleComments] delete error:", err);
      setComments(snapshot);
      toast.error("Something went wrong.");
    } finally {
      setDeletingId(null);
    }
  };

  const total = comments.length;

  return (
    <>
      <section
        aria-labelledby="comments-heading"
        className="mt-14 sm:mt-16"
      >
        {/* HEADER */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4 sm:mb-8 sm:pb-5">
          <div className="flex items-center gap-2.5">
            <MessageSquare
              className="size-5 text-primary"
              strokeWidth={1.75}
              aria-hidden="true"
            />
            <h2
              id="comments-heading"
              className="font-serif text-2xl tracking-tight text-foreground sm:text-3xl"
            >
              Comments
            </h2>
            <span className="rounded-full border border-border bg-muted px-2 py-0.5 text-[11px] font-semibold tabular-nums text-muted-foreground">
              {total}
            </span>
          </div>
        </div>

        {/* FORM */}
        {isSignedIn ? (
          <form
            onSubmit={handleSubmit}
            className="mb-8 rounded-2xl border border-border bg-card p-3.5 sm:mb-10 sm:p-5"
          >
            <div className="flex items-start gap-3">
              <div className="relative size-9 shrink-0 overflow-hidden rounded-full border border-border bg-muted sm:size-10">
                {user?.imageUrl ? (
                  <Image
                    src={user.imageUrl}
                    alt={user.fullName ?? "You"}
                    fill
                    sizes="40px"
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-primary text-[12px] font-semibold text-primary-foreground">
                    {getInitials(user?.fullName ?? "You")}
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <textarea
                  ref={textareaRef}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Share your thoughts…"
                  rows={3}
                  maxLength={2000}
                  disabled={submitting}
                  className={cn(
                    "w-full resize-none rounded-xl border border-border bg-background px-3.5 py-2.5",
                    "text-[14px] leading-relaxed text-foreground placeholder:text-muted-foreground/60",
                    "focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/30",
                    "disabled:opacity-60",
                  )}
                />

                <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                  <p className="text-[11px] text-muted-foreground">
                    Posting as{" "}
                    <span className="font-medium text-foreground">
                      {user?.fullName ?? "Reader"}
                    </span>
                    <span className="mx-1.5 text-muted-foreground/40">·</span>
                    <span className="tabular-nums">
                      {content.length}/2000
                    </span>
                  </p>

                  <button
                    type="submit"
                    disabled={submitting || content.trim().length === 0}
                    className={cn(
                      "inline-flex h-9 items-center justify-center gap-2 rounded-full px-4",
                      "bg-primary text-primary-foreground",
                      "text-[11px] font-semibold uppercase tracking-[0.15em]",
                      "transition-colors hover:bg-primary/90",
                      "disabled:cursor-not-allowed disabled:opacity-50",
                    )}
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        Posting
                      </>
                    ) : (
                      "Post comment"
                    )}
                  </button>
                </div>
              </div>
            </div>
          </form>
        ) : (
          <div className="mb-8 rounded-2xl border border-dashed border-border bg-muted/30 p-6 text-center sm:mb-10">
            <p className="text-[14px] text-muted-foreground">
              Sign in to join the conversation.
            </p>

            <SignInButton
              mode="modal"
              forceRedirectUrl={redirectUrl}
              signUpForceRedirectUrl={redirectUrl}
            >
              <button
                type="button"
                className={cn(
                  "mt-4 inline-flex h-10 items-center justify-center rounded-full px-5",
                  "border border-primary bg-transparent text-primary",
                  "text-[11px] font-semibold uppercase tracking-[0.15em]",
                  "transition-colors hover:bg-primary hover:text-primary-foreground",
                )}
              >
                Sign in
              </button>
            </SignInButton>
          </div>
        )}

        {/* LIST */}
        {total === 0 ? (
          <p className="py-8 text-center text-[14px] text-muted-foreground">
            No comments yet. Be the first.
          </p>
        ) : (
          <ul className="space-y-5">
            {comments.map((c) => {
              const authorName = getAuthorName(c);
              const isOwn = isSignedIn && c.user.clerkId === user?.id;
              const isDeleting = deletingId === c.id;

              return (
                <li
                  key={c.id}
                  className="group flex items-start gap-2.5 border-b border-border/60 pb-5 last:border-b-0 last:pb-0 sm:gap-3"
                >
                  {/* Avatar */}
                  <div className="relative size-9 shrink-0 overflow-hidden rounded-full border border-border bg-muted sm:size-10">
                    {c.user.imageUrl ? (
                      <Image
                        src={c.user.imageUrl}
                        alt={authorName}
                        fill
                        sizes="40px"
                        className="object-cover"
                        unoptimized
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-primary text-[12px] font-semibold text-primary-foreground">
                        {getInitials(authorName)}
                      </div>
                    )}
                  </div>

                  {/* Body */}
                  <div className="min-w-0 flex-1">
                    {/* Meta row */}
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <p className="text-[13px] font-semibold text-foreground">
                        {authorName}
                      </p>

                      {isOwn && (
                        <span className="rounded-full border border-primary/20 bg-primary/10 px-1.5 py-px text-[9px] font-semibold uppercase tracking-[0.1em] text-primary">
                          You
                        </span>
                      )}

                      <span className="text-[11px] text-muted-foreground">
                        {formatRelative(c.createdAt)}
                      </span>

                      {isOwn && (
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(c)}
                          disabled={isDeleting}
                          aria-label="Delete comment"
                          title="Delete comment"
                          className="ml-auto inline-flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:opacity-40"
                        >
                          {isDeleting ? (
                            <Loader2 className="size-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="size-3.5" strokeWidth={1.75} />
                          )}
                        </button>
                      )}
                    </div>

                    {/* Comment body */}
                    <p className="mt-1.5 whitespace-pre-wrap text-[14px] leading-7 text-foreground/90 wrap-anywhere sm:text-[14.5px]">
                      {c.content}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* DELETE CONFIRMATION DIALOG */}
      {deleteTarget && (
        <DeleteCommentDialog
          comment={deleteTarget}
          deleting={deletingId === deleteTarget.id}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={() => performDelete(deleteTarget)}
        />
      )}
    </>
  );
}

// ============================================================
// DELETE CONFIRMATION DIALOG
// ============================================================

function DeleteCommentDialog({
  comment,
  deleting,
  onCancel,
  onConfirm,
}: {
  comment: CommentItem;
  deleting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const inputRef = React.useRef<HTMLButtonElement>(null);

  // Focus the cancel button on mount so the user's default
  // action is safe (Enter does not accidentally delete).
  React.useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Esc to close
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !deleting) onCancel();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [deleting, onCancel]);

  // Body scroll lock
  React.useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  const preview =
    comment.content.length > 120
      ? comment.content.slice(0, 120).trimEnd() + "…"
      : comment.content;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-comment-title"
      className="fixed inset-0 z-100 flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm"
      onClick={() => !deleting && onCancel()}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-3xl border border-border bg-background p-6 shadow-2xl sm:p-7"
      >
        {/* Icon */}
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10">
          <AlertTriangle
            className="h-6 w-6 text-destructive"
            strokeWidth={1.75}
          />
        </div>

        <h2
          id="delete-comment-title"
          className="text-center font-serif text-2xl tracking-tight text-foreground"
        >
          Delete comment?
        </h2>

        <p className="mt-3 text-center text-sm text-muted-foreground">
          This cannot be undone.
        </p>

        {/* Preview */}
        <div className="mt-5 rounded-xl border border-border bg-muted/40 p-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            Your comment
          </p>
          <p className="mt-1.5 text-[13px] leading-6 text-foreground/85 wrap-anywhere">
            {preview}
          </p>
        </div>

        {/* Actions */}
        <div className="mt-6 flex items-center justify-end gap-2">
          <button
            ref={inputRef}
            type="button"
            onClick={onCancel}
            disabled={deleting}
            className="inline-flex h-10 items-center justify-center rounded-full border border-border bg-transparent px-5 text-[11px] font-semibold uppercase tracking-[0.15em] text-foreground transition-colors hover:bg-accent disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={deleting}
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