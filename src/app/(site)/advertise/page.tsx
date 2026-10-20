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
const PAGE_URL = `${SITE_URL}/advertise`;
const ORGANIZATION_ID = `${SITE_URL}/#organization`;
const WEBSITE_ID = `${SITE_URL}/#website`;
const OG_IMAGE = `${SITE_URL}/seo/og-image.png`;

const TITLE = "Advertise with Alentah | Sponsorships & Partnerships";
const DESCRIPTION =
  "Partner with Alentah, an independent publication for curious minds. Labeled sponsored content, newsletter sponsorships and custom research for aligned brands.";

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
        alt: "Advertise with Alentah",
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
// Organization and WebSite are defined once in the root layout;
// here we only reference them by @id.
// ============================================================

function jsonLd(data: object): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

const webPageJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "@id": `${PAGE_URL}#webpage`,
  url: PAGE_URL,
  name: TITLE,
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
    { "@type": "ListItem", position: 2, name: "Advertise", item: PAGE_URL },
  ],
};

const serviceJsonLd = {
  "@context": "https://schema.org",
  "@type": "Service",
  "@id": `${PAGE_URL}#service`,
  name: "Alentah Advertising & Partnerships",
  provider: { "@id": ORGANIZATION_ID },
  serviceType:
    "Sponsored content, newsletter sponsorship, display advertising, custom research",
  areaServed: "Worldwide",
  description:
    "Clearly labeled editorial partnerships, newsletter sponsorships, display placements and custom research for brands aligned with Alentah's editorial standards.",
  url: PAGE_URL,
};

// ============================================================
// DATA
// Only claims that are true today. Do not add audience numbers
// until they come from real analytics.
// ============================================================

const FACTS = [
  { value: "2026", label: "Year founded" },
  { value: "Independent", label: "Editorial ownership" },
  { value: "100%", label: "Sponsored content labeled" },
  { value: "Small", label: "Number of partners at a time" },
];

const AUDIENCE = [
  "Artificial intelligence",
  "Software engineering",
  "Technology and business",
  "Science and research",
  "Design and culture",
  "Developer tools",
];

const FORMATS = [
  {
    number: "01",
    title: "Editorial partnership",
    body: "A co-produced long-form piece or a sponsored series written in our voice and clearly marked as partner content.",
  },
  {
    number: "02",
    title: "Display advertising",
    body: "Quiet, design-forward placements in articles and section pages. Clearly labeled as advertising.",
  },
  {
    number: "03",
    title: "Newsletter sponsorship",
    body: "A single, considered sponsor mention in the Alentah newsletter, available as the newsletter grows.",
  },
  {
    number: "04",
    title: "Custom research",
    body: "Original research produced with our editorial team and published as a co-branded report.",
  },
];

const COMMITMENTS = [
  {
    number: "01",
    title: "Clear labeling",
    body: "Sponsored content is always labeled as sponsored. Our writers never present paid pieces as independent editorial.",
  },
  {
    number: "02",
    title: "Editorial independence",
    body: "Partners do not control our newsroom, our coverage or our conclusions. Read our editorial standards on the ethics page.",
  },
  {
    number: "03",
    title: "Honest numbers",
    body: "We are a new publication and we don't publish audience figures we can't verify. We share real, aggregated analytics on request.",
  },
];

const STEPS = [
  {
    number: "01",
    title: "Inquiry",
    body: "Tell us about your goals and the audience you want to reach.",
  },
  {
    number: "02",
    title: "Brief",
    body: "We share the options that fit and ask a few follow-up questions.",
  },
  {
    number: "03",
    title: "Proposal",
    body: "You receive a tailored recommendation and a quote.",
  },
  {
    number: "04",
    title: "Go live",
    body: "Once approved, we handle production and publication.",
  },
];

const FAQ = [
  {
    number: "01",
    question: "Do you accept sponsored articles?",
    answer:
      "Yes. We partner with a small number of brands on long-form content that fits our editorial standards. Every sponsored piece is clearly labeled.",
  },
  {
    number: "02",
    question: "Do you already show ads on the site?",
    answer:
      "Yes. Alentah shows Google AdSense advertising. Direct partnerships are separate from that and are always labeled. See our Privacy and Cookies pages for how advertising partners use data.",
  },
  {
    number: "03",
    question: "Can I see reader data?",
    answer:
      "We can share aggregated, anonymized audience insights on request, and we will tell you plainly what we can and can't measure yet.",
  },
  {
    number: "04",
    question: "Do you offer performance-based pricing?",
    answer:
      "No. We don't sell clicks or guaranteed outcomes. Partnerships are priced on the format and the work involved.",
  },
];

// ============================================================
// PAGE
// ============================================================

export default function AdvertisePage() {
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(serviceJsonLd) }}
      />

      <BackButton />

      {/* HERO */}
      <section
        aria-labelledby="advertise-heading"
        className="pt-10 sm:pt-12 lg:pt-14"
      >
        <div aria-hidden="true" className="h-px w-full bg-border" />

        <div className="pt-14 sm:pt-16 lg:pt-20">
          <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-primary">
            Partnerships
          </p>

          <h1
            id="advertise-heading"
            className="mt-6 max-w-4xl font-serif text-5xl font-bold leading-[1.05] tracking-[-0.03em] text-foreground sm:text-6xl lg:text-7xl xl:text-[5rem]"
          >
            Advertise with Alentah.
          </h1>

          <p className="mt-8 max-w-2xl font-serif text-lg italic leading-relaxed text-muted-foreground sm:text-xl">
            Alentah is an independent publication of slow journalism for
            curious minds, covering technology, software, AI, science and
            business. We partner with a small number of brands whose work
            fits what our readers care about.
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

      {/* FACTS (all verifiable) */}
      <section aria-labelledby="facts-heading" className="mt-20 sm:mt-24">
        <h2 id="facts-heading" className="sr-only">
          Alentah at a glance
        </h2>

        <div aria-hidden="true" className="h-px w-full bg-border" />

        <dl className="mt-12 grid grid-cols-2 gap-8 sm:grid-cols-4 sm:gap-6">
          {FACTS.map((fact) => (
            <div key={fact.label}>
              <dd className="font-serif text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                {fact.value}
              </dd>
              <dt className="mt-3 text-[10px] font-bold uppercase tracking-[0.22em] text-muted-foreground">
                {fact.label}
              </dt>
            </div>
          ))}
        </dl>
      </section>

      {/* AUDIENCE */}
      <section
        aria-labelledby="audience-heading"
        className="mt-20 sm:mt-24 lg:mt-32"
      >
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-6">
            <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-primary">
              Our readers
            </p>

            <h2
              id="audience-heading"
              className="mt-4 font-serif text-4xl font-semibold leading-tight tracking-tight text-foreground sm:text-5xl"
            >
              Depth over volume.
            </h2>

            <p className="mt-6 max-w-xl text-[15px] leading-7 text-muted-foreground">
              Alentah is written for people who want to understand the
              mechanism beneath the announcement: engineers, founders,
              designers and researchers. We publish fewer, longer stories and
              would rather earn a reader&rsquo;s attention than chase clicks.
              Learn more{" "}
              <Link
                href="/about"
                className="underline underline-offset-4 hover:text-primary"
              >
                about Alentah
              </Link>
              .
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

      {/* FORMATS */}
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

      {/* WHAT WE DON'T DO */}
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
          No autoplay video. No sponsored writing that pretends to be
          editorial. No promises of rankings, traffic or clicks. We don&rsquo;t
          sell reader data; advertising partners such as Google AdSense work
          under the rules in our{" "}
          <Link
            href="/privacy"
            className="underline underline-offset-4 hover:text-primary"
          >
            Privacy
          </Link>{" "}
          and{" "}
          <Link
            href="/cookies"
            className="underline underline-offset-4 hover:text-primary"
          >
            Cookies
          </Link>{" "}
          policies.
        </p>

        <div aria-hidden="true" className="mt-10 h-px w-full bg-border" />
      </section>

      {/* COMMITMENTS */}
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

        <p className="mt-10 text-[14px] leading-7 text-muted-foreground">
          Read our full{" "}
          <Link
            href="/ethics"
            className="underline underline-offset-4 hover:text-primary"
          >
            editorial standards
          </Link>
          .
        </p>
      </section>

      {/* HOW IT WORKS */}
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

        <ol className="mt-10 grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          {STEPS.map((step) => (
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

      {/* CONTACT CTA */}
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
              Tell us about your brand and goals on the contact page and we
              will send the available formats, placements and rates.
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
          </div>
        </div>
      </section>

      {/* FAQ (visible content; no FAQ schema, see notes) */}
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
            We work with a small number of partners. That is the point.
          </p>

          <p className="mt-8 text-[10px] font-bold uppercase tracking-[0.24em] text-muted-foreground">
            The Editorial Team
          </p>
        </div>
      </section>
    </main>
  );
}