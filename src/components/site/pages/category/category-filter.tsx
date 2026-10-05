// src/components/site/pages/category/category-filter.tsx
// ============================================================
// CategoryFilter — ALENTAH
// Presentational pill row for subcategory selection.
// Parent (CategoryBody) owns the active state and URL sync.
// ============================================================

import { CategorySubcategory } from "@/actions/category/get-category-by-slug";

export function CategoryFilter({
  subcategories,
  activeSlug,
  onSelect,
}: {
  subcategories: CategorySubcategory[];
  activeSlug: string | null;
  onSelect: (slug: string | null) => void;
}) {
  if (subcategories.length === 0) return null;

  const pills: { id: string; label: string; slug: string | null }[] = [
    { id: "all", label: "All", slug: null },
    ...subcategories.map((sub) => ({
      id: sub.id,
      label: sub.name,
      slug: sub.slug,
    })),
  ];

  return (
    <div className="mt-14 sm:mt-16">
      <div
        role="tablist"
        aria-label="Filter by subcategory"
        className="flex flex-wrap items-center gap-2 sm:gap-3"
      >
        {pills.map((pill) => {
          const isActive = activeSlug === pill.slug;

          return (
            <button
              key={pill.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => onSelect(pill.slug)}
              className={[
                "inline-flex h-9 items-center rounded-full px-4",
                "text-[10px] font-bold uppercase tracking-[0.18em]",
                "border transition-colors duration-200",
                isActive
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground",
              ].join(" ")}
            >
              {pill.label}
            </button>
          );
        })}
      </div>

      <div aria-hidden="true" className="mt-10 h-px w-full bg-border" />
    </div>
  );
}