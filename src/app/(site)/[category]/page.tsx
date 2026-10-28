// src/app/(site)/[category]/page.tsx
// ============================================================
// Category Page — ALENTAH
// URL: /[category]
// ============================================================

import { Suspense } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { cn } from "@/lib/utils";
import { CategoryHero } from "@/components/site/pages/category/category-hero";
import { CategoryBody } from "@/components/site/pages/category/category-body";
import { CategoryPageSkeleton } from "@/components/site/pages/category/category-skeleton";
import { getCategoryBySlug } from "@/actions/category/get-category-by-slug";
import {
  ADS_ENABLED,
  Banner300x250,
  Banner728x90,
  NativeAd,
} from "@/components/site/general/ads/site-ads";

// ============================================================
// TYPES
// ============================================================

type PageParams = {
  category: string;
};

type PageProps = {
  params: Promise<PageParams>;
};

// ============================================================
// SITE CONSTANT
// ============================================================

const SITE_URL = "https://www.alentah.com";

// ============================================================
// AD SLOT — no background, no border, label only
// ============================================================

function AdSlot({
  children,
  className,
  label = "Advertisement",
}: {
  children: React.ReactNode;
  className?: string;
  label?: string;
}) {
  if (!ADS_ENABLED) return null;

  return (
    <div className="mx-auto w-full max-w-[1600px] px-4 sm:px-6 lg:px-8">
      <aside
        aria-label={label}
        className={cn("flex w-full min-w-0 flex-col items-center", className)}
      >
        <span className="mb-1.5 text-[9px] font-medium uppercase tracking-[0.22em] text-muted-foreground/60">
          {label}
        </span>
        <div className="flex max-w-full justify-center overflow-hidden">
          {children}
        </div>
      </aside>
    </div>
  );
}

// ============================================================
// HERO AD — sits on the empty right side of the hero (lg+)
// ============================================================

function HeroAd() {
  if (!ADS_ENABLED) return null;

  return (
    <div className="pointer-events-none absolute inset-0 hidden lg:block">
      <div className="mx-auto flex h-full w-full max-w-[1600px] items-center justify-end px-8">
        <aside
          aria-label="Advertisement"
          className="pointer-events-auto flex flex-col items-center"
        >
          <span className="mb-1.5 text-[9px] font-medium uppercase tracking-[0.22em] text-muted-foreground/60">
            Advertisement
          </span>
          <Banner300x250 />
        </aside>
      </div>
    </div>
  );
}

// ============================================================
// METADATA
// ============================================================

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { category } = await params;
  const decoded = decodeURIComponent(category);

  const result = await getCategoryBySlug(decoded);

  if (!result.success) {
    return {
      title: "Category not found",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const cat = result.category;

  const title = `${cat.name} — Articles & Analysis`;
  const description =
    cat.description ??
    `Long-form ${cat.name.toLowerCase()} writing from Alentah — slow journalism for curious minds. ${cat.blogCount} ${
      cat.blogCount === 1 ? "article" : "articles"
    } and counting.`;

  // FIX: Use full absolute URL for canonical
  const canonicalUrl = `${SITE_URL}/${cat.slug}`;

  return {
    title,
    description,

    keywords: [
      cat.name,
      `${cat.name} articles`,
      `${cat.name} news`,
      `${cat.name} analysis`,
      `${cat.name} long reads`,
      "Alentah",
      "slow journalism",
      "editorial magazine",
      ...cat.subcategories.map((s) => s.name),
    ],

    alternates: {
      canonical: canonicalUrl,
    },

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
      url: canonicalUrl,
      siteName: "Alentah",
      title: `${cat.name} — Alentah`,
      description,
      images: [
        {
          url: cat.coverImage ?? `${SITE_URL}/seo/og-image.png`,
          width: 1200,
          height: 630,
          alt: `${cat.name} on Alentah`,
        },
      ],
    },

    twitter: {
      card: "summary_large_image",
      site: "@alentah",
      title: `${cat.name} — Alentah`,
      description,
      images: [cat.coverImage ?? `${SITE_URL}/seo/og-image.png`],
    },
  };
}

// ============================================================
// PAGE
// ============================================================

export default function CategoryPage({ params }: PageProps) {
  return (
    <Suspense fallback={<CategoryPageSkeleton />}>
      <CategoryContent params={params} />
    </Suspense>
  );
}

// ============================================================
// CONTENT
// ============================================================

async function CategoryContent({
  params,
}: {
  params: Promise<PageParams>;
}) {
  const { category } = await params;
  const decodedSlug = decodeURIComponent(category);

  const result = await getCategoryBySlug(decodedSlug);

  if (!result.success) {
    notFound();
  }

  const cat = result.category;

  // ─── Structured Data ───

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
        name: cat.name,
        item: `${SITE_URL}/${cat.slug}`,
      },
    ],
  };

  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${cat.name} — Alentah`,
    url: `${SITE_URL}/${cat.slug}`,
    description:
      cat.description ??
      `Long-form ${cat.name.toLowerCase()} writing from Alentah.`,
    inLanguage: "en",
    isPartOf: {
      "@type": "WebSite",
      name: "Alentah",
      url: SITE_URL,
    },
    publisher: {
      "@type": "Organization",
      name: "Alentah",
      url: SITE_URL,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/seo/icon-512.png`,
      },
    },
    ...(cat.editor
      ? {
          editor: {
            "@type": "Person",
            name: cat.editor.name,
            ...(cat.editor.imageUrl && { image: cat.editor.imageUrl }),
          },
        }
      : {}),
    ...(cat.blogs.length > 0 && {
      mainEntity: {
        "@type": "ItemList",
        numberOfItems: cat.blogs.length,
        itemListElement: cat.blogs.slice(0, 10).map((blog, index) => ({
          "@type": "ListItem",
          position: index + 1,
          url: blog.subcategory
            ? `${SITE_URL}/${cat.slug}/${blog.subcategory.slug}/${blog.slug}`
            : `${SITE_URL}/${cat.slug}/${blog.slug}`,
          name: blog.title,
        })),
      },
    }),
  };

  return (
    <main className="w-full space-y-8 overflow-x-hidden sm:space-y-10 lg:space-y-14">
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
          __html: JSON.stringify(collectionJsonLd),
        }}
      />

      {/* HERO + AD on the right side (lg+) */}
      <div className="relative">
        {/* editor={null} hides the "Edited by" card */}
        <CategoryHero
          name={cat.name}
          description={cat.description}
          blogCount={cat.blogCount}
          editor={null}
        />
        <HeroAd />
      </div>

      {/* AD 1 — after hero: 728x90 on md+ */}
      <AdSlot className="hidden md:flex" label="Advertisement">
        <Banner728x90 />
      </AdSlot>

      {/* AD 1 — after hero: 300x250 on mobile */}
      <AdSlot className="md:hidden" label="Advertisement">
        <Banner300x250 />
      </AdSlot>

      <CategoryBody
        categorySlug={cat.slug}
        subcategories={cat.subcategories}
        blogs={cat.blogs}
      />

      {/* AD 2 — native after the article grid */}
      <AdSlot className="mx-auto max-w-4xl" label="Sponsored">
        <NativeAd />
      </AdSlot>

      {/* AD 3 — bottom: 728x90 on md+ */}
      <AdSlot className="hidden md:flex" label="Advertisement">
        <Banner728x90 />
      </AdSlot>

      {/* AD 3 — bottom: 300x250 on mobile */}
      <AdSlot className="pb-4 md:hidden" label="Advertisement">
        <Banner300x250 />
      </AdSlot>
    </main>
  );
}