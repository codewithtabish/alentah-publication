// src/app/(site)/[category]/[slug]/page.tsx

import { Suspense } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { cn } from "@/lib/utils";
import { getArticleBySlug } from "@/actions/blog/get-article-by-slug";

import type { TableOfContentsItem } from "@/schemas/blog-schema";
import { ArticlePageSkeleton } from "@/components/site/pages/article/article-page-view";
import BlogHeader from "@/components/site/pages/article/single-blog-header";
import { BlogPreviewer } from "@/components/site/admim/article/artcile-previewer";
import { ArticleTOC } from "@/components/site/pages/article/article-toc";
import { ArticleCommentsSkeleton } from "@/components/site/admim/article/article-comments-skeleton";
import { ArticleCommentsServer } from "@/components/site/admim/article/article-comments-server";
import { ArticleBookmarkServer } from "@/components/site/admim/article/article-bookmark-server";
import {
  ADS_ENABLED,
  Banner160x600,
  Banner300x250,
  Banner320x50,
  Banner728x90,
  NativeAd,
} from "@/components/site/general/ads/site-ads";

type PageParams = { category: string; slug: string };
type PageProps = { params: Promise<PageParams> };

const SITE_URL = "https://www.alentah.com";
const SITE_NAME = "Alentah";
const PUBLISHER_LOGO = `${SITE_URL}/seo/icon-512.png`;
const FALLBACK_OG_IMAGE = `${SITE_URL}/seo/og-image.png`;

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
    <aside
      aria-label={label}
      className={cn(
        "flex w-full min-w-0 max-w-full flex-col items-center overflow-hidden",
        className,
      )}
    >
      <span className="mb-1.5 text-[9px] font-medium uppercase tracking-[0.22em] text-muted-foreground/60">
        {label}
      </span>
      <div className="flex max-w-full justify-center">{children}</div>
    </aside>
  );
}

function SidebarAds() {
  if (!ADS_ENABLED) return null;

  return (
    <div className="hidden w-full flex-col items-stretch gap-6 lg:sticky lg:top-24 lg:flex">
      <AdSlot className="w-full">
        <Banner160x600 variant={0} />
      </AdSlot>

      <AdSlot className="w-full">
        <Banner300x250 variant={1} />
      </AdSlot>

      <AdSlot className="w-full">
        <Banner320x50 variant={0} />
      </AdSlot>
    </div>
  );
}

function BottomAds() {
  if (!ADS_ENABLED) return null;

  return (
    <div className="mt-10 space-y-8 px-4 sm:mt-12 lg:px-0">
      <AdSlot className="hidden md:flex">
        <Banner728x90 variant={0} />
      </AdSlot>

      <div className="grid grid-cols-1 justify-items-center gap-8 md:grid-cols-2 lg:hidden">
        <AdSlot>
          <Banner300x250 variant={2} />
        </AdSlot>
        <AdSlot>
          <Banner300x250 variant={3} />
        </AdSlot>
      </div>

      <AdSlot className="md:hidden">
        <Banner300x250 variant={4} />
      </AdSlot>
    </div>
  );
}

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

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const result = await getArticleBySlug(decodeURIComponent(slug));

  if (!result.success) {
    return {
      title: "Article not found",
      robots: { index: false, follow: false },
    };
  }

  const article = result.article;
  const title = article.seo?.metaTitle || article.title;
  const description =
    article.seo?.metaDescription ||
    article.shortDescription ||
    `${article.title} — read on Alentah.`;

  const ogImage = toAbsoluteUrl(article.seo?.ogImage || article.bannerImage);
  const twitterImage = toAbsoluteUrl(
    article.seo?.twitterImage || article.seo?.ogImage || article.bannerImage,
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
    alternates: { canonical: canonicalUrl },
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

export default function CategoryArticlePage({ params }: PageProps) {
  return (
    <Suspense fallback={<ArticlePageSkeleton />}>
      <ArticleContent params={params} />
    </Suspense>
  );
}

async function ArticleContent({ params }: { params: Promise<PageParams> }) {
  const { category, slug } = await params;
  const decodedCategory = decodeURIComponent(category);
  const decodedSlug = decodeURIComponent(slug);

  const result = await getArticleBySlug(decodedSlug);

  if (!result.success) notFound();

  const blog = result.article;

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

  const tocItems: TableOfContentsItem[] = Array.isArray(blog.tableOfContents)
    ? (blog.tableOfContents as TableOfContentsItem[])
    : [];

  const canonicalPath = `/${blog.category.slug}/${
    blog.subcategory?.slug ? `${blog.subcategory.slug}/` : ""
  }${blog.slug}`;
  const canonicalUrl = blog.seo?.canonicalUrl || `${SITE_URL}${canonicalPath}`;
  const articleImage = toAbsoluteUrl(blog.seo?.ogImage || blog.bannerImage);
  const authorName = getAuthorName(blog.author);
  const wordCount = countWords(blog.content);

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
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
    mainEntityOfPage: { "@type": "WebPage", "@id": canonicalUrl },
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
    ...(blog.category && { articleSection: blog.category.name }),
    ...(blog.subcategory && {
      about: { "@type": "Thing", name: blog.subcategory.name },
    }),
    ...(blog.tags.length > 0 && {
      keywords: blog.tags.map((t) => t.name).join(", "),
    }),
    ...(blog.readingTime && { timeRequired: `PT${blog.readingTime}M` }),
    ...(wordCount > 0 && { wordCount }),
    inLanguage: "en",
    isAccessibleForFree: true,
    url: canonicalUrl,
  };

  return (
    <main className="w-full min-w-0 overflow-x-hidden px-0">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

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

      <div className="mx-auto w-full min-w-0 max-w-[1440px] px-4 pt-6 lg:px-8 xl:px-10">
        <AdSlot className="hidden md:flex">
          <Banner728x90 variant={0} />
        </AdSlot>

        <AdSlot className="md:hidden">
          <Banner300x250 variant={0} />
        </AdSlot>
      </div>

      <div className="mx-auto w-full min-w-0 max-w-[1440px] px-0 pb-10 pt-6 sm:pb-12 lg:px-8 lg:pb-16 xl:px-10">
        <div
          className={[
            "grid w-full min-w-0 gap-8 lg:gap-10 xl:gap-14",
            "grid-cols-1",
            "lg:grid-cols-[minmax(0,1fr)_320px]",
            "xl:grid-cols-[minmax(0,1fr)_340px]",
          ].join(" ")}
        >
          <div className="order-2 min-w-0 w-full lg:order-1">
            <article className="relative min-w-0 w-full max-w-none">
              <BlogPreviewer
                content={blog.content}
                tableOfContents={undefined}
              />

              <div className="mt-8 px-4 lg:px-0">
                <AdSlot label="Sponsored" className="overflow-visible">
                  <NativeAd variant={0} />
                </AdSlot>
              </div>

              <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-border px-4 pt-6 sm:mt-12 lg:px-0">
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

              <Suspense fallback={<ArticleCommentsSkeleton />}>
                <ArticleCommentsServer blogId={blog.id} blogSlug={blog.slug} />
              </Suspense>
            </article>
          </div>

          <aside className="order-1 flex w-full min-w-0 flex-col gap-6 lg:order-2 lg:self-stretch">
            <div className="lg:sticky lg:top-24 lg:z-10">
              <ArticleTOC items={tocItems} className="w-full" />
            </div>

            <SidebarAds />
          </aside>
        </div>

        <BottomAds />
      </div>
    </main>
  );
}