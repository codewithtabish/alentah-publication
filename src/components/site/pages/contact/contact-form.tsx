"use client";

// ============================================================
// ContactForm — ALENTAH
// Client form wired to sendContactMessage server action.
//
// States: idle / loading / success / error.
// On success: shows a confirmation panel and clears the form.
// ============================================================

import * as React from "react";
import { ArrowRight, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { sendContactMessage } from "@/actions/contact/send-contact-message";

type Status = "idle" | "loading" | "success" | "error";

export function ContactForm() {
  const [status, setStatus] = React.useState<Status>("idle");
  const [errorMessage, setErrorMessage] = React.useState("");
  const [successMessage, setSuccessMessage] = React.useState("");
  const [errorField, setErrorField] = React.useState<string | null>(null);

  const isLoading = status === "loading";
  const isSuccess = status === "success";

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isLoading || isSuccess) return;

    setStatus("loading");
    setErrorMessage("");
    setErrorField(null);

    const form = e.currentTarget;
    const formData = new FormData(form);

    const result = await sendContactMessage(formData);

    if (result.success) {
      setStatus("success");
      setSuccessMessage(result.message);
      form.reset();
    } else {
      setStatus("error");
      setErrorMessage(result.error);
      setErrorField(result.field ?? null);
    }
  };

  // ── Success panel ──
  if (isSuccess) {
    return (
      <div className="rounded-xl border border-primary/30 bg-primary/5 p-8 sm:p-10">
        <div className="flex items-start gap-4">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Check className="size-5" aria-hidden="true" />
          </span>
          <div>
            <h3 className="font-serif text-2xl leading-tight tracking-tight text-foreground">
              Message sent.
            </h3>
            <p className="mt-3 max-w-md text-[15px] leading-7 text-muted-foreground">
              {successMessage}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-6"
      noValidate
      aria-busy={isLoading}
    >
      <Field
        id="contact-name"
        label="Your name"
        name="name"
        type="text"
        autoComplete="name"
        required
        disabled={isLoading}
        hasError={errorField === "name"}
      />

      <Field
        id="contact-email"
        label="Email address"
        name="email"
        type="email"
        autoComplete="email"
        required
        disabled={isLoading}
        hasError={errorField === "email"}
      />

      {/* Subject */}
      <div>
        <label
          htmlFor="contact-subject"
          className="block text-[10px] font-bold uppercase tracking-[0.22em] text-muted-foreground"
        >
          Subject
        </label>
        <div className="relative mt-2">
          <select
            id="contact-subject"
            name="subject"
            required
            disabled={isLoading}
            defaultValue=""
            className={cn(
              "h-11 w-full appearance-none rounded-md border bg-muted/30 px-3 pr-10",
              "text-[14px] text-foreground transition-colors",
              "focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/20",
              "disabled:cursor-not-allowed disabled:opacity-60",
              errorField === "subject"
                ? "border-destructive/50"
                : "border-border",
            )}
          >
            <option value="">Select a subject</option>
            <option value="editorial">Editorial pitch</option>
            <option value="correction">Correction</option>
            <option value="partnership">Partnership</option>
            <option value="feedback">Feedback</option>
            <option value="other">Other</option>
          </select>
          <span
            aria-hidden="true"
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          >
            <svg viewBox="0 0 24 24" fill="none" className="size-4">
              <path
                d="m6 9 6 6 6-6"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </div>
      </div>

      {/* Message */}
      <div>
        <label
          htmlFor="contact-message"
          className="block text-[10px] font-bold uppercase tracking-[0.22em] text-muted-foreground"
        >
          Message
        </label>
        <textarea
          id="contact-message"
          name="message"
          required
          rows={6}
          disabled={isLoading}
          className={cn(
            "mt-2 w-full resize-y rounded-md border bg-muted/30 px-3 py-3",
            "text-[14px] leading-6 text-foreground transition-colors",
            "focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/20",
            "disabled:cursor-not-allowed disabled:opacity-60",
            errorField === "message"
              ? "border-destructive/50"
              : "border-border",
          )}
        />
      </div>

      {/* Copy checkbox */}
      <label
        className={cn(
          "flex items-start gap-3 text-[13px] leading-6 text-muted-foreground",
          isLoading && "opacity-60",
        )}
      >
        <input
          type="checkbox"
          name="copy"
          disabled={isLoading}
          className="mt-1 size-4 shrink-0 cursor-pointer rounded border border-border bg-background accent-primary disabled:cursor-not-allowed"
        />
        <span>Send me a copy of this message.</span>
      </label>

      {/* Error */}
      {status === "error" && errorMessage && (
        <p
          className="animate-in fade-in-0 slide-in-from-top-1 text-[13px] text-destructive"
          role="alert"
        >
          {errorMessage}
        </p>
      )}

      {/* Submit */}
      <div>
        <button
          type="submit"
          disabled={isLoading}
          className={cn(
            "group inline-flex h-11 items-center gap-2 rounded-full bg-primary px-6",
            "text-[11px] font-bold uppercase tracking-[0.15em] text-primary-foreground",
            "transition-all duration-200",
            "hover:bg-primary/90 hover:shadow-[0_6px_20px_-6px_var(--primary)] active:scale-[0.98]",
            "disabled:cursor-not-allowed disabled:opacity-80",
          )}
        >
          {isLoading ? (
            <>
              <span className="flex items-center gap-1" aria-label="Sending">
                <span className="size-1.5 animate-[pulse_1.2s_ease-in-out_infinite] rounded-full bg-primary-foreground" />
                <span className="size-1.5 animate-[pulse_1.2s_ease-in-out_0.15s_infinite] rounded-full bg-primary-foreground" />
                <span className="size-1.5 animate-[pulse_1.2s_ease-in-out_0.3s_infinite] rounded-full bg-primary-foreground" />
              </span>
              <span>Sending</span>
            </>
          ) : (
            <>
              <span>Send message</span>
              <ArrowRight
                className="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </>
          )}
        </button>
      </div>
    </form>
  );
}

// ────────────────────────────────────────────────────────────
// FIELD helper
// ────────────────────────────────────────────────────────────

function Field({
  id,
  label,
  name,
  type = "text",
  autoComplete,
  required,
  disabled,
  hasError,
}: {
  id: string;
  label: string;
  name: string;
  type?: "text" | "email";
  autoComplete?: string;
  required?: boolean;
  disabled?: boolean;
  hasError?: boolean;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="block text-[10px] font-bold uppercase tracking-[0.22em] text-muted-foreground"
      >
        {label}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        autoComplete={autoComplete}
        required={required}
        disabled={disabled}
        className={cn(
          "mt-2 h-11 w-full rounded-md border bg-muted/30 px-3",
          "text-[14px] text-foreground transition-colors",
          "placeholder:text-muted-foreground/60",
          "focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/20",
          "disabled:cursor-not-allowed disabled:opacity-60",
          hasError ? "border-destructive/50" : "border-border",
        )}
      />
    </div>
  );
}