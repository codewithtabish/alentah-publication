// src/app/page.tsx
// ============================================================
// Homepage — ALENTAH
// ============================================================

import { HomeScreenSkeleton } from "@/components/site/pages/home/home-screen";
import { HomeSection } from "@/components/site/pages/home/home-section";
import { Suspense } from "react";

export const metadata = {
  title: "Alentah — Slow Journalism for Curious Minds",
  description:
    "An independent editorial publication covering technology, lifestyle, finance, culture, and travel.",
};

export default function HomePage() {
  return (
    <div className="py-8 sm:py-10 lg:py-12">
      <Suspense fallback={<HomeScreenSkeleton />}>
        <HomeSection />
      </Suspense>
    </div>
  );
}