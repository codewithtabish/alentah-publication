"use client";

// ============================================================
// SavedGrid — ALENTAH
// Client component: sort control + 3-column grid of saved cards.
// ============================================================

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { Bookmark, ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { SavedBlogItem } from "@/actions/blog/get-saved-blogs";

// ============================================================
// TYPES
// ============================================================

type SortKey = "recent" | "oldest" | "title";

interface SavedGridProps {
  items: SavedBlogItem[];
}

// ============================================================
// HELPERS
// ============================================================

function getArticleHref(item: SavedBlogItem): string {
  const { blog } = item;
  const cat = blog.category.slug;
  const sub = blog.subcategory?.slug;

  if (sub) {
    return `/${cat}/${sub}/${blog.slug}`;
  }
  return `/${cat}/${blog.slug}`;
}

function getAuthorName(item: SavedBlogItem): string {
  const { author } = item.blog;
  return (
    [author.firstName, author.lastName].filter(Boolean).join(" ") ||
    "Alentah Editors"
  );
}

function getInitials(name: string): string {
  const parts = name.split(" ").filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// ============================================================
// COMPONENT
// ============================================================

export function SavedGrid({ items }: SavedGridProps) {
  const [sort, setSort] = React.useState<SortKey>("recent");
  const [menuOpen, setMenuOpen] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);

  // Close menu on outside click
  React.useEffect(() => {
    if (!menuOpen) return;

    const onClick = (e: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target as Node)
      ) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [menuOpen]);

  // Close menu on Escape
  React.useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  const sorted = React.useMemo(() => {
    const copy = [...items];
    if (sort === "recent") {
      copy.sort(
        (a, b) =>
          new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime(),
      );
    } else if (sort === "oldest") {
      copy.sort(
        (a, b) =>
          new Date(a.savedAt).getTime() - new Date(b.savedAt).getTime(),
      );
    } else {
      copy.sort((a, b) =>
        a.blog.title.localeCompare(b.blog.title, "en", {
          sensitivity: "base",
        }),
      );
    }
    return copy;
  }, [items, sort]);

  const sortLabels: Record<SortKey, string> = {
    recent: "Recently saved",
    oldest: "Oldest first",
    title: "Title A–Z",
  };

  return (
    <>
      {/* TOOLBAR */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
        <p className="font-serif text-[15px] italic leading-tight text-muted-foreground">
          {items.length}{" "}
          {items.length === 1 ? "story" : "stories"} saved
        </p>

        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-haspopup="listbox"
            aria-expanded={menuOpen}
            className={cn(
              "inline-flex h-9 items-center gap-2 rounded-full border border-border bg-transparent px-3.5",
              "text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground",
              "transition-colors hover:border-foreground/40 hover:text-foreground",
            )}
          >
            <span>Sort: {sortLabels[sort]}</span>
            <ChevronDown
              className={cn(
                "h-3.5 w-3.5 transition-transform duration-200",
                menuOpen && "rotate-180",
              )}
              strokeWidth={1.75}
            />
          </button>

          {menuOpen && (
            <div
              role="listbox"
              className={cn(
                "absolute right-0 top-full z-30 mt-2 w-48 overflow-hidden rounded-xl",
                "border border-border bg-popover shadow-lg",
                "animate-in fade-in-0 slide-in-from-top-1 duration-150",
              )}
            >
              {(["recent", "oldest", "title"] as SortKey[]).map((key) => (
                <button
                  key={key}
                  type="button"
                  role="option"
                  aria-selected={sort === key}
                  onClick={() => {
                    setSort(key);
                    setMenuOpen(false);
                  }}
                  className={cn(
                    "flex w-full items-center px-3.5 py-2.5 text-left",
                    "text-[12px] transition-colors",
                    sort === key
                      ? "bg-primary/10 text-primary"
                      : "text-foreground hover:bg-accent",
                  )}
                >
                  {sortLabels[key]}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* GRID */}
      <ul className="mt-8 grid grid-cols-1 gap-x-8 gap-y-10 sm:mt-10 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-10 lg:gap-y-12">
        {sorted.map((item) => {
          const href = getArticleHref(item);
          const authorName = getAuthorName(item);

          return (
            <li key={item.bookmarkId} className="group flex flex-col">
              {/* Cover */}
              <Link
                href={href}
                className="relative block aspect-16/10 w-full overflow-hidden bg-muted"
              >
                <Image
                  src={item.blog.bannerImage}
                  alt={item.blog.title}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                />

                {/* Saved indicator */}
                <span
                  aria-hidden="true"
                  className={cn(
                    "absolute right-3 top-3 inline-flex size-8 items-center justify-center rounded-full",
                    "border border-border bg-background/85 text-primary backdrop-blur-sm",
                  )}
                >
                  <Bookmark
                    className="h-3.5 w-3.5"
                    strokeWidth={2}
                    fill="currentColor"
                  />
                </span>
              </Link>

              {/* Text */}
              <div className="mt-4 flex flex-1 flex-col">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
                  {item.blog.category.name}
                </p>

                <Link href={href} className="mt-2">
                  <h3 className="font-serif text-[19px] leading-snug tracking-[-0.015em] text-foreground transition-colors group-hover:text-primary line-clamp-2 sm:text-[20px]">
                    {item.blog.title}
                  </h3>
                </Link>

                {item.blog.shortDescription && (
                  <p className="mt-2.5 text-[13.5px] leading-6 text-muted-foreground line-clamp-3 sm:text-[14px] sm:leading-7">
                    {item.blog.shortDescription}
                  </p>
                )}

                {/* Meta */}
                <div className="mt-auto flex items-center gap-2.5 pt-5">
                  <div className="relative size-7 shrink-0 overflow-hidden rounded-full border border-border bg-muted">
                    {item.blog.author.imageUrl ? (
                      <Image
                        src={item.blog.author.imageUrl}
                        alt={authorName}
                        fill
                        sizes="28px"
                        className="object-cover"
                        unoptimized
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-primary text-[10px] font-semibold text-primary-foreground">
                        {getInitials(authorName)}
                      </div>
                    )}
                  </div>

                  <p className="text-[12px] text-muted-foreground">
                    By{" "}
                    <span className="font-medium text-foreground">
                      {authorName}
                    </span>
                    {item.blog.subcategory?.name && (
                      <>
                        <span className="mx-2 text-muted-foreground/40">
                          ·
                        </span>
                        <span>{item.blog.subcategory.name}</span>
                      </>
                    )}
                  </p>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </>
  );
}