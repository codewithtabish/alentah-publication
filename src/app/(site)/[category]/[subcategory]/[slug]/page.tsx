// src/app/(site)/[category]/[slug]/page.tsx
// ============================================================
// Article Page — two-column reading layout
// URL: /category/slug
//
// Layout:
//   Mobile  → single column, TOC collapses above the article
//   Desktop → [content 1fr] [TOC 280px]  (TOC on the RIGHT)
//
// Padding:
//   Mobile  → px-0 (full-bleed, edge-to-edge)
//   lg+     → px-8 / xl:px-10 (comfortable reading gutters)
//
// SEO:
//   - Rich generateMetadata (title, description, canonical,
//     robots, OG article, Twitter, keywords, authors)
//   - Article / BlogPosting JSON-LD (full schema)
//   - BreadcrumbList JSON-LD (Home > Category > Article)
//   - Publisher + Author entities
// ============================================================

import { Suspense } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { getArticleBySlug } from "@/actions/blog/get-article-by-slug";

import type { TableOfContentsItem } from "@/schemas/blog-schema";
import { ArticlePageSkeleton } from "@/components/site/pages/article/article-page-view";
import BlogHeader from "@/components/site/pages/article/single-blog-header";
import { BlogPreviewer } from "@/components/site/admim/article/artcile-previewer";
import { ArticleTOC } from "@/components/site/pages/article/article-toc";
import { ArticleCommentsSkeleton } from "@/components/site/admim/article/article-comments-skeleton";
import { ArticleCommentsServer } from "@/components/site/admim/article/article-comments-server";
import { ArticleBookmarkServer } from "@/components/site/admim/article/article-bookmark-server";

// ============================================================
// TYPES
// ============================================================

type PageParams = {
  category: string;
  slug: string;
};

type PageProps = {
  params: Promise<PageParams>;
};

// ============================================================
// SITE CONSTANTS
// ============================================================

const SITE_URL = "https://www.alentah.com";
const SITE_NAME = "Alentah";
const PUBLISHER_LOGO = `${SITE_URL}/seo/icon-512.png`;
const FALLBACK_OG_IMAGE = `${SITE_URL}/seo/og-image.png`;

// ============================================================
// HELPERS
// ============================================================

function toAbsoluteUrl(pathOrUrl: string | null | undefined): string {
  if (!pathOrUrl) return FALLBACK_OG_IMAGE;
  if (pathOrUrl.startsWith("http://") || pathOrUrl.startsWith("https://")) {
    return pathOrUrl;
  }
  return `${SITE_URL}${pathOrUrl.startsWith("/") ? "" : "/"}${pathOrUrl}`;
}

function getAuthorName(author: {
  firstName: string | null;
  lastName: string | null;
}): string {
  return (
    [author.firstName, author.lastName].filter(Boolean).join(" ") ||
    "Alentah Editors"
  );
}

function countWords(content: unknown): number {
  if (!content) return 0;
  try {
    const json = JSON.stringify(content);
    const matches = json.match(/"[^"]+"/g);
    if (!matches) return 0;
    const text = matches
      .map((m) => m.replace(/"/g, ""))
      .join(" ")
      .replace(/[{}[\]":,]/g, " ");
    return text.split(/\s+/).filter(Boolean).length;
  } catch {
    return 0;
  }
}

// ============================================================
// METADATA
// ============================================================

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;

  const result = await getArticleBySlug(decodeURIComponent(slug));

  if (!result.success) {
    return {
      title: "Article not found",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const article = result.article;

  const title = article.seo?.metaTitle || article.title;
  const description =
    article.seo?.metaDescription ||
    article.shortDescription ||
    `${article.title} — read on Alentah.`;

  const ogImage = toAbsoluteUrl(
    article.seo?.ogImage || article.bannerImage,
  );
  const twitterImage = toAbsoluteUrl(
    article.seo?.twitterImage ||
      article.seo?.ogImage ||
      article.bannerImage,
  );

  const canonicalPath = `/${article.category.slug}/${
    article.subcategory?.slug ? `${article.subcategory.slug}/` : ""
  }${article.slug}`;
  const canonicalUrl = article.seo?.canonicalUrl || canonicalPath;

  const authorName = getAuthorName(article.author);

  const keywords = [
    article.title,
    article.category.name,
    ...(article.subcategory ? [article.subcategory.name] : []),
    ...article.tags.map((t) => t.name),
    SITE_NAME,
    "slow journalism",
    "editorial",
  ];

  return {
    title,
    description,

    keywords,

    authors: [{ name: authorName, url: SITE_URL }],
    creator: authorName,
    publisher: SITE_NAME,

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
      type: "article",
      url: canonicalUrl,
      siteName: SITE_NAME,
      title,
      description,
      publishedTime: article.publishedAt
        ? new Date(article.publishedAt).toISOString()
        : undefined,
      modifiedTime: article.updatedAt
        ? new Date(article.updatedAt).toISOString()
        : undefined,
      authors: [authorName],
      section: article.category.name,
      tags: article.tags.map((t) => t.name),
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: article.bannerImageAlt || article.title,
        },
      ],
    },

    twitter: {
      card: "summary_large_image",
      site: "@alentah",
      creator: "@alentah",
      title,
      description,
      images: [twitterImage],
    },
  };
}

// ============================================================
// PAGE  (sync — wraps async content in Suspense)
// ============================================================

export default function CategoryArticlePage({ params }: PageProps) {
  return (
    <Suspense fallback={<ArticlePageSkeleton />}>
      <ArticleContent params={params} />
    </Suspense>
  );
}

// ============================================================
// CONTENT  (async — reads params + fetches article)
// ============================================================

async function ArticleContent({ params }: { params: Promise<PageParams> }) {
  const { category, slug } = await params;

  const decodedCategory = decodeURIComponent(category);
  const decodedSlug = decodeURIComponent(slug);

  const result = await getArticleBySlug(decodedSlug);

  // Real 404: article not in DB
  if (!result.success) {
    notFound();
  }

  const blog = result.article;

  // Soft warnings (do NOT 404 — render anyway)
  if (blog.category.slug !== decodedCategory) {
    console.warn(
      `[article-page] URL category "${decodedCategory}" does not match DB "${blog.category.slug}" for slug "${decodedSlug}". Rendering anyway.`,
    );
  }

  if (blog.subcategory?.slug) {
    console.warn(
      `[article-page] URL uses /category/slug but article HAS subcategory "${blog.subcategory.slug}". Rendering anyway.`,
    );
  }

  const tocItems: TableOfContentsItem[] = Array.isArray(
    blog.tableOfContents,
  )
    ? (blog.tableOfContents as TableOfContentsItem[])
    : [];

  // ==========================================================
  // STRUCTURED DATA
  // ==========================================================

  const canonicalPath = `/${blog.category.slug}/${
    blog.subcategory?.slug ? `${blog.subcategory.slug}/` : ""
  }${blog.slug}`;
  const canonicalUrl = blog.seo?.canonicalUrl || `${SITE_URL}${canonicalPath}`;

  const articleImage = toAbsoluteUrl(
    blog.seo?.ogImage || blog.bannerImage,
  );

  const authorName = getAuthorName(blog.author);

  const wordCount = countWords(blog.content);

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
        name: blog.category.name,
        item: `${SITE_URL}/${blog.category.slug}`,
      },
      ...(blog.subcategory
        ? [
            {
              "@type": "ListItem",
              position: 3,
              name: blog.subcategory.name,
              item: `${SITE_URL}/${blog.category.slug}/${blog.subcategory.slug}`,
            },
          ]
        : []),
      {
        "@type": "ListItem",
        position: blog.subcategory ? 4 : 3,
        name: blog.title,
        item: canonicalUrl,
      },
    ],
  };

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": canonicalUrl,
    },
    headline: blog.title,
    description: blog.shortDescription || blog.title,
    image: [articleImage],
    datePublished: blog.publishedAt
      ? new Date(blog.publishedAt).toISOString()
      : undefined,
    dateModified: blog.updatedAt
      ? new Date(blog.updatedAt).toISOString()
      : undefined,
    author: {
      "@type": "Person",
      name: authorName,
      ...(blog.author.imageUrl && { image: blog.author.imageUrl }),
      ...(blog.author.bio && { description: blog.author.bio }),
    },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
      logo: {
        "@type": "ImageObject",
        url: PUBLISHER_LOGO,
        width: 512,
        height: 512,
      },
    },
    ...(blog.category && {
      articleSection: blog.category.name,
    }),
    ...(blog.subcategory && {
      about: {
        "@type": "Thing",
        name: blog.subcategory.name,
      },
    }),
    ...(blog.tags.length > 0 && {
      keywords: blog.tags.map((t) => t.name).join(", "),
    }),
    ...(blog.readingTime && {
      timeRequired: `PT${blog.readingTime}M`,
    }),
    ...(wordCount > 0 && { wordCount }),
    inLanguage: "en",
    isAccessibleForFree: true,
    url: canonicalUrl,
  };

  return (
    <main className="w-full min-w-0 px-0">
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(articleJsonLd),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJsonLd),
        }}
      />

      {/* =====================================================
          HERO HEADER (full-width, zero padding on mobile)
      ====================================================== */}
      <BlogHeader
        title={blog.title}
        shortDescription={blog.shortDescription}
        publishedAt={blog.publishedAt}
        type={blog.type}
        readingTime={blog.readingTime}
        bannerImage={blog.bannerImage}
        bannerImageAlt={blog.bannerImageAlt}
        author={blog.author}
        category={blog.category}
        subcategory={blog.subcategory ?? blog.category}
      />

      {/* =====================================================
          READING GRID
            mobile  → 1 column (TOC above body), px-0
            lg+     → [content 1fr] [toc 280px], px-8 / px-10
      ====================================================== */}
      <div className="mx-auto w-full min-w-0 max-w-[1440px] px-0 pb-12 sm:pb-16 lg:px-8 lg:pb-24 xl:px-10">
        <div
          className={[
            "grid w-full min-w-0 gap-8 lg:gap-10 xl:gap-14",
            "grid-cols-1",
            "lg:grid-cols-[minmax(0,1fr)_280px]",
            "xl:grid-cols-[minmax(0,1fr)_300px]",
            "lg:items-start",
          ].join(" ")}
        >
          {/* =================================================
              ARTICLE BODY  (left column on lg+)
          ================================================= */}
          <div className="order-2 min-w-0 w-full lg:order-1">
            <article className="relative min-w-0 w-full max-w-none">
              <BlogPreviewer
                content={blog.content}
                tableOfContents={undefined}
              />

              {/* =============================================
                  SAVE / BOOKMARK ACTION
              ============================================== */}
              <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-6 sm:mt-12">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Enjoyed this story?
                </p>

                <Suspense
                  fallback={
                    <div className="h-9 w-24 animate-pulse rounded-full bg-muted" />
                  }
                >
                  <ArticleBookmarkServer blogId={blog.id} />
                </Suspense>
              </div>

              {/* =============================================
                  COMMENTS
              ============================================== */}
              <Suspense fallback={<ArticleCommentsSkeleton />}>
                <ArticleCommentsServer
                  blogId={blog.id}
                  blogSlug={blog.slug}
                />
              </Suspense>
            </article>
          </div>

          {/* =================================================
              TABLE OF CONTENTS
                mobile → above body (order-1), full-bleed
                lg+    → sticky right sidebar (order-2)
          ================================================= */}
          <ArticleTOC
            items={tocItems}
            className="order-1 w-full lg:order-2 lg:sticky lg:top-24"
          />
        </div>
      </div>
    </main>
  );
}