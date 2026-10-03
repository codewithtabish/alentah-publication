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
 *
 * IMPORTANT:
 * This component does NOT detect routes.
 * Admin routes must use src/app/admin/layout.tsx instead.
 *
 * This avoids usePathname() blocking prerendering with
 * Next.js 16 + cacheComponents.
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
        "relative isolate min-h-screen w-full",
        "bg-background text-foreground",
        "transition-colors duration-500 ease-out",

        // ============================================================
        // PUBLIC RESPONSIVE PADDING
        // ============================================================
        "px-4",
        "sm:px-6",
        "md:px-8",
        "lg:px-8",
        "xl:px-10",
        "2xl:px-12",

        // ============================================================
        // PUBLIC AMBIENT BACKGROUND
        // ------------------------------------------------------------
        // Very subtle top fade — barely visible, just enough to
        // add depth without overpowering the page.
        // ============================================================
        "bg-[radial-gradient(ellipse_100%_50%_at_50%_-10%,color-mix(in_oklab,var(--primary)_2%,transparent),transparent_60%)]",
        "dark:bg-[radial-gradient(ellipse_100%_50%_at_50%_-10%,color-mix(in_oklab,var(--primary)_6%,transparent),transparent_60%)]",

        className,
      )}
      {...props}
    >
      {/* ============================================================
          PUBLIC AMBIENT GLOWS
          ------------------------------------------------------------
          Both glows are now much lighter and softer.
          They whisper — they don't shout.
          ============================================================ */}

      {/* Top-center glow */}
      <div
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute left-1/2 top-[-15%] -translate-x-1/2",
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
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute bottom-[-20%] right-[-10%]",
          "h-[350px] w-[350px]",
          "sm:h-[450px] sm:w-[450px]",
          "lg:h-[600px] lg:w-[600px]",
          "rounded-full blur-[140px]",
          "bg-[radial-gradient(circle,color-mix(in_oklab,var(--primary)_2%,transparent),transparent_70%)]",
          "dark:bg-[radial-gradient(circle,color-mix(in_oklab,var(--primary)_5%,transparent),transparent_70%)]",
        )}
      />

      {/* ============================================================
          CONTENT
          ============================================================ */}
      <div className="relative z-10 flex min-h-screen w-full flex-col">
        {children}
      </div>
    </div>
  );
}