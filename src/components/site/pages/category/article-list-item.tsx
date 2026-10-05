// src/components/site/pages/category/article-list-item.tsx
// ============================================================
// ArticleListItem — ALENTAH
// Horizontal row for the list layout on the category page.
// Thumbnail on the left, text on the right with a constrained
// max-width so long titles/descriptions don't stretch across
// the whole row on wide screens.
// ============================================================

import Image from "next/image";
import Link from "next/link";
import type { CategoryBlog } from "@/actions/category/get-category-by-slug";

export function ArticleListItem({
  article,
  href,
}: {
  article: CategoryBlog;
  href: string;
}) {
  const eyebrow = article.subcategory?.name ?? article.category.name;

  return (
    <Link
      href={href}
      className="group grid grid-cols-1 gap-5 py-6 sm:grid-cols-[180px_minmax(0,1fr)_auto] sm:gap-8 sm:py-8"
    >
      {/* Thumbnail */}
      <div className="relative aspect-4/3 w-full overflow-hidden bg-muted">
        <Image
          src={article.bannerImage}
          alt={article.title}
          fill
          sizes="(max-width: 640px) 100vw, 180px"
          className="object-cover scale-[1.01] transition-transform duration-700 group-hover:scale-[1.04]"
        />
      </div>

      {/* Text — constrained width so it doesn't stretch */}
      <div className="min-w-0 max-w-[62ch] self-center">
        <div className="flex items-center gap-2">
          <span
            aria-hidden="true"
            className="block size-1.5 shrink-0 rounded-full bg-primary"
          />
          <p className="text-[9px] font-bold uppercase tracking-[0.24em] text-primary">
            {eyebrow}
          </p>
        </div>

        <h3 className="mt-2 font-serif text-lg font-medium leading-snug tracking-tight text-foreground transition-colors group-hover:text-primary sm:text-xl lg:text-2xl">
          {article.title}
        </h3>

        {article.shortDescription && (
          <p className="mt-2.5 text-[13.5px] leading-6 text-muted-foreground line-clamp-2 sm:text-[14.5px] sm:leading-7">
            {article.shortDescription}
          </p>
        )}
      </div>

      {/* Arrow */}
      <span
        aria-hidden="true"
        className="inline-flex shrink-0 items-center gap-1.5 self-center text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground transition-colors group-hover:text-foreground sm:self-start sm:pt-1"
      >
        <span>Read</span>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5"
        >
          <path
            d="M5 12h14M13 5l7 7-7 7"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    </Link>
  );
}