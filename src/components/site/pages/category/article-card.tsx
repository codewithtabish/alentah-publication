// src/components/site/pages/category/article-card.tsx
// ============================================================
// ArticleCard — ALENTAH
// Vertical card for the category grid.
// ============================================================

import { CategoryBlog } from "@/actions/category/get-category-by-slug";
import Image from "next/image";
import Link from "next/link";

export function ArticleCard({
  article,
  href,
}: {
  article: CategoryBlog;
  href: string;
}) {
  return (
    <article className="group flex flex-col">
      <Link
        href={href}
        className="relative block aspect-16/10 w-full overflow-hidden bg-muted"
      >
        <Image
          src={article.bannerImage}
          alt={article.title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover scale-[1.01] transition-transform duration-700 group-hover:scale-[1.03]"
        />
      </Link>

      <div className="mt-5 flex items-center gap-2">
        <span
          aria-hidden="true"
          className="block size-1.5 rounded-full bg-primary"
        />
        <p className="text-[9px] font-bold uppercase tracking-[0.24em] text-primary">
          {article.subcategory.name}
        </p>
      </div>

      <Link href={href} className="mt-2">
        <h3 className="font-serif text-lg font-medium leading-snug tracking-tight text-foreground transition-colors group-hover:text-primary line-clamp-2 sm:text-xl">
          {article.title}
        </h3>
      </Link>

      {article.readingTime && (
        <p className="mt-3 text-[12px] text-muted-foreground">
          {article.readingTime} min read
        </p>
      )}
    </article>
  );
}