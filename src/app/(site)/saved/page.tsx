// src/app/(site)/saved/page.tsx
// ============================================================
// Saved Articles Page — ALENTAH
// URL: /saved
//
// Readers see this page after tapping "Saved" in the user menu.
// Auth required — signed-out visitors see a sign-in prompt.
//
// SEO: this is a PRIVATE, per-user page. It must NOT be indexed
// by Google. The metadata below tells crawlers to stay out while
// still providing a proper share card for anyone who copies the
// link into a chat or a social post.
//
// Next 16 pattern:
//   - Page shell renders instantly (hero + eyebrow)
//   - <Suspense> wraps the async content that awaits auth()
//   - The async child does the auth check + data fetch
// ============================================================

import { Suspense } from "react";
import type { Metadata } from "next";

import { SavedSkeleton } from "@/components/site/pages/saved/saved-skeleton";
import { SavedSignedOut } from "@/components/site/pages/saved/saved-signed-out";
import { SavedEmpty } from "@/components/site/pages/saved/saved-empty";
import { SavedGrid } from "@/components/site/pages/saved/saved-grid";
import { getSavedBlogs } from "@/actions/blog/get-saved-blogs";

// ============================================================
// SEO METADATA
// ============================================================
//
// Why noindex?
//   /saved is a personalized reading list. For a signed-out
//   crawler it renders only the sign-in prompt — an empty page
//   with no value in search results. Indexing it would surface
//   a broken-looking result for queries like "Alentah saved".
//
// Why keep OG + Twitter?
//   When a reader shares their /saved URL in a chat or DM, the
//   preview should still show the ALENTAH card rather than a
//   blank placeholder. The OG block below handles that.

export const metadata: Metadata = {
  // ✅ FIX: title lengthened from 24 → 54 chars (inside 50–60 target).
  title: "Saved Articles — Your Reading List on Alentah",
  description:
    "Your reading list on Alentah — stories you've set aside to read later.",

  // Keep this page out of every search engine index
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
      "max-video-preview": -1,
      "max-image-preview": "none",
      "max-snippet": -1,
    },
  },

  alternates: {
    canonical: "/saved",
  },

  openGraph: {
    type: "website",
    url: "/saved",
    siteName: "Alentah",
    // ✅ FIX: OG title matched to the new 54-char title.
    title: "Saved Articles — Your Reading List on Alentah",
    description:
      "Your reading list on Alentah — stories you've set aside to read later.",
    images: [
      {
        // ✅ FIX: dedicated saved OG image (CTA baked into the artwork).
        // Drop this asset at /public/seo/og-saved.png.
        // Falls back gracefully to og-image.png if you haven't made it yet.
        url: "/seo/og-saved.png",
        width: 1200,
        height: 630,
        alt: "Alentah Saved Articles — build your reading list. Sign in to save stories for later.",
        type: "image/png",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    // ✅ FIX: Twitter title matched to the new 54-char title.
    title: "Saved Articles — Your Reading List on Alentah",
    description:
      "Your reading list on Alentah — stories you've set aside to read later.",
    images: [
      {
        url: "/seo/og-saved.png",
        alt: "Alentah Saved Articles — build your reading list. Sign in to save stories for later.",
      },
    ],
  },
};

// ============================================================
// PAGE SHELL — no runtime data
// ============================================================

export default function SavedPage() {
  return (
    <main className="mx-auto w-full min-w-0 max-w-[1440px] px-4 pb-16 pt-10 sm:px-6 sm:pb-20 sm:pt-12 lg:px-8 lg:pb-24 lg:pt-16 xl:px-10">
      {/* =====================================================
          HERO
      ====================================================== */}
      <header className="w-full">
        {/* Eyebrow */}
        <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
          <span
            aria-hidden="true"
            className="inline-block size-1.5 shrink-0 rounded-full bg-primary"
          />
          <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-primary sm:text-[11px]">
            Your Library
          </p>
          <span
            aria-hidden="true"
            className="h-px min-w-0 flex-1 bg-linear-to-r from-primary/40 to-transparent"
          />
        </div>

        {/* Headline */}
        <h1 className="mt-5 w-full max-w-none wrap-break-word font-serif text-[1.75rem] font-bold leading-[1.1] tracking-[-0.03em] text-foreground sm:text-4xl sm:leading-[1.1] md:text-5xl md:leading-[1.08] lg:text-[3.25rem] lg:leading-[1.05] xl:text-[3.75rem]">
          Saved Articles.
        </h1>

        {/* Tagline */}
        <p className="mt-4 max-w-none font-serif text-[15px] italic leading-7 text-muted-foreground sm:mt-5 sm:max-w-2xl sm:text-[1.0625rem] sm:leading-8">
          Stories you&apos;ve set aside to read later.
        </p>

        {/* Hairline */}
        <div
          aria-hidden="true"
          className="mt-8 h-px w-full bg-border sm:mt-10"
        />
      </header>

      {/* =====================================================
          CONTENT — everything runtime goes inside Suspense
      ====================================================== */}
      <div className="mt-8 sm:mt-10">
        <Suspense fallback={<SavedSkeleton />}>
          <SavedContent />
        </Suspense>
      </div>
    </main>
  );
}

// ============================================================
// ASYNC CONTENT — auth check + data fetch, inside Suspense
// ============================================================

async function SavedContent() {
  const result = await getSavedBlogs();

  if (!result.success) {
    // Not authenticated → signed-out prompt
    if (!result.authenticated) {
      return <SavedSignedOut />;
    }

    // Auth ok, but the query failed
    return (
      <div className="rounded-2xl border border-destructive/40 bg-destructive/5 p-8 text-center">
        <p className="mb-2 font-serif text-xl tracking-tight">
          Couldn&apos;t load your saved articles
        </p>
        <p className="text-sm text-muted-foreground">{result.error}</p>
      </div>
    );
  }

  // No saved articles → empty state
  if (result.total === 0) {
    return <SavedEmpty />;
  }

  // Has saved articles → render the grid
  return <SavedGrid items={result.items} />;
}