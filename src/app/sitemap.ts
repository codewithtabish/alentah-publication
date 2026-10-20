
import type { MetadataRoute } from "next";
import prisma from "@/lib/clients/prisma-client";

// Canonical production URL
const SITE_URL = "https://www.alentah.com";

// ============================================================
// HELPERS
// ============================================================

function safeDate(
  value: Date | string | null | undefined,
): Date | undefined {
  if (!value) return undefined;

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
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
// Generated at /sitemap.xml by Next.js
// ============================================================

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // 1. Static public pages
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

  // 2. Fetch active categories and published articles.
  // Allow database errors to propagate rather than silently
  // returning an incomplete sitemap.
  const [categories, blogs] = await Promise.all([
    prisma.category.findMany({
      where: {
        isActive: true,
      },
      select: {
        slug: true,
        updatedAt: true,
      },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    }),

    prisma.blog.findMany({
      where: {
        status: "PUBLISHED",
        publishedAt: {
          not: null,
        },
        category: {
          isActive: true,
        },
      },
      select: {
        slug: true,
        updatedAt: true,
        publishedAt: true,
        category: {
          select: {
            slug: true,
          },
        },
        subcategory: {
          select: {
            slug: true,
            isActive: true,
          },
        },
      },
      orderBy: [{ publishedAt: "desc" }],
    }),
  ]);

  // 3. Active category URLs
  const categoryRoutes: MetadataRoute.Sitemap = categories
    .filter((category) => Boolean(category.slug))
    .map((category) => ({
      url: `${SITE_URL}/${category.slug}`,
      lastModified: safeDate(category.updatedAt),
    }));

  // 4. Published article URLs
  const articleRoutes: MetadataRoute.Sitemap = blogs
    .filter((blog) => Boolean(blog.category?.slug && blog.slug))
    .map((blog) => {
      const subcategorySlug =
        blog.subcategory?.isActive && blog.subcategory.slug
          ? blog.subcategory.slug
          : null;

      return {
        url: buildArticleUrl(
          blog.category.slug,
          subcategorySlug,
          blog.slug,
        ),
        lastModified: safeDate(blog.updatedAt ?? blog.publishedAt),
      };
    });

  // 5. Return all public URLs
  return [...staticRoutes, ...categoryRoutes, ...articleRoutes];
}
