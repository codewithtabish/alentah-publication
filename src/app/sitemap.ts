// src/app/sitemap.ts
// ============================================================
// Sitemap — ALENTAH
// Auto-generated at /sitemap.xml by Next.js.
//
// Includes:
//   - Static public pages
//   - Every active category
//   - Every published article (with or without subcategory)
//
// Excludes:
//   - /admin, /saved, /profile, /api (private / not pages)
//   - Draft / scheduled / archived articles
//   - Inactive categories and subcategories
//
// NOTES:
//   - Google ignores <changefreq> and <priority>, so they are removed.
//   - <lastmod> is only set where we have a REAL date. Fake "now"
//     dates make Google distrust the sitemap.
//   - If the database fails, we THROW instead of returning a
//     half-empty sitemap. Next.js then keeps serving the last good
//     sitemap instead of caching an empty one.
// ============================================================

import type { MetadataRoute } from "next";
import prisma from "@/lib/clients/prisma-client";

// Regenerate at most once per hour
export const revalidate = 3600;

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
  // 1 — STATIC PUBLIC PAGES (no fake lastModified)
  const staticPaths = [
    "",
    "/about",
    "/careers",
    "/contact",
    "/advertise",
    "/ethics",
    "/privacy",
    "/cookies",
    "/terms",
  ];

  const staticRoutes: MetadataRoute.Sitemap = staticPaths.map((path) => ({
    url: `${SITE_URL}${path}`,
  }));

  // 2 — CATEGORIES + 3 — ARTICLES
  // No try/catch on purpose: a DB failure must NOT produce an empty sitemap.
  const [categories, blogs] = await Promise.all([
    prisma.category.findMany({
      where: { isActive: true },
      select: { slug: true, updatedAt: true },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    }),
    prisma.blog.findMany({
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
    }),
  ]);

  const categoryRoutes: MetadataRoute.Sitemap = categories
    .filter((c) => c.slug)
    .map((c) => ({
      url: `${SITE_URL}/${c.slug}`,
      lastModified: safeDate(c.updatedAt),
    }));

  const articleRoutes: MetadataRoute.Sitemap = blogs
    .filter((b) => b.category?.slug && b.slug)
    .map((b) => {
      // Only use the subcategory slug if the subcategory is active
      const subSlug =
        b.subcategory && b.subcategory.isActive ? b.subcategory.slug : null;

      return {
        url: buildArticleUrl(b.category.slug, subSlug, b.slug),
        lastModified: safeDate(b.updatedAt ?? b.publishedAt),
      };
    });

  // 4 — RETURN EVERYTHING
  return [...staticRoutes, ...categoryRoutes, ...articleRoutes];
}
