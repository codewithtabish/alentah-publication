// src/components/site/pages/saved/saved-skeleton.tsx
// ============================================================
// SavedSkeleton — Suspense fallback for /saved
// ============================================================

export function SavedSkeleton() {
  return (
    <>
      {/* Toolbar skeleton */}
      <div className="flex items-center justify-between gap-3 border-b border-border pb-4">
        <div className="h-4 w-32 animate-pulse rounded-full bg-muted" />
        <div className="h-9 w-40 animate-pulse rounded-full bg-muted" />
      </div>

      {/* Grid skeleton */}
      <ul className="mt-8 grid grid-cols-1 gap-x-8 gap-y-10 sm:mt-10 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-10 lg:gap-y-12">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <li key={i} className="flex flex-col">
            <div className="aspect-16/10 w-full animate-pulse bg-muted" />

            <div className="mt-4 space-y-3">
              <div className="h-2.5 w-20 animate-pulse rounded-full bg-muted" />
              <div className="h-5 w-full animate-pulse rounded-md bg-muted" />
              <div className="h-5 w-4/5 animate-pulse rounded-md bg-muted" />
              <div className="h-3 w-full animate-pulse rounded-full bg-muted/70" />
              <div className="h-3 w-11/12 animate-pulse rounded-full bg-muted/70" />
              <div className="h-3 w-2/3 animate-pulse rounded-full bg-muted/70" />

              <div className="flex items-center gap-2.5 pt-4">
                <div className="size-7 animate-pulse rounded-full bg-muted" />
                <div className="h-3 w-40 animate-pulse rounded-full bg-muted/70" />
              </div>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}