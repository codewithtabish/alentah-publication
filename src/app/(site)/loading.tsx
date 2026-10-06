// src/app/(site)/loading.tsx
// ============================================================
// Homepage Loading UI — ALENTAH
// Shown automatically by Next.js while the (site) group is
// streaming. Renders the same skeleton as <HomeScreenSkeleton />
// so the transition is seamless.
// ============================================================

import { HomeScreenSkeleton } from "@/components/site/pages/home/home-screen";

export default function Loading() {
  return (
    <div className="mx-auto w-full min-w-0 max-w-[1500px] px-4 pt-10 sm:px-6 sm:pt-12 lg:px-8 lg:pt-16 xl:px-10">
      <HomeScreenSkeleton />
    </div>
  );
}