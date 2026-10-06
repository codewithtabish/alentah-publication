// src/app/robots.ts
// ============================================================
// Robots — ALENTAH
// Auto-generated at /robots.txt by Next.js.
//
// Allows:
//   - Every crawler
//   - All public pages
//
// Disallows:
//   - /admin and everything under it (private CMS)
//   - /api (not a page)
//   - /saved (private reading list)
//   - /profile (private account)
//
// Points to:
//   - sitemap.xml
//   - canonical host (www.alentah.com)
// ============================================================

import type { MetadataRoute } from "next";

const SITE_URL = "https://www.alentah.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin",
          "/admin/",
          "/api/",
          "/saved",
          "/profile",
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}