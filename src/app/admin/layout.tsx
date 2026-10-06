// src/app/admin/layout.tsx

import type { Metadata } from "next";

import { AdminHeader } from "@/components/site/admim/general/admin-header";
import { AdminSidebar } from "@/components/site/admim/general/admin-sidebar";

// ============================================================
// ADMIN METADATA
// ============================================================
//
// Admin pages must NEVER be indexed by Google or any other
// crawler. Even though /admin is also blocked in robots.txt and
// excluded from the sitemap, this noindex tag is the final
// safety net — it works even if the other two layers are
// bypassed (e.g. by an external backlink).
//
// This metadata applies to every page in the /admin tree:
// /admin, /admin/categories, /admin/articles, /admin/editors,
// /admin/subcategories, etc.

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
      "max-video-preview": -1,
      "max-image-preview": "none",
      "max-snippet": -1,
    },
  },
};

// ============================================================
// LAYOUT
// ============================================================

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen w-full max-w-none bg-background text-foreground">
      <AdminHeader />

      <div className="flex w-full max-w-none">
        <AdminSidebar />

        <main className="min-w-0 flex-1 w-full max-w-none py-8">
          {children}
        </main>
      </div>
    </div>
  );
}