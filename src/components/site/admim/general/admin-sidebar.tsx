"use client";

// ============================================================
// Admin Sidebar — ALENTAH
// Collapsible editorial navigation.
// The Nav (which uses usePathname) is wrapped in Suspense
// so Next.js 16 can prerender the shell.
// ============================================================

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useClerk } from "@clerk/nextjs";
import {
  LayoutDashboard,
  FileText,
  FolderTree,
  Users,
  MessageSquare,
  Mail,
  Image as ImageIcon,
  Settings,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ============================================================
// NAV DATA
// ============================================================

type NavItem = {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
};

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Articles", href: "/admin/articles", icon: FileText },
  { label: "Categories", href: "/admin/categories", icon: FolderTree },
  { label: "Editors", href: "/admin/editors", icon: Users },
  { label: "Comments", href: "/admin/comments", icon: MessageSquare },
  { label: "Newsletter", href: "/admin/newsletter", icon: Mail },
  { label: "Media", href: "/admin/media", icon: ImageIcon },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

const STORAGE_KEY = "alentah:admin-sidebar-collapsed";

// ============================================================
// SIDEBAR
// ============================================================

export function AdminSidebar() {
  const { signOut } = useClerk();

  const [collapsed, setCollapsed] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === "true") setCollapsed(true);
    } catch {
      /* ignore */
    }
    setMounted(true);
  }, []);

  React.useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem(STORAGE_KEY, String(collapsed));
    } catch {
      /* ignore */
    }
  }, [collapsed, mounted]);

  // ⌘B / Ctrl+B
  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "b") {
        e.preventDefault();
        setCollapsed((v) => !v);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <aside
      className={cn(
        "hidden lg:flex flex-col",
        "shrink-0",
        "h-[calc(100vh-4rem)] sticky top-16",
        "border-r border-border",
        "bg-background/60 backdrop-blur-sm",
        "transition-[width] duration-300 ease-out",
        collapsed ? "w-[72px]" : "w-[260px]",
      )}
    >
      {/* ============================================
          HEADER — profile + collapse toggle
          ============================================ */}
      <div
        className={cn(
          "flex items-center border-b border-border",
          "transition-all duration-300",
          collapsed ? "px-3 py-3 justify-center" : "px-4 py-3 gap-3",
        )}
      >
        <div
          className={cn(
            "h-10 w-10 rounded-full overflow-hidden shrink-0",
            "border border-border ring-1 ring-primary/10",
          )}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/admin.png"
            alt="Talha Tabish"
            className="h-full w-full object-cover"
          />
        </div>

        {!collapsed && (
          <div className="min-w-0 flex-1 overflow-hidden">
            <p className="font-serif text-[14px] leading-tight text-foreground truncate">
              Talha Tabish
            </p>
            <p className="mt-0.5 text-[10px] uppercase tracking-[0.15em] text-muted-foreground truncate">
              Editor-in-Chief
            </p>
          </div>
        )}

        <button
          type="button"
          onClick={() => setCollapsed((v) => !v)}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          title={collapsed ? "Expand (⌘B)" : "Collapse (⌘B)"}
          className={cn(
            "shrink-0 inline-flex items-center justify-center",
            "h-8 w-8 rounded-lg",
            "text-muted-foreground hover:text-foreground hover:bg-accent",
            "transition-colors duration-200",
          )}
        >
          {collapsed ? (
            <PanelLeftOpen className="h-4 w-4" strokeWidth={1.75} />
          ) : (
            <PanelLeftClose className="h-4 w-4" strokeWidth={1.75} />
          )}
        </button>
      </div>

      {/* ============================================
          NAV — uses usePathname → must be in Suspense
          ============================================ */}
      <Suspense fallback={<SidebarNavSkeleton collapsed={collapsed} />}>
        <SidebarNav collapsed={collapsed} />
      </Suspense>

      {/* ============================================
          SIGN OUT — no usePathname, safe outside Suspense
          ============================================ */}
      <div
        className={cn(
          "border-t border-border",
          collapsed ? "px-2 py-3" : "px-3 py-3",
        )}
      >
        <button
          type="button"
          onClick={() => signOut({ redirectUrl: "/" })}
          aria-label="Sign out"
          title={collapsed ? "Sign out" : undefined}
          className={cn(
            "group flex w-full items-center",
            "rounded-lg",
            "text-[11px] font-medium uppercase tracking-[0.15em]",
            "text-muted-foreground hover:text-foreground hover:bg-accent/60",
            "transition-all duration-200",
            collapsed ? "justify-center h-11 px-0" : "gap-3 px-3 py-2.5",
          )}
        >
          <LogOut
            className="h-[17px] w-[17px] shrink-0 text-foreground/50"
            strokeWidth={1.75}
          />
          {!collapsed && <span>Sign out</span>}
        </button>
      </div>
    </aside>
  );
}

// ============================================================
// NAV — the piece that uses usePathname(), isolated for Suspense
// ============================================================

function SidebarNav({ collapsed }: { collapsed: boolean }) {
  const pathname = usePathname();

  return (
    <nav
      className={cn(
        "flex-1 overflow-y-auto px-3 py-4",
        "scrollbar-none [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden",
      )}
    >
      <ul className="flex flex-col gap-0.5">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-label={item.label}
                title={collapsed ? item.label : undefined}
                className={cn(
                  "group relative flex items-center",
                  "rounded-lg",
                  "text-[11px] font-medium uppercase tracking-[0.15em]",
                  "transition-all duration-200",
                  collapsed
                    ? "justify-center h-11 px-0"
                    : "gap-3 px-3 py-2.5",
                  isActive
                    ? "text-primary bg-accent"
                    : "text-foreground/70 hover:text-foreground hover:bg-accent/60",
                )}
              >
                {isActive && (
                  <span
                    aria-hidden
                    className={cn(
                      "absolute left-0 w-[3px] rounded-r-lg bg-primary",
                      collapsed ? "top-2.5 bottom-2.5" : "top-2 bottom-2",
                    )}
                  />
                )}

                <Icon
                  className={cn(
                    "h-[17px] w-[17px] shrink-0",
                    isActive ? "text-primary" : "text-foreground/60",
                  )}
                  strokeWidth={1.75}
                />

                {!collapsed && <span className="truncate">{item.label}</span>}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

// ============================================================
// NAV SKELETON — matches the nav's shape (no layout shift)
// ============================================================

function SidebarNavSkeleton({ collapsed }: { collapsed: boolean }) {
  return (
    <nav
      className={cn(
        "flex-1 overflow-y-auto px-3 py-4",
        "scrollbar-none [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden",
      )}
      aria-hidden
    >
      <ul className="flex flex-col gap-0.5">
        {NAV_ITEMS.map((item) => (
          <li key={item.href}>
            <div
              className={cn(
                "flex items-center rounded-lg",
                collapsed
                  ? "justify-center h-11 px-0"
                  : "gap-3 px-3 py-2.5",
              )}
            >
              <div className="h-[17px] w-[17px] rounded shrink-0 bg-muted animate-pulse" />
              {!collapsed && (
                <div
                  className={cn(
                    "h-2.5 rounded-full bg-muted animate-pulse",
                    item.label.length > 8 ? "w-24" : "w-16",
                  )}
                />
              )}
            </div>
          </li>
        ))}
      </ul>
    </nav>
  );
}

// ============================================================
// Import Suspense from react
// ============================================================

import { Suspense } from "react";