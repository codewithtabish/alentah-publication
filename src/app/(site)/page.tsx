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
// Here we only override title + description so search results
// and social previews reflect the homepage specifically.

export const metadata: Metadata = {
  title: "Alentah — Slow Journalism for Curious Minds",
  description:
    "An independent editorial publication covering technology, business, finance, lifestyle, culture, travel, health, science, design, art, food, sports, politics, environment, education, and books.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: "/",
    title: "Alentah — Slow Journalism for Curious Minds",
    description:
      "An independent editorial publication covering technology, business, finance, lifestyle, culture, travel, health, science, design, art, food, sports, politics, environment, education, and books.",
    images: [
      {
        url: "/seo/og-image.png",
        width: 1200,
        height: 630,
        alt: "Alentah — Slow Journalism",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Alentah — Slow Journalism for Curious Minds",
    description:
      "An independent editorial publication covering technology, business, finance, lifestyle, culture, travel, health, science, design, art, food, sports, politics, environment, education, and books.",
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