"use client";

// ============================================================
// Navbar — ALENTAH (Client)
// Floating editorial masthead. Always visible on scroll.
// Plain surface, no shadow, no scrolled state changes.
// Animated hamburger → X icon trigger on the left.
// HIDDEN on /admin routes.
// ============================================================

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Search,
  LogOut,
  Bookmark,
  User as UserIcon,
} from "lucide-react";
import { SignInButton, useUser, useClerk, Show } from "@clerk/nextjs";
import { cn } from "@/lib/utils";
import { ModeToggle } from "@/components/site/general/theme/mode-toggle";
import { CategoryListItem } from "@/actions/category/get-categories";

// ============================================================
// CUSTOM SVG — Shield
// ============================================================

function ShieldIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 2 4 5v6c0 5.25 3.4 9.74 8 11 4.6-1.26 8-5.75 8-11V5l-8-3Z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  );
}

// ============================================================
// TYPES
// ============================================================

interface NavbarClientProps {
  categories: CategoryListItem[];
}

// ============================================================
// COMPONENT
// ============================================================

export function NavbarClient({ categories }: NavbarClientProps) {
  const pathname = usePathname();
  const { user } = useUser();
  const { signOut } = useClerk();

  const [menuOpen, setMenuOpen] = React.useState(false);
  const [userMenuOpen, setUserMenuOpen] = React.useState(false);

  const userMenuRef = React.useRef<HTMLDivElement>(null);
  const lineMenuRef = React.useRef<HTMLDivElement>(null);

  const role = (user?.publicMetadata as { role?: string } | undefined)?.role;
  const isAdmin = role === "ADMIN";

  const isAdminRoute =
    pathname === "/admin" || pathname.startsWith("/admin/");

  // Show only active categories + active subs
  const visibleCategories = React.useMemo(
    () =>
      categories
        .filter((c) => c.isActive)
        .map((c) => ({
          ...c,
          subcategories: (c.subcategories ?? []).filter((s) => s.isActive),
        })),
    [categories],
  );

  // ---------------------------------------------------------
  // Close menus on route change
  // ---------------------------------------------------------
  React.useEffect(() => {
    setMenuOpen(false);
    setUserMenuOpen(false);
  }, [pathname]);

  // ---------------------------------------------------------
  // Close line menu on outside click
  // ---------------------------------------------------------
  React.useEffect(() => {
    if (!menuOpen) return;

    const onMouseDown = (e: MouseEvent) => {
      const target = e.target as Node | null;
      if (
        lineMenuRef.current &&
        target &&
        !lineMenuRef.current.contains(target)
      ) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, [menuOpen]);

  // ---------------------------------------------------------
  // Close line menu on Escape
  // ---------------------------------------------------------
  React.useEffect(() => {
    if (!menuOpen) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [menuOpen]);

  // ---------------------------------------------------------
  // Close user menu on outside click
  // ---------------------------------------------------------
  React.useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(e.target as Node)
      ) {
        setUserMenuOpen(false);
      }
    };
    if (userMenuOpen) {
      document.addEventListener("mousedown", handleClick);
    }
    return () => document.removeEventListener("mousedown", handleClick);
  }, [userMenuOpen]);

  // ---------------------------------------------------------
  // Lock body scroll while the panel is open on small screens
  // ---------------------------------------------------------
  React.useEffect(() => {
    const isSmall =
      typeof window !== "undefined" &&
      window.matchMedia("(max-width: 640px)").matches;

    document.body.style.overflow = menuOpen && isSmall ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  // ---------------------------------------------------------
  // Admin route → no navbar
  // ---------------------------------------------------------
  if (isAdminRoute) {
    return null;
  }

  return (
    <>
      <header
        className={cn(
          "fixed left-1/2 z-50 -translate-x-1/2 top-4",
          "w-[calc(100%-2rem)] max-w-[1400px]",
        )}
      >
        <div
          className={cn(
            "relative overflow-visibles",
            "",
            "  ",
          )}
        >
          <div className="relative flex h-14 items-center justify-between gap-2 px-3 sm:px-4">
            {/* ============================================================
                LEFT — icon trigger + brand
                ============================================================ */}
            <div
              ref={lineMenuRef}
              className="relative flex items-center gap-2.5 pl-1"
            >
              {/* Icon trigger — animated hamburger */}
              <button
                type="button"
                onClick={() => setMenuOpen((v) => !v)}
                aria-expanded={menuOpen}
                aria-controls="navbar-line-menu"
                aria-label={menuOpen ? "Close menu" : "Open menu"}
                className={cn(
                  "group relative inline-flex h-9 w-9 items-center justify-center rounded-full",
                  "text-foreground/80",
                  "transition-colors duration-300",
                  "hover:bg-muted/50 hover:text-primary",
                  "focus-visible:outline-none focus-visible:ring-2",
                  "focus-visible:ring-primary/40 focus-visible:ring-offset-2",
                  "focus-visible:ring-offset-background",
                  menuOpen && "bg-muted/50 text-primary",
                )}
              >
                <span
                  aria-hidden="true"
                  className="relative block h-[14px] w-[18px]"
                >
                  {/* Top line */}
                  <span
                    className={cn(
                      "absolute left-0 block h-[1.75px] w-full rounded-full bg-current",
                      "transition-all duration-300 ease-out",
                      "top-0",
                      menuOpen && "top-1/2 -translate-y-1/2 rotate-45",
                    )}
                  />

                  {/* Middle line */}
                  <span
                    className={cn(
                      "absolute top-1/2 block h-[1.75px] rounded-full bg-current",
                      "transition-all duration-300 ease-out",
                      "-translate-y-1/2",
                      menuOpen
                        ? "left-1/2 w-0 opacity-0"
                        : "left-0 w-3/4 opacity-100",
                    )}
                  />

                  {/* Bottom line */}
                  <span
                    className={cn(
                      "absolute left-0 block h-[1.75px] w-full rounded-full bg-current",
                      "transition-all duration-300 ease-out",
                      "bottom-0",
                      menuOpen && "bottom-1/2 translate-y-1/2 -rotate-45",
                    )}
                  />
                </span>
              </button>

              {/* BRAND — ALENTAH */}
              <Link
                href="/"
                aria-label="ALENTAH — Home"
                className="group flex shrink-0 items-baseline gap-1"
              >
                <span
                  className={cn(
                    "font-serif text-lg sm:text-xl md:text-2xl",
                    "tracking-[0.04em] text-foreground",
                    "transition-colors duration-300",
                    "group-hover:text-primary",
                  )}
                >
                  ALENTAH
                </span>

                <span
                  aria-hidden="true"
                  className={cn(
                    "block size-1 rounded-full bg-primary",
                    "transition-all duration-300",
                    "group-hover:scale-125",
                  )}
                />
              </Link>

              {/* FLOATING CATEGORY PANEL */}
              <div
                id="navbar-line-menu"
                role="region"
                aria-label="Categories"
                className={cn(
                  "absolute left-0 top-full z-50 mt-4 origin-top-left",
                  "transition-all duration-300 ease-out",
                  menuOpen
                    ? "pointer-events-auto translate-y-0 scale-100 opacity-100"
                    : "pointer-events-none translate-y-1 scale-[0.98] opacity-0",
                )}
              >
                <nav
                  className={cn(
                    "w-[280px] overflow-hidden rounded-2xl",
                    "border border-border bg-background/95",
                    "shadow-[0_24px_60px_-20px_rgba(0,0,0,0.5)]",
                    "backdrop-blur-xl backdrop-saturate-150",
                    "sm:w-xs",
                  )}
                >
                  {/* Header */}
                  <div className="border-b border-border/70 px-4 pb-3 pt-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-primary">
                        Browse
                      </p>

                      <span className="rounded-full border border-border bg-muted/50 px-2 py-0.5 text-[10px] font-semibold tabular-nums text-muted-foreground">
                        {visibleCategories.length}
                      </span>
                    </div>
                  </div>

                  {/* Items */}
                  <ul className="max-h-[calc(100vh-14rem)] overflow-y-auto p-2">
                    {visibleCategories.length === 0 ? (
                      <li className="px-3 py-3 text-sm text-muted-foreground">
                        No categories yet.
                      </li>
                    ) : (
                      visibleCategories.map((item, index) => {
                        const number = String(index + 1).padStart(2, "0");
                        const href = `/${item.slug}`;
                        const isActive = pathname.startsWith(href);

                        return (
                          <li
                            key={item.id}
                            className={cn(
                              "transition-all duration-300 ease-out",
                              menuOpen
                                ? "translate-y-0 opacity-100"
                                : "translate-y-1 opacity-0",
                            )}
                            style={{
                              transitionDelay: menuOpen
                                ? `${50 + index * 35}ms`
                                : "0ms",
                            }}
                          >
                            <Link
                              href={href}
                              onClick={() => setMenuOpen(false)}
                              className={cn(
                                "group flex items-center gap-3 rounded-xl",
                                "px-3 py-2.5",
                                "transition-colors duration-200",
                                "hover:bg-muted/50",
                                "focus-visible:outline-none focus-visible:bg-muted/50",
                                isActive && "bg-muted/40",
                              )}
                            >
                              <span
                                className={cn(
                                  "text-[11px] font-semibold tabular-nums",
                                  "transition-colors duration-200",
                                  isActive
                                    ? "text-primary"
                                    : "text-muted-foreground/60 group-hover:text-primary",
                                )}
                              >
                                {number}
                              </span>

                              <span
                                className={cn(
                                  "flex-1 truncate text-sm font-medium",
                                  isActive
                                    ? "text-primary"
                                    : "text-foreground",
                                )}
                              >
                                {item.name}
                              </span>

                              <span
                                aria-hidden="true"
                                className={cn(
                                  "block h-px w-0 bg-primary",
                                  "transition-all duration-300 ease-out",
                                  "group-hover:w-5",
                                )}
                              />
                            </Link>

                            {item.subcategories.length > 0 && (
                              <ul className="mb-1 ml-4 border-l border-border/60 pl-3">
                                {item.subcategories.map((child) => (
                                  <li key={child.id}>
                                    <Link
                                      href={`/${item.slug}?sub=${child.slug}`}
                                      onClick={() => setMenuOpen(false)}
                                      className={cn(
                                        "block rounded-lg px-2 py-1.5",
                                        "text-[12.5px] text-muted-foreground",
                                        "transition-colors duration-150",
                                        "hover:text-foreground hover:bg-muted/40",
                                      )}
                                    >
                                      {child.name}
                                    </Link>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </li>
                        );
                      })
                    )}
                  </ul>
                </nav>
              </div>
            </div>

            {/* ============================================================
                RIGHT — actions
                ============================================================ */}
            <div className="flex shrink-0 items-center gap-1 sm:gap-1.5">
              <button
                type="button"
                aria-label="Search"
                className={cn(
                  "hidden sm:inline-flex h-9 w-9 items-center justify-center rounded-full",
                  "text-foreground/60 hover:text-primary hover:bg-accent",
                  "transition-colors duration-200",
                )}
              >
                <Search className="h-[17px] w-[17px]" strokeWidth={1.75} />
              </button>

              <ModeToggle />

              <Show when="signed-out">
                <SignInButton
                  mode="modal"
                  forceRedirectUrl="/"
                  signUpForceRedirectUrl="/"
                >
                  <button
                    type="button"
                    className={cn(
                      "inline-flex h-9 items-center justify-center",
                      "px-4 sm:px-5 rounded-full",
                      "border border-primary bg-transparent text-primary",
                      "text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.18em]",
                      "hover:bg-primary hover:text-primary-foreground",
                      "transition-colors duration-200",
                    )}
                  >
                    Login
                  </button>
                </SignInButton>
              </Show>

              <Show when="signed-in">
                <div className="relative" ref={userMenuRef}>
                  <button
                    type="button"
                    aria-label="Open user menu"
                    aria-expanded={userMenuOpen}
                    onClick={() => setUserMenuOpen((v) => !v)}
                    className={cn(
                      "inline-flex h-9 w-9 items-center justify-center rounded-full",
                      "overflow-hidden border border-border",
                      "hover:border-primary transition-colors duration-200",
                    )}
                  >
                    {user?.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={user.imageUrl}
                        alt={user.fullName ?? "User avatar"}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center bg-primary text-primary-foreground text-xs font-semibold">
                        {user?.firstName?.[0]?.toUpperCase() ??
                          user?.primaryEmailAddress?.emailAddress?.[0]?.toUpperCase() ??
                          "U"}
                      </div>
                    )}
                  </button>

                  {userMenuOpen && (
                    <div
                      className={cn(
                        "absolute right-0 top-full mt-3 z-50",
                        "w-[240px] overflow-hidden",
                        "border border-border bg-popover/95 backdrop-blur-xl rounded-2xl",
                        "shadow-[0_20px_40px_-16px_rgba(0,0,0,0.18)]",
                        "animate-in fade-in slide-in-from-top-2 duration-150",
                      )}
                    >
                      <div className="px-4 py-3 border-b border-border">
                        <p className="text-[13px] font-medium text-popover-foreground truncate">
                          {user?.fullName ?? "Reader"}
                        </p>
                        <p className="text-[11px] text-muted-foreground truncate">
                          {user?.primaryEmailAddress?.emailAddress}
                        </p>
                      </div>

                      <ul className="py-1.5">
                        <li>
                          <Link
                            href="/profile"
                            onClick={() => setUserMenuOpen(false)}
                            className={cn(
                              "flex items-center gap-3 px-4 py-2 mx-1 rounded-lg",
                              "text-[13px] text-popover-foreground/85",
                              "hover:bg-accent hover:text-foreground",
                              "transition-colors",
                            )}
                          >
                            <UserIcon className="h-4 w-4" strokeWidth={1.75} />
                            Profile
                          </Link>
                        </li>
                        <li>
                          <Link
                            href="/saved"
                            onClick={() => setUserMenuOpen(false)}
                            className={cn(
                              "flex items-center gap-3 px-4 py-2 mx-1 rounded-lg",
                              "text-[13px] text-popover-foreground/85",
                              "hover:bg-accent hover:text-foreground",
                              "transition-colors",
                            )}
                          >
                            <Bookmark className="h-4 w-4" strokeWidth={1.75} />
                            Saved
                          </Link>
                        </li>

                        {isAdmin && (
                          <>
                            <li className="my-1 h-px bg-border mx-3" />
                            <li>
                              <Link
                                href="/admin"
                                onClick={() => setUserMenuOpen(false)}
                                className={cn(
                                  "flex items-center gap-3 px-4 py-2 mx-1 rounded-lg",
                                  "text-[13px] font-medium text-primary",
                                  "hover:bg-primary/10",
                                  "transition-colors",
                                )}
                              >
                                <ShieldIcon className="h-4 w-4" />
                                Admin
                                <span
                                  className={cn(
                                    "ml-auto text-[9px] uppercase tracking-[0.15em]",
                                    "px-1.5 py-0.5 rounded",
                                    "bg-primary/15 text-primary",
                                  )}
                                >
                                  CMS
                                </span>
                              </Link>
                            </li>
                          </>
                        )}
                      </ul>

                      <div className="border-t border-border py-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setUserMenuOpen(false);
                            signOut({ redirectUrl: "/" });
                          }}
                          className={cn(
                            "flex w-[calc(100%-0.5rem)] items-center gap-3 px-4 py-2 mx-1 rounded-lg",
                            "text-[13px] text-popover-foreground/85",
                            "hover:bg-accent hover:text-foreground",
                            "transition-colors",
                          )}
                        >
                          <LogOut className="h-4 w-4" strokeWidth={1.75} />
                          Sign out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </Show>
            </div>
          </div>
        </div>
      </header>

      <div aria-hidden className="h-24" />
    </>
  );
}

// ============================================================
// SKELETON
// ============================================================

export function NavbarSkeleton() {
  return (
    <>
      <div
        aria-hidden
        className="fixed top-4 left-1/2 z-50 w-[calc(100%-2rem)] max-w-[1400px] -translate-x-1/2"
      >
        <div className="flex h-14 items-center justify-between gap-2 rounded-full border border-border/60 bg-background/70 px-3 backdrop-blur-xl sm:px-4">
          <div className="flex items-center gap-2.5 pl-1">
            <div className="size-9 rounded-full bg-muted" />
            <div className="h-4 w-20 rounded bg-muted" />
          </div>
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-full bg-muted" />
            <div className="h-8 w-16 rounded-full bg-muted" />
          </div>
        </div>
      </div>
      <div aria-hidden className="h-24" />
    </>
  );
}