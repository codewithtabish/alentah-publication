"use client";

// ============================================================
// ExitIntentPopup — ALENTAH
//
// Fires when the user's cursor moves ABOVE the viewport top
// (classic exit-intent signal — same one used by Sumo,
// OptinMonster, Sleeknote).
//
// Behavior:
//   - Arms 8 seconds after mount (won't fire on page load)
//   - Fires ONCE per browser session (sessionStorage flag)
//   - Dismissed via × button, ESC key, or backdrop click
//   - Body scroll locked while open
//   - Form submit is independent — closing mid-flight doesn't cancel it
//
// Layout:
//   - Compact card, auto height, max-w-[600px]
//   - Soft rounded corners
//   - NO hardcoded colors — every color comes from theme tokens
// ============================================================

import * as React from "react";
import { cn } from "@/lib/utils";

// ------------------------------------------------------------
// CONSTANTS
// ------------------------------------------------------------

const STORAGE_KEY = "alentah.exit-intent.shown";

// Delay before the trigger arms — prevents firing on page load.
const ARM_DELAY_MS = 8000;

// Cursor must cross this many pixels above the viewport top.
const EXIT_THRESHOLD = 4;

// ------------------------------------------------------------
// COMPONENT
// ------------------------------------------------------------

export function ExitIntentPopup() {
  const [open, setOpen] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // ---------------------------------------------------------
  // Arm the exit-intent trigger
  // ---------------------------------------------------------
  React.useEffect(() => {
    if (!mounted) return;

    try {
      if (sessionStorage.getItem(STORAGE_KEY) === "1") return;
    } catch {
      /* sessionStorage blocked — proceed anyway */
    }

    let armed = false;
    let lastY = 0;
    let fired = false;

    const trigger = () => {
      if (fired) return;
      fired = true;
      armed = false;
      setOpen(true);
      try {
        sessionStorage.setItem(STORAGE_KEY, "1");
      } catch {
        /* ignore */
      }
    };

    const armTimer = window.setTimeout(() => {
      armed = true;
      // Seed lastY so the first mousemove doesn't produce a bogus delta
      lastY = window.innerHeight / 2;
    }, ARM_DELAY_MS);

    const handleMouseMove = (e: MouseEvent) => {
      if (!armed) {
        lastY = e.clientY;
        return;
      }

      const goingUp = e.clientY < lastY;
      const nearTop = e.clientY <= EXIT_THRESHOLD;

      if (goingUp && nearTop) {
        trigger();
        return;
      }

      lastY = e.clientY;
    };

    const handleMouseOut = (e: MouseEvent) => {
      if (!armed) return;
      if (e.clientY <= EXIT_THRESHOLD && !e.relatedTarget) {
        trigger();
      }
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseout", handleMouseOut);

    return () => {
      window.clearTimeout(armTimer);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseout", handleMouseOut);
    };
  }, [mounted]);

  // ---------------------------------------------------------
  // Lock body scroll while open
  // ---------------------------------------------------------
  React.useEffect(() => {
    if (!open) return;

    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  // ---------------------------------------------------------
  // ESC to close
  // ---------------------------------------------------------
  React.useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };

    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  if (!mounted || !open) return null;

  return <ExitIntentDialog onClose={() => setOpen(false)} />;
}

// ------------------------------------------------------------
// DIALOG
// ------------------------------------------------------------

function ExitIntentDialog({ onClose }: { onClose: () => void }) {
  const [email, setEmail] = React.useState("");
  const [status, setStatus] = React.useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = React.useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!email.trim()) return;

    setStatus("loading");
    setErrorMessage("");

    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source: "exit-intent" }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || "Subscription failed.");
      }

      setStatus("success");
      setEmail("");
    } catch (err) {
      setStatus("error");
      setErrorMessage(
        err instanceof Error ? err.message : "Something went wrong.",
      );
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="exit-intent-heading"
      className={cn(
        "fixed inset-0 z-100 flex items-center justify-center",
        "bg-black/45 px-4 py-6 backdrop-blur-sm",
        "animate-in fade-in-0 duration-200",
      )}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={cn(
          // Compact card — auto height
          "relative w-full max-w-[600px]",
          // Soft rounded corners
          "rounded-3xl sm:rounded-[2rem]",
          // Theme colors — no hardcoded hex
          "bg-card text-card-foreground",
          "border border-border",
          "shadow-[0_30px_80px_-30px_rgba(0,0,0,0.35)]",
          "animate-in fade-in-0 zoom-in-95 duration-200",
          // Padding
          "px-7 py-9 sm:px-10 sm:py-12",
        )}
      >
        {/* CLOSE BUTTON */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className={cn(
            "absolute right-4 top-4 inline-flex size-9 items-center justify-center",
            "rounded-full border border-border bg-background/80",
            "text-muted-foreground transition-colors",
            "hover:border-primary/60 hover:text-primary",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
          )}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            className="size-4"
            aria-hidden="true"
          >
            <path
              d="M6 6l12 12M18 6 6 18"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
            />
          </svg>
        </button>

        {/* EYEBROW */}
        <div className="flex items-center gap-3">
          <span
            aria-hidden="true"
            className="inline-block size-1.5 shrink-0 rounded-full bg-primary"
          />
          <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-primary">
            One Story a Week
          </p>
          <span
            aria-hidden="true"
            className="h-px min-w-0 flex-1 bg-linear-to-r from-primary/40 to-transparent"
          />
        </div>

        {/* HEADLINE */}
        <h2
          id="exit-intent-heading"
          className={cn(
            "mt-5 font-serif tracking-[-0.025em] text-foreground",
            "text-[1.5rem] leading-[1.18]",
            "sm:text-[1.875rem] sm:leading-[1.15]",
            "md:text-[2.25rem] md:leading-[1.12]",
          )}
        >
          Before you go —
          <br />
          <em className="italic font-normal">
            let us send you something worth reading.
          </em>
        </h2>

        {/* DESCRIPTION */}
        <p className="mt-5 max-w-[46ch] text-[14px] leading-[1.65] text-muted-foreground sm:text-[15px] sm:leading-[1.7]">
          Join 12,000 readers who get one slow story every Sunday.
          <br className="hidden sm:block" /> No noise. No clickbait. Just the
          good stuff.
        </p>

        {/* FORM */}
        <form
          onSubmit={handleSubmit}
          className="mt-7 flex flex-col gap-3"
          noValidate
        >
          <div
            className={cn(
              "flex w-full items-center gap-2",
              "rounded-full border border-border bg-background/70",
              "px-2 py-1.5 pl-5",
              "transition-colors focus-within:border-primary/60",
            )}
          >
            <label htmlFor="exit-intent-email" className="sr-only">
              Email address
            </label>

            <input
              id="exit-intent-email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (status === "error") setStatus("idle");
              }}
              disabled={status === "loading" || status === "success"}
              required
              autoComplete="email"
              placeholder="your@email.com"
              className={cn(
                "h-10 min-w-0 flex-1 bg-transparent",
                "text-[14px] text-foreground",
                "placeholder:text-muted-foreground/60",
                "focus:outline-none",
              )}
            />

            <button
              type="submit"
              disabled={status === "loading" || status === "success"}
              className={cn(
                "inline-flex h-10 shrink-0 items-center justify-center",
                "rounded-full bg-primary px-5 sm:px-6",
                "text-[11px] font-bold uppercase tracking-[0.18em] text-primary-foreground",
                "transition-colors hover:bg-primary/90",
                "disabled:cursor-not-allowed disabled:opacity-70",
              )}
            >
              {status === "loading" && "…"}
              {status === "success" && "Done"}
              {(status === "idle" || status === "error") && "Subscribe"}
            </button>
          </div>

          {status === "error" && errorMessage && (
            <p className="pl-1 text-[12px] text-destructive" role="alert">
              {errorMessage}
            </p>
          )}

          {status === "success" && (
            <p className="pl-1 text-[12px] text-primary">
              You&rsquo;re in. Check your inbox on Sunday.
            </p>
          )}

          {status === "idle" && (
            <p className="pl-1 text-[11px] text-muted-foreground">
              No spam. Unsubscribe any time.
            </p>
          )}
        </form>

        {/* SIGNATURE */}
        <div className="mt-7 border-t border-border pt-5">
          <p className="text-center font-serif text-[13px] italic text-muted-foreground">
            — The Editorial Team.
          </p>
        </div>
      </div>
    </div>
  );
}