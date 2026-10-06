// src/app/(site)/cookies/page.tsx
// ============================================================
// Cookies — ALENTAH
// Server component. Owns SEO metadata + JSON-LD structured data.
// The scroll-spy TOC lives in a small client component
// (CookiesSidebar); the back button is the shared BackButton.
// ============================================================

import type { Metadata } from "next";
import type { ReactNode } from "react";

import { CookiesSidebar } from "@/components/site/pages/cookies/cookies-sidebar";
import { BackButton } from "@/components/site/general/backs/back-button";

// ============================================================
// SEO METADATA
// ============================================================

const SITE_URL = "https://www.alentah.com";

const SHORT_DESCRIPTION =
  "Which cookies we use, what they do, and how to turn them off. No ad network cookies. No cross-site tracking.";

export const metadata: Metadata = {
  title: "Cookies Policy — Alentah",
  description: SHORT_DESCRIPTION,
  keywords: [
    "cookie policy",
    "Alentah cookies",
    "cookie consent",
    "privacy policy",
    "third-party cookies",
    "strictly necessary cookies",
    "analytics cookies",
    "disable cookies",
    "browser cookies",
    "GDPR cookies",
    "how to block cookies",
  ],
  alternates: {
    canonical: "/cookies",
  },
  openGraph: {
    type: "website",
    url: "/cookies",
    siteName: "Alentah",
    title: "Cookies Policy — Alentah",
    description: SHORT_DESCRIPTION,
    images: [
      {
        url: "/seo/og-image.png",
        width: 1200,
        height: 630,
        alt: "Cookies Policy — Alentah",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Cookies Policy — Alentah",
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
      name: "Cookies",
      item: `${SITE_URL}/cookies`,
    },
  ],
};

const webPageJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Cookies Policy — Alentah",
  url: `${SITE_URL}/cookies`,
  description:
    "Alentah uses a minimal set of cookies. Read exactly which ones, what they do, and how to turn them off.",
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
  { id: "what-cookies-are", label: "What cookies are" },
  { id: "how-we-use-them", label: "How we use them" },
  { id: "strictly-necessary", label: "Strictly necessary" },
  { id: "analytics", label: "Analytics" },
  { id: "your-preferences", label: "Your preferences" },
  { id: "third-party-cookies", label: "Third-party cookies" },
  { id: "how-to-disable-them", label: "How to disable them" },
  { id: "changes-to-this-policy", label: "Changes to this policy" },
  { id: "contact-us", label: "Contact us" },
];

const COOKIE_TABLE = [
  {
    name: "session",
    purpose: "Keeps you logged in during your visit.",
  },
  {
    name: "csrf_token",
    purpose: "Helps protect against cross-site request forgery.",
  },
  {
    name: "theme_preference",
    purpose: "Remembers your light or dark mode choice.",
  },
];

const BROWSER_STEPS = [
  {
    browser: "Chrome",
    steps: "Settings → Privacy and security → Cookies and other site data.",
  },
  {
    browser: "Safari",
    steps: "Settings → Privacy → Manage Website Data.",
  },
  {
    browser: "Firefox",
    steps: "Settings → Privacy & Security → Cookies and Site Data.",
  },
  {
    browser: "Edge",
    steps: "Settings → Privacy, search and services → Cookies and site permissions.",
  },
];

// ============================================================
// PAGE
// ============================================================

export default function CookiesPage() {
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
        aria-labelledby="cookies-heading"
        className="pt-10 sm:pt-12 lg:pt-14"
      >
        <div aria-hidden="true" className="h-px w-full bg-border" />

        <div className="pt-14 sm:pt-16 lg:pt-20">
          <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-primary">
            Cookies at Alentah
          </p>

          <h1
            id="cookies-heading"
            className="mt-6 max-w-3xl font-serif text-5xl font-bold leading-[1.05] tracking-[-0.03em] text-foreground sm:text-6xl lg:text-7xl xl:text-[5rem]"
          >
            Small files, clearly explained.
          </h1>

          <p className="mt-8 max-w-2xl font-serif text-lg italic leading-relaxed text-muted-foreground sm:text-xl">
            We use as few cookies as possible. Here is exactly which ones,
            what they do, and how to turn them off if you want to.
          </p>

          <p className="mt-6 text-[12px] text-muted-foreground">
            Last updated: 5 October 2026
          </p>
        </div>
      </section>

      {/* SIDEBAR + BODY */}
      <div className="mt-16 grid grid-cols-1 gap-12 lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-16 xl:gap-20">
        {/* STICKY TOC — client component */}
        <CookiesSidebar sections={SECTIONS} />

        {/* BODY */}
        <article className="min-w-0">
          <Section
            id="what-cookies-are"
            eyebrow="What cookies are"
            heading="What cookies are"
          >
            <p className="text-[16px] leading-7 text-muted-foreground">
              A cookie is a small text file that a website stores in your
              browser. It lets the site remember things between page loads,
              like your language preference or whether you&rsquo;re logged in.
              It is not a program, and it cannot read other files on your
              computer.
            </p>
          </Section>

          <Section
            id="how-we-use-them"
            eyebrow="How we use them"
            heading="How we use them"
          >
            <p className="text-[16px] leading-7 text-muted-foreground">
              Alentah uses a minimal set of cookies to keep the site working
              smoothly and to improve your experience. We do not use ad
              network cookies, and we do not track readers across other
              websites.
            </p>
          </Section>

          <Section
            id="strictly-necessary"
            eyebrow="Strictly necessary"
            heading="Strictly necessary"
          >
            <p className="text-[16px] leading-7 text-muted-foreground">
              These cookies are essential for the website to function. Without
              them, core features like security, session management and your
              preferences would not work properly.
            </p>

            <div className="mt-6 overflow-x-auto rounded-lg border border-border">
              <table className="w-full min-w-[480px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-border">
                    <th className="px-4 py-3 text-[12px] font-bold uppercase tracking-[0.14em] text-foreground">
                      Cookie
                    </th>
                    <th className="px-4 py-3 text-[12px] font-bold uppercase tracking-[0.14em] text-foreground">
                      Purpose
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {COOKIE_TABLE.map((cookie) => (
                    <tr
                      key={cookie.name}
                      className="border-b border-border last:border-b-0"
                    >
                      <td className="px-4 py-3 font-mono text-[13px] text-foreground">
                        {cookie.name}
                      </td>
                      <td className="px-4 py-3 text-[14px] leading-6 text-muted-foreground">
                        {cookie.purpose}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>

          <Section
            id="analytics"
            eyebrow="Analytics"
            heading="Analytics"
          >
            <p className="text-[16px] leading-7 text-muted-foreground">
              We use a single analytics tool to understand how the site is
              used and to improve our content. It is privacy-friendly and
              self-hosted, does not collect personal identifiers, and stores
              no cross-site data.
            </p>
          </Section>

          <Section
            id="your-preferences"
            eyebrow="Your preferences"
            heading="Your preferences"
          >
            <p className="text-[16px] leading-7 text-muted-foreground">
              On your first visit, you can choose to accept or decline
              analytics. Your choice is stored in a strictly necessary
              cookie, so it won&rsquo;t affect your browsing experience.
            </p>
          </Section>

          <Section
            id="third-party-cookies"
            eyebrow="Third-party cookies"
            heading="Third-party cookies"
          >
            <p className="text-[16px] leading-7 text-muted-foreground">
              Alentah does not embed third-party ad or tracking cookies. If we
              include embedded content (such as a YouTube video), that content
              may set its own cookies. This will be disclosed on the page
              where it appears.
            </p>
          </Section>

          <Section
            id="how-to-disable-them"
            eyebrow="How to disable them"
            heading="How to disable them"
          >
            <p className="text-[16px] leading-7 text-muted-foreground">
              You can block or delete cookies at the browser level. This will
              affect all websites you visit, not just Alentah.
            </p>

            <ul className="mt-6 space-y-3">
              {BROWSER_STEPS.map((item) => (
                <li
                  key={item.browser}
                  className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:gap-3"
                >
                  <span
                    aria-hidden="true"
                    className="mt-2 hidden size-1.5 shrink-0 rounded-full bg-primary sm:block"
                  />
                  <p className="text-[15px] leading-7 text-muted-foreground">
                    <span className="font-semibold text-foreground">
                      {item.browser}:
                    </span>{" "}
                    {item.steps}
                  </p>
                </li>
              ))}
            </ul>
          </Section>

          <Section
            id="changes-to-this-policy"
            eyebrow="Changes to this policy"
            heading="Changes to this policy"
          >
            <p className="text-[16px] leading-7 text-muted-foreground">
              We may update this policy from time to time. If we make
              significant changes, we will let you know on this page.
            </p>
          </Section>

          <Section
            id="contact-us"
            eyebrow="Contact us"
            heading="Contact us"
            last
          >
            <p className="text-[16px] leading-7 text-muted-foreground">
              If you have any questions about this policy, please get in touch
              at{" "}
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
            Fewer cookies, more reading.
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