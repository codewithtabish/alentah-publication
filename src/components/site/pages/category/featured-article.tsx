// src/components/site/pages/category/featured-article.tsx
// ============================================================
// FeaturedArticle — ALENTAH
// Large hero-style featured article for the category page.
// ============================================================

import { CategoryBlog } from "@/actions/category/get-category-by-slug";
import Image from "next/image";
import Link from "next/link";

function getAuthorName(article: CategoryBlog): string {
  return (
    [article.author.firstName, article.author.lastName]
      .filter(Boolean)
      .join(" ") || "Alentah Editors"
  );
}

export function FeaturedArticle({
  article,
  href,
}: {
  article: CategoryBlog;
  href: string;
}) {
  const authorName = getAuthorName(article);

  return (
    <section
      aria-labelledby="featured-heading"
      className="mt-14 sm:mt-16 lg:mt-20"
    >
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-14">
        {/* Image */}
        <Link
          href={href}
          className="group relative col-span-1 block aspect-16/10 w-full overflow-hidden bg-muted lg:col-span-7"
        >
          <Image
            src={article.bannerImage}
            alt={article.title}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 58vw"
            className="object-cover scale-[1.01] transition-transform duration-700 group-hover:scale-[1.03]"
          />
        </Link>

        {/* Content */}
        <div className="flex flex-col justify-start lg:col-span-5">
          <div className="flex items-center gap-2.5">
            <span
              aria-hidden="true"
              className="block size-1.5 rounded-full bg-primary"
            />
            <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-primary">
              {article.subcategory.name}
            </p>
          </div>

          <Link href={href} className="group/title">
            <h2
              id="featured-heading"
              className="mt-4 font-serif text-3xl font-semibold leading-[1.15] tracking-tight text-foreground transition-colors group-hover/title:text-primary sm:text-4xl lg:text-[2.75rem] lg:leading-[1.1]"
            >
              {article.title}
            </h2>
          </Link>

          {article.shortDescription && (
            <p className="mt-5 max-w-xl text-[16px] leading-7 text-muted-foreground">
              {article.shortDescription}
            </p>
          )}

    
        </div>
      </div>
    </section>
  );
}