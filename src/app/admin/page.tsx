// src/app/(admin)/admin/page.tsx
// ============================================================
// Admin Dashboard — ALENTAH
// Server component. Renders instantly; sections stream in
// via <Suspense> with per-section skeletons.
//
// Data sources:
//   - getAdminArticles()   → articles + status breakdown
//   - getAdminDashboard()  → KPIs, charts, recent activity
//
// Charts are client components (Recharts).
//
// SEO:
//   - noindex — admin pages must never be indexed.
// ============================================================

import type { Metadata } from "next";
import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  FileText,
  Users,
  MessageSquare,
  Mail,
  ArrowUpRight,
  Clock,
} from "lucide-react";

import { getAdminArticles } from "@/actions/blog/get-admin-articles";
import { getAdminDashboard } from "@/actions/admin/get-admin-dashboard";

import { cn } from "@/lib/utils";
import { KpiCard } from "@/components/site/admim/general/kpi-card";
import { ActivityChart, TopCategoriesChart } from "@/components/site/admim/general/dashboard-charts";

// ============================================================
// SEO
// ============================================================

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Admin dashboard — editorial activity overview.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
    },
  },
};

// ============================================================
// PAGE — server shell
// ============================================================

export default function AdminDashboardPage() {
  return (
    <div className="space-y-8">
      {/* ── Static header (renders instantly) ── */}
      <header className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-muted-foreground">
            Overview
          </p>
          <h1 className="mt-1 font-serif text-3xl tracking-tight text-foreground sm:text-4xl">
            Dashboard
          </h1>
          <p className="mt-2 max-w-xl text-[13px] leading-6 text-muted-foreground">
            A live view of your editorial activity — articles, users, comments,
            and newsletter growth.
          </p>
        </div>
      </header>

      {/* ── KPIs — stream independently ── */}
      <Suspense fallback={<KpisSkeleton />}>
        <KpisSection />
      </Suspense>

      {/* ── Charts — stream independently ── */}
      <Suspense fallback={<ChartsSkeleton />}>
        <ChartsSection />
      </Suspense>

      {/* ── Recent panels — stream independently ── */}
      <Suspense fallback={<PanelsSkeleton />}>
        <RecentPanelsSection />
      </Suspense>

      {/* ── Status strip — stream independently ── */}
      <Suspense fallback={<StatusStripSkeleton />}>
        <StatusStripSection />
      </Suspense>
    </div>
  );
}

// ============================================================
// SECTION — KPI CARDS
// ============================================================

async function KpisSection() {
  const result = await getAdminDashboard();

  if (!result.success) {
    return <ErrorCard message={result.error} />;
  }

  const { kpis } = result.data;

  return (
    <section
      aria-label="Key metrics"
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
    >
      <KpiCard
        label="Articles"
        value={kpis.articles.total}
        hint={`${kpis.articles.published} published · ${kpis.articles.draft} draft`}
        icon={FileText}
        tone="primary"
      />
      <KpiCard
        label="Users"
        value={kpis.users.total}
        hint={`${kpis.users.admins} admin${kpis.users.admins === 1 ? "" : "s"}`}
        icon={Users}
      />
      <KpiCard
        label="Comments"
        value={kpis.comments.total}
        hint={`${kpis.comments.pending} pending review`}
        icon={MessageSquare}
        tone={kpis.comments.pending > 0 ? "warning" : "default"}
      />
      <KpiCard
        label="Newsletter"
        value={kpis.newsletter.total}
        hint={`${kpis.newsletter.subscribed} subscribed`}
        icon={Mail}
      />
    </section>
  );
}

// ============================================================
// SECTION — CHARTS
// ============================================================

async function ChartsSection() {
  const result = await getAdminDashboard();

  if (!result.success) {
    return <ErrorCard message={result.error} />;
  }

  const { articlesByDay, usersByDay, commentsByDay, topCategories } =
    result.data;

  return (
    <>
      <section className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <ChartPanel title="Articles published" subtitle="Last 30 days">
          <ActivityChart data={articlesByDay} label="Articles" />
        </ChartPanel>

        <ChartPanel title="Users joined" subtitle="Last 30 days">
          <ActivityChart
            data={usersByDay}
            label="Users"
            color="hsl(var(--foreground))"
          />
        </ChartPanel>
      </section>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <ChartPanel title="Comments activity" subtitle="Last 30 days">
          <ActivityChart
            data={commentsByDay}
            label="Comments"
            color="hsl(45 90% 55%)"
          />
        </ChartPanel>

        <ChartPanel title="Top categories" subtitle="By article count">
          {topCategories.length === 0 ? (
            <EmptyState message="No categories yet." />
          ) : (
            <TopCategoriesChart data={topCategories} />
          )}
        </ChartPanel>
      </section>
    </>
  );
}

// ============================================================
// SECTION — RECENT PANELS (articles + comments)
// ============================================================

async function RecentPanelsSection() {
  const [articlesResult, dashboardResult] = await Promise.all([
    getAdminArticles(),
    getAdminDashboard(),
  ]);

  if (!articlesResult.success || !dashboardResult.success) {
    return (
      <ErrorCard
        message={
          !articlesResult.success
            ? articlesResult.error
            : !dashboardResult.success
              ? dashboardResult.error
              : "Unknown error"
        }
      />
    );
  }

  const { articles } = articlesResult;
  const { kpis, recentComments } = dashboardResult.data;

  return (
    <section className="grid grid-cols-1 gap-4 xl:grid-cols-2">
      {/* Recent articles */}
      <Panel
        title="Recent articles"
        subtitle={`${articles.length} total`}
        action={{ href: "/admin/articles", label: "View all" }}
      >
        {articles.length === 0 ? (
          <EmptyState message="No articles yet." />
        ) : (
          <ul className="divide-y divide-border">
            {articles.slice(0, 5).map((a) => (
              <li key={a.id}>
                <Link
                  href={`/admin/articles/${a.id}`}
                  className="group -mx-3 flex items-center gap-3 rounded-md px-3 py-3 transition-colors hover:bg-muted/40"
                >
                  {/* Next.js Image — 40×40 thumbnail, lazy, low priority */}
                  <div className="relative size-10 shrink-0 overflow-hidden rounded-md border border-border bg-muted">
                    {a.bannerImage ? (
                      <Image
                        src={a.bannerImage}
                        alt=""
                        fill
                        sizes="40px"
                        quality={70}
                        className="object-cover"
                      />
                    ) : null}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-medium text-foreground group-hover:text-primary">
                      {a.title}
                    </p>
                    <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
                      {a.category.name}
                      {a.subcategory ? ` · ${a.subcategory.name}` : ""}
                      {" · "}
                      {a.status.toLowerCase()}
                    </p>
                  </div>

                  <StatusPill status={a.status} />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      {/* Recent comments */}
      <Panel
        title="Recent comments"
        subtitle={`${kpis.comments.pending} pending`}
        action={{ href: "/admin/comments", label: "Moderate" }}
      >
        {recentComments.length === 0 ? (
          <EmptyState message="No comments yet." />
        ) : (
          <ul className="divide-y divide-border">
            {recentComments.map((c) => (
              <li key={c.id} className="py-3">
                <div className="flex items-start gap-3">
                  {/* Avatar — Next.js Image, lazy */}
                  <div className="relative size-8 shrink-0 overflow-hidden rounded-full border border-border bg-muted">
                    {c.user.imageUrl ? (
                      <Image
                        src={c.user.imageUrl}
                        alt=""
                        fill
                        sizes="32px"
                        quality={70}
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-[10px] font-semibold text-muted-foreground">
                        {(c.user.firstName ?? "?").charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[12px] font-medium text-foreground">
                      {[c.user.firstName, c.user.lastName]
                        .filter(Boolean)
                        .join(" ") || "Anonymous"}
                      <span className="ml-2 font-normal text-muted-foreground">
                        on {c.blog.title}
                      </span>
                    </p>
                    <p className="mt-1 line-clamp-2 text-[12px] leading-5 text-muted-foreground">
                      {c.content}
                    </p>
                  </div>

                  <StatusPill status={c.status} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </section>
  );
}

// ============================================================
// SECTION — STATUS STRIP
// ============================================================

async function StatusStripSection() {
  const result = await getAdminDashboard();

  if (!result.success) {
    return null; // Status strip is optional — fail silently
  }

  const { kpis } = result.data;

  return (
    <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <StatStrip
        label="Published"
        value={kpis.articles.published}
        total={kpis.articles.total}
        tone="primary"
      />
      <StatStrip
        label="Drafts"
        value={kpis.articles.draft}
        total={kpis.articles.total}
        tone="muted"
      />
      <StatStrip
        label="In review"
        value={kpis.articles.inReview}
        total={kpis.articles.total}
        tone="warning"
      />
      <StatStrip
        label="Scheduled"
        value={kpis.articles.scheduled}
        total={kpis.articles.total}
        tone="default"
      />
    </section>
  );
}

// ============================================================
// SUBCOMPONENTS
// ============================================================

function ChartPanel({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="mb-4 flex items-baseline justify-between gap-3">
        <h2 className="text-[12px] font-bold uppercase tracking-[0.16em] text-foreground">
          {title}
        </h2>
        {subtitle && (
          <span className="text-[11px] text-muted-foreground">{subtitle}</span>
        )}
      </div>
      {children}
    </div>
  );
}

function Panel({
  title,
  subtitle,
  action,
  children,
}: {
  title: string;
  subtitle?: string;
  action?: { href: string; label: string };
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-baseline gap-2">
          <h2 className="text-[12px] font-bold uppercase tracking-[0.16em] text-foreground">
            {title}
          </h2>
          {subtitle && (
            <span className="text-[11px] text-muted-foreground">
              {subtitle}
            </span>
          )}
        </div>

        {action && (
          <Link
            href={action.href}
            className="group inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            {action.label}
            <ArrowUpRight className="size-3 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        )}
      </div>

      {children}
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const tone: Record<string, string> = {
    PUBLISHED: "bg-primary/15 text-primary border-primary/30",
    APPROVED: "bg-primary/15 text-primary border-primary/30",
    DRAFT: "bg-muted text-muted-foreground border-border",
    IN_REVIEW: "bg-amber-500/15 text-amber-500 border-amber-500/30",
    PENDING: "bg-amber-500/15 text-amber-500 border-amber-500/30",
    SCHEDULED: "bg-blue-500/15 text-blue-500 border-blue-500/30",
    REJECTED: "bg-destructive/15 text-destructive border-destructive/30",
    SPAM: "bg-destructive/15 text-destructive border-destructive/30",
    ARCHIVED: "bg-muted text-muted-foreground/80 border-border",
  };

  const cls = tone[status] ?? "bg-muted text-muted-foreground border-border";

  return (
    <span
      className={cn(
        "shrink-0 rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.14em]",
        cls,
      )}
    >
      {status.replace(/_/g, " ")}
    </span>
  );
}

function StatStrip({
  label,
  value,
  total,
  tone = "default",
}: {
  label: string;
  value: number;
  total: number;
  tone?: "default" | "primary" | "warning" | "muted";
}) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;

  const barTone: Record<typeof tone, string> = {
    default: "bg-foreground/70",
    primary: "bg-primary",
    warning: "bg-amber-500",
    muted: "bg-muted-foreground/50",
  };

  return (
    <div className="rounded-lg border border-border bg-card p-3">
      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 font-serif text-xl tracking-tight tabular-nums text-foreground">
        {value}
        <span className="ml-1 text-[11px] font-normal text-muted-foreground">
          ({pct}%)
        </span>
      </p>
      <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={cn("h-full rounded-full transition-all", barTone[tone])}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex items-center gap-2 rounded-md border border-dashed border-border bg-muted/20 px-3 py-6 text-[12px] text-muted-foreground">
      <Clock className="size-3.5" />
      {message}
    </div>
  );
}

function ErrorCard({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-destructive/40 bg-destructive/5 p-5">
      <p className="font-serif text-base tracking-tight text-foreground">
        Couldn&rsquo;t load this section
      </p>
      <p className="mt-1 text-[12px] text-muted-foreground">{message}</p>
    </div>
  );
}

// ============================================================
// SKELETONS — per section
// ============================================================

function KpisSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="rounded-xl border border-border bg-card p-5">
          <div className="h-2.5 w-24 animate-pulse rounded-full bg-muted" />
          <div className="mt-3 h-9 w-20 animate-pulse rounded-md bg-muted" />
          <div className="mt-3 h-2.5 w-32 animate-pulse rounded-full bg-muted/70" />
        </div>
      ))}
    </div>
  );
}

function ChartsSkeleton() {
  return (
    <>
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        {[0, 1].map((i) => (
          <div
            key={i}
            className="rounded-xl border border-border bg-card p-5"
          >
            <div className="h-3 w-32 animate-pulse rounded-full bg-muted" />
            <div className="mt-6 h-56 w-full animate-pulse rounded-md bg-muted/60" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        {[0, 1].map((i) => (
          <div
            key={i}
            className="rounded-xl border border-border bg-card p-5"
          >
            <div className="h-3 w-32 animate-pulse rounded-full bg-muted" />
            <div className="mt-6 h-56 w-full animate-pulse rounded-md bg-muted/60" />
          </div>
        ))}
      </div>
    </>
  );
}

function PanelsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
      {[0, 1].map((i) => (
        <div key={i} className="rounded-xl border border-border bg-card p-5">
          <div className="h-3 w-32 animate-pulse rounded-full bg-muted" />
          <div className="mt-5 space-y-3">
            {[0, 1, 2, 3, 4].map((j) => (
              <div
                key={j}
                className="h-12 w-full animate-pulse rounded-md bg-muted/60"
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function StatusStripSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          className="rounded-lg border border-border bg-card p-3"
        >
          <div className="h-2.5 w-16 animate-pulse rounded-full bg-muted" />
          <div className="mt-2 h-5 w-20 animate-pulse rounded-md bg-muted" />
          <div className="mt-3 h-1 w-full animate-pulse rounded-full bg-muted/60" />
        </div>
      ))}
    </div>
  );
}