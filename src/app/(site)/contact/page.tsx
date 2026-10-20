// src/app/(site)/contact/page.tsx
// ============================================================
// Contact — ALENTAH
// Server component. Owns SEO metadata + JSON-LD structured data.
// The back button is the shared BackButton client component.
// The contact form is a client component in
//   @/components/site/pages/contact/contact-form
// ============================================================

import Link from "next/link";
import type { Metadata } from "next";
import { BackButton } from "@/components/site/general/backs/back-button";
import { ContactForm } from "@/components/site/pages/contact/contact-form";

// ============================================================
// SEO METADATA
// ============================================================

const SITE_URL = "https://www.alentah.com";
const PAGE_URL = `${SITE_URL}/contact`;
const ORGANIZATION_ID = `${SITE_URL}/#organization`;
const WEBSITE_ID = `${SITE_URL}/#website`;
const OG_IMAGE = `${SITE_URL}/seo/og-image.png`;

const TITLE = "Contact Alentah | Editorial, Corrections & Partnerships";
const DESCRIPTION =
  "Contact the Alentah editorial team for pitches, corrections, partnerships and press enquiries. We read every message and reply within 5–7 days.";

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
        alt: "Contact Alentah",
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
  { number: "01", body: "We read every message." },
  { number: "02", body: "We reply within 5–7 days." },
  { number: "03", body: "We publish corrections, not excuses." },
];

const LANGUAGES = ["English", "Urdu", "Pashto"];

// ============================================================
// STRUCTURED DATA (JSON-LD)
// The Organization uses the same @id as the root layout, so Google
// merges this contact info into the one Organization entity.
// ============================================================

function jsonLd(data: object): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

const contactPageJsonLd = {
  "@context": "https://schema.org",
  "@type": "ContactPage",
  "@id": `${PAGE_URL}#webpage`,
  url: PAGE_URL,
  name: "Contact Alentah",
  description: DESCRIPTION,
  inLanguage: "en",
  isPartOf: { "@id": WEBSITE_ID },
  breadcrumb: { "@id": `${PAGE_URL}#breadcrumb` },
  mainEntity: {
    "@type": "Organization",
    "@id": ORGANIZATION_ID,
    name: "Alentah",
    url: SITE_URL,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Mardan",
      addressRegion: "Khyber Pakhtunkhwa",
      addressCountry: "PK",
    },
    contactPoint: DIRECT_LINES.map((line) => ({
      "@type": "ContactPoint",
      contactType: line.label,
      email: line.email,
      availableLanguage: LANGUAGES,
    })),
  },
};

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "@id": `${PAGE_URL}#breadcrumb`,
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
    { "@type": "ListItem", position: 2, name: "Contact", item: PAGE_URL },
  ],
};

// ============================================================
// PAGE
// ============================================================

export default function ContactPage() {
  return (
    <main className="w-full">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(contactPageJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(breadcrumbJsonLd) }}
      />

      <BackButton />

      {/* HERO */}
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

      {/* DIRECT LINES */}
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
                      className="block select-all break-all font-mono text-lg text-foreground transition-colors hover:text-primary sm:text-2xl"
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

          <p className="mt-8 text-[13px] leading-6 text-muted-foreground">
            Looking for something specific? See our{" "}
            <Link
              href="/ethics"
              className="underline underline-offset-4 hover:text-primary"
            >
              editorial standards and corrections policy
            </Link>
            , our{" "}
            <Link
              href="/advertise"
              className="underline underline-offset-4 hover:text-primary"
            >
              advertising and partnerships
            </Link>{" "}
            page, or{" "}
            <Link
              href="/careers"
              className="underline underline-offset-4 hover:text-primary"
            >
              careers
            </Link>
            .
          </p>
        </div>
      </section>

      {/* CONTACT FORM */}
      <section
        aria-labelledby="contact-form-heading"
        className="mt-20 sm:mt-24"
      >
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-16">
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

          <div className="lg:col-span-7">
            <ContactForm />
          </div>
        </div>
      </section>

      {/* RESPONSE PROMISE */}
      <section aria-labelledby="promise-heading" className="mt-20 sm:mt-24">
        <h2 id="promise-heading" className="sr-only">
          Our response promise
        </h2>

        <div aria-hidden="true" className="h-px w-full bg-border" />

        <ul className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-3 sm:gap-6">
          {PROMISES.map((promise) => (
            <li
              key={promise.number}
              className="flex items-start gap-4 sm:flex-col sm:gap-3"
            >
              <p className="shrink-0 text-[11px] font-bold uppercase tracking-[0.22em] text-primary tabular-nums">
                {promise.number}
              </p>
              <p className="text-[15px] leading-7 text-muted-foreground">
                {promise.body}
              </p>
            </li>
          ))}
        </ul>
      </section>

      {/* WHERE WE WORK */}
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
              shared belief in better journalism. Read more{" "}
              <Link
                href="/about"
                className="underline underline-offset-4 hover:text-primary"
              >
                about us
              </Link>
              .
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
                  <dt className="shrink-0">Based in</dt>
                  <dd className="text-foreground/80">Mardan, KPK, Pakistan</dd>
                </div>
                <div className="flex flex-wrap gap-x-3">
                  <dt className="shrink-0">Responses in</dt>
                  <dd className="text-foreground/80">
                    English, Urdu or Pashto
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </section>

      {/* PRESS & MEDIA */}
      <section
        aria-labelledby="press-heading"
        className="mt-20 sm:mt-24 lg:mt-32"
      >
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-6">
            <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-primary">
              Press
            </p>

            <h2
              id="press-heading"
              className="mt-4 font-serif text-4xl font-semibold leading-tight tracking-tight text-foreground sm:text-5xl"
            >
              Press and media.
            </h2>
          </div>

          <div className="lg:col-span-6">
            <p className="max-w-xl text-[15px] leading-7 text-muted-foreground">
              For media enquiries, interviews, or to request logos and brand
              information, email{" "}
              <a
                href="mailto:partners@alentah.com"
                className="underline underline-offset-4 hover:text-primary"
              >
                partners@alentah.com
              </a>
              . We ask that you credit ALENTAH when using our content.
            </p>
          </div>
        </div>
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