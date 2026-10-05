// src/app/(site)/careers/page.tsx
// ============================================================
// Careers — ALENTAH
// Editorial Careers page: hero, why us, empty-state openings,
// reach out, what we look for, how we hire, closing strip.
// Includes a back button at the top.
// No horizontal padding on page-level elements — the global
// Container handles it. No backgrounds on panels — typography
// and hairlines only.
// ============================================================

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";

// ============================================================
// DATA
// ============================================================

const WHY_US = [
  "We're building a modern digital magazine for curious people. We value independence, depth and good judgment over speed and volume.",
  "Our team is small, so you'll have real ownership, and your work will actually reach readers. We care about quality, not output.",
  "We're based remotely, which means we hire people we trust, not just people who are nearby.",
];

const WHAT_WE_LOOK_FOR = [
  {
    number: "01",
    title: "Editors who write",
    body: "We value clear thinking, strong writing and a deep curiosity about the world.",
  },
  {
    number: "02",
    title: "Engineers who care about craft",
    body: "We look for people who build thoughtfully, solve real problems and care about the details.",
  },
  {
    number: "03",
    title: "Designers who read",
    body: "We want designers who bring ideas to life, have a strong point of view and read widely.",
  },
];

const HIRING_STEPS = [
  {
    number: "01",
    title: "Introduction",
    body: "A short chat to get to know you and your work.",
  },
  {
    number: "02",
    title: "Portfolio",
    body: "We'll review your writing, projects or examples.",
  },
  {
    number: "03",
    title: "Conversation",
    body: "A deeper discussion about your experience and goals.",
  },
  {
    number: "04",
    title: "Paid exercise",
    body: "A small paid task to see how you think and work.",
  },
];

// ============================================================
// PAGE
// ============================================================

export default function CareersPage() {
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
          <span className="flex size-7 items-center justify-center rounded-full border border-border transition-colors group-hover:border-primary/40">
            <ArrowLeft className="size-3.5" aria-hidden="true" />
          </span>
          <span>Back</span>
        </button>
      </div>

      {/* =====================================================
          HERO
          ===================================================== */}
      <section
        aria-labelledby="careers-heading"
        className="pt-10 sm:pt-12 lg:pt-14"
      >
        <div aria-hidden="true" className="h-px w-full bg-border" />

        <div className="pt-14 sm:pt-16 lg:pt-20">
          <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-primary">
            Careers at Alentah
          </p>

          <h1
            id="careers-heading"
            className="mt-6 max-w-4xl font-serif text-5xl font-bold leading-[1.05] tracking-[-0.03em] text-foreground sm:text-6xl lg:text-7xl xl:text-[5rem]"
          >
            Do the best work
            <br className="hidden sm:block" /> of your career.
          </h1>

          <p className="mt-8 max-w-2xl font-serif text-lg italic leading-relaxed text-muted-foreground sm:text-xl">
            We are a small, independent editorial team. We hire slowly, write
            carefully, and ship work we are proud to sign.
          </p>
        </div>
      </section>

      {/* =====================================================
          WHY US
          ===================================================== */}
      <section
        aria-labelledby="why-heading"
        className="mt-20 sm:mt-24 lg:mt-32"
      >
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-3">
            <h2
              id="why-heading"
              className="text-[10px] font-bold uppercase tracking-[0.28em] text-primary"
            >
              Why us
            </h2>
          </div>

          <div className="lg:col-span-9">
            <div className="space-y-6">
              {WHY_US.map((paragraph, index) => (
                <p
                  key={index}
                  className="max-w-2xl text-[16px] leading-7 text-muted-foreground"
                >
                  {paragraph}
                </p>
              ))}
            </div>

            <div className="mt-8 border-l-2 border-primary/40 pl-5">
              <p className="font-serif text-lg italic leading-7 text-foreground sm:text-xl">
                We publish less than everyone else, and we mean more.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          CURRENT OPENINGS
          ===================================================== */}
      <section
        aria-labelledby="openings-heading"
        className="mt-20 sm:mt-24 lg:mt-32"
      >
        <div className="rounded-xl border border-border p-8 sm:p-10 lg:p-12">
          <h2
            id="openings-heading"
            className="font-serif text-3xl tracking-tight text-foreground sm:text-4xl"
          >
            Current openings.
          </h2>

          <div className="mt-10 flex flex-col items-center text-center">
            <span className="inline-flex items-center rounded-full border border-border px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.22em] text-muted-foreground">
              No open positions
            </span>

            <p className="mt-6 font-serif text-2xl font-semibold leading-tight tracking-tight text-foreground sm:text-3xl">
              Nothing open right now.
            </p>

            <p className="mt-4 max-w-xl text-[14px] leading-7 text-muted-foreground">
              But we hire as the team grows. When a role opens, it will be
              listed here first — and we&rsquo;ll announce it in the
              newsletter.
            </p>

            <Link
              href="/newsletter"
              className="group mt-8 inline-flex h-11 items-center gap-2 rounded-full bg-primary px-6 text-[11px] font-bold uppercase tracking-[0.15em] text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <span>Notify me by email</span>
              <ArrowRight
                className="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </Link>
          </div>
        </div>
      </section>

      {/* =====================================================
          REACH OUT
          ===================================================== */}
      <section
        aria-labelledby="reach-out-heading"
        className="mt-20 sm:mt-24 lg:mt-32"
      >
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-6">
            <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-primary">
              Reach out
            </p>

            <h2
              id="reach-out-heading"
              className="mt-4 font-serif text-4xl font-semibold leading-tight tracking-tight text-foreground sm:text-5xl"
            >
              Say hello anyway.
            </h2>

            <p className="mt-6 max-w-md text-[15px] leading-7 text-muted-foreground">
              If you think you belong here — whether there&rsquo;s a role or
              not — write to us. We read every message. Tell us what you
              build, what you write, and what you&rsquo;d want to work on.
            </p>
          </div>

          <div className="lg:col-span-6">
            <a
              href="mailto:careers@alentah.com"
              className="inline-block font-serif text-3xl text-foreground underline decoration-border underline-offset-8 transition-colors hover:text-primary hover:decoration-primary/60 sm:text-4xl lg:text-[2.5rem]"
            >
              careers@alentah.com
            </a>

            <p className="mt-5 max-w-sm text-[13px] leading-6 text-muted-foreground">
              Reply time: 5–7 days. If we&rsquo;re slow, it&rsquo;s because
              we&rsquo;re reading carefully.
            </p>
          </div>
        </div>
      </section>

      {/* =====================================================
          WHAT WE LOOK FOR
          ===================================================== */}
      <section
        aria-labelledby="look-for-heading"
        className="mt-20 sm:mt-24 lg:mt-32"
      >
        <p
          id="look-for-heading"
          className="text-[10px] font-bold uppercase tracking-[0.28em] text-primary"
        >
          What we look for
        </p>

        <div className="mt-10 grid grid-cols-1 gap-10 sm:grid-cols-3 sm:gap-8 lg:gap-12">
          {WHAT_WE_LOOK_FOR.map((item) => (
            <div key={item.number}>
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-primary tabular-nums">
                {item.number}
              </p>

              <h3 className="mt-3 font-serif text-xl leading-tight tracking-tight text-foreground sm:text-2xl">
                {item.title}
              </h3>

              <p className="mt-3 text-[15px] leading-7 text-muted-foreground">
                {item.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* =====================================================
          HOW WE HIRE
          ===================================================== */}
      <section
        aria-labelledby="hire-heading"
        className="mt-20 sm:mt-24 lg:mt-32"
      >
        <div className="flex flex-wrap items-baseline gap-x-2">
          <p
            id="hire-heading"
            className="text-[10px] font-bold uppercase tracking-[0.28em] text-primary"
          >
            How we hire
          </p>
          <span className="text-[10px] font-bold uppercase tracking-[0.28em] text-muted-foreground">
            (when a role does open)
          </span>
        </div>

        <div aria-hidden="true" className="mt-6 h-px w-full bg-border" />

        <div className="mt-10 grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          {HIRING_STEPS.map((step) => (
            <div key={step.number}>
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-primary tabular-nums">
                {step.number}
              </p>

              <h3 className="mt-3 font-serif text-xl leading-tight tracking-tight text-foreground sm:text-2xl">
                {step.title}
              </h3>

              <p className="mt-3 text-[15px] leading-7 text-muted-foreground">
                {step.body}
              </p>
            </div>
          ))}
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
            We build this slowly. We&rsquo;d rather wait for the right person
            than hire the wrong one.
          </p>

          <p className="mt-8 text-[10px] font-bold uppercase tracking-[0.24em] text-muted-foreground">
            — Talha Tabish, Editor-in-Chief
          </p>
        </div>
      </section>
    </main>
  );
}