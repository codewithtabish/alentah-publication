"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

/**
 * Container — ALENTAH
 *
 * Public-site container only.
 * Admin routes must use src/app/admin/layout.tsx instead.
 *
 * Layout contract:
 *   - Passive wrapper: background, padding, ambient glows.
 *   - Does NOT force min-height.
 *   - Does NOT create a flex column.
 *   - Ambient glows live inside their own `absolute inset-0
 *     overflow-hidden` overlay so their negative offsets are
 *     clipped and cannot push the document height.
 *   - Content sits in its own z-10 wrapper so `sticky` and
 *     `fixed` positioning inside pages continue to work.
 */
export function Container({
  children,
  className,
  ...props
}: ContainerProps) {
  return (
    <div
      className={cn(
        // ============================================================
        // BASE
        // ============================================================
        "relative isolate w-full",
        "bg-background text-foreground",
        "transition-colors duration-500 ease-out",

        // ============================================================
        // RESPONSIVE PADDING
        // ============================================================
        "px-4",          // mobile  → 16px
        "sm:px-5",       // sm      → 20px
        "md:px-6",       // md      → 24px
        "lg:px-6",       // lg      → 24px
        "xl:px-6",       // xl      → 24px
        "2xl:px-8",      // 2xl     → 32px

        // ============================================================
        // AMBIENT BACKGROUND
        // ============================================================
        "bg-[radial-gradient(ellipse_100%_50%_at_50%_-10%,color-mix(in_oklab,var(--primary)_2%,transparent),transparent_60%)]",
        "dark:bg-[radial-gradient(ellipse_100%_50%_at_50%_-10%,color-mix(in_oklab,var(--primary)_6%,transparent),transparent_60%)]",

        className,
      )}
      {...props}
    >
      {/* ============================================================
          AMBIENT GLOWS — wrapped in a clipping overlay
          ------------------------------------------------------------
          The overlay is `absolute inset-0 overflow-hidden`, so the
          glows' negative offsets are clipped to the container's
          bounds. Without this wrapper, the negative offsets push
          the document height and create blank space below the
          footer. The overlay is `pointer-events-none` and has no
          layout impact on siblings.
          ============================================================ */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        {/* Top-center glow */}
        <div
          className={cn(
            "absolute left-1/2 top-[-15%] -translate-x-1/2",
            "h-[400px] w-[400px]",
            "sm:h-[550px] sm:w-[550px]",
            "lg:h-[700px] lg:w-[700px]",
            "rounded-full blur-[120px]",
            "bg-[radial-gradient(circle,color-mix(in_oklab,var(--primary)_3%,transparent),transparent_70%)]",
            "dark:bg-[radial-gradient(circle,color-mix(in_oklab,var(--primary)_8%,transparent),transparent_70%)]",
          )}
        />

        {/* Bottom-right glow */}
        <div
          className={cn(
            "absolute bottom-[-20%] right-[-10%]",
            "h-[350px] w-[350px]",
            "sm:h-[450px] sm:w-[450px]",
            "lg:h-[600px] lg:w-[600px]",
            "rounded-full blur-[140px]",
            "bg-[radial-gradient(circle,color-mix(in_oklab,var(--primary)_2%,transparent),transparent_70%)]",
            "dark:bg-[radial-gradient(circle,color-mix(in_oklab,var(--primary)_5%,transparent),transparent_70%)]",
          )}
        />
      </div>

      {/* ============================================================
          CONTENT
          ============================================================ */}
      <div className="relative z-10 w-full">{children}</div>
    </div>
  );
}