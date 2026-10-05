// src/app/(site)/contact/page.tsx
// ============================================================
// Contact — ALENTAH
// Editorial contact page: hero, direct emails, form, response
// promise, where we work, press, closing strip.
// Includes a back button at the top.
// No horizontal padding — the global Container handles it.
// ============================================================

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";

// ============================================================
// DATA
// ============================================================

const DIRECT_LINES = [
  {
    label: "Editorial",
    email: "hello@alentah.com",
    subline: "Pitches, feedback, and general correspondence.",
  },
  {
    label: "Corrections",
    email: "corrections@alentah.com",
    subline: "Something we got wrong? Tell us. We publish updates.",
  },
  {
    label: "Partnerships",
    email: "partners@alentah.com",
    subline: "Sponsored writing, research collaboration, and press enquiries.",
  },
];

const PROMISES = [
  {
    number: "01",
    body: "We read every message.",
  },
  {
    number: "02",
    body: "We reply within 5–7 days.",
  },
  {
    number: "03",
    body: "We publish corrections, not excuses.",
  },
];

// ============================================================
// PAGE
// ============================================================

export default function ContactPage() {
  const router = useRouter();

  const handleBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push("/");
    }
  };

  return (
    <main className="w-full">
      {/* =====================================================
          BACK BUTTON
          ===================================================== */}
      <div className="pt-8 sm:pt-10">
        <button
          type="button"
          onClick={handleBack}
          aria-label="Go back"
          className="group inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground transition-colors hover:text-foreground"
        >
          <span className="flex size-7 items-center justify-center rounded-full border border-border bg-background transition-colors group-hover:border-primary/40 group-hover:bg-primary/10">
            <ArrowLeft className="size-3.5" aria-hidden="true" />
          </span>
          <span>Back</span>
        </button>
      </div>

      {/* =====================================================
          HERO
          ===================================================== */}
      <section
        aria-labelledby="contact-heading"
        className="pt-10 sm:pt-12 lg:pt-14"
      >
        <div aria-hidden="true" className="h-px w-full bg-border" />

        <div className="pt-14 sm:pt-16 lg:pt-20">
          <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-primary">
            Contact Alentah
          </p>

          <h1
            id="contact-heading"
            className="mt-6 font-serif text-5xl font-bold leading-[1.05] tracking-[-0.03em] text-foreground sm:text-6xl lg:text-7xl xl:text-[5rem]"
          >
            Write to us.
          </h1>

          <p className="mt-8 max-w-2xl font-serif text-lg italic leading-relaxed text-muted-foreground sm:text-xl">
            We read every message. Whether it&rsquo;s a pitch, a correction, or
            just a note — this is the fastest way to reach the editors.
          </p>
        </div>
      </section>

      {/* =====================================================
          DIRECT LINES
          ===================================================== */}
      <section
        aria-labelledby="direct-lines-heading"
        className="mt-16 sm:mt-20"
      >
        <div className="rounded-xl border border-border bg-muted/30 p-8 sm:p-10 lg:p-12">
          <h2
            id="direct-lines-heading"
            className="font-serif text-3xl tracking-tight text-foreground sm:text-4xl"
          >
            Direct lines.
          </h2>

          <ul className="mt-8 divide-y divide-border">
            {DIRECT_LINES.map((line) => (
              <li key={line.label} className="py-6 first:pt-6 last:pb-0">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-[180px_minmax(0,1fr)] sm:gap-8">
                  <p className="pt-1 text-[10px] font-bold uppercase tracking-[0.22em] text-muted-foreground">
                    {line.label}
                  </p>

                  <div>
                    <a
                      href={`mailto:${line.email}`}
                      className="inline-block font-serif text-xl text-foreground underline decoration-border underline-offset-[6px] transition-colors hover:text-primary hover:decoration-primary/60 sm:text-2xl"
                    >
                      {line.email}
                    </a>

                    <p className="mt-2 text-[13px] leading-6 text-muted-foreground">
                      {line.subline}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* =====================================================
          CONTACT FORM
          ===================================================== */}
      <section
        aria-labelledby="contact-form-heading"
        className="mt-20 sm:mt-24"
      >
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-16">
          {/* Left — copy */}
          <div className="lg:col-span-5">
            <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-primary">
              Or use the form
            </p>

            <h2
              id="contact-form-heading"
              className="mt-4 font-serif text-4xl font-semibold leading-tight tracking-tight text-foreground sm:text-5xl"
            >
              Send a message.
            </h2>

            <p className="mt-6 max-w-md text-[15px] leading-7 text-muted-foreground">
              This reaches the editorial inbox. We respond within 5–7 days.
            </p>
          </div>

          {/* Right — form */}
          <div className="lg:col-span-7">
            <form
              action="/api/contact"
              method="post"
              className="flex flex-col gap-6"
            >
              <Field
                id="contact-name"
                label="Your name"
                name="name"
                type="text"
                autoComplete="name"
                required
              />

              <Field
                id="contact-email"
                label="Email address"
                name="email"
                type="email"
                autoComplete="email"
                required
              />

              {/* Subject — select */}
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
                    className="h-11 w-full appearance-none rounded-md border border-border bg-muted/30 px-3 pr-10 text-[14px] text-foreground transition-colors focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/20"
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
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      className="size-4"
                    >
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

              {/* Message — textarea */}
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
                  rows={5}
                  className="mt-2 w-full resize-y rounded-md border border-border bg-muted/30 px-3 py-3 text-[14px] leading-6 text-foreground transition-colors focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              {/* Checkbox */}
              <label className="flex items-start gap-3 text-[13px] leading-6 text-muted-foreground">
                <input
                  type="checkbox"
                  name="copy"
                  className="mt-1 size-4 shrink-0 cursor-pointer rounded border border-border bg-background accent-primary"
                />
                <span>Send me a copy of this message.</span>
              </label>

              {/* Submit */}
              <div>
                <button
                  type="submit"
                  className="group inline-flex h-11 items-center gap-2 rounded-full bg-primary px-6 text-[11px] font-bold uppercase tracking-[0.15em] text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  <span>Send message</span>
                  <ArrowRight
                    className="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5"
                    aria-hidden="true"
                  />
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* =====================================================
          RESPONSE PROMISE
          ===================================================== */}
      <section
        aria-labelledby="promise-heading"
        className="mt-20 sm:mt-24"
      >
        <h2 id="promise-heading" className="sr-only">
          Our response promise
        </h2>

        <div aria-hidden="true" className="h-px w-full bg-border" />

        <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-3 sm:gap-6">
          {PROMISES.map((promise) => (
            <div
              key={promise.number}
              className="flex items-start gap-4 sm:flex-col sm:gap-3"
            >
              <p className="shrink-0 text-[11px] font-bold uppercase tracking-[0.22em] text-primary tabular-nums">
                {promise.number}
              </p>
              <p className="text-[15px] leading-7 text-muted-foreground">
                {promise.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* =====================================================
          WHERE WE WORK
          ===================================================== */}
      <section
        aria-labelledby="where-heading"
        className="mt-20 sm:mt-24 lg:mt-32"
      >
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-6">
            <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-primary">
              Where we are
            </p>

            <h2
              id="where-heading"
              className="mt-4 font-serif text-4xl font-semibold leading-tight tracking-tight text-foreground sm:text-5xl"
            >
              Where we work.
            </h2>

            <p className="mt-6 max-w-xl text-[15px] leading-7 text-muted-foreground">
              ALENTAH is a fully remote team, with no physical office. We work
              from different cities, time zones and countries — united by a
              shared belief in better journalism.
            </p>
          </div>

          <div className="lg:col-span-6">
            <div className="rounded-xl border border-border bg-muted/30 p-6 sm:p-8">
              <dl className="space-y-3 font-mono text-[13px] leading-6 text-muted-foreground sm:text-[14px]">
                <div className="flex flex-wrap gap-x-3">
                  <dt className="font-semibold text-foreground">ALENTAH</dt>
                </div>
                <div className="flex flex-wrap gap-x-3">
                  <dt className="shrink-0">Editorial</dt>
                  <dd className="text-foreground/80">— Remote-first</dd>
                </div>
                <div className="flex flex-wrap gap-x-3">
                  <dt className="shrink-0">Based between</dt>
                  <dd className="text-foreground/80">
                    Karachi and Berlin
                  </dd>
                </div>
                <div className="flex flex-wrap gap-x-3">
                  <dt className="shrink-0">Responses in</dt>
                  <dd className="text-foreground/80">English or Urdu</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          PRESS & MEDIA
          ===================================================== */}
      <section
        aria-labelledby="press-heading"
        className="mt-20 sm:mt-24 lg:mt-32"
      >
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-6">
            <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-primary">
              Press
            </p>

            <p className="mt-4 max-w-xl text-[15px] leading-7 text-muted-foreground">
              For media enquiries, interviews, or to request brand assets,
              please use the editorial email above. We can provide logos,
              brand guidelines and background information, and we ask that you
              credit ALENTAH when using our content.
            </p>
          </div>

          <div className="lg:col-span-6">
            <h2
              id="press-heading"
              className="font-serif text-4xl font-semibold leading-tight tracking-tight text-foreground sm:text-5xl"
            >
              Media kit.
            </h2>

            <div className="mt-6 flex flex-wrap items-center gap-x-8 gap-y-3">
              <a
                href="/press/alentah-logos.zip"
                className="inline-flex items-center gap-1.5 text-[13px] font-medium text-foreground underline decoration-border underline-offset-[6px] transition-colors hover:text-primary hover:decoration-primary/60"
              >
                Download logos
              </a>

              <Link
                href="/press/guidelines"
                className="group inline-flex items-center gap-1.5 text-[13px] font-medium text-foreground underline decoration-border underline-offset-[6px] transition-colors hover:text-primary hover:decoration-primary/60"
              >
                <span>Editorial guidelines</span>
                <ArrowRight
                  className="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          CLOSING STRIP
          ===================================================== */}
      <section
        aria-labelledby="closing-heading"
        className="mt-24 pb-24 sm:mt-28 sm:pb-28 lg:mt-32 lg:pb-32"
      >
        <h2 id="closing-heading" className="sr-only">
          Closing
        </h2>

        <div aria-hidden="true" className="h-px w-full bg-border" />

        <div className="mx-auto mt-16 max-w-3xl text-center">
          <p className="font-serif text-xl italic leading-snug tracking-tight text-foreground sm:text-2xl lg:text-3xl">
            The best messages we receive are the ones that take five minutes
            to write.
          </p>

          <p className="mt-8 text-[10px] font-bold uppercase tracking-[0.24em] text-muted-foreground">
            — The Editorial Team
          </p>
        </div>
      </section>
    </main>
  );
}

// ============================================================
// FIELD — small text input helper
// ============================================================

function Field({
  id,
  label,
  name,
  type = "text",
  autoComplete,
  required,
}: {
  id: string;
  label: string;
  name: string;
  type?: "text" | "email";
  autoComplete?: string;
  required?: boolean;
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
        className="mt-2 h-11 w-full rounded-md border border-border bg-muted/30 px-3 text-[14px] text-foreground transition-colors placeholder:text-muted-foreground/60 focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/20"
      />
    </div>
  );
}