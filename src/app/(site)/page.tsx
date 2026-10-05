// src/app/page.tsx
// ============================================================
// Homepage — ALENTAH
// ============================================================

import FromTheEditor from "@/components/site/pages/home/from-the-editor";
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
    <div className="">
      <Suspense fallback={<HomeScreenSkeleton />}>
        <HomeSection />
        <FromTheEditor/>
      </Suspense>
    </div>
  );
}