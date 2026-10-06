"use client";

// ============================================================
// ArticleBookmarkButton — ALENTAH
// Save / unsave a blog. Auth required.
// Optimistic toggle with rollback on failure.
// ============================================================

import * as React from "react";
import { SignInButton, useUser } from "@clerk/nextjs";
import { usePathname } from "next/navigation";
import { Bookmark, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { toggleBookmark } from "@/actions/bookmarks/toggle-bookmark";

// ============================================================
// TYPES
// ============================================================

interface ArticleBookmarkButtonProps {
  blogId: string;
  initialSaved: boolean;
  className?: string;
}

// ============================================================
// COMPONENT
// ============================================================

export function ArticleBookmarkButton({
  blogId,
  initialSaved,
  className,
}: ArticleBookmarkButtonProps) {
  const pathname = usePathname();
  const { isSignedIn } = useUser();

  const [saved, setSaved] = React.useState(initialSaved);
  const [pending, setPending] = React.useState(false);
  const [justSaved, setJustSaved] = React.useState(false);

  React.useEffect(() => {
    setSaved(initialSaved);
  }, [initialSaved]);

  const handleToggle = async () => {
    if (pending) return;

    const next = !saved;

    // Optimistic
    setSaved(next);
    setPending(true);

    if (next) {
      setJustSaved(true);
      window.setTimeout(() => setJustSaved(false), 1200);
    }

    try {
      const result = await toggleBookmark({ blogId });

      if (!result.success) {
        setSaved(!next);
        toast.error(result.error);
        return;
      }

      // Server is authoritative
      setSaved(result.saved);

      toast.success(result.saved ? "Saved to your reading list." : "Removed from saved.");
    } catch (err) {
      console.error("[ArticleBookmarkButton] error:", err);
      setSaved(!next);
      toast.error("Something went wrong.");
    } finally {
      setPending(false);
    }
  };

  // ---------------------------------------------------------
  // Signed out — Clerk sign-in
  // ---------------------------------------------------------
  if (!isSignedIn) {
    const redirectUrl = pathname || "/";

    return (
      <SignInButton
        mode="modal"
        forceRedirectUrl={redirectUrl}
        signUpForceRedirectUrl={redirectUrl}
      >
        <button
          type="button"
          aria-label="Sign in to save"
          title="Sign in to save"
          className={cn(
            "inline-flex items-center gap-2 rounded-full border border-border bg-transparent px-4 py-2",
            "text-[11px] font-semibold uppercase tracking-[0.15em] text-foreground",
            "transition-colors hover:bg-accent",
            className,
          )}
        >
          <Bookmark className="h-3.5 w-3.5" strokeWidth={1.75} />
          Save
        </button>
      </SignInButton>
    );
  }

  // ---------------------------------------------------------
  // Signed in — toggle
  // ---------------------------------------------------------
  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={pending}
      aria-pressed={saved}
      aria-label={saved ? "Remove from saved" : "Save article"}
      title={saved ? "Remove from saved" : "Save article"}
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-4 py-2",
        "text-[11px] font-semibold uppercase tracking-[0.15em]",
        "transition-colors",
        saved
          ? "border-primary/40 bg-primary/10 text-primary hover:bg-primary/15"
          : "border-border bg-transparent text-foreground hover:bg-accent",
        "disabled:opacity-60",
        className,
      )}
    >
      {pending ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" strokeWidth={1.75} />
      ) : justSaved ? (
        <Check className="h-3.5 w-3.5" strokeWidth={2} />
      ) : (
        <Bookmark
          className="h-3.5 w-3.5"
          strokeWidth={1.75}
          fill={saved ? "currentColor" : "none"}
        />
      )}

      {saved ? "Saved" : "Save"}
    </button>
  );
}