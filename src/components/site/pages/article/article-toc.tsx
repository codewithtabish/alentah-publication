// src/components/site/pages/article/article-toc.tsx
"use client";

// ============================================================
// ArticleTOC — ALENTAH
// Responsive table of contents.
//   Mobile  → collapsible card above the article
//   Desktop → sticky right-side sidebar
// ============================================================

import { useEffect, useMemo, useState } from "react";

import type { TableOfContentsItem } from "@/schemas/blog-schema";
import { cn } from "@/lib/utils";

// ============================================================
// TYPES
// ============================================================

type Props = {
  items: TableOfContentsItem[];
  className?: string;
};

type NormalizedItem = {
  id: string;
  title: string;
  level: number;
};

// ============================================================
// HELPERS
// ============================================================

function normalizeItem(
  item: TableOfContentsItem & {
    id?: string;
    text?: string;
    title?: string;
    label?: string;
    href?: string;
    slug?: string;
    level?: number;
  },
): NormalizedItem {
  const title = item.title || item.text || item.label || "";
  const rawId = item.slug || item.id || item.href || "";
  const id = rawId.replace(/^#/, "").trim();

  return {
    id,
    title,
    level: item.level || 2,
  };
}

// ============================================================
// COMPONENT
// ============================================================

export function ArticleTOC({ items, className }: Props) {
  const [activeId, setActiveId] = useState<string>("");
  const [mobileOpen, setMobileOpen] = useState(false);

  // Normalize + filter to top-level H2 entries only
  const mainItems = useMemo(
    () =>
      items
        .map(normalizeItem)
        .filter((item) => item.id && item.title && item.level === 2),
    [items],
  );

  // ----------------------------------------------------------
  // Scroll-spy: track the currently visible H2
  // ----------------------------------------------------------
  useEffect(() => {
    if (!mainItems.length) return;

    const headingElements = mainItems
      .map((item) => document.getElementById(item.id))
      .filter((el): el is HTMLElement => Boolean(el));

    if (!headingElements.length) return;

    let ticking = false;

    const update = () => {
      const offset = 160;
      let current = headingElements[0]?.id || "";

      for (const el of headingElements) {
        if (el.getBoundingClientRect().top <= offset) {
          current = el.id;
        } else {
          break;
        }
      }

      setActiveId(current);
      ticking = false;
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [mainItems]);

  // ----------------------------------------------------------
  // Click: smooth-scroll to section
  // ----------------------------------------------------------
  const handleClick = (
    event: React.MouseEvent<HTMLButtonElement>,
    id: string,
  ) => {
    event.preventDefault();
    const target = document.getElementById(id);
    if (!target) return;

    setActiveId(id);
    setMobileOpen(false);

    window.requestAnimationFrame(() => {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  if (!mainItems.length) return null;

  const total = mainItems.length;

  return (
    <aside
      className={cn("w-full", className)}
      aria-label="Table of contents"
    >
      {/* =====================================================
          MOBILE — collapsible card (visible < lg)
      ====================================================== */}
      <div className="lg:hidden">
        <div className="overflow-hidden rounded-2xl border border-border bg-muted/30">
          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-expanded={mobileOpen}
            aria-controls="article-toc-mobile"
            className="flex w-full items-center justify-between gap-4 px-4 py-3.5 text-left"
          >
            <div className="flex min-w-0 items-center gap-3">
              <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary">
                Table of Contents
              </span>

              <span className="rounded-full border border-border bg-background px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                {total}
              </span>
            </div>

            <span
              className={cn(
                "flex size-7 shrink-0 items-center justify-center rounded-full bg-background text-muted-foreground transition-transform duration-300",
                mobileOpen ? "rotate-180" : "rotate-0",
              )}
              aria-hidden="true"
            >
              <svg viewBox="0 0 24 24" fill="none" className="size-4">
                <path
                  d="m6 9 6 6 6-6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          </button>

          <div
            id="article-toc-mobile"
            className={cn(
              "grid transition-[grid-template-rows,opacity] duration-300 ease-out",
              mobileOpen
                ? "grid-rows-[1fr] opacity-100"
                : "grid-rows-[0fr] opacity-0",
            )}
          >
            <div className="min-h-0 overflow-hidden">
              <ul className="max-h-[60vh] space-y-0.5 overflow-y-auto border-t border-border p-2">
                {mainItems.map((item, index) => {
                  const isActive = activeId === item.id;
                  const number = String(index + 1).padStart(2, "0");

                  return (
                    <li key={`${item.id}-${index}`}>
                      <button
                        type="button"
                        onClick={(event) => handleClick(event, item.id)}
                        aria-current={isActive ? "location" : undefined}
                        className={cn(
                          "flex w-full items-start gap-3 rounded-lg px-3 py-2.5 text-left transition-colors",
                          isActive
                            ? "bg-background text-foreground"
                            : "text-muted-foreground hover:bg-background/60 hover:text-foreground",
                        )}
                      >
                        <span
                          className={cn(
                            "pt-0.5 text-[11px] font-semibold tabular-nums",
                            isActive
                              ? "text-primary"
                              : "text-muted-foreground/70",
                          )}
                        >
                          {number}
                        </span>

                        <span className="flex-1 text-sm font-medium leading-5">
                          {item.title}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* =====================================================
          DESKTOP — sticky sidebar (visible lg+)
      ====================================================== */}
      <nav className="hidden lg:block">
        <div className="rounded-2xl border border-border bg-muted/20 p-4">
          {/* Header */}
          <div className="mb-3 flex items-center justify-between gap-3 px-2">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary">
              Table of Contents
            </p>

            <span className="rounded-full border border-border bg-background px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
              {total}
            </span>
          </div>

          {/* List */}
          <ul className="max-h-[calc(100vh-200px)] space-y-0.5 overflow-y-auto pr-1">
            {mainItems.map((item, index) => {
              const isActive = activeId === item.id;
              const number = String(index + 1).padStart(2, "0");

              return (
                <li key={`${item.id}-${index}`}>
                  <button
                    type="button"
                    onClick={(event) => handleClick(event, item.id)}
                    aria-current={isActive ? "location" : undefined}
                    className={cn(
                      "group relative flex w-full items-start gap-3 rounded-lg px-3 py-2.5 text-left transition-colors duration-200",
                      isActive ? "bg-muted/60" : "hover:bg-muted/30",
                    )}
                  >
                    {/* Active left accent bar */}
                    <span
                      className={cn(
                        "absolute left-0 top-2 bottom-2 w-[2px] rounded-full transition-opacity duration-200",
                        isActive ? "bg-primary opacity-100" : "opacity-0",
                      )}
                      aria-hidden="true"
                    />

                    {/* Number */}
                    <span
                      className={cn(
                        "pt-0.5 text-[11px] font-semibold tabular-nums transition-colors",
                        isActive
                          ? "text-primary"
                          : "text-muted-foreground/70 group-hover:text-muted-foreground",
                      )}
                    >
                      {number}
                    </span>

                    {/* Title */}
                    <span
                      className={cn(
                        "flex-1 text-sm font-medium leading-5 transition-colors",
                        isActive
                          ? "text-foreground"
                          : "text-muted-foreground group-hover:text-foreground",
                      )}
                    >
                      {item.title}
                    </span>

                    {/* Active dot */}
                    {isActive && (
                      <span
                        className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary"
                        aria-hidden="true"
                      />
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>
    </aside>
  );
}

export default ArticleTOC;