"use client";

// src/components/admin/dashboard/dashboard-charts.tsx
// Recharts wrappers for the admin dashboard.
//
// These are the only client components in the dashboard.
// The parent /admin/page.tsx is a server component.

import * as React from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { DailyPoint, CategoryPoint } from "@/actions/admin/get-admin-dashboard";

// ────────────────────────────────────────────────────────────
// SHARED STYLES
// ────────────────────────────────────────────────────────────

const axisStyle = {
  fontSize: 10,
  fill: "hsl(var(--muted-foreground))",
} as const;

function formatShortDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

// ────────────────────────────────────────────────────────────
// ACTIVITY CHART — Area chart of daily counts
// ────────────────────────────────────────────────────────────

export function ActivityChart({
  data,
  label,
  color = "hsl(var(--primary))",
}: {
  data: DailyPoint[];
  label: string;
  color?: string;
}) {
  const gradId = React.useId();

  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 12, left: -10, bottom: 0 }}>
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.35} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>

          <CartesianGrid
            strokeDasharray="3 3"
            stroke="hsl(var(--border))"
            vertical={false}
          />

          <XAxis
            dataKey="date"
            tickFormatter={formatShortDate}
            tick={axisStyle}
            axisLine={false}
            tickLine={false}
            interval="preserveStartEnd"
            minTickGap={24}
          />

          <YAxis
            allowDecimals={false}
            tick={axisStyle}
            axisLine={false}
            tickLine={false}
            width={28}
          />

          <Tooltip
            labelFormatter={(v:any) => formatShortDate(String(v))}
            contentStyle={{
              background: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: 8,
              fontSize: 12,
            }}
            formatter={(value: number) => [value, label]}
          />

          <Area
            type="monotone"
            dataKey="count"
            stroke={color}
            strokeWidth={2}
            fill={`url(#${gradId})`}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// CATEGORY CHART — Horizontal bar
// ────────────────────────────────────────────────────────────

export function TopCategoriesChart({ data }: { data: CategoryPoint[] }) {
  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 4, right: 16, left: 0, bottom: 0 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="hsl(var(--border))"
            horizontal={false}
          />

          <XAxis
            type="number"
            allowDecimals={false}
            tick={axisStyle}
            axisLine={false}
            tickLine={false}
          />

          <YAxis
            type="category"
            dataKey="name"
            tick={axisStyle}
            axisLine={false}
            tickLine={false}
            width={90}
          />

          <Tooltip
            contentStyle={{
              background: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: 8,
              fontSize: 12,
            }}
            formatter={(value: number) => [value, "Articles"]}
          />

          <Bar
            dataKey="count"
            fill="hsl(var(--primary))"
            radius={[0, 6, 6, 0]}
            barSize={18}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}