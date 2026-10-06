"use client";

// ============================================================
// FooterNewsletterForm — ALENTAH
// Compact subscribe form for the footer.
//
// Uses the same server action as the exit-intent popup and the
// homepage sidebar. Handles idle / loading / success / error /
// already states with the same visual language.
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

export function FooterNewsletterForm() {
  const [email, setEmail] = React.useState("");
  const [status, setStatus] = React.useState<Status>("idle");
  const [errorMessage, setErrorMessage] = React.useState("");
  const [successMessage, setSuccessMessage] = React.useState("");
  const [hydrated, setHydrated] = React.useState(false);

  const isLoading = status === "loading";
  const isSuccess = status === "success";
  const isError = status === "error";
  const isAlready = status === "already";

  // On mount: if this browser already subscribed, lock the form
  React.useEffect(() => {
    setHydrated(true);
    if (hasAnySubscription()) {
      setStatus("already");
      setSuccessMessage("You're already on the list.");
    }
  }, []);

  // While typing: if the email matches a remembered one, mark already
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
    formData.set("source", "footer");

    const result = await subscribeToNewsletter(formData);

    if (result.success) {
      rememberSubscribed(submittedEmail);
      setStatus("success");
      setSuccessMessage(result.message);
      setEmail("");
    } else {
      setStatus("error");
      setErrorMessage(result.error);
    }
  };

  const handleChange = (value: string) => {
    setEmail(value);
    if (status === "error" || status === "already") {
      setStatus("idle");
      setSuccessMessage("");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-2"
      noValidate
    >
      <label htmlFor="footer-newsletter-email" className="sr-only">
        Email address
      </label>

      <input
        id="footer-newsletter-email"
        type="email"
        value={email}
        onChange={(e) => handleChange(e.target.value)}
        disabled={locked}
        required
        autoComplete="email"
        placeholder={
          isLoading
            ? "Adding you…"
            : isSuccess || isAlready
              ? "You're on the list."
              : "Your email"
        }
        className={cn(
          "h-10 w-full min-w-0 rounded-md px-3",
          "border bg-background",
          "text-[12px] text-foreground",
          "placeholder:text-muted-foreground/60",
          "transition-colors duration-200",
          "focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/30",
          "disabled:cursor-not-allowed",
          isError
            ? "border-destructive/50"
            : isAlready
              ? "border-primary/30"
              : "border-border",
          isLoading && "opacity-60",
          (isSuccess || isAlready) && "opacity-70",
        )}
      />

      <button
        type="submit"
        disabled={locked}
        aria-busy={isLoading}
        className={cn(
          "inline-flex h-10 w-full items-center justify-center rounded-md px-4",
          "text-[10px] font-bold uppercase tracking-[0.18em]",
          "transition-colors duration-200 whitespace-nowrap",
          isAlready
            ? "bg-primary/15 text-primary"
            : "bg-primary text-primary-foreground",
          !locked && "hover:bg-primary/90",
          "disabled:cursor-not-allowed",
          (isLoading || isSuccess || isAlready) && "disabled:opacity-100",
        )}
      >
        {status === "idle" && <span>Subscribe</span>}

        {isLoading && (
          <span className="flex items-center gap-1" aria-label="Subscribing">
            <span className="size-1.5 animate-[pulse_1.2s_ease-in-out_infinite] rounded-full bg-primary-foreground" />
            <span className="size-1.5 animate-[pulse_1.2s_ease-in-out_0.15s_infinite] rounded-full bg-primary-foreground" />
            <span className="size-1.5 animate-[pulse_1.2s_ease-in-out_0.3s_infinite] rounded-full bg-primary-foreground" />
          </span>
        )}

        {isSuccess && <span>Subscribed</span>}
        {isAlready && <span>Already subscribed</span>}
      </button>

      {/* MESSAGES — single live region, small reserved height */}
      <div
        className="min-h-[14px]"
        aria-live="polite"
        aria-atomic="true"
      >
        {isError && errorMessage && (
          <p
            className="animate-in fade-in-0 slide-in-from-top-1 text-[10px] text-destructive"
            role="alert"
          >
            {errorMessage}
          </p>
        )}

        {isSuccess && successMessage && (
          <p className="animate-in fade-in-0 slide-in-from-top-1 text-[10px] text-primary">
            {successMessage}
          </p>
        )}

        {isAlready && successMessage && (
          <p className="text-[10px] text-muted-foreground">
            {successMessage}
          </p>
        )}
      </div>
    </form>
  );
}