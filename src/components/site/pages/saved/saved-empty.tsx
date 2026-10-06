// src/components/site/pages/saved/saved-empty.tsx
// ============================================================
// SavedEmpty — shown when the reader has no saved articles yet
// ============================================================

import Link from "next/link";
import { Bookmark } from "lucide-react";

export function SavedEmpty() {
  return (
    <section className="flex flex-col items-center px-4 py-16 text-center sm:py-24">
      {/* Icon */}
      <div className="mb-6 flex size-16 items-center justify-center rounded-full border border-border bg-muted/40">
        <Bookmark
          className="size-7 text-primary"
          strokeWidth={1.5}
          aria-hidden="true"
        />
      </div>

      {/* Headline */}
      <h2 className="font-serif text-2xl tracking-[-0.02em] text-foreground sm:text-[1.75rem]">
        Nothing saved yet.
      </h2>

      {/* Description */}
      <p className="mt-3 max-w-md text-[14px] leading-7 text-muted-foreground sm:text-[15px]">
        Tap the bookmark icon on any story to save it here for later.
      </p>

      {/* CTA */}
      <Link
        href="/"
        className={[
          "mt-8 inline-flex h-11 items-center justify-center rounded-full px-6",
          "bg-primary text-primary-foreground",
          "text-[11px] font-semibold uppercase tracking-[0.18em]",
          "transition-colors hover:bg-primary/90",
        ].join(" ")}
      >
        Browse Stories
      </Link>
    </section>
  );
}