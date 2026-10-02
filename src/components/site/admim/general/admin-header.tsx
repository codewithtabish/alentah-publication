"use client";

// ============================================================
// Admin Header — ALENTAH
// Full-width top bar for the admin dashboard.
// Wordmark + Admin tag · Global search · Notifications ·
// Mode toggle · Avatar
// ============================================================

import * as React from "react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { Search, Bell } from "lucide-react";
import { cn } from "@/lib/utils";
import { ModeToggle } from "@/components/site/general/theme/mode-toggle";

export function AdminHeader() {
  const { user } = useUser();
  const [query, setQuery] = React.useState("");

  const displayName =
    user?.fullName ??
    user?.firstName ??
    user?.primaryEmailAddress?.emailAddress?.split("@")[0] ??
    "Talha Tabish";

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full",
        "border-b border-border",
        "bg-background/85 backdrop-blur-xl backdrop-saturate-150",
        // subtle warm glow like the rest of the site
        "relative",
        "before:pointer-events-none before:absolute before:inset-0",
        "before:bg-[radial-gradient(ellipse_80%_120%_at_50%_-20%,color-mix(in_oklab,var(--primary)_6%,transparent),transparent_70%)]",
        "dark:before:bg-[radial-gradient(ellipse_80%_120%_at_50%_-20%,color-mix(in_oklab,var(--primary)_14%,transparent),transparent_70%)]",
      )}
    >
      <div className="relative flex h-16 items-center gap-4 px-4 sm:px-6 lg:px-8">
        {/* ============ LEFT — Wordmark + Admin tag ============ */}
        <div className="flex shrink-0 items-center gap-3">
          <Link
            href="/"
            aria-label="ALENTAH — Home"
            className="group flex items-center"
          >
            <span
              className={cn(
                "font-serif text-2xl tracking-tight text-foreground",
                "transition-colors duration-300 group-hover:text-primary",
              )}
            >
              ALENTAH
            </span>
          </Link>

          <span
            className={cn(
              "hidden sm:inline-flex items-center",
              "px-2 py-0.5 rounded-full",
              "border border-primary/40 bg-primary/10 text-primary",
              "text-[10px] font-semibold uppercase tracking-[0.18em]",
            )}
          >
            Admin
          </span>
        </div>

        {/* ============ CENTER — Global search ============ */}
        <div className="flex flex-1 items-center justify-center">
          <div
            className={cn(
              "relative w-full max-w-[520px]",
              "hidden md:flex items-center",
            )}
          >
            <Search
              className="absolute left-4 h-4 w-4 text-muted-foreground pointer-events-none"
              strokeWidth={1.75}
            />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search articles, editors, categories..."
              className={cn(
                "w-full h-10 pl-11 pr-4",
                "rounded-full",
                "bg-input border border-border text-foreground",
                "text-[13px] placeholder:text-muted-foreground",
                "focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40",
                "transition-all duration-200",
              )}
            />
          </div>
        </div>

        {/* ============ RIGHT — Actions ============ */}
        <div className="flex shrink-0 items-center gap-1.5">
          {/* Notifications */}
          <button
            type="button"
            aria-label="Notifications"
            className={cn(
              "relative inline-flex h-9 w-9 items-center justify-center rounded-full",
              "text-foreground/70 hover:text-primary hover:bg-accent",
              "transition-colors duration-200",
            )}
          >
            <Bell className="h-[18px] w-[18px]" strokeWidth={1.75} />
            {/* Unread dot */}
            <span className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-primary" />
          </button>

          {/* Theme toggle */}
          <ModeToggle />

          {/* Avatar + name */}
          <div className="flex items-center gap-2 pl-1">
            <span className="hidden lg:block text-[12px] font-medium text-foreground/80">
              {displayName}
            </span>
            <div
              className={cn(
                "h-9 w-9 rounded-full overflow-hidden",
                "border border-border",
                "ring-1 ring-transparent hover:ring-primary/40",
                "transition-all duration-200",
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/admin.png"
                alt="Admin avatar"
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}