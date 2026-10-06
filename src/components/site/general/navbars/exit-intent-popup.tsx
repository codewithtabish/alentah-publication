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
//   - NEVER fires again once this browser has subscribed
//     (localStorage — persists across reloads and tabs)
//   - Dismissed via × button, ESC key, or backdrop click
//   - Body scroll locked while open
//   - Form submit is independent — closing mid-flight doesn't cancel it
//   - On success: shows a checkmark for 1.4s, then auto-closes
//
// Layout:
//   - Compact card, auto height, max-w-[600px]
//   - Soft rounded corners
//   - NO hardcoded colors — every color comes from theme tokens
// ============================================================

import * as React from "react";
import { cn } from "@/lib/utils";
import { subscribeToNewsletter } from "@/actions/newsletter/subscribe-to-newsletter";
import { hasAnySubscription, rememberSubscribed } from "@/lib/resend/subscriber-memory";


// ------------------------------------------------------------
// CONSTANTS
// ------------------------------------------------------------

const STORAGE_KEY = "alentah.exit-intent.shown";

// Delay before the trigger arms — prevents firing on page load.
const ARM_DELAY_MS = 8000;

// Cursor must cross this many pixels above the viewport top.
const EXIT_THRESHOLD = 4;

// How long the success state stays visible before auto-closing.
const SUCCESS_AUTO_CLOSE_MS = 1400;

// How long the exit animation runs (keep in sync with CSS below).
const EXIT_ANIM_MS = 200;

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

    // ── Never fire if this browser already subscribed ──
    if (hasAnySubscription()) return;

    // ── Once per session, regardless ──
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

      // Double-check right before opening — in case they
      // subscribed via the sidebar box in this same session.
      if (hasAnySubscription()) {
        fired = true;
        return;
      }

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

type Status = "idle" | "loading" | "success" | "error";

function ExitIntentDialog({ onClose }: { onClose: () => void }) {
  const [email, setEmail] = React.useState("");
  const [status, setStatus] = React.useState<Status>("idle");
  const [errorMessage, setErrorMessage] = React.useState("");
  const [successMessage, setSuccessMessage] = React.useState("");
  const [shake, setShake] = React.useState(false);

  // ── Exit animation state ──
  const [closing, setClosing] = React.useState(false);
  const closeTimerRef = React.useRef<number | null>(null);
  const successTimerRef = React.useRef<number | null>(null);

  const isLoading = status === "loading";
  const isSuccess = status === "success";
  const isError = status === "error";

  // ---------------------------------------------------------
  // Graceful close — runs the exit animation, then calls
  // the parent's onClose after the animation finishes.
  // ---------------------------------------------------------
  const beginClose = React.useCallback(() => {
    if (closing) return;
    setClosing(true);

    if (closeTimerRef.current !== null) {
      window.clearTimeout(closeTimerRef.current);
    }

    closeTimerRef.current = window.setTimeout(() => {
      closeTimerRef.current = null;
      onClose();
    }, EXIT_ANIM_MS);
  }, [closing, onClose]);

  // ---------------------------------------------------------
  // Cancel both timers on unmount (safety net)
  // ---------------------------------------------------------
  React.useEffect(() => {
    return () => {
      if (closeTimerRef.current !== null) {
        window.clearTimeout(closeTimerRef.current);
      }
      if (successTimerRef.current !== null) {
        window.clearTimeout(successTimerRef.current);
      }
    };
  }, []);

  // ---------------------------------------------------------
  // Submit
  // ---------------------------------------------------------
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!email.trim() || isLoading || isSuccess) return;

    setStatus("loading");
    setErrorMessage("");
    setSuccessMessage("");

    const submittedEmail = email;

    const formData = new FormData();
    formData.set("email", submittedEmail);
    formData.set("source", "exit-intent");

    const result = await subscribeToNewsletter(formData);

    if (result.success) {
      // ── Remember this browser has subscribed ──
      // Both popup and sidebar box read from this.
      rememberSubscribed(submittedEmail);

      setStatus("success");
      setSuccessMessage(result.message);
      setEmail("");

      // Auto-close after a short pause so the reader
      // sees the confirmation, then the popup fades out.
      if (successTimerRef.current !== null) {
        window.clearTimeout(successTimerRef.current);
      }
      successTimerRef.current = window.setTimeout(() => {
        successTimerRef.current = null;
        beginClose();
      }, SUCCESS_AUTO_CLOSE_MS);
    } else {
      setStatus("error");
      setErrorMessage(result.error);
      setShake(true);
      window.setTimeout(() => setShake(false), 420);
    }
  };

  // ---------------------------------------------------------
  // Close button handler — also plays the exit animation
  // ---------------------------------------------------------
  const handleClose = () => {
    if (successTimerRef.current !== null) {
      window.clearTimeout(successTimerRef.current);
      successTimerRef.current = null;
    }
    beginClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="exit-intent-heading"
      data-closing={closing ? "true" : "false"}
      className={cn(
        "fixed inset-0 z-100 flex items-center justify-center",
        "bg-black/45 px-4 py-6 backdrop-blur-sm",
        "transition-opacity duration-200",
        closing ? "opacity-0" : "opacity-100 animate-in fade-in-0",
      )}
      onClick={(e) => {
        if (e.target === e.currentTarget && !closing) handleClose();
      }}
    >
      <div
        className={cn(
          "relative w-full max-w-[600px]",
          "rounded-3xl sm:rounded-[2rem]",
          "bg-card text-card-foreground",
          "border border-border",
          "shadow-[0_30px_80px_-30px_rgba(0,0,0,0.35)]",
          "px-7 py-9 sm:px-10 sm:py-12",
          "transition-all duration-200",
          closing
            ? "scale-[0.97] opacity-0"
            : "scale-100 opacity-100 animate-in fade-in-0 zoom-in-95",
        )}
      >
        {/* CLOSE BUTTON */}
        <button
          type="button"
          onClick={handleClose}
          aria-label="Close"
          disabled={closing}
          className={cn(
            "absolute right-4 top-4 inline-flex size-9 items-center justify-center",
            "rounded-full border border-border bg-background/80",
            "text-muted-foreground transition-colors",
            "hover:border-primary/60 hover:text-primary",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
            "disabled:pointer-events-none disabled:opacity-0",
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
              "rounded-full border bg-background/70",
              "p-1.5 pl-5",
              "transition-all duration-200",
              "focus-within:border-primary/60 focus-within:ring-4 focus-within:ring-primary/10",
              isError ? "border-destructive/50" : "border-border",
              shake && "animate-[shake_0.4s_ease-in-out]",
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
              disabled={isLoading || isSuccess}
              required
              autoComplete="email"
              placeholder={
                isLoading
                  ? "Adding you to the list…"
                  : isSuccess
                    ? "You're on the list."
                    : "your@email.com"
              }
              className={cn(
                "h-10 min-w-0 flex-1 bg-transparent",
                "text-[14px] text-foreground",
                "placeholder:text-muted-foreground/60",
                "focus:outline-none",
                "transition-colors duration-200",
                isLoading && "opacity-60",
              )}
            />

            <button
              type="submit"
              disabled={isLoading || isSuccess}
              aria-busy={isLoading}
              className={cn(
                "relative inline-flex h-10 shrink-0 items-center justify-center",
                "rounded-full",
                "min-w-[112px] px-5 sm:px-6",
                "text-[11px] font-bold uppercase tracking-[0.18em]",
                "bg-primary text-primary-foreground",
                "transition-all duration-200",
                !isLoading &&
                  !isSuccess &&
                  "hover:bg-primary/90 hover:shadow-[0_6px_20px_-6px_var(--primary)] active:scale-[0.98]",
                "disabled:cursor-not-allowed",
                (isLoading || isSuccess) && "disabled:opacity-100",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2 focus-visible:ring-offset-card",
              )}
            >
              {status === "idle" && <span>Subscribe</span>}

              {isLoading && (
                <span
                  className="flex items-center gap-1"
                  aria-label="Subscribing"
                >
                  <span className="size-1.5 animate-[pulse_1.2s_ease-in-out_infinite] rounded-full bg-primary-foreground" />
                  <span className="size-1.5 animate-[pulse_1.2s_ease-in-out_0.15s_infinite] rounded-full bg-primary-foreground" />
                  <span className="size-1.5 animate-[pulse_1.2s_ease-in-out_0.3s_infinite] rounded-full bg-primary-foreground" />
                </span>
              )}

              {isSuccess && (
                <span className="flex items-center gap-1.5">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    className="size-3.5 animate-[pop_0.35s_ease-out]"
                    aria-hidden="true"
                  >
                    <path
                      d="M4 12l5 5L20 6"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span>Subscribed</span>
                </span>
              )}
            </button>
          </div>

          <div
            className="min-h-[18px] pl-1"
            aria-live="polite"
            aria-atomic="true"
          >
            {isError && errorMessage && (
              <p
                className="animate-in fade-in-0 slide-in-from-top-1 text-[12px] text-destructive"
                role="alert"
              >
                {errorMessage}
              </p>
            )}

            {isSuccess && successMessage && (
              <p className="animate-in fade-in-0 slide-in-from-top-1 text-[12px] text-primary">
                {successMessage}
              </p>
            )}

            {status === "idle" && (
              <p className="text-[11px] text-muted-foreground">
                No spam. Unsubscribe any time.
              </p>
            )}
          </div>
        </form>

        <div className="mt-7 border-t border-border pt-5">
          <p className="text-center font-serif text-[13px] italic text-muted-foreground">
            — The Editorial Team.
          </p>
        </div>
      </div>

      <style jsx global>{`
        @keyframes shake {
          0%,
          100% {
            transform: translateX(0);
          }
          20% {
            transform: translateX(-6px);
          }
          40% {
            transform: translateX(6px);
          }
          60% {
            transform: translateX(-4px);
          }
          80% {
            transform: translateX(4px);
          }
        }
        @keyframes pop {
          0% {
            transform: scale(0.5);
            opacity: 0;
          }
          60% {
            transform: scale(1.15);
            opacity: 1;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 0.001ms !important;
            transition-duration: 0.001ms !important;
          }
        }
      `}</style>
    </div>
  );
}