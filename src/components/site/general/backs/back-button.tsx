"use client";

// ============================================================
// BackButton — ALENTAH
// Small client component: routes back if history exists,
// otherwise sends the reader to the homepage.
// Kept separate so the Advertise page can stay a server
// component with full SEO metadata.
// ============================================================

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export function BackButton() {
  const router = useRouter();

  const handleBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push("/");
    }
  };

  return (
    <div className="pt-8 sm:pt-10">
      <button
        type="button"
        onClick={handleBack}
        aria-label="Go back"
        className="group inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground transition-colors hover:text-foreground"
      >
        <span className="flex size-7 items-center justify-center rounded-full border border-border transition-colors group-hover:border-primary/40">
          <ArrowLeft className="size-3.5" aria-hidden="true" />
        </span>
        <span>Back</span>
      </button>
    </div>
  );
}