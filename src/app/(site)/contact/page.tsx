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
import { ArrowRight } from "lucide-react";
import { BackButton } from "@/components/site/general/backs/back-button";
import { ContactForm } from "@/components/site/pages/contact/contact-form";

// ============================================================
// SEO METADATA
// ============================================================

const SITE_URL = "https://www.alentah.com";

const SHORT_DESCRIPTION =
  "Pitches, corrections, partnerships, and press enquiries. We read every message and reply within 5–7 days.";

export const metadata: Metadata = {
  title: "Contact Alentah — Editorial, Corrections & Partnerships",
  description: SHORT_DESCRIPTION,
  keywords: [
    "contact Alentah",
    "Alentah email",
    "editorial contact",
    "pitch to Alentah",
    "corrections",
    "press enquiries",
    "partnerships",
    "media enquiries",
    "Alentah press kit",
    "write for Alentah",
    "Talha Tabish contact",
  ],
  alternates: {
    canonical: "/contact",
  },
  openGraph: {
    type: "website",
    url: "/contact",
    siteName: "Alentah",
    title: "Contact Alentah — Editorial, Corrections & Partnerships",
    description: SHORT_DESCRIPTION,
    images: [
      {
        url: "/seo/og-image.png",
        width: 1200,
        height: 630,
        alt: "Contact Alentah",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact Alentah — Editorial, Corrections & Partnerships",
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
      name: "Contact",
      item: `${SITE_URL}/contact`,
    },
  ],
};

const contactPageJsonLd = {
  "@context": "https://schema.org",
  "@type": "ContactPage",
  name: "Contact Alentah",
  url: `${SITE_URL}/contact`,
  description:
    "Write to the editorial team at Alentah — pitches, corrections, partnerships, and press enquiries.",
  inLanguage: "en",
  mainEntity: {
    "@type": "Organization",
    name: "Alentah",
    url: SITE_URL,
    logo: `${SITE_URL}/seo/icon-512.png`,
    contactPoint: [
      {
        "@type": "ContactPoint",
        contactType: "Editorial",
        email: "hello@alentah.com",
        availableLanguage: ["English", "Urdu", "Pashto"],
      },
      {
        "@type": "ContactPoint",
        contactType: "Corrections",
        email: "corrections@alentah.com",
        availableLanguage: ["English", "Urdu", "Pashto"],
      },
      {
        "@type": "ContactPoint",
        contactType: "Partnerships",
        email: "partners@alentah.com",
        availableLanguage: ["English", "Urdu", "Pashto"],
      },
    ],
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
          __html: JSON.stringify(contactPageJsonLd),
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
                    <p className="select-all font-mono text-xl text-foreground sm:text-2xl">
                      {line.email}
                    </p>

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

          {/* Right — form (client component) */}
          <div className="lg:col-span-7">
            <ContactForm />
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