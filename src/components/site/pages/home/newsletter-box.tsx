"use client";

// ============================================================
// NewsletterBox — ALENTAH
// Sidebar subscribe card for the homepage.
//
// Uses the same server action as the exit-intent popup.
// Handles all four states: idle / loading / success / error.
//
// Duplicate handling (UI layer):
//   - On mount, reads localStorage — if this browser already
//     subscribed, the box is locked with a "You're on the list" state.
//   - While typing, if the typed email matches a remembered one,
//     shows "Already subscribed" and disables the button.
//   - New emails subscribe normally.
//
// The server still does the real dedupe (Prisma unique + Resend).
// This is just to prevent redundant submits from this browser.
//
// Mobile polish:
//   When locked (loading / success / already), the input is
//   replaced with a compact icon + text line so the capsule
//   doesn't show an empty bubble on small screens.
// ============================================================

import * as React from "react";
import { cn } from "@/lib/utils";
import { subscribeToNewsletter } from "@/actions/newsletter/subscribe-to-newsletter";
import {
  hasAnySubscription,
  hasSubscribed,
  rememberSubscribed,
} from "@/lib/resend/subscriber-memory";

type Status = "idle" | "loading" | "success" | "error" | "already";

export function NewsletterBox() {
  const [email, setEmail] = React.useState("");
  const [status, setStatus] = React.useState<Status>("idle");
  const [errorMessage, setErrorMessage] = React.useState("");
  const [successMessage, setSuccessMessage] = React.useState("");
  const [shake, setShake] = React.useState(false);
  const [hydrated, setHydrated] = React.useState(false);

  const isLoading = status === "loading";
  const isSuccess = status === "success";
  const isError = status === "error";
  const isAlready = status === "already";

  // ── On mount: if this browser already subscribed, lock the box ──
  React.useEffect(() => {
    setHydrated(true);
    if (hasAnySubscription()) {
      setStatus("already");
      setSuccessMessage("You're already on the list.");
    }
  }, []);

  // ── While typing: if the email matches a remembered one, mark already ──
  React.useEffect(() => {
    if (!hydrated) return;
    if (isLoading || isSuccess || isAlready) return;

    const trimmed = email.trim();
    if (!trimmed) {
      if (isError) setStatus("idle");
      return;
    }

    if (hasSubscribed(trimmed)) {
      setStatus("already");
      setSuccessMessage("You're already subscribed.");
    } else if (isAlready) {
      setStatus("idle");
      setSuccessMessage("");
    }
  }, [email, hydrated, isLoading, isSuccess, isAlready, isError]);

  const locked = isLoading || isSuccess || isAlready;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!email.trim() || locked) return;

    setStatus("loading");
    setErrorMessage("");
    setSuccessMessage("");

    const submittedEmail = email;

    const formData = new FormData();
    formData.set("email", submittedEmail);
    formData.set("source", "home-sidebar");

    const result = await subscribeToNewsletter(formData);

    if (result.success) {
      // ── Remember in localStorage ──
      rememberSubscribed(submittedEmail);

      setStatus("success");
      setSuccessMessage(result.message);
      setEmail("");
    } else {
      setStatus("error");
      setErrorMessage(result.error);
      setShake(true);
      window.setTimeout(() => setShake(false), 420);
    }
  };

  // ── Restore "idle" if the user clears an "already" or error state ──
  const handleChange = (value: string) => {
    setEmail(value);
    if (status === "error" || status === "already") {
      setStatus("idle");
      setSuccessMessage("");
    }
  };

  return (
    <section className="rounded-lg bg-muted/60 p-6">
      <h3 className="font-serif text-lg leading-tight tracking-tight text-foreground">
        Get the best stories, once a week.
      </h3>

      <p className="mt-2 max-w-[46ch] text-[12px] leading-relaxed text-muted-foreground">
        Sign up for our newsletter and never miss a thing.
      </p>

      <form
        onSubmit={handleSubmit}
        className="mt-4 flex flex-col gap-2"
        noValidate
      >
        <div
          className={cn(
            "flex w-full flex-col gap-2",
            "sm:flex-row sm:items-center sm:gap-1.5",
            "rounded-2xl border bg-background",
            "p-1.5 sm:rounded-full sm:pl-3.5",
            "transition-all duration-200",
            "focus-within:border-primary/60 focus-within:ring-4 focus-within:ring-primary/10",
            isError
              ? "border-destructive/50"
              : isAlready
                ? "border-primary/30"
                : "border-border",
            shake && "animate-[shake_0.4s_ease-in-out]",
          )}
        >
          <label htmlFor="home-newsletter-email" className="sr-only">
            Email address
          </label>

          {/* ── Input OR compact locked line ── */}
          {locked ? (
            <div className="flex min-w-0 flex-1 items-center gap-2 px-3 sm:px-1">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className={cn(
                  "size-3.5 shrink-0",
                  isLoading ? "text-muted-foreground" : "text-primary",
                )}
                aria-hidden="true"
              >
                {isLoading ? (
                  <circle
                    cx="12"
                    cy="12"
                    r="9"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeDasharray="4 4"
                    className="animate-spin origin-center"
                  />
                ) : (
                  <path
                    d="M4 12l5 5L20 6"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )}
              </svg>

              <span
                className={cn(
                  "truncate text-[13px]",
                  isError ? "text-destructive" : "text-muted-foreground",
                )}
              >
                {isLoading
                  ? "Adding you to the list…"
                  : "You're on the list."}
              </span>
            </div>
          ) : (
            <input
              id="home-newsletter-email"
              type="email"
              value={email}
              onChange={(e) => handleChange(e.target.value)}
              required
              autoComplete="email"
              placeholder="Your email address"
              className={cn(
                "h-10 min-w-0 flex-1 bg-transparent px-3 sm:px-1",
                "text-[13px] text-foreground",
                "placeholder:text-muted-foreground/60",
                "focus:outline-none",
                "transition-colors duration-200",
              )}
            />
          )}

          <button
            type="submit"
            disabled={locked}
            aria-busy={isLoading}
            className={cn(
              "relative inline-flex h-10 shrink-0 items-center justify-center",
              "rounded-full",
              "w-full px-4 sm:w-auto sm:min-w-[110px] sm:px-5",
              "text-[10px] font-bold uppercase tracking-[0.15em]",
              isAlready
                ? "bg-primary/15 text-primary"
                : "bg-primary text-primary-foreground",
              "transition-all duration-200",
              !locked &&
                "hover:bg-primary/90 hover:shadow-[0_6px_20px_-6px_var(--primary)] active:scale-[0.98]",
              "disabled:cursor-not-allowed",
              (isLoading || isSuccess || isAlready) && "disabled:opacity-100",
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

            {isAlready && (
              <span className="flex items-center gap-1.5">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  className="size-3.5"
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
                <span>Already subscribed</span>
              </span>
            )}
          </button>
        </div>

        {/* MESSAGES — single live region, reserved height */}
        <div
          className="min-h-[16px] px-1"
          aria-live="polite"
          aria-atomic="true"
        >
          {isError && errorMessage && (
            <p
              className="animate-in fade-in-0 slide-in-from-top-1 text-[11px] text-destructive"
              role="alert"
            >
              {errorMessage}
            </p>
          )}

          {isSuccess && successMessage && (
            <p className="animate-in fade-in-0 slide-in-from-top-1 text-[11px] text-primary">
              {successMessage}
            </p>
          )}

          {isAlready && successMessage && (
            <p className="text-[11px] text-muted-foreground">
              {successMessage} No need to sign up again.
            </p>
          )}

          {status === "idle" && (
            <p className="text-[10px] text-muted-foreground">
              No spam. Unsubscribe any time.
            </p>
          )}
        </div>
      </form>

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
    </section>
  );
}