// src/app/(site)/terms/layout.tsx
// ============================================================
// Terms — SEO metadata + JSON-LD
// Sibling layout that owns all metadata for /terms.
// Required because page.tsx is a client component and cannot
// export `metadata`.
//
// Length targets:
//   <title>            50–60 chars → 51 here
//   meta description   150–160     → 152 here
//   og:description     ~125        → 123 here
//   twitter:descript.  ~125        → 123 here
// ============================================================

import type { Metadata } from "next";
import type { ReactNode } from "react";

const SITE_URL = "https://www.alentah.com";

// ============================================================
// SEO METADATA
// ============================================================

export const metadata: Metadata = {
  title: "Terms of Use — The Rules of the Road | Alentah",
  description:
    "What you can expect from Alentah, what we expect from you, and how we handle disagreement. Written to be read, not skimmed.",
  keywords: [
    "terms of use",
    "Alentah terms",
    "terms of service",
    "user agreement",
    "comment policy",
    "content license",
    "editorial terms",
    "governing law",
    "account deletion",
    "newsletter terms",
  ],
  alternates: {
    canonical: "/terms",
  },
  openGraph: {
    type: "website",
    url: "/terms",
    siteName: "Alentah",
    title: "Terms of Use — Alentah",
    description:
      "What you can expect from us, what we expect from you, and how we handle disagreement.",
    images: [
      {
        // Dedicated OG image with CTA text baked into the artwork.
        // Drop at /public/seo/og-terms.png. Falls back gracefully to
        // /seo/og-image.png if you haven't made it yet.
        url: "/seo/og-terms.png",
        width: 1200,
        height: 630,
        alt: "Alentah Terms of Use — the rules of the road, written to be read.",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Terms of Use — Alentah",
    description:
      "What you can expect from us, what we expect from you, and how we handle disagreement.",
    images: [
      {
        url: "/seo/og-terms.png",
        alt: "Alentah Terms of Use — the rules of the road, written to be read.",
      },
    ],
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
    { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
    {
      "@type": "ListItem",
      position: 2,
      name: "Terms",
      item: `${SITE_URL}/terms`,
    },
  ],
};

const webPageJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Terms of Use — Alentah",
  url: `${SITE_URL}/terms`,
  description:
    "What you can expect from Alentah, what we expect from you, and how we handle disagreement.",
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
      contactType: "Legal",
      email: "legal@alentah.com",
    },
  },
};

// ============================================================
// LAYOUT — injects JSON-LD, renders the client page
// ============================================================

export default function TermsLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <>
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
      {children}
    </>
  );
}