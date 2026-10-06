// src/app/(site)/advertise/page.tsx
// ============================================================
// Advertise — ALENTAH
// Server component. Owns SEO metadata + JSON-LD structured data.
// The back button is a small client component (BackButton).
// ============================================================

import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { BackButton } from "@/components/site/general/backs/back-button";

// ============================================================
// SEO METADATA
// ============================================================

const SITE_URL = "https://www.alentah.com";

const SHORT_DESCRIPTION =
  "Reach readers who actually read. Editorial partnerships, display placements, and newsletter sponsorships for aligned brands.";

export const metadata: Metadata = {
  title: "Advertise with Alentah — Reach Curious Minds",
  description: SHORT_DESCRIPTION,
  keywords: [
    "advertise on Alentah",
    "Alentah advertising",
    "editorial partnership",
    "sponsored content",
    "media kit",
    "newsletter sponsorship",
    "custom research",
    "brand partnership",
    "long-form publishing",
    "developer audience",
    "technology advertising",
  ],
  alternates: {
    canonical: "/advertise",
  },
  openGraph: {
    type: "website",
    url: "/advertise",
    siteName: "Alentah",
    title: "Advertise with Alentah — Reach Curious Minds",
    description: SHORT_DESCRIPTION,
    images: [
      {
        url: "/seo/og-image.png",
        width: 1200,
        height: 630,
        alt: "Advertise with Alentah",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Advertise with Alentah — Reach Curious Minds",
    description: SHORT_DESCRIPTION,
    images: ["/seo/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

// ============================================================
// STRUCTURED DATA (JSON-LD)
// ============================================================

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    {
      "@type": "ListItem",
      position: 1,
      name: "Home",
      item: SITE_URL,
    },
    {
      "@type": "ListItem",
      position: 2,
      name: "Advertise",
      item: `${SITE_URL}/advertise`,
    },
  ],
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Do you accept sponsored articles?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. We partner with brands for long-form, high-quality content that aligns with our editorial standards.",
      },
    },
    {
      "@type": "Question",
      name: "How many partners do you work with at once?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "We work with a small number of partners so that placements stay rare, considered, and effective.",
      },
    },
    {
      "@type": "Question",
      name: "Can I see anonymized reader data?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. We can share aggregated, anonymized audience insights upon request.",
      },
    },
    {
      "@type": "Question",
      name: "Do you offer performance-based pricing?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "We don't offer performance-based pricing. Our value is in quality, not volume.",
      },
    },
  ],
};

const serviceJsonLd = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "Alentah Advertising & Partnerships",
  provider: {
    "@type": "Organization",
    name: "Alentah",
    url: SITE_URL,
  },
  serviceType:
    "Editorial Partnership, Display Advertising, Newsletter Sponsorship, Custom Research",
  areaServed: "Worldwide",
  audience: {
    "@type": "Audience",
    audienceType: "Brands, technology companies, and research organizations",
  },
  description:
    "Long-form editorial partnerships, considered display placements, newsletter sponsorships, and custom research for brands aligned with our editorial standards.",
};

// ============================================================
// DATA
// ============================================================

const NUMBERS = [
  { value: "180K", label: "Monthly readers" },
  { value: "62%", label: "Senior decision-makers" },
  { value: "38 min", label: "Average time on page" },
  { value: "9.4", label: "Average session depth" },
];

const AUDIENCE = [
  "Artificial intelligence",
  "Cloud infrastructure",
  "Software engineering",
  "Product design",
  "Research and science",
  "Business and economics",
  "Cybersecurity",
  "Developer tools",
];

const FORMATS = [
  {
    number: "01",
    title: "Editorial partnership",
    body: "Long-form co-produced research or a sponsored series that matches our editorial voice. Marked clearly as partner content.",
  },
  {
    number: "02",
    title: "Display advertising",
    body: "Quiet, design-forward placements in articles, newsletters, and section pages. Never intrusive. Never pop-ups.",
  },
  {
    number: "03",
    title: "Newsletter sponsorship",
    body: "A single, considered mention in our weekly newsletter — the most read surface on the site.",
  },
  {
    number: "04",
    title: "Custom research",
    body: "Original research reports produced with our editorial team and distributed to our audience as a co-branded PDF.",
  },
];

const COMMITMENTS = [
  {
    number: "01",
    title: "No dark patterns",
    body: "We don't retarget readers across the web. We don't sell personal data. Ever.",
  },
  {
    number: "02",
    title: "Editorial independence",
    body: "Sponsored content is always labeled. Our writers never write paid pieces as if they were editorial.",
  },
  {
    number: "03",
    title: "Reader-first pricing",
    body: "We work with a small number of partners so that placements stay rare, considered, and effective.",
  },
];

const STEPS = [
  {
    number: "01",
    title: "Inquiry",
    body: "Tell us about your goals and ideal audience.",
  },
  {
    number: "02",
    title: "Brief",
    body: "We'll share options and ask a few more questions.",
  },
  {
    number: "03",
    title: "Proposal",
    body: "You'll receive a tailored recommendation and quote.",
  },
  {
    number: "04",
    title: "Go live",
    body: "Once approved, we'll handle production and publication.",
  },
];

const FAQ = [
  {
    number: "01",
    question: "Do you accept sponsored articles?",
    answer:
      "Yes. We partner with brands for long-form, high-quality content that aligns with our editorial standards.",
  },
  {
    number: "02",
    question: "How many partners do you work with at once?",
    answer:
      "We work with a small number of partners so that placements stay rare, considered, and effective.",
  },
  {
    number: "03",
    question: "Can I see anonymized reader data?",
    answer:
      "Yes. We can share aggregated, anonymized audience insights upon request.",
  },
  {
    number: "04",
    question: "Do you offer performance-based pricing?",
    answer:
      "We don't offer performance-based pricing. Our value is in quality, not volume.",
  },
];

// ============================================================
// PAGE
// ============================================================

export default function AdvertisePage() {
  return (
    <main className="w-full">
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJsonLd),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqJsonLd),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(serviceJsonLd),
        }}
      />

      {/* =====================================================
          BACK BUTTON
          ===================================================== */}
      <BackButton />

      {/* =====================================================
          HERO
          ===================================================== */}
      <section
        aria-labelledby="advertise-heading"
        className="pt-10 sm:pt-12 lg:pt-14"
      >
        <div aria-hidden="true" className="h-px w-full bg-border" />

        <div className="pt-14 sm:pt-16 lg:pt-20">
          <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-primary">
            Advertise with Alentah
          </p>

          <h1
            id="advertise-heading"
            className="mt-6 max-w-4xl font-serif text-5xl font-bold leading-[1.05] tracking-[-0.03em] text-foreground sm:text-6xl lg:text-7xl xl:text-[5rem]"
          >
            Reach readers who
            <br className="hidden sm:block" /> actually read.
          </h1>

          <p className="mt-8 max-w-2xl font-serif text-lg italic leading-relaxed text-muted-foreground sm:text-xl">
            ALENTAH is a long-form publication for curious minds. Our readers
            are engineers, founders, designers, and researchers — the people
            who shape what gets built next.
          </p>

          <div className="mt-6">
            <Link
              href="/contact"
              className="group inline-flex items-center gap-1.5 text-[13px] font-semibold text-foreground underline decoration-border underline-offset-[6px] transition-colors hover:text-primary hover:decoration-primary/60"
            >
              <span>Request the media kit</span>
              <ArrowRight
                className="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </Link>
          </div>
        </div>
      </section>

      {/* =====================================================
          NUMBERS
          ===================================================== */}
      <section
        aria-labelledby="numbers-heading"
        className="mt-20 sm:mt-24"
      >
        <h2 id="numbers-heading" className="sr-only">
          Alentah by the numbers
        </h2>

        <div aria-hidden="true" className="h-px w-full bg-border" />

        <div className="mt-12 grid grid-cols-2 gap-8 sm:grid-cols-4 sm:gap-6">
          {NUMBERS.map((stat) => (
            <div key={stat.label}>
              <p className="font-serif text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
                {stat.value}
              </p>
              <p className="mt-3 text-[10px] font-bold uppercase tracking-[0.22em] text-muted-foreground">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* =====================================================
          AUDIENCE
          ===================================================== */}
      <section
        aria-labelledby="audience-heading"
        className="mt-20 sm:mt-24 lg:mt-32"
      >
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-6">
            <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-primary">
              Our audience
            </p>

            <h2
              id="audience-heading"
              className="mt-4 font-serif text-4xl font-semibold leading-tight tracking-tight text-foreground sm:text-5xl"
            >
              Depth over volume.
            </h2>

            <p className="mt-6 max-w-xl text-[15px] leading-7 text-muted-foreground">
              Our readers come to ALENTAH because they are tired of clickbait.
              They want to understand the mechanism beneath the announcement.
              They bookmark what they read and come back to it months later.
            </p>
          </div>

          <div className="lg:col-span-6">
            <ul className="grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
              {AUDIENCE.map((item) => (
                <li
                  key={item}
                  className="border-b border-border pb-3 text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground"
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* =====================================================
          FORMATS
          ===================================================== */}
      <section
        aria-labelledby="formats-heading"
        className="mt-20 sm:mt-24 lg:mt-32"
      >
        <h2
          id="formats-heading"
          className="font-serif text-3xl tracking-tight text-foreground sm:text-4xl"
        >
          Formats we offer.
        </h2>

        <div aria-hidden="true" className="mt-8 h-px w-full bg-border" />

        <ul className="divide-y divide-border">
          {FORMATS.map((format) => (
            <li key={format.number} className="py-6">
              <Link
                href="/contact"
                className="group grid grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-6 sm:grid-cols-[60px_minmax(0,1fr)_auto] sm:gap-10"
              >
                <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-primary tabular-nums">
                  {format.number}
                </span>

                <div>
                  <h3 className="font-serif text-xl leading-tight tracking-tight text-foreground transition-colors group-hover:text-primary sm:text-2xl">
                    {format.title}
                  </h3>
                  <p className="mt-2 max-w-xl text-[13px] leading-6 text-muted-foreground">
                    {format.body}
                  </p>
                </div>

                <span className="hidden items-center gap-1.5 self-center text-[11px] font-semibold text-muted-foreground transition-colors group-hover:text-foreground sm:inline-flex">
                  <span>Inquire</span>
                  <ArrowRight
                    className="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5"
                    aria-hidden="true"
                  />
                </span>
              </Link>
            </li>
          ))}
        </ul>

        <div aria-hidden="true" className="h-px w-full bg-border" />
      </section>

      {/* =====================================================
          WHAT WE DON'T DO
          ===================================================== */}
      <section
        aria-labelledby="dont-heading"
        className="mt-20 sm:mt-24 lg:mt-32"
      >
        <h2
          id="dont-heading"
          className="font-serif text-3xl tracking-tight text-foreground sm:text-4xl"
        >
          What we don&rsquo;t do.
        </h2>

        <p className="mt-6 max-w-3xl text-[16px] leading-7 text-muted-foreground">
          No pop-ups. No autoplay video. No ad networks that scrape reader
          data. No sponsored writing that pretends to be editorial.
        </p>

        <div aria-hidden="true" className="mt-10 h-px w-full bg-border" />
      </section>

      {/* =====================================================
          COMMITMENTS
          ===================================================== */}
      <section
        aria-labelledby="commitments-heading"
        className="mt-20 sm:mt-24 lg:mt-32"
      >
        <h2
          id="commitments-heading"
          className="font-serif text-3xl tracking-tight text-foreground sm:text-4xl"
        >
          Our commitments.
        </h2>

        <div className="mt-10 grid grid-cols-1 gap-10 sm:grid-cols-3 sm:gap-8 lg:gap-12">
          {COMMITMENTS.map((item) => (
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
          HOW IT WORKS
          ===================================================== */}
      <section
        aria-labelledby="how-heading"
        className="mt-20 sm:mt-24 lg:mt-32"
      >
        <h2
          id="how-heading"
          className="font-serif text-3xl tracking-tight text-foreground sm:text-4xl"
        >
          How it works.
        </h2>

        <div aria-hidden="true" className="mt-8 h-px w-full bg-border" />

        <div className="mt-10 grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          {STEPS.map((step) => (
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
          CONTACT CTA
          ===================================================== */}
      <section
        aria-labelledby="contact-cta-heading"
        className="mt-20 sm:mt-24 lg:mt-32"
      >
        <div className="rounded-xl border border-border p-8 sm:p-10 lg:p-12">
          <div className="flex flex-col items-center text-center">
            <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-primary">
              Get started
            </p>

            <h2
              id="contact-cta-heading"
              className="mt-4 font-serif text-3xl font-semibold leading-tight tracking-tight text-foreground sm:text-4xl"
            >
              Request the media kit.
            </h2>

            <p className="mt-4 max-w-xl text-[14px] leading-7 text-muted-foreground">
              Full rate card, audience breakdown, and available placements
              for the next quarter. Reach us on the contact page.
            </p>

            <Link
              href="/contact"
              className="group mt-8 inline-flex h-11 items-center gap-2 rounded-full bg-primary px-6 text-[11px] font-bold uppercase tracking-[0.15em] text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <span>Go to contact page</span>
              <ArrowRight
                className="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </Link>

            <p className="mt-4 text-[12px] text-muted-foreground">
              Response time: under 24 hours.
            </p>
          </div>
        </div>
      </section>

      {/* =====================================================
          FAQ
          ===================================================== */}
      <section
        aria-labelledby="faq-heading"
        className="mt-20 sm:mt-24 lg:mt-32"
      >
        <h2
          id="faq-heading"
          className="font-serif text-3xl tracking-tight text-foreground sm:text-4xl"
        >
          Frequently asked questions.
        </h2>

        <div aria-hidden="true" className="mt-8 h-px w-full bg-border" />

        <ul className="divide-y divide-border">
          {FAQ.map((item) => (
            <li key={item.number} className="py-6">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-[60px_minmax(0,1fr)] sm:gap-6">
                <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-primary tabular-nums">
                  {item.number}
                </span>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-8">
                  <h3 className="font-serif text-lg leading-snug tracking-tight text-foreground sm:text-xl">
                    {item.question}
                  </h3>
                  <p className="text-[14px] leading-7 text-muted-foreground">
                    {item.answer}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>
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
            We work with a small number of partners. That is the point.
          </p>

          <p className="mt-8 text-[10px] font-bold uppercase tracking-[0.24em] text-muted-foreground">
            — The Editorial Team
          </p>
        </div>
      </section>
    </main>
  );
}