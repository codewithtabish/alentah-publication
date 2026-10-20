// src/app/(site)/careers/page.tsx
// ============================================================
// Careers — ALENTAH
// Server component. Owns SEO metadata + JSON-LD structured data.
// The back button is the shared BackButton client component.
// ============================================================

import Link from "next/link";
import type { Metadata } from "next";
import { BackButton } from "@/components/site/general/backs/back-button";

// ============================================================
// SEO METADATA
// ============================================================

const SITE_URL = "https://www.alentah.com";
const PAGE_URL = `${SITE_URL}/careers`;
const ORGANIZATION_ID = `${SITE_URL}/#organization`;
const WEBSITE_ID = `${SITE_URL}/#website`;
const OG_IMAGE = `${SITE_URL}/seo/og-image.png`;
const CAREERS_EMAIL = "careers@alentah.com";

const TITLE = "Careers at Alentah | Join an Independent Newsroom";
const DESCRIPTION =
  "Join Alentah, a small, independent, remote-first editorial team. We hire slowly, write carefully and ship work we're proud to sign. See how we hire.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    type: "website",
    url: PAGE_URL,
    siteName: "Alentah",
    locale: "en_US",
    title: TITLE,
    description: DESCRIPTION,
    images: [
      {
        url: OG_IMAGE,
        width: 1200,
        height: 630,
        alt: "Careers at Alentah",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: [OG_IMAGE],
  },
};

// ============================================================
// STRUCTURED DATA (JSON-LD)
// Organization and WebSite live in the root layout; here we only
// reference them by @id. No JobPosting until a real role is open.
// ============================================================

function jsonLd(data: object): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

const webPageJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "@id": `${PAGE_URL}#webpage`,
  url: PAGE_URL,
  name: "Careers at Alentah",
  description: DESCRIPTION,
  inLanguage: "en",
  isPartOf: { "@id": WEBSITE_ID },
  about: { "@id": ORGANIZATION_ID },
  breadcrumb: { "@id": `${PAGE_URL}#breadcrumb` },
};

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "@id": `${PAGE_URL}#breadcrumb`,
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
    { "@type": "ListItem", position: 2, name: "Careers", item: PAGE_URL },
  ],
};

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
  return (
    <main className="w-full">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(webPageJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(breadcrumbJsonLd) }}
      />

      <BackButton />

      {/* HERO */}
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

      {/* WHY US */}
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

            <p className="mt-6 max-w-2xl text-[14px] leading-7 text-muted-foreground">
              Learn more{" "}
              <Link
                href="/about"
                className="underline underline-offset-4 hover:text-primary"
              >
                about Alentah
              </Link>{" "}
              and read our{" "}
              <Link
                href="/ethics"
                className="underline underline-offset-4 hover:text-primary"
              >
                editorial standards
              </Link>
              .
            </p>

            <div className="mt-8 border-l-2 border-primary/40 pl-5">
              <p className="font-serif text-lg italic leading-7 text-foreground sm:text-xl">
                We publish less than everyone else, and we mean more.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CURRENT OPENINGS */}
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
              listed here first.
            </p>
          </div>
        </div>
      </section>

      {/* REACH OUT */}
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
              href={`mailto:${CAREERS_EMAIL}`}
              className="block select-all break-all font-mono text-2xl text-foreground transition-colors hover:text-primary sm:text-4xl lg:text-[2.5rem]"
            >
              {CAREERS_EMAIL}
            </a>

            <p className="mt-5 max-w-sm text-[13px] leading-6 text-muted-foreground">
              Reply time: 5–7 days. If we&rsquo;re slow, it&rsquo;s because
              we&rsquo;re reading carefully.
            </p>

            <p className="mt-3 max-w-sm text-[13px] leading-6 text-muted-foreground">
              Press or general questions? Use the{" "}
              <Link
                href="/contact"
                className="underline underline-offset-4 hover:text-primary"
              >
                contact page
              </Link>
              .
            </p>
          </div>
        </div>
      </section>

      {/* WHAT WE LOOK FOR */}
      <section
        aria-labelledby="look-for-heading"
        className="mt-20 sm:mt-24 lg:mt-32"
      >
        <h2
          id="look-for-heading"
          className="text-[10px] font-bold uppercase tracking-[0.28em] text-primary"
        >
          What we look for
        </h2>

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

      {/* HOW WE HIRE */}
      <section
        aria-labelledby="hire-heading"
        className="mt-20 sm:mt-24 lg:mt-32"
      >
        <div className="flex flex-wrap items-baseline gap-x-2">
          <h2
            id="hire-heading"
            className="text-[10px] font-bold uppercase tracking-[0.28em] text-primary"
          >
            How we hire
          </h2>
          <span className="text-[10px] font-bold uppercase tracking-[0.28em] text-muted-foreground">
            (when a role does open)
          </span>
        </div>

        <div aria-hidden="true" className="mt-6 h-px w-full bg-border" />

        <ol className="mt-10 grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          {HIRING_STEPS.map((step) => (
            <li key={step.number}>
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-primary tabular-nums">
                {step.number}
              </p>

              <h3 className="mt-3 font-serif text-xl leading-tight tracking-tight text-foreground sm:text-2xl">
                {step.title}
              </h3>

              <p className="mt-3 text-[15px] leading-7 text-muted-foreground">
                {step.body}
              </p>
            </li>
          ))}
        </ol>
      </section>

      {/* CLOSING */}
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