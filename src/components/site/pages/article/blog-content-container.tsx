// src/components/blog/blog-content-container.tsx
// ============================================================
// BlogContentContainer — ALENTAH
//
// The premium reading surface for every article.
// Full-width, zero horizontal padding on every device.
// No max-width caps. No side gutters.
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
        "relative w-full min-w-0 max-w-none",

        // Zero horizontal padding on every device
        "px-0",

        // Vertical rhythm only
        "py-8 sm:py-10 lg:py-12",

        // Reading experience
        "text-foreground antialiased",

        // Smooth entry
        "animate-in fade-in-0 duration-500",

        className,
      )}
      {...props}
    >
      <div className="relative z-10 w-full min-w-0">{children}</div>
    </div>
  );
}