// src/components/site/pages/category/category-skeleton.tsx
// ============================================================
// CategoryPageSkeleton — ALENTAH
// Loading state for the category page.
// ============================================================

export function CategoryPageSkeleton() {
  return (
    <div className="w-full">
      <div className="pt-10 sm:pt-12 lg:pt-14">
        <div className="h-px w-full bg-border" />

        <div className="pt-14 sm:pt-16 lg:pt-20">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-end lg:gap-16">
            <div className="lg:col-span-8">
              <div className="h-3 w-24 animate-pulse rounded-full bg-muted" />
              <div className="mt-6 h-14 w-2/3 animate-pulse rounded-md bg-muted sm:h-20" />
              <div className="mt-8 h-4 w-3/4 animate-pulse rounded-md bg-muted/70" />
              <div className="mt-3 h-4 w-1/2 animate-pulse rounded-md bg-muted/70" />
              <div className="mt-6 h-3 w-40 animate-pulse rounded-full bg-muted/70" />
            </div>

            <div className="lg:col-span-4">
              <div className="flex items-center gap-4">
                <div className="size-16 shrink-0 animate-pulse rounded-full bg-muted" />
                <div className="space-y-2">
                  <div className="h-2.5 w-20 animate-pulse rounded-full bg-muted/70" />
                  <div className="h-5 w-32 animate-pulse rounded-md bg-muted" />
                  <div className="h-2.5 w-24 animate-pulse rounded-full bg-muted/70" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-14 flex flex-wrap gap-3">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="h-9 w-32 animate-pulse rounded-full bg-muted"
          />
        ))}
      </div>

      <div className="mt-10 h-px w-full bg-border" />

      <div className="mt-14 grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-14">
        <div className="aspect-16/10 w-full animate-pulse bg-muted lg:col-span-7" />
        <div className="space-y-4 lg:col-span-5">
          <div className="h-3 w-24 animate-pulse rounded-full bg-muted" />
          <div className="h-8 w-full animate-pulse rounded-md bg-muted" />
          <div className="h-8 w-4/5 animate-pulse rounded-md bg-muted" />
          <div className="h-3 w-full animate-pulse rounded-full bg-muted/70" />
          <div className="h-3 w-3/4 animate-pulse rounded-full bg-muted/70" />
          <div className="flex items-center gap-3 pt-4">
            <div className="size-9 animate-pulse rounded-full bg-muted" />
            <div className="h-3 w-40 animate-pulse rounded-full bg-muted" />
          </div>
        </div>
      </div>

      <div className="mt-16">
        <div className="mb-6 flex items-end justify-between border-b border-border pb-6">
          <div className="h-3 w-32 animate-pulse rounded-full bg-muted" />
          <div className="h-3 w-20 animate-pulse rounded-full bg-muted/70" />
        </div>

        <div className="grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="space-y-3">
              <div className="aspect-16/10 w-full animate-pulse bg-muted" />
              <div className="h-2.5 w-20 animate-pulse rounded-full bg-muted" />
              <div className="h-5 w-full animate-pulse rounded-md bg-muted" />
              <div className="h-3 w-24 animate-pulse rounded-full bg-muted/70" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}