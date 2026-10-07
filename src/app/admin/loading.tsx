// src/app/(admin)/admin/loading.tsx
// ============================================================
// Admin dashboard — route loading fallback.
//
// Next.js renders this INSTANTLY when navigating to /admin,
// before the page's server component starts streaming.
//
// Once the page shell mounts, this is replaced by the real
// layout — and per-section <Suspense> skeletons take over
// inside the page itself.
//
// Design mirrors the real dashboard so there's no visual jump.
// ============================================================

export default function AdminLoading() {
  return (
    <div className="space-y-8">
      {/* ── Header placeholder ── */}
      <header className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div className="w-full">
          <div className="h-2.5 w-20 animate-pulse rounded-full bg-muted" />
          <div className="mt-3 h-9 w-48 animate-pulse rounded-md bg-muted" />
          <div className="mt-3 h-3 w-72 max-w-full animate-pulse rounded-full bg-muted/70" />
        </div>
      </header>

      {/* ── KPI cards ── */}
      <section
        aria-hidden="true"
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="rounded-xl border border-border bg-card p-5"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="h-2.5 w-24 animate-pulse rounded-full bg-muted" />
                <div className="mt-3 h-9 w-20 animate-pulse rounded-md bg-muted" />
                <div className="mt-3 h-2.5 w-32 animate-pulse rounded-full bg-muted/70" />
              </div>
              <div className="size-9 shrink-0 animate-pulse rounded-full bg-muted/60" />
            </div>
          </div>
        ))}
      </section>

      {/* ── Chart row 1 ── */}
      <section
        aria-hidden="true"
        className="grid grid-cols-1 gap-4 xl:grid-cols-2"
      >
        {[0, 1].map((i) => (
          <div
            key={i}
            className="rounded-xl border border-border bg-card p-5"
          >
            <div className="mb-4 flex items-baseline justify-between gap-3">
              <div className="h-3 w-32 animate-pulse rounded-full bg-muted" />
              <div className="h-2.5 w-20 animate-pulse rounded-full bg-muted/70" />
            </div>
            <div className="h-56 w-full animate-pulse rounded-md bg-muted/60" />
          </div>
        ))}
      </section>

      {/* ── Chart row 2 ── */}
      <section
        aria-hidden="true"
        className="grid grid-cols-1 gap-4 xl:grid-cols-2"
      >
        {[0, 1].map((i) => (
          <div
            key={i}
            className="rounded-xl border border-border bg-card p-5"
          >
            <div className="mb-4 flex items-baseline justify-between gap-3">
              <div className="h-3 w-32 animate-pulse rounded-full bg-muted" />
              <div className="h-2.5 w-20 animate-pulse rounded-full bg-muted/70" />
            </div>
            <div className="h-56 w-full animate-pulse rounded-md bg-muted/60" />
          </div>
        ))}
      </section>

      {/* ── Recent panels ── */}
      <section
        aria-hidden="true"
        className="grid grid-cols-1 gap-4 xl:grid-cols-2"
      >
        {[0, 1].map((i) => (
          <div
            key={i}
            className="rounded-xl border border-border bg-card p-5"
          >
            <div className="mb-3 flex items-center justify-between gap-3">
              <div className="h-3 w-32 animate-pulse rounded-full bg-muted" />
              <div className="h-2.5 w-16 animate-pulse rounded-full bg-muted/70" />
            </div>

            <div className="space-y-3">
              {[0, 1, 2, 3, 4].map((j) => (
                <div
                  key={j}
                  className="flex items-center gap-3 py-1.5"
                >
                  <div className="size-10 shrink-0 animate-pulse rounded-md bg-muted/60" />
                  <div className="min-w-0 flex-1 space-y-2">
                    <div className="h-3 w-3/4 animate-pulse rounded-full bg-muted" />
                    <div className="h-2.5 w-1/2 animate-pulse rounded-full bg-muted/70" />
                  </div>
                  <div className="h-5 w-14 shrink-0 animate-pulse rounded-full bg-muted/60" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>

      {/* ── Status strip ── */}
      <section
        aria-hidden="true"
        className="grid grid-cols-2 gap-3 sm:grid-cols-4"
      >
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
      </section>
    </div>
  );
}