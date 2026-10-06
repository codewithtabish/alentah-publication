// src/app/page.tsx
// ============================================================
// Homepage — ALENTAH
// ============================================================

import { Suspense } from "react";
import type { Metadata } from "next";

import { HomeSection } from "@/components/site/pages/home/home-section";
import { HomeScreenSkeleton } from "@/components/site/pages/home/home-screen";
import FromTheEditor from "@/components/site/pages/home/from-the-editor";

// ============================================================
// METADATA
// ============================================================
// The layout already provides metadataBase, canonical "/", OG
// and Twitter cards, and the "%s | Alentah" title template.
// Here we override title, description, siteName, and OG image
// so search results and social previews reflect the homepage.

export const metadata: Metadata = {
  title: "Alentah — Slow Journalism for Curious Minds",
  description:
    "Slow journalism for curious minds. Independent editorial coverage of technology, business, culture, and more — one story at a time.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: "/",
    siteName: "Alentah",
    title: "Alentah — Slow Journalism for Curious Minds",
    description:
      "Slow journalism for curious minds. Independent editorial coverage of technology, business, culture, and more — one story at a time.",
    locale: "en_US",
    images: [
      {
        url: "/seo/og-image.png",
        width: 1200,
        height: 630,
        alt: "Alentah — Slow Journalism for Curious Minds",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@alentah",
    creator: "@alentah",
    title: "Alentah — Slow Journalism for Curious Minds",
    description:
      "Slow journalism for curious minds. Independent editorial coverage of technology, business, culture, and more — one story at a time.",
    images: ["/seo/og-image.png"],
  },
};

// ============================================================
// PAGE
// ============================================================

export default function HomePage() {
  return (
    <>
      {/* Main homepage grid — hero, trending, cards, latest, picks */}
      <Suspense fallback={<HomeScreenSkeleton />}>
        <HomeSection />
      </Suspense>

      {/* Editorial letter — streams in after the main grid */}
      <Suspense fallback={null}>
        <FromTheEditor />
      </Suspense>
    </>
  );
}