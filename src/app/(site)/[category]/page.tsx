// src/app/(site)/[category]/page.tsx
// ============================================================
// Category Page — ALENTAH
// URL: /[category]
//
// Renders the category hero, its editor, and the interactive
// body (subcategory filter + featured article + responsive
// article grid).
//
// SEO:
//   - Rich metadata via generateMetadata (per category)
//   - BreadcrumbList JSON-LD
//   - CollectionPage JSON-LD
//   - Canonical + OG + Twitter
//   - robots: index, follow (public content)
//
// Cache invalidation is handled by `revalidateCategory` and
// `revalidateBlog` from src/lib/cache-keys.ts.
// ============================================================

import { Suspense } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { CategoryHero } from "@/components/site/pages/category/category-hero";
import { CategoryBody } from "@/components/site/pages/category/category-body";
import { CategoryPageSkeleton } from "@/components/site/pages/category/category-skeleton";
import { getCategoryBySlug } from "@/actions/category/get-category-by-slug";

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

  const canonicalUrl = `/${cat.slug}`;

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
          url: cat.coverImage ?? "/seo/og-image.png",
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
      images: [cat.coverImage ?? "/seo/og-image.png"],
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
          __html: JSON.stringify(collectionJsonLd),
        }}
      />

      <CategoryHero
        name={cat.name}
        description={cat.description}
        blogCount={cat.blogCount}
        editor={cat.editor}
      />

      <CategoryBody
        categorySlug={cat.slug}
        subcategories={cat.subcategories}
        blogs={cat.blogs}
      />
    </main>
  );
}