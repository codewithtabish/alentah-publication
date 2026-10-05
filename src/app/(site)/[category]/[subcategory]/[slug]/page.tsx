// src/app/(site)/[category]/[slug]/page.tsx
// ============================================================
// Article Page — two-column reading layout
// URL: /category/slug
//
// Layout:
//   Mobile  → single column, TOC collapses above the article
//   Desktop → [content 1fr] [TOC 280px]  (TOC on the RIGHT)
// ============================================================

import { Suspense } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { getArticleBySlug } from "@/actions/blog/get-article-by-slug";

// import TheDaily from "@/components/blog/the-daily";

import type { TableOfContentsItem } from "@/schemas/blog-schema";
import { ArticlePageSkeleton } from "@/components/site/pages/article/article-page-view";
import BlogHeader from "@/components/site/pages/article/single-blog-header";
import { BlogPreviewer } from "@/components/site/admim/article/artcile-previewer";
import { ArticleTOC } from "@/components/site/pages/article/article-toc";

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
// METADATA
// ============================================================

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;

  const result = await getArticleBySlug(
    decodeURIComponent(slug),
  );

  if (!result.success) {
    return { title: "Article not found — Alentah" };
  }

  const article = result.article;

  const title =
    article.seo?.metaTitle || article.title;

  const description =
    article.seo?.metaDescription ||
    article.shortDescription ||
    undefined;

  return {
    title: `${title} — Alentah`,
    description,

    openGraph: {
      title,
      description,
      type: "article",
      publishedTime: article.publishedAt
        ? new Date(article.publishedAt).toISOString()
        : undefined,
      images: article.seo?.ogImage
        ? [article.seo.ogImage]
        : article.bannerImage
          ? [article.bannerImage]
          : undefined,
    },

    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: article.seo?.twitterImage
        ? [article.seo.twitterImage]
        : article.bannerImage
          ? [article.bannerImage]
          : undefined,
    },

    alternates: article.seo?.canonicalUrl
      ? { canonical: article.seo.canonicalUrl }
      : undefined,
  };
}

// ============================================================
// PAGE  (sync — wraps async content in Suspense)
// ============================================================

export default function CategoryArticlePage({
  params,
}: PageProps) {
  return (
    <Suspense fallback={<ArticlePageSkeleton />}>
      <ArticleContent params={params} />
    </Suspense>
  );
}

// ============================================================
// CONTENT  (async — reads params + fetches article)
// ============================================================

async function ArticleContent({
  params,
}: {
  params: Promise<PageParams>;
}) {
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

  return (
    <main className="w-full">
      {/* =====================================================
          HERO HEADER (full-width)
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
            mobile  → 1 column (TOC above body)
            lg+     → [content 1fr] [toc 280px]  (TOC right)
      ====================================================== */}
      <div className="mx-auto w-full max-w-[1440px] px-4 pb-16 sm:px-6 sm:pb-20 lg:px-8 lg:pb-24 xl:px-10">
        <div
          className={[
            "grid w-full gap-8 lg:gap-10 xl:gap-14",
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

              <hr className="my-10 border-border sm:my-12" />

              {/* <Suspense fallback={<BlogCommentsSkeleton />}>
                <BlogComments
                  blogId={blog.id}
                  blogSlug={blog.slug}
                />
              </Suspense>

              <TheDaily /> */}
            </article>
          </div>

          {/* =================================================
              TABLE OF CONTENTS
                mobile → above body (order-1)
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