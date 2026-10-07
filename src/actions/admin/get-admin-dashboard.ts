// src/actions/admin/get-admin-dashboard.ts
"use server";

// ============================================================
// Admin dashboard aggregate — ALENTAH
// One call → everything the /admin home page renders.
//
// Returns:
//   - KPI counts (articles, users, comments, subscribers)
//   - Article breakdown (published / draft / in-review / scheduled)
//   - Comment breakdown (approved / pending / rejected / spam)
//   - 30-day activity (articles, users, comments per day)
//   - Top 5 categories by article count
//   - Latest 5 comments with author + blog
//
// Cached with tag "dashboard" so any admin write can invalidate.
// ============================================================

import { cacheTag, cacheLife } from "next/cache";
import prisma from "@/lib/clients/prisma-client";
import { CACHE_TAGS } from "@/lib/cache-keys";

// ────────────────────────────────────────────────────────────
// TYPES
// ────────────────────────────────────────────────────────────

export type AdminKpis = {
  articles: {
    total: number;
    published: number;
    draft: number;
    inReview: number;
    scheduled: number;
    archived: number;
  };
  users: {
    total: number;
    admins: number;
  };
  comments: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    spam: number;
  };
  newsletter: {
    total: number;
    subscribed: number;
    pending: number;
    unsubscribed: number;
  };
};

export type DailyPoint = {
  date: string; // ISO yyyy-mm-dd
  count: number;
};

export type CategoryPoint = {
  id: string;
  name: string;
  count: number;
};

export type RecentComment = {
  id: string;
  content: string;
  status: string;
  createdAt: Date;
  user: {
    firstName: string | null;
    lastName: string | null;
    imageUrl: string | null;
  };
  blog: {
    title: string;
    slug: string;
  };
};

export type AdminDashboardData = {
  kpis: AdminKpis;
  articlesByDay: DailyPoint[];
  usersByDay: DailyPoint[];
  commentsByDay: DailyPoint[];
  topCategories: CategoryPoint[];
  recentComments: RecentComment[];
};

export type GetAdminDashboardResult =
  | { success: true; data: AdminDashboardData }
  | { success: false; error: string };

// ────────────────────────────────────────────────────────────
// HELPERS
// ────────────────────────────────────────────────────────────

function toDateKey(d: Date): string {
  return d.toISOString().slice(0, 10); // yyyy-mm-dd
}

function last30Days(): string[] {
  const out: string[] = [];
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  for (let i = 29; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    out.push(toDateKey(d));
  }
  return out;
}

function groupByDay(dates: Date[], buckets: string[]): DailyPoint[] {
  const counts = new Map<string, number>();
  for (const key of buckets) counts.set(key, 0);

  for (const d of dates) {
    const key = toDateKey(new Date(d));
    if (counts.has(key)) {
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
  }

  return buckets.map((date) => ({
    date,
    count: counts.get(date) ?? 0,
  }));
}

// ────────────────────────────────────────────────────────────
// CACHED READ
// ────────────────────────────────────────────────────────────

async function readDashboard(): Promise<AdminDashboardData> {
  "use cache";
  cacheLife("max");
  cacheTag(CACHE_TAGS.dashboard);

  const since = new Date();
  since.setDate(since.getDate() - 30);
  since.setHours(0, 0, 0, 0);

  // ── Parallel aggregate queries ──
  const [
    articleCounts,
    userCounts,
    commentCounts,
    newsletterCounts,
    articles30,
    users30,
    comments30,
    topCategoriesRaw,
    recentCommentsRaw,
  ] = await Promise.all([
    // Article status breakdown
    prisma.blog.groupBy({
      by: ["status"],
      _count: { _all: true },
    }),

    // Users by role
    prisma.user.groupBy({
      by: ["role"],
      _count: { _all: true },
    }),

    // Comments by status
    prisma.comment.groupBy({
      by: ["status"],
      _count: { _all: true },
    }),

    // Newsletter by status
    prisma.newsletterSubscriber.groupBy({
      by: ["status"],
      _count: { _all: true },
    }),

    // Articles created in the last 30 days
    prisma.blog.findMany({
      where: { createdAt: { gte: since } },
      select: { createdAt: true },
    }),

    // Users created in the last 30 days
    prisma.user.findMany({
      where: { createdAt: { gte: since } },
      select: { createdAt: true },
    }),

    // Comments created in the last 30 days
    prisma.comment.findMany({
      where: { createdAt: { gte: since } },
      select: { createdAt: true },
    }),

    // Top 5 categories by article count
    prisma.category.findMany({
      take: 5,
      orderBy: { blogs: { _count: "desc" } },
      select: {
        id: true,
        name: true,
        _count: { select: { blogs: true } },
      },
    }),

    // Latest 5 comments
    prisma.comment.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        content: true,
        status: true,
        createdAt: true,
        user: {
          select: {
            firstName: true,
            lastName: true,
            imageUrl: true,
          },
        },
        blog: {
          select: { title: true, slug: true },
        },
      },
    }),
  ]);

  // ── Shape KPI data ──
  const articleMap = new Map(
    articleCounts.map((r) => [r.status, r._count._all]),
  );
  const userMap = new Map(userCounts.map((r) => [r.role, r._count._all]));
  const commentMap = new Map(
    commentCounts.map((r) => [r.status, r._count._all]),
  );
  const newsletterMap = new Map(
    newsletterCounts.map((r) => [r.status, r._count._all]),
  );

  const sum = (m: Map<string, number>) =>
    Array.from(m.values()).reduce((a, b) => a + b, 0);

  const kpis: AdminKpis = {
    articles: {
      total: sum(articleMap),
      published: articleMap.get("PUBLISHED") ?? 0,
      draft: articleMap.get("DRAFT") ?? 0,
      inReview: articleMap.get("IN_REVIEW") ?? 0,
      scheduled: articleMap.get("SCHEDULED") ?? 0,
      archived: articleMap.get("ARCHIVED") ?? 0,
    },
    users: {
      total: sum(userMap),
      admins: userMap.get("ADMIN") ?? 0,
    },
    comments: {
      total: sum(commentMap),
      pending: commentMap.get("PENDING") ?? 0,
      approved: commentMap.get("APPROVED") ?? 0,
      rejected: commentMap.get("REJECTED") ?? 0,
      spam: commentMap.get("SPAM") ?? 0,
    },
    newsletter: {
      total: sum(newsletterMap),
      subscribed: newsletterMap.get("SUBSCRIBED") ?? 0,
      pending: newsletterMap.get("PENDING") ?? 0,
      unsubscribed: newsletterMap.get("UNSUBSCRIBED") ?? 0,
    },
  };

  // ── Chart data ──
  const buckets = last30Days();

  const articlesByDay = groupByDay(
    articles30.map((r) => r.createdAt),
    buckets,
  );
  const usersByDay = groupByDay(
    users30.map((r) => r.createdAt),
    buckets,
  );
  const commentsByDay = groupByDay(
    comments30.map((r) => r.createdAt),
    buckets,
  );

  // ── Top categories ──
  const topCategories: CategoryPoint[] = topCategoriesRaw.map((c) => ({
    id: c.id,
    name: c.name,
    count: c._count.blogs,
  }));

  // ── Recent comments ──
  const recentComments: RecentComment[] = recentCommentsRaw.map((c) => ({
    id: c.id,
    content: c.content,
    status: c.status,
    createdAt: c.createdAt,
    user: c.user,
    blog: c.blog,
  }));

  return {
    kpis,
    articlesByDay,
    usersByDay,
    commentsByDay,
    topCategories,
    recentComments,
  };
}

// ────────────────────────────────────────────────────────────
// MAIN
// ────────────────────────────────────────────────────────────

export async function getAdminDashboard(): Promise<GetAdminDashboardResult> {
  try {
    const data = await readDashboard();
    return { success: true, data };
  } catch (error) {
    console.error("[getAdminDashboard] Error:", error);
    return { success: false, error: "Failed to load dashboard." };
  }
}