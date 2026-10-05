// src/app/(site)/about/page.tsx
// ============================================================
// About — ALENTAH
// Editorial About page: hero, editors, values, principles,
// what we cover, closing quote. Images are softly rounded
// and a bit smaller, page carries more editorial substance.
// Includes a back button at the top.
// No horizontal padding — the global Container handles it.
// ============================================================

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

// ============================================================
// DATA
// ============================================================

const EDITORS = [
  {
    name: "Talha Tabish",
    role: "Editor-in-Chief",
    image: "/images/editor.webp",
    imageAlt: "Talha Tabish, Editor-in-Chief of Alentah",
    bio: "Senior Software Engineer. Fifteen years building systems and writing about the ideas that shape them. Believes good writing slows the world down long enough to see it clearly.",
    signatureType: "talha" as const,
  },
  {
    name: "Sudais Azlan",
    role: "Co-Founder & Editor",
    image: "/images/sudais.webp",
    imageAlt: "Sudais Azlan, Subtitle Editor of Alentah",
    bio: "Senior AI Engineer. Focused on the intersection of language, intelligence, and the craft of publishing. He shapes every story before it reaches the reader.",
    signatureType: "sudais" as const,
  },
];

const VALUES = [
  {
    number: "01",
    title: "Depth over speed",
    body: "We take the time to understand before we publish. Every story earns its place.",
  },
  {
    number: "02",
    title: "Quality over quantity",
    body: "A few considered pieces beat a flood of forgettable ones. We publish less, and mean more.",
  },
  {
    number: "03",
    title: "Perspective over popularity",
    body: "We write for readers who want to see clearly, not for algorithms that want to keep them scrolling.",
  },
];

const PRINCIPLES = [
  {
    number: "01",
    title: "Report, then write",
    body: "Every article starts with research. We read the source documents, talk to the people doing the work, and only write once the picture is clear. Opinions are earned, not declared.",
  },
  {
    number: "02",
    title: "Explain the mechanism, not just the headline",
    body: "Most technology coverage stops at the announcement. We go one layer deeper — the architecture, the economics, the trade-offs, and the second-order consequences that shape what actually ships.",
  },
  {
    number: "03",
    title: "Write for a reader who thinks",
    body: "We assume our reader is intelligent but not yet an expert. We do not simplify to the point of distortion, and we do not assume prior knowledge. Every technical term is defined before it is used.",
  },
  {
    number: "04",
    title: "Publish for the archive",
    body: "A piece that reads well today and reads well in two years is the standard. We avoid hype cycles, dated references, and anything that will look embarrassing six months from now.",
  },
];

const COVERAGE = [
  {
    label: "Technology",
    description:
      "Artificial intelligence, cloud infrastructure, software development, cybersecurity, and the systems that quietly run the modern internet.",
  },
  {
    label: "Software & Development",
    description:
      "The craft of building software — architecture, tools, engineering culture, and the practices that separate durable systems from fragile ones.",
  },
  {
    label: "Science & Research",
    description:
      "Applied science, computational research, and the fields where engineering meets discovery — from materials to machine learning to biology.",
  },
  {
    label: "Business & Economy",
    description:
      "The market forces shaping technology — capital flows, competitive dynamics, pricing, and the business models that survive contact with reality.",
  },
  {
    label: "Culture & Society",
    description:
      "How technology reshapes work, identity, attention, and daily life — and the debates that follow.",
  },
  {
    label: "Essays & Analysis",
    description:
      "Long-form writing on the ideas shaping the next decade — where argument, evidence, and perspective meet.",
  },
];

const STATS = [
  { value: "12+", label: "Years of editorial work" },
  { value: "3", label: "Core domains of coverage" },
  { value: "40+", label: "In-depth guides published" },
  { value: "100%", label: "Independently funded" },
];

const QUOTE =
  "The best ideas don’t just change how we think, they change how we live.";

// ============================================================
// SIGNATURES — inline SVG, handwritten style
// ============================================================

function TalhaTabishSignature({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 260 56"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="Talha Tabish signature"
    >
      <path
        d="M6 14 C 14 12, 24 11, 34 11 C 27 14, 22 24, 20 34 C 19 40, 21 42, 27 40"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M40 38 C 36 32, 40 26, 46 28 C 50 29, 48 36, 44 40 C 42 42, 46 42, 50 38"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M54 12 C 56 11, 58 14, 56 22 L 52 38 C 51 42, 54 42, 58 38"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M62 14 C 64 13, 66 16, 64 24 L 60 38 C 60 42, 63 42, 66 38 M 62 30 C 66 26, 74 26, 72 34 C 71 40, 66 42, 70 42 C 74 42, 78 38, 80 34"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M86 38 C 82 32, 86 26, 92 28 C 96 29, 94 36, 90 40 C 88 42, 92 42, 96 38"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4 48 C 36 44, 78 43, 100 46"
        stroke="currentColor"
        strokeWidth="0.85"
        strokeLinecap="round"
        opacity="0.65"
      />
      <path
        d="M120 24 C 128 22, 138 21, 148 21 C 141 24, 136 32, 134 42 C 133 46, 135 47, 141 45"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M154 42 C 150 36, 154 30, 160 32 C 164 33, 162 40, 158 44 C 156 46, 160 46, 164 42"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M170 12 C 172 11, 174 14, 172 22 L 166 42 C 166 46, 170 47, 176 43 M 172 32 C 176 26, 184 28, 182 36 C 180 42, 172 46, 168 42"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M190 32 C 192 31, 194 34, 192 40 C 191 44, 193 44, 196 42 M 191 26 C 191 24, 194 24, 194 26"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M204 34 C 208 30, 214 32, 212 36 C 210 40, 204 40, 206 44 C 208 46, 214 44, 218 40"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M224 14 C 226 13, 228 16, 226 24 L 222 42 C 222 46, 225 46, 228 42 M 224 34 C 228 30, 236 30, 234 38 C 233 42, 228 44, 232 44 C 236 44, 240 40, 242 36"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M118 50 C 152 46, 208 46, 252 49"
        stroke="currentColor"
        strokeWidth="0.85"
        strokeLinecap="round"
        opacity="0.65"
      />
    </svg>
  );
}

function SudaisAzlanSignature({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 240 56"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="Sudais Azlan signature"
    >
      <path
        d="M6 30 C 10 24, 18 22, 22 26 C 26 30, 20 34, 14 36 C 8 38, 4 42, 8 46 C 12 50, 22 48, 28 42"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M36 32 C 34 28, 36 24, 40 26 L 38 40 C 38 44, 44 44, 48 38 C 50 36, 52 30, 52 26"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M64 12 C 66 11, 68 14, 66 22 L 60 42 C 60 46, 64 47, 70 43 M 68 32 C 72 26, 80 28, 78 36 C 76 42, 68 46, 64 42"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M86 38 C 82 32, 86 26, 92 28 C 96 29, 94 36, 90 40 C 88 42, 92 42, 96 38"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M104 32 C 106 31, 108 34, 106 40 C 105 44, 107 44, 110 42 M 105 26 C 105 24, 108 24, 108 26"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M118 34 C 122 30, 128 32, 126 36 C 124 40, 118 40, 120 44 C 122 46, 128 44, 132 40"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4 48 C 36 44, 88 43, 136 46"
        stroke="currentColor"
        strokeWidth="0.85"
        strokeLinecap="round"
        opacity="0.65"
      />
      <path
        d="M150 46 C 154 32, 160 20, 166 20 C 172 20, 176 32, 180 46 M 156 38 L 176 38"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M186 26 L 200 26 L 184 46 L 204 46"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M208 12 C 210 11, 212 14, 210 22 L 206 38 C 205 42, 208 42, 212 38"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M218 38 C 214 32, 218 26, 224 28 C 228 29, 226 36, 222 40 C 220 42, 224 42, 228 38"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M234 32 L 232 46 M 232 32 C 236 28, 244 28, 244 36 L 242 46"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M148 50 C 176 46, 210 46, 240 48"
        stroke="currentColor"
        strokeWidth="0.85"
        strokeLinecap="round"
        opacity="0.65"
      />
    </svg>
  );
}

function Signature({
  type,
  className,
}: {
  type: "talha" | "sudais";
  className?: string;
}) {
  if (type === "sudais") {
    return <SudaisAzlanSignature className={className} />;
  }
  return <TalhaTabishSignature className={className} />;
}

// ============================================================
// PAGE
// ============================================================

export default function AboutPage() {
  return (
    <main className="w-full">
      {/* =====================================================
          BACK BUTTON
          ===================================================== */}
      <div className="pt-8 sm:pt-10">
        <Link
          href="/"
          aria-label="Back to home"
          className="group inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground transition-colors hover:text-foreground"
        >
          <span className="flex size-7 items-center justify-center rounded-full border border-border bg-background transition-colors group-hover:border-primary/40 group-hover:bg-primary/10">
            <ArrowLeft className="size-3.5" aria-hidden="true" />
          </span>
          <span>Back</span>
        </Link>
      </div>

      {/* =====================================================
          HERO
          ===================================================== */}
      <section
        aria-labelledby="about-heading"
        className="pt-10 sm:pt-12 lg:pt-14"
      >
        <div aria-hidden="true" className="h-px w-full bg-border" />

        <div className="pt-14 sm:pt-16 lg:pt-20">
          <p className="text-center text-[10px] font-bold uppercase tracking-[0.28em] text-primary">
            About Alentah
          </p>

          <h1
            id="about-heading"
            className="mx-auto mt-6 max-w-4xl text-center font-serif text-4xl font-bold leading-[1.08] tracking-[-0.02em] text-foreground sm:text-5xl lg:text-6xl xl:text-[4rem]"
          >
            Slow journalism for
            <br className="hidden sm:block" /> curious minds.
          </h1>

          <p className="mx-auto mt-8 max-w-2xl text-center font-serif text-lg italic leading-relaxed text-muted-foreground sm:text-xl">
            We choose depth over speed, quality over quantity, and perspective
            over popularity.
          </p>
        </div>
      </section>

      {/* =====================================================
          MISSION — what we do
          ===================================================== */}
      <section
        aria-labelledby="mission-heading"
        className="mt-20 sm:mt-24 lg:mt-32"
      >
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-primary">
              Our Purpose
            </p>

            <h2
              id="mission-heading"
              className="mt-4 font-serif text-3xl font-semibold leading-tight tracking-tight text-foreground sm:text-4xl"
            >
              Writing that earns its place.
            </h2>
          </div>

          <div className="space-y-6 lg:col-span-8">
            <p className="text-lg leading-8 text-muted-foreground">
              Alentah is an independent digital publication about technology,
              software, and the ideas shaping the next decade. We were founded
              on a simple observation: the internet produces more information
              than at any point in history, and less understanding than it
              should. Most technology writing covers announcements. Very
              little of it explains mechanisms.
            </p>

            <p className="text-lg leading-8 text-muted-foreground">
              We write for readers who want to know how things actually work
              — the architecture beneath the product, the economics behind
              the strategy, the trade-offs that determine what ships and what
              quietly does not. We are not a news site. We are not a review
              site. We are a small editorial team focused on long-form
              analysis, technical explanation, and the kind of writing that
              is still useful two years after it is published.
            </p>

            <p className="text-lg leading-8 text-muted-foreground">
              Every article on this site goes through research, technical
              review, and multiple rounds of editing before it reaches a
              reader. Every claim is sourced. Every diagram is drawn for a
              reason. Every headline is written to inform, not to bait.
            </p>

            <div className="mt-8 border-l-2 border-primary/40 pl-5">
              <p className="text-base leading-7 text-muted-foreground">
                <strong className="font-semibold text-foreground">
                  The standard we hold:
                </strong>
                if a piece does not teach the reader something they could not
                have learned from a press release, we do not publish it.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          THE PEOPLE BEHIND ALENTAH
          ===================================================== */}
      <section
        aria-labelledby="editors-heading"
        className="mt-20 sm:mt-24 lg:mt-32"
      >
        <h2
          id="editors-heading"
          className="font-serif text-3xl tracking-tight text-foreground sm:text-4xl"
        >
          The People Behind Alentah.
        </h2>

        <div className="mt-10 grid grid-cols-1 gap-12 sm:mt-12 lg:grid-cols-2 lg:gap-16">
          {EDITORS.map((editor) => (
            <article key={editor.name} className="flex flex-col">
              <figure className="flex flex-col">
                <div className="relative mx-auto w-full max-w-xs overflow-hidden rounded-2xl bg-muted sm:max-w-[360px] sm:rounded-3xl">
                  <div className="relative aspect-4/5 w-full">
                    <Image
                      src={editor.image}
                      alt={editor.imageAlt}
                      fill
                      priority
                      sizes="(max-width: 640px) 320px, 360px"
                      className="object-cover object-top scale-[1.01]"
                    />
                  </div>
                </div>

                <figcaption className="mt-6">
                  <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-primary">
                    {editor.role}
                  </p>

                  <p className="mt-2 font-serif text-2xl font-semibold leading-tight tracking-tight text-foreground sm:text-[1.75rem]">
                    {editor.name}
                  </p>

                  <p className="mt-4 text-[14px] leading-6 text-muted-foreground">
                    {editor.bio}
                  </p>

                  <div
                    aria-hidden="true"
                    className="mt-6 h-px w-full bg-border"
                  />

                  <div className="mt-5">
                    <Signature
                      type={editor.signatureType}
                      className="h-10 w-[190px] text-foreground/85 sm:w-[220px]"
                    />
                  </div>
                </figcaption>
              </figure>
            </article>
          ))}
        </div>
      </section>

      {/* =====================================================
          STATS
          ===================================================== */}
      <section
        aria-labelledby="stats-heading"
        className="mt-20 sm:mt-24 lg:mt-32"
      >
        <h2 id="stats-heading" className="sr-only">
          Alentah by the numbers
        </h2>

        <div aria-hidden="true" className="h-px w-full bg-border" />

        <div className="mt-12 grid grid-cols-2 gap-10 sm:grid-cols-4 sm:gap-8">
          {STATS.map((stat) => (
            <div key={stat.label}>
              <p className="font-serif text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                {stat.value}
              </p>
              <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* =====================================================
          EDITORIAL PRINCIPLES
          ===================================================== */}
      <section
        aria-labelledby="principles-heading"
        className="mt-20 sm:mt-24 lg:mt-32"
      >
        <div className="flex items-end justify-between gap-6 pb-8">
          <h2
            id="principles-heading"
            className="font-serif text-3xl tracking-tight text-foreground sm:text-4xl"
          >
            How we work.
          </h2>
        </div>

        <div aria-hidden="true" className="h-px w-full bg-border" />

        <div className="mt-10 grid grid-cols-1 gap-10 sm:grid-cols-2 sm:gap-x-12 sm:gap-y-14">
          {PRINCIPLES.map((principle) => (
            <article key={principle.number}>
              <p className="font-serif text-2xl text-foreground/70 tabular-nums">
                {principle.number}
              </p>

              <h3 className="mt-3 font-serif text-xl tracking-tight text-foreground sm:text-2xl">
                {principle.title}
              </h3>

              <p className="mt-3 text-[15px] leading-7 text-muted-foreground">
                {principle.body}
              </p>
            </article>
          ))}
        </div>
      </section>

      {/* =====================================================
          WHAT WE COVER
          ===================================================== */}
      <section
        aria-labelledby="coverage-heading"
        className="mt-20 sm:mt-24 lg:mt-32"
      >
        <h2
          id="coverage-heading"
          className="font-serif text-3xl tracking-tight text-foreground sm:text-4xl"
        >
          What we cover.
        </h2>

        <div aria-hidden="true" className="mt-8 h-px w-full bg-border" />

        <div className="mt-10 grid grid-cols-1 gap-x-12 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {COVERAGE.map((item) => (
            <div key={item.label}>
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-primary">
                {item.label}
              </p>
              <p className="mt-3 text-[15px] leading-7 text-muted-foreground">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* =====================================================
          VALUES
          ===================================================== */}
      <section
        aria-labelledby="values-heading"
        className="mt-20 sm:mt-24 lg:mt-32"
      >
        <h2 id="values-heading" className="sr-only">
          Our values
        </h2>

        <div aria-hidden="true" className="h-px w-full bg-border" />

        <div className="mt-12 grid grid-cols-1 gap-10 sm:grid-cols-3 sm:gap-8 lg:gap-12">
          {VALUES.map((value) => (
            <div key={value.number}>
              <p className="font-serif text-2xl text-foreground/70 tabular-nums">
                {value.number}
              </p>

              <h3 className="mt-3 font-serif text-xl tracking-tight text-foreground sm:text-2xl">
                {value.title}
              </h3>

              <p className="mt-3 text-[15px] leading-7 text-muted-foreground">
                {value.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* =====================================================
          CONTACT STRIP
          ===================================================== */}
      <section
        aria-labelledby="contact-heading"
        className="mt-20 sm:mt-24 lg:mt-32"
      >
        <div aria-hidden="true" className="h-px w-full bg-border" />

        <div className="mt-10 grid grid-cols-1 items-start gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end lg:gap-12">
          <div>
            <h2
              id="contact-heading"
              className="font-serif text-2xl tracking-tight text-foreground sm:text-3xl"
            >
              Get in touch.
            </h2>
            <p className="mt-3 max-w-xl text-[15px] leading-7 text-muted-foreground">
              Pitches, feedback, and corrections are always welcome. We read
              every message.
            </p>
            <div className="mt-5 flex flex-wrap gap-x-8 gap-y-3 text-[14px]">
              <a
                href="mailto:hello@alentah.com"
                className="text-foreground underline decoration-border underline-offset-4 transition-colors hover:text-primary hover:decoration-primary/60"
              >
                hello@alentah.com
              </a>
              <a
                href="mailto:pitch@alentah.com"
                className="text-foreground underline decoration-border underline-offset-4 transition-colors hover:text-primary hover:decoration-primary/60"
              >
                pitch@alentah.com
              </a>
            </div>
          </div>

          <div className="lg:pb-1">
            <Link
              href="/articles"
              className="group inline-flex h-11 items-center gap-2 rounded-full border border-border bg-background px-5 text-[11px] font-bold uppercase tracking-[0.15em] text-foreground transition-colors hover:bg-muted"
            >
              <span>Read the latest</span>
              <span
                aria-hidden="true"
                className="transition-transform duration-200 group-hover:translate-x-0.5"
              >
                →
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* =====================================================
          CLOSING QUOTE
          ===================================================== */}
      <section
        aria-labelledby="closing-quote"
        className="mt-24 pb-24 sm:mt-28 sm:pb-28 lg:mt-32 lg:pb-32"
      >
        <h2 id="closing-quote" className="sr-only">
          Closing quote
        </h2>

        <div className="mx-auto max-w-3xl text-center">
          <p className="font-serif text-2xl italic leading-snug tracking-tight text-foreground sm:text-3xl lg:text-[2.25rem]">
            <span
              aria-hidden="true"
              className="mr-1 align-top text-3xl not-italic text-muted-foreground/60"
            >
              &ldquo;
            </span>
            {QUOTE}
            <span
              aria-hidden="true"
              className="ml-1 align-top text-3xl not-italic text-muted-foreground/60"
            >
              &rdquo;
            </span>
          </p>

          <p className="mt-8 text-[10px] font-bold uppercase tracking-[0.24em] text-muted-foreground">
            — Talha Tabish, Editor-in-Chief
          </p>
        </div>
      </section>
    </main>
  );
}