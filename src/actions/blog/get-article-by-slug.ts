// src/actions/blog/get-article-by-slug.ts
"use server";

// ============================================================
// Server Action — Get Article by Slug
// For the public /article/[slug] view page.
// ============================================================

import { cacheTag, cacheLife } from "next/cache";
import prisma from "@/lib/clients/prisma-client";
import { CACHE_TAGS } from "@/lib/cache-keys";

// ============================================================
// TYPES
// ============================================================

export type ArticleDetail = {
  id: string;
  title: string;
  slug: string;
  shortDescription: string | null;
  content: unknown;
  tableOfContents: unknown;
  bannerImage: string;
  bannerImageAlt: string | null;
  status: string;
  type: string;
  featured: boolean;
  readingTime: number | null;
  viewCount: number;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  author: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    imageUrl: string | null;
    bio: string | null;
  };
  category: {
    id: string;
    name: string;
    slug: string;
  };
  subcategory: {
    id: string;
    name: string;
    slug: string;
  };
  seo: {
    metaTitle: string | null;
    metaDescription: string | null;
    canonicalUrl: string | null;
    ogImage: string | null;
    ogDescription: string | null;
    twitterImage: string | null;
    twitterDescription: string | null;
  } | null;
  tags: {
    id: string;
    name: string;
    slug: string;
  }[];
};

export type GetArticleBySlugResult =
  | { success: true; article: ArticleDetail }
  | { success: false; error: string };

// ============================================================
// CACHED READ
// ============================================================

async function getCachedArticle(
  slug: string,
): Promise<ArticleDetail | null> {
  "use cache";
  cacheLife("max");
  cacheTag(CACHE_TAGS.blog(slug));
  cacheTag(CACHE_TAGS.blogs);

  const article = await prisma.blog.findUnique({
    where: { slug },
    select: {
      id: true,
      title: true,
      slug: true,
      shortDescription: true,
      content: true,
      tableOfContents: true,
      bannerImage: true,
      bannerImageAlt: true,
      status: true,
      type: true,
      featured: true,
      readingTime: true,
      viewCount: true,
      publishedAt: true,
      createdAt: true,
      updatedAt: true,
      author: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          imageUrl: true,
          bio: true,
        },
      },
      category: {
        select: { id: true, name: true, slug: true },
      },
      subcategory: {
        select: { id: true, name: true, slug: true },
      },
      seo: {
        select: {
          metaTitle: true,
          metaDescription: true,
          canonicalUrl: true,
          ogImage: true,
          ogDescription: true,
          twitterImage: true,
          twitterDescription: true,
        },
      },
      tags: {
        select: {
          tag: {
            select: { id: true, name: true, slug: true },
          },
        },
      },
    },
  });

  if (!article) return null;

  return {
    ...article,
    tags: article.tags.map((t) => t.tag),
  };
}

// ============================================================
// MAIN ACTION
// ============================================================

export async function getArticleBySlug(
  slug: string,
): Promise<GetArticleBySlugResult> {
  try {
    const article = await getCachedArticle(slug);

    if (!article) {
      return { success: false, error: "Article not found." };
    }

    return { success: true, article };
  } catch (error) {
    console.error("[getArticleBySlug] Error:", error);
    return { success: false, error: "Failed to load article." };
  }
}