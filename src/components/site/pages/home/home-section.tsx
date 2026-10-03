// src/components/site/home/home-section.tsx
// ============================================================
// HomeSection — ALENTAH
// Self-contained async server component.
// Fetches data + renders the editorial homepage.
// Drop into any page: <HomeSection />
// ============================================================

import { getHomeBlogs } from "@/actions/blog/get-home-blogs";
import { HomeScreen } from "./home-screen";

export async function HomeSection() {
  const result = await getHomeBlogs();

  if (!result.success) {
    return (
      <div className="mx-auto max-w-2xl rounded-2xl border border-destructive/40 bg-destructive/5 p-8 text-center">
        <p className="mb-2 font-serif text-xl tracking-tight">
          Couldn&apos;t load the homepage
        </p>
        <p className="text-sm text-muted-foreground">{result.error}</p>
      </div>
    );
  }

  return <HomeScreen blogs={result.blogs} />;
}