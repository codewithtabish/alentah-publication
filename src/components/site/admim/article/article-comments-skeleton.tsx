// src/components/site/pages/article/article-comments-skeleton.tsx
// ============================================================
// Skeleton fallback for the ArticleComments section
// ============================================================

export function ArticleCommentsSkeleton() {
  return (
    <section className="mt-14 sm:mt-16">
      <div className="mb-8 flex items-center gap-3 border-b border-border pb-5">
        <div className="h-5 w-5 animate-pulse rounded bg-muted" />
        <div className="h-8 w-40 animate-pulse rounded-md bg-muted" />
        <div className="h-5 w-8 animate-pulse rounded-full bg-muted/70" />
      </div>

      <div className="mb-10 h-32 animate-pulse rounded-2xl border border-border bg-muted/40" />

      <ul className="space-y-6">
        {[0, 1, 2].map((i) => (
          <li key={i} className="flex items-start gap-4">
            <div className="size-10 shrink-0 animate-pulse rounded-full bg-muted" />
            <div className="flex-1 space-y-2.5">
              <div className="h-3.5 w-40 animate-pulse rounded-full bg-muted" />
              <div className="h-3.5 w-full animate-pulse rounded-full bg-muted/70" />
              <div className="h-3.5 w-11/12 animate-pulse rounded-full bg-muted/70" />
              <div className="h-3.5 w-2/3 animate-pulse rounded-full bg-muted/70" />
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}