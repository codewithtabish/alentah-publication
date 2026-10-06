// src/app/(site)/privacy/page.tsx
// ============================================================
// Privacy — ALENTAH
// Server component. Owns SEO metadata + JSON-LD structured data.
// The scroll-spy TOC lives in PrivacySidebar (client).
// The back button is the shared BackButton.
// ============================================================

import Link from "next/link";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { PrivacySidebar } from "@/components/site/privacy/privacy-sidebar";
import { BackButton } from "@/components/site/general/backs/back-button";


// ============================================================
// SEO METADATA
// ============================================================

const SITE_URL = "https://www.alentah.com";

export const metadata: Metadata = {
  title: "Privacy Policy — Alentah",
  description:
    "Your data, in plain English. What Alentah collects, how we use it, who sees it, your rights, and how to delete it. We never sell your data and we don't use ad network tracking.",
  keywords: [
    "privacy policy",
    "Alentah privacy",
    "data protection",
    "GDPR privacy",
    "reader privacy",
    "data rights",
    "cookies policy",
    "analytics privacy",
    "how to delete data",
    "no ad tracking",
    "reader data policy",
  ],
  alternates: {
    canonical: "/privacy",
  },
  openGraph: {
    type: "website",
    url: "/privacy",
    siteName: "Alentah",
    title: "Privacy Policy — Alentah",
    description:
      "What Alentah collects, how we use it, and how to delete it. We never sell your data.",
    images: [
      {
        url: "/seo/og-image.png",
        width: 1200,
        height: 630,
        alt: "Privacy Policy — Alentah",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Privacy Policy — Alentah",
    description:
      "What Alentah collects, how we use it, and how to delete it. We never sell your data.",
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
      name: "Privacy",
      item: `${SITE_URL}/privacy`,
    },
  ],
};

const webPageJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Privacy Policy — Alentah",
  url: `${SITE_URL}/privacy`,
  description:
    "What Alentah collects, how we use it, who sees it, your rights, and how to delete it.",
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
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "Privacy",
      email: "privacy@alentah.com",
    },
  },
};

// ============================================================
// DATA
// ============================================================

const SECTIONS = [
  { id: "what-we-collect", label: "What we collect" },
  { id: "how-we-use-it", label: "How we use it" },
  { id: "cookies-and-analytics", label: "Cookies and analytics" },
  { id: "what-we-never-do", label: "What we never do" },
  { id: "who-sees-your-data", label: "Who sees your data" },
  { id: "your-rights", label: "Your rights" },
  { id: "how-to-delete-it", label: "How to delete it" },
  { id: "changes-to-this-policy", label: "Changes to this policy" },
  { id: "contact-us", label: "Contact us" },
];

// ============================================================
// PAGE
// ============================================================

export default function PrivacyPage() {
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
        aria-labelledby="privacy-heading"
        className="pt-10 sm:pt-12 lg:pt-14"
      >
        <div aria-hidden="true" className="h-px w-full bg-border" />

        <div className="pt-14 sm:pt-16 lg:pt-20">
          <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-primary">
            Privacy at Alentah
          </p>

          <h1
            id="privacy-heading"
            className="mt-6 max-w-3xl font-serif text-5xl font-bold leading-[1.05] tracking-[-0.03em] text-foreground sm:text-6xl lg:text-7xl xl:text-[5rem]"
          >
            Your data, in
            <br className="hidden sm:block" /> plain English.
          </h1>

          <p className="mt-8 max-w-2xl font-serif text-lg italic leading-relaxed text-muted-foreground sm:text-xl">
            We collect the minimum we need to run the publication. We never
            sell your data. Here is exactly what we do — and how to reach us
            if you want it deleted.
          </p>

          <p className="mt-6 text-[12px] text-muted-foreground">
            Last updated: 5 October 2026
          </p>
        </div>
      </section>

      {/* SIDEBAR + BODY */}
      <div className="mt-16 grid grid-cols-1 gap-12 lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-16 xl:gap-20">
        {/* STICKY TOC — client component */}
        <PrivacySidebar sections={SECTIONS} />

        {/* BODY */}
        <article className="min-w-0">
          {/* 1 — What we collect */}
          <Section
            id="what-we-collect"
            eyebrow="What we collect"
            heading="What we collect"
          >
            <p className="text-[16px] leading-7 text-muted-foreground">
              Your email address if you subscribe to our newsletter.
              <br />
              Your name if you leave a comment.
              <br />
              Anonymized analytics about what you read (no personal
              identifiers).
              <br />
              Nothing else. We don&rsquo;t collect your location, phone number,
              or payment details.
            </p>
          </Section>

          {/* 2 — How we use it */}
          <Section
            id="how-we-use-it"
            eyebrow="How we use it"
            heading="How we use it"
          >
            <p className="text-[16px] leading-7 text-muted-foreground">
              We use your email address to send our newsletter and important
              updates about the publication.
            </p>
            <p className="text-[16px] leading-7 text-muted-foreground">
              We use your name and comment history to moderate conversations
              and keep them constructive and respectful.
            </p>
            <p className="text-[16px] leading-7 text-muted-foreground">
              We use anonymized analytics to understand what gets read, so we
              can write better and improve the experience. We do not use your
              data for third-party ad targeting or sell it to anyone.
            </p>
          </Section>

          {/* 3 — Cookies and analytics */}
          <Section
            id="cookies-and-analytics"
            eyebrow="Cookies and analytics"
            heading="Cookies and analytics"
          >
            <p className="text-[16px] leading-7 text-muted-foreground">
              We use a single analytics tool (Plausible) to understand how the
              site is used. We do not use ad network tracking pixels or other
              third-party trackers.
            </p>
            <p className="text-[16px] leading-7 text-muted-foreground">
              <a
                href="https://plausible.io/data-policy"
                target="_blank"
                rel="noopener noreferrer"
                className="underline decoration-border underline-offset-4 transition-colors hover:text-foreground hover:decoration-primary/60"
              >
                You can disable analytics in your browser at any time.
              </a>
            </p>
          </Section>

          {/* 4 — What we never do */}
          <Section
            id="what-we-never-do"
            eyebrow="What we never do"
            heading="What we never do"
          >
            <p className="text-[16px] leading-7 text-muted-foreground">
              We never sell your data. We don&rsquo;t use ad networks that
              track you across the web. We don&rsquo;t embed hidden pixels or
              other tracking technology. We don&rsquo;t use dark patterns or
              trick you into sharing more than you intend to.
            </p>
          </Section>

          {/* 5 — Who sees your data */}
          <Section
            id="who-sees-your-data"
            eyebrow="Who sees your data"
            heading="Who sees your data"
          >
            <p className="text-[16px] leading-7 text-muted-foreground">
              Your data is stored with a single email provider (Resend) for
              our newsletter. Our analytics are self-hosted and managed by us.
              No other party has access to your data.
            </p>
          </Section>

          {/* 6 — Your rights */}
          <Section
            id="your-rights"
            eyebrow="Your rights"
            heading="Your rights"
          >
            <p className="text-[16px] leading-7 text-muted-foreground">
              You have the right to access your data, correct it if it&rsquo;s
              inaccurate, delete it when you no longer want us to keep it, and
              request a portable copy.
            </p>
          </Section>

          {/* 7 — How to delete it */}
          <Section
            id="how-to-delete-it"
            eyebrow="How to delete it"
            heading="How to delete it"
          >
            <p className="text-[16px] leading-7 text-muted-foreground">
              If you&rsquo;d like us to delete your data, just send an email
              to{" "}
              <a
                href="mailto:privacy@alentah.com"
                className="text-foreground underline decoration-border underline-offset-4 transition-colors hover:text-primary hover:decoration-primary/60"
              >
                privacy@alentah.com
              </a>{" "}
              and we&rsquo;ll take care of it within a reasonable time.
            </p>
          </Section>

          {/* 8 — Changes to this policy */}
          <Section
            id="changes-to-this-policy"
            eyebrow="Changes to this policy"
            heading="Changes to this policy"
          >
            <p className="text-[16px] leading-7 text-muted-foreground">
              We may update this policy from time to time. If we make
              significant changes, we&rsquo;ll let you know by email or post a
              notice on the site.
            </p>
          </Section>

          {/* 9 — Contact us */}
          <Section
            id="contact-us"
            eyebrow="Contact us"
            heading="Contact us"
            last
          >
            <p className="text-[16px] leading-7 text-muted-foreground">
              If you have any questions about this policy or your data, please
              email us at{" "}
              <a
                href="mailto:privacy@alentah.com"
                className="text-foreground underline decoration-border underline-offset-4 transition-colors hover:text-primary hover:decoration-primary/60"
              >
                privacy@alentah.com
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
            We write about technology for a living. Of course we take this
            seriously.
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