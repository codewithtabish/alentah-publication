// src/components/blog/blog-content-container.tsx
// ============================================================
// BlogContentContainer — ALENTAH
//
// The premium reading surface for every article.
// Full-width by default. No fixed max-width caps.
// The parent layout is responsible for horizontal sizing.
// ============================================================

import { cn } from "@/lib/utils";
import * as React from "react";

// ============================================================
// TYPES
// ============================================================

interface BlogContentContainerProps
  extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

// ============================================================
// COMPONENT
// ============================================================

export function BlogContentContainer({
  children,
  className,
  ...props
}: BlogContentContainerProps) {
  return (
    <div
      className={cn(
        // Layout — full width, no max cap
        "relative mx-auto min-w-0 w-full max-w-none",

        // Vertical rhythm
        "py-8 sm:py-10 lg:py-12",

        // Reading experience
        "text-foreground antialiased",

        // Smooth entry
        "animate-in fade-in-0 duration-500",

        className,
      )}
      {...props}
    >
      {/* Subtle top glow */}
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

      <div className="relative z-10 w-full">{children}</div>
    </div>
  );
}