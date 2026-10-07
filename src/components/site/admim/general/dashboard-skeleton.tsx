// src/components/admin/dashboard/dashboard-skeleton.tsx

export function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      {/* KPI grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="rounded-xl border border-border bg-card p-5"
          >
            <div className="h-2.5 w-24 animate-pulse rounded-full bg-muted" />
            <div className="mt-3 h-9 w-20 animate-pulse rounded-md bg-muted" />
            <div className="mt-3 h-2.5 w-32 animate-pulse rounded-full bg-muted/70" />
          </div>
        ))}
      </div>

      {/* Charts row */}
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

      {/* Bottom row */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        {[0, 1].map((i) => (
          <div
            key={i}
            className="rounded-xl border border-border bg-card p-5"
          >
            <div className="h-3 w-32 animate-pulse rounded-full bg-muted" />
            <div className="mt-5 space-y-3">
              {[0, 1, 2, 3, 4].map((j) => (
                <div
                  key={j}
                  className="h-10 w-full animate-pulse rounded-md bg-muted/60"
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}