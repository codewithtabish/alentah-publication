// src/app/(site)/ethics/page.tsx
// ============================================================
// Ethics — ALENTAH
// Server component. Owns SEO metadata + JSON-LD structured data.
// The scroll-spy TOC lives in EthicsSidebar (client).
// The back button is the shared BackButton.
// ============================================================

import { EthicsSidebar } from "@/components/site/ethics/ethics-sidebar";
import { BackButton } from "@/components/site/general/backs/back-button";
import type { Metadata } from "next";
import type { ReactNode } from "react";


// ============================================================
// SEO METADATA
// ============================================================

const SITE_URL = "https://www.alentah.com";

export const metadata: Metadata = {
  title: "Editorial Ethics — Alentah's Principles & Standards",
  description:
    "How Alentah works, and what we stand for. Independence, funding, sources, corrections, use of AI, sponsored content, reader data, and accountability — the principles behind every story we publish.",
  keywords: [
    "editorial ethics",
    "Alentah ethics",
    "journalism ethics",
    "media ethics policy",
    "editorial independence",
    "corrections policy",
    "AI in journalism",
    "sponsored content policy",
    "reader data policy",
    "accountability in media",
    "newsroom standards",
  ],
  alternates: {
    canonical: "/ethics",
  },
  openGraph: {
    type: "website",
    url: "/ethics",
    siteName: "Alentah",
    title: "Editorial Ethics — Alentah's Principles & Standards",
    description:
      "Independence, funding, sources, corrections, AI, sponsored content, reader data, and accountability — the principles behind every story we publish.",
    images: [
      {
        url: "/seo/og-image.png",
        width: 1200,
        height: 630,
        alt: "Editorial Ethics — Alentah",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Editorial Ethics — Alentah's Principles & Standards",
    description:
      "Independence, funding, sources, corrections, AI, sponsored content, reader data, and accountability — the principles behind every story we publish.",
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
      name: "Ethics",
      item: `${SITE_URL}/ethics`,
    },
  ],
};

const webPageJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Editorial Ethics — Alentah",
  url: `${SITE_URL}/ethics`,
  description:
    "Alentah's editorial ethics: independence, funding, sources, corrections, AI, sponsored content, reader data, and accountability.",
  inLanguage: "en",
  dateModified: "2026-10-05",
  isPartOf: {
    "@type": "WebSite",
    name: "Alentah",
    url: SITE_URL,
  },
  publisher: {
    "@type": "Organization",
    name: "Alentah",
    url: SITE_URL,
    logo: `${SITE_URL}/seo/icon-512.png`,
  },
};

// ============================================================
// DATA
// ============================================================

const SECTIONS = [
  { id: "our-commitments", label: "Our commitments" },
  { id: "independence", label: "Independence" },
  { id: "funding-and-advertising", label: "Funding and advertising" },
  { id: "sources-and-attribution", label: "Sources and attribution" },
  { id: "corrections", label: "Corrections" },
  { id: "use-of-ai-in-our-work", label: "Use of AI in our work" },
  { id: "sponsored-content", label: "Sponsored content" },
  { id: "reader-data", label: "Reader data" },
  {
    id: "complaints-and-accountability",
    label: "Complaints and accountability",
  },
  { id: "contact-us", label: "Contact us" },
];

const COMMITMENTS = [
  { number: "01", body: "We seek truth, not clicks." },
  { number: "02", body: "We give a voice to underrepresented perspectives." },
  {
    number: "03",
    body: "We are transparent about our process and our mistakes.",
  },
  { number: "04", body: "We put our readers first, always." },
];

// ============================================================
// PAGE
// ============================================================

export default function EthicsPage() {
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
          __html: JSON.stringify(webPageJsonLd),
        }}
      />

      {/* BACK BUTTON — hidden when there is no history to return to */}
      <BackButton />

      {/* HERO */}
      <section
        aria-labelledby="ethics-heading"
        className="pt-10 sm:pt-12 lg:pt-14"
      >
        <div aria-hidden="true" className="h-px w-full bg-border" />

        <div className="pt-14 sm:pt-16 lg:pt-20">
          <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-primary">
            Ethics at Alentah
          </p>

          <h1
            id="ethics-heading"
            className="mt-6 max-w-4xl font-serif text-5xl font-bold leading-[1.05] tracking-[-0.03em] text-foreground sm:text-6xl lg:text-7xl xl:text-[5rem]"
          >
            How we work, and
            <br className="hidden sm:block" /> what we stand for.
          </h1>

          <p className="mt-8 max-w-2xl font-serif text-lg italic leading-relaxed text-muted-foreground sm:text-xl">
            ALENTAH is small and independent. We answer to our readers, not to
            advertisers, platforms, or press cycles. Here is what that means in
            practice.
          </p>

          <p className="mt-6 text-[12px] text-muted-foreground">
            Last updated: 5 October 2026
          </p>
        </div>
      </section>

      {/* SIDEBAR + BODY */}
      <div className="mt-16 grid grid-cols-1 gap-12 lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-16 xl:gap-20">
        {/* STICKY TOC — client component */}
        <EthicsSidebar sections={SECTIONS} />

        {/* BODY */}
        <article className="min-w-0">
          {/* 1 — Our commitments */}
          <Section
            id="our-commitments"
            eyebrow="Our commitments"
            heading="Our commitments"
          >
            <p className="text-[16px] leading-7 text-muted-foreground">
              These are the principles that guide every piece of journalism we
              publish.
            </p>

            <ol className="mt-2 space-y-3">
              {COMMITMENTS.map((item) => (
                <li
                  key={item.number}
                  className="flex items-baseline gap-4"
                >
                  <span className="shrink-0 font-mono text-[13px] font-semibold text-primary tabular-nums">
                    {item.number}
                  </span>
                  <span className="text-[16px] leading-7 text-muted-foreground">
                    {item.body}
                  </span>
                </li>
              ))}
            </ol>
          </Section>

          {/* 2 — Independence */}
          <Section
            id="independence"
            eyebrow="Independence"
            heading="Independence"
          >
            <p className="text-[16px] leading-7 text-muted-foreground">
              Alentah is editorially independent. We do not take direction from
              advertisers, partners, platforms, or any other commercial
              interests.
            </p>
            <p className="text-[16px] leading-7 text-muted-foreground">
              Our editorial decisions are made by our team, based on what we
              believe is important, not on what will generate the most traffic
              or revenue.
            </p>
          </Section>

          {/* 3 — Funding and advertising */}
          <Section
            id="funding-and-advertising"
            eyebrow="Funding and advertising"
            heading="Funding and advertising"
          >
            <p className="text-[16px] leading-7 text-muted-foreground">
              Alentah is funded by a mix of reader support and carefully
              selected advertising.
            </p>
            <p className="text-[16px] leading-7 text-muted-foreground">
              All advertising is clearly labeled. We do not accept sponsored
              editorial, and we do not sell influence, coverage, or access.
            </p>
          </Section>

          {/* 4 — Sources and attribution */}
          <Section
            id="sources-and-attribution"
            eyebrow="Sources and attribution"
            heading="Sources and attribution"
          >
            <p className="text-[16px] leading-7 text-muted-foreground">
              We credit our sources, link to primary documents, and name the
              people we interview unless there is a documented safety reason
              not to.
            </p>
            <p className="text-[16px] leading-7 text-muted-foreground">
              We do not fabricate, misrepresent, or paraphrase without
              attribution.
            </p>
          </Section>

          {/* 5 — Corrections */}
          <Section
            id="corrections"
            eyebrow="Corrections"
            heading="Corrections"
          >
            <p className="text-[16px] leading-7 text-muted-foreground">
              We publish corrections prominently and transparently. When we
              make material changes, we add an editor&rsquo;s note to the
              article.
            </p>
            <p className="text-[16px] leading-7 text-muted-foreground">
              We never silently edit or delete published work.
            </p>
          </Section>

          {/* 6 — Use of AI in our work */}
          <Section
            id="use-of-ai-in-our-work"
            eyebrow="Use of AI in our work"
            heading="Use of AI in our work"
          >
            <p className="text-[16px] leading-7 text-muted-foreground">
              We may use AI tools for research assistance, transcription, and
              translation.
            </p>
            <p className="text-[16px] leading-7 text-muted-foreground">
              Every published sentence is written, reviewed, and approved by a
              human editor.
            </p>
            <p className="text-[16px] leading-7 text-muted-foreground">
              AI is never credited as an author.
            </p>
          </Section>

          {/* 7 — Sponsored content */}
          <Section
            id="sponsored-content"
            eyebrow="Sponsored content"
            heading="Sponsored content"
          >
            <p className="text-[16px] leading-7 text-muted-foreground">
              Any sponsored or partner content is labeled at the top of the
              page, uses a distinct visual treatment, and is written or
              reviewed by our editorial team.
            </p>
          </Section>

          {/* 8 — Reader data */}
          <Section
            id="reader-data"
            eyebrow="Reader data"
            heading="Reader data"
          >
            <p className="text-[16px] leading-7 text-muted-foreground">
              We do not sell reader data. For more details, see our{" "}
              <a
                href="/privacy"
                className="text-foreground underline decoration-border underline-offset-4 transition-colors hover:text-primary hover:decoration-primary/60"
              >
                Privacy page
              </a>
              .
            </p>
          </Section>

          {/* 9 — Complaints and accountability */}
          <Section
            id="complaints-and-accountability"
            eyebrow="Complaints and accountability"
            heading="Complaints and accountability"
          >
            <p className="text-[16px] leading-7 text-muted-foreground">
              Readers can raise concerns by emailing{" "}
              <a
                href="mailto:ethics@alentah.com"
                className="text-foreground underline decoration-border underline-offset-4 transition-colors hover:text-primary hover:decoration-primary/60"
              >
                ethics@alentah.com
              </a>
              . We investigate all legitimate concerns and, where appropriate,
              publish our response.
            </p>
            <p className="text-[16px] leading-7 text-muted-foreground">
              Accountability matters, and we take it seriously.
            </p>
          </Section>

          {/* 10 — Contact us */}
          <Section
            id="contact-us"
            eyebrow="Contact us"
            heading="Contact us"
            last
          >
            <p className="text-[16px] leading-7 text-muted-foreground">
              For questions about our ethics, please contact us at{" "}
              <a
                href="mailto:ethics@alentah.com"
                className="text-foreground underline decoration-border underline-offset-4 transition-colors hover:text-primary hover:decoration-primary/60"
              >
                ethics@alentah.com
              </a>
              .
            </p>
          </Section>
        </article>
      </div>

      {/* CLOSING STRIP */}
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
            We would rather lose a story than lose our readers&rsquo; trust.
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
// SECTION — eyebrow dot + serif heading + body
// ============================================================

function Section({
  id,
  eyebrow,
  heading,
  last,
  children,
}: {
  id: string;
  eyebrow: string;
  heading: string;
  last?: boolean;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-heading`}
      className={last ? "scroll-mt-24" : "scroll-mt-24 mb-16 sm:mb-20"}
    >
      <div className="flex items-center gap-2.5">
        <span
          aria-hidden="true"
          className="block size-1.5 rounded-full bg-primary"
        />
        <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-primary">
          {eyebrow}
        </p>
      </div>

      <h2
        id={`${id}-heading`}
        className="mt-4 font-serif text-3xl font-semibold leading-tight tracking-tight text-foreground sm:text-4xl"
      >
        {heading}
      </h2>

      <div className="mt-5 space-y-4">{children}</div>
    </section>
  );
}