// src/app/sitemap.ts
// ============================================================
// Sitemap — ALENTAH
// Auto-generated at /sitemap.xml by Next.js.
//
// Includes:
//   - Static public pages (/, /about, /careers, /contact, ...)
//   - Every active category
//   - Every published article (with or without subcategory)
//
// Excludes:
//   - /admin (private, noindex)
//   - /saved (private, noindex)
//   - /api (not a page)
//   - Draft / scheduled / archived articles
//   - Inactive categories and subcategories
//   - Query-param URLs (they canonicalize to base)
// ============================================================

import type { MetadataRoute } from "next";
import prisma from "@/lib/clients/prisma-client";

const SITE_URL = "https://www.alentah.com";

// ============================================================
// HELPERS
// ============================================================

function safeDate(value: Date | null | undefined): Date | undefined {
  if (!value) return undefined;
  const d = new Date(value);
  return isNaN(d.getTime()) ? undefined : d;
}

function buildArticleUrl(
  categorySlug: string,
  subcategorySlug: string | null | undefined,
  articleSlug: string,
): string {
  if (subcategorySlug) {
    return `${SITE_URL}/${categorySlug}/${subcategorySlug}/${articleSlug}`;
  }
  return `${SITE_URL}/${categorySlug}/${articleSlug}`;
}

// ============================================================
// SITEMAP
// ============================================================

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // -----------------------------------------------------------
  // 1 — STATIC PUBLIC PAGES
  // -----------------------------------------------------------
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${SITE_URL}`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/careers`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${SITE_URL}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${SITE_URL}/advertise`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${SITE_URL}/ethics`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.4,
    },
    {
      url: `${SITE_URL}/privacy`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/cookies`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  // -----------------------------------------------------------
  // 2 — CATEGORIES (all active)
  // -----------------------------------------------------------
  let categoryRoutes: MetadataRoute.Sitemap = [];
  let articleRoutes: MetadataRoute.Sitemap = [];

  try {
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      select: {
        slug: true,
        updatedAt: true,
      },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    });

    categoryRoutes = categories.map((c) => ({
      url: `${SITE_URL}/${c.slug}`,
      lastModified: safeDate(c.updatedAt),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));
  } catch (error) {
    console.error("[sitemap] Failed to load categories:", error);
  }

  // -----------------------------------------------------------
  // 3 — ARTICLES (all PUBLISHED with a real publish date)
  // -----------------------------------------------------------
  try {
    const blogs = await prisma.blog.findMany({
      where: {
        status: "PUBLISHED",
        publishedAt: { not: null },
        category: { isActive: true },
      },
      select: {
        slug: true,
        updatedAt: true,
        publishedAt: true,
        category: { select: { slug: true } },
        subcategory: { select: { slug: true, isActive: true } },
      },
      orderBy: [{ publishedAt: "desc" }],
    });

    articleRoutes = blogs
      .filter((b) => b.category?.slug && b.slug)
      .map((b) => {
        // Only use the subcategory slug if the subcategory is active
        const subSlug =
          b.subcategory && b.subcategory.isActive
            ? b.subcategory.slug
            : null;

        return {
          url: buildArticleUrl(b.category.slug, subSlug, b.slug),
          lastModified: safeDate(b.updatedAt ?? b.publishedAt),
          changeFrequency: "monthly" as const,
          priority: 0.7,
        };
      });
  } catch (error) {
    console.error("[sitemap] Failed to load articles:", error);
  }

  // -----------------------------------------------------------
  // 4 — RETURN EVERYTHING
  // -----------------------------------------------------------
  return [...staticRoutes, ...categoryRoutes, ...articleRoutes];
}