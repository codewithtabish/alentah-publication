// src/components/blog/blog-content-container.tsx
// ============================================================
// BlogContentContainer — ALENTAH
//
// The premium reading surface for every article.
//
// Responsibilities:
//   - 100% width on small screens (zero reduction)
//   - 84% width on large screens (16% narrower, cleaner edges)
//   - Cap at a max width so huge monitors still read well
//   - Provide generous vertical breathing room
//   - Establish prose typography baseline
//   - Smooth entry animation
// ============================================================

import { cn } from "@/lib/utils";
import * as React from "react";

// ============================================================
// TYPES
// ============================================================

interface BlogContentContainerProps
  extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;

  /**
   * Optional. Controls the maximum width of the content.
   *
   *   "narrow"  → max-w-2xl   (672px)   → poems, short reads
   *   "default" → max-w-4xl   (896px)   → normal articles
   *   "wide"    → max-w-6xl   (1152px)  → rich articles
   *   "full"    → max-w-7xl   (1280px)  → almost full width
   */
  width?: "narrow" | "default" | "wide" | "full";
}

// ============================================================
// WIDTH PRESETS
// ------------------------------------------------------------
// "full" is the default — on large screens the container
// is 84% of the available width (16% narrower) so it never
// touches the screen edges.
// ============================================================

const WIDTH_CLASSES: Record<
  NonNullable<BlogContentContainerProps["width"]>,
  string
> = {
  narrow: "max-w-2xl",
  default: "max-w-4xl",
  wide: "max-w-6xl",
  full: "max-w-7xl",
};

// ============================================================
// COMPONENT
// ============================================================

export function BlogContentContainer({
  children,
  className,
  width = "full",
  ...props
}: BlogContentContainerProps) {
  return (
    <div
      className={cn(
        // ----------------------------------------------------------
        // Layout — width
        // ----------------------------------------------------------
        "relative mx-auto",
        "w-full", // ← small screens: full width (zero reduction)
        "sm:w-[92%]", // ← tablet: slight inset
        "lg:w-[84%]", // ← large screens: 16% narrower
        WIDTH_CLASSES[width],
        "min-w-0",

        // ----------------------------------------------------------
        // Vertical rhythm
        // ----------------------------------------------------------
        "py-10",
        "sm:py-12",
        "lg:py-16",

        // ----------------------------------------------------------
        // Horizontal breathing room
        // ----------------------------------------------------------
        "px-0",
        "sm:px-1",
        "lg:px-0",

        // ----------------------------------------------------------
        // Reading experience
        // ----------------------------------------------------------
        "text-foreground",
        "antialiased",

        // ----------------------------------------------------------
        // Smooth entry
        // ----------------------------------------------------------
        "animate-in fade-in-0 duration-500",

        className,
      )}
      {...props}
    >
      {/* ============================================================
          SUBTLE TOP FADE
          ============================================================ */}
      <div
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute left-1/2 top-0 -z-10",
          "-translate-x-1/2",
          "h-32 w-full",
          "bg-[radial-gradient(ellipse_60%_100%_at_50%_0%,color-mix(in_oklab,var(--primary)_4%,transparent),transparent_80%)]",
          "dark:bg-[radial-gradient(ellipse_60%_100%_at_50%_0%,color-mix(in_oklab,var(--primary)_8%,transparent),transparent_80%)]",
        )}
      />

      {/* ============================================================
          CONTENT
          ============================================================ */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}