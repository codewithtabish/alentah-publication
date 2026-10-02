"use client";

// ============================================================
// Navbar — ALENTAH (Client)
// Floating editorial masthead. HIDDEN on /admin routes.
// Categories come from getCategories() (existing action).
// ============================================================

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Search,
  Menu,
  X,
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
  const [openDropdown, setOpenDropdown] = React.useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [userMenuOpen, setUserMenuOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);

  const userMenuRef = React.useRef<HTMLDivElement>(null);

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

  React.useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 12);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  React.useEffect(() => {
    setMobileOpen(false);
    setOpenDropdown(null);
    setUserMenuOpen(false);
  }, [pathname]);

  React.useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

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

  if (isAdminRoute) {
    return null;
  }

  return (
    <>
      <header
        className={cn(
          "fixed left-1/2 -translate-x-1/2 z-50",
          "w-[calc(100%-2rem)] max-w-[1400px]",
          "transition-all duration-500 ease-out",
          scrolled
            ? "top-3 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.18)] dark:shadow-[0_8px_40px_-12px_rgba(0,0,0,0.6)]"
            : "top-4 shadow-[0_4px_24px_-8px_rgba(0,0,0,0.10)] dark:shadow-[0_4px_24px_-8px_rgba(0,0,0,0.4)]",
        )}
      >
        <div
          className={cn(
            "relative overflow-visible rounded-full",
            "border border-border/60",
            "transition-all duration-500",
            "backdrop-blur-xl backdrop-saturate-150",
            scrolled ? "bg-background/85" : "bg-background/70",
            "before:absolute before:inset-0 before:rounded-full before:pointer-events-none",
            "before:bg-[radial-gradient(ellipse_80%_120%_at_50%_-20%,color-mix(in_oklab,var(--primary)_8%,transparent),transparent_70%)]",
            "dark:before:bg-[radial-gradient(ellipse_80%_120%_at_50%_-20%,color-mix(in_oklab,var(--primary)_18%,transparent),transparent_70%)]",
          )}
        >
          <div
            aria-hidden
            className="absolute inset-x-8 bottom-0 h-px bg-linear-to-r from-transparent via-primary/60 to-transparent"
          />

          <div className="relative flex h-14 items-center justify-between gap-3 px-3 sm:px-5">
            {/* LEFT: WORDMARK */}
            <Link
              href="/"
              aria-label="ALENTAH — Home"
              className="group flex shrink-0 items-center pl-2"
            >
              <span
                className={cn(
                  "font-serif text-xl sm:text-2xl tracking-tight text-foreground",
                  "transition-colors duration-300 group-hover:text-primary",
                )}
              >
                ALENTAH
              </span>
            </Link>

            {/* CENTER: DESKTOP NAV */}
            <nav className="hidden lg:flex flex-1 items-center justify-center gap-1">
              {visibleCategories.map((item) => {
                const href = `/category/${item.slug}`;
                const isActive = pathname.startsWith(href);
                const hasChildren = item.subcategories.length > 0;

                return (
                  <div
                    key={item.id}
                    className="relative"
                    onMouseEnter={() =>
                      hasChildren && setOpenDropdown(item.id)
                    }
                    onMouseLeave={() => hasChildren && setOpenDropdown(null)}
                  >
                    <Link
                      href={href}
                      className={cn(
                        "relative inline-flex items-center whitespace-nowrap",
                        "px-3 py-2 rounded-full",
                        "text-[11px] font-medium uppercase tracking-[0.16em]",
                        "transition-all duration-200",
                        isActive
                          ? "text-primary"
                          : "text-foreground/70 hover:text-foreground",
                        "hover:bg-accent",
                      )}
                    >
                      {item.name}
                    </Link>

                    {hasChildren && openDropdown === item.id && (
                      <div className="absolute left-1/2 top-full z-50 -translate-x-1/2 pt-3">
                        <div
                          className={cn(
                            "min-w-[220px] overflow-hidden",
                            "border border-border bg-popover/95 backdrop-blur-xl rounded-2xl",
                            "shadow-[0_20px_40px_-16px_rgba(0,0,0,0.18)]",
                          )}
                        >
                          <ul className="py-2">
                            {item.subcategories.map((child) => (
                              <li key={child.id}>
                                <Link
                                  href={`/category/${item.slug}/${child.slug}`}
                                  className={cn(
                                    "block px-4 py-2 mx-1 rounded-lg",
                                    "text-[13px] text-popover-foreground/80",
                                    "hover:bg-accent hover:text-foreground",
                                    "transition-colors duration-150",
                                  )}
                                >
                                  {child.name}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>

            {/* RIGHT: ACTIONS */}
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

              <button
                type="button"
                aria-label={mobileOpen ? "Close menu" : "Open menu"}
                aria-expanded={mobileOpen}
                onClick={() => setMobileOpen((v) => !v)}
                className={cn(
                  "inline-flex lg:hidden h-9 w-9 items-center justify-center rounded-full",
                  "text-foreground hover:text-primary hover:bg-accent",
                  "transition-colors duration-200",
                )}
              >
                {mobileOpen ? (
                  <X className="h-5 w-5" strokeWidth={1.75} />
                ) : (
                  <Menu className="h-5 w-5" strokeWidth={1.75} />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* MOBILE MENU */}
        {mobileOpen && (
          <div
            className={cn(
              "lg:hidden mt-3 overflow-hidden",
              "bg-background/85 backdrop-blur-xl backdrop-saturate-150",
              "border border-border/60 rounded-3xl",
              "shadow-[0_20px_60px_-20px_rgba(0,0,0,0.25)]",
              "max-h-[calc(100vh-8rem)] overflow-y-auto",
              "relative",
              "before:absolute before:inset-0 before:pointer-events-none before:rounded-3xl",
              "before:bg-[radial-gradient(ellipse_80%_120%_at_50%_-20%,color-mix(in_oklab,var(--primary)_6%,transparent),transparent_70%)]",
              "dark:before:bg-[radial-gradient(ellipse_80%_120%_at_50%_-20%,color-mix(in_oklab,var(--primary)_14%,transparent),transparent_70%)]",
            )}
          >
            <div className="relative px-5 py-4">
              <ul className="flex flex-col">
                {visibleCategories.map((item, idx) => {
                  const href = `/category/${item.slug}`;
                  const isActive = pathname.startsWith(href);

                  return (
                    <li
                      key={item.id}
                      className="border-b border-border/60 last:border-b-0"
                    >
                      <Link
                        href={href}
                        className={cn(
                          "flex items-baseline justify-between py-3.5",
                          "text-base font-serif tracking-tight",
                          isActive
                            ? "text-primary"
                            : "text-foreground hover:text-primary",
                          "transition-colors duration-200",
                        )}
                      >
                        <span>{item.name}</span>
                        <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                          {String(idx + 1).padStart(2, "0")}
                        </span>
                      </Link>

                      {item.subcategories.length > 0 && (
                        <ul className="pb-3 pl-4 flex flex-col gap-1.5 border-l border-border ml-1">
                          {item.subcategories.map((child) => (
                            <li key={child.id}>
                              <Link
                                href={`/category/${item.slug}/${child.slug}`}
                                className="block text-[13px] text-muted-foreground hover:text-foreground transition-colors"
                              >
                                {child.name}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  );
                })}
              </ul>

              <div className="mt-5 flex flex-col gap-2">
                <Show when="signed-out">
                  <SignInButton
                    mode="modal"
                    forceRedirectUrl="/"
                    signUpForceRedirectUrl="/"
                  >
                    <button
                      type="button"
                      className={cn(
                        "inline-flex h-11 items-center justify-center rounded-full",
                        "border border-primary bg-transparent text-primary",
                        "text-[11px] font-semibold uppercase tracking-[0.18em]",
                        "hover:bg-primary hover:text-primary-foreground",
                        "transition-colors duration-200",
                      )}
                    >
                      Login
                    </button>
                  </SignInButton>
                </Show>

                <Show when="signed-in">
                  <Link
                    href="/profile"
                    className={cn(
                      "inline-flex h-11 items-center justify-center gap-2 rounded-full",
                      "border border-border text-foreground",
                      "text-[11px] font-semibold uppercase tracking-[0.18em]",
                      "hover:bg-accent transition-colors",
                    )}
                  >
                    <UserIcon className="h-4 w-4" />
                    Profile
                  </Link>

                  {isAdmin && (
                    <Link
                      href="/admin"
                      className={cn(
                        "inline-flex h-11 items-center justify-center gap-2 rounded-full",
                        "border border-primary bg-primary/10 text-primary",
                        "text-[11px] font-semibold uppercase tracking-[0.18em]",
                        "hover:bg-primary/15 transition-colors",
                      )}
                    >
                      <ShieldIcon className="h-4 w-4" />
                      Admin
                    </Link>
                  )}
                </Show>
              </div>
            </div>
          </div>
        )}
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
        className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-[1400px]"
      >
        <div className="h-14 rounded-full border border-border/60 bg-background/70 backdrop-blur-xl" />
      </div>
      <div aria-hidden className="h-24" />
    </>
  );
}