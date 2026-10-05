// src/components/site/pages/category/category-hero.tsx
// ============================================================
// CategoryHero — ALENTAH
// Server component for the category page hero.
// Left: kicker, headline, description, metadata.
// Right: editor card (avatar, name, bio, socials).
// ============================================================

import Image from "next/image";
import Link from "next/link";
import { SOCIAL_ICONS, SocialIconKey } from "../../general/theme/social-icons";
import { CategoryEditor } from "@/actions/category/get-category-by-slug";


// ============================================================
// HELPERS
// ============================================================

function isKnownPlatform(p: string): p is SocialIconKey {
  return p in SOCIAL_ICONS;
}

function EditorSocials({ socials }: { socials: any[] }) {
  if (!socials || socials.length === 0) return null;

  return (
    <ul className="mt-3 flex flex-wrap items-center gap-1.5">
      {socials.map((s) => {
        const platform = s.platform.toLowerCase();
        if (!isKnownPlatform(platform)) return null;

        const Icon = SOCIAL_ICONS[platform];

        return (
          <li key={s.id}>
            <Link
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={platform}
              className="inline-flex size-7 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary"
            >
              <Icon className="size-3.5" />
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

// ============================================================
// COMPONENT
// ============================================================

export function CategoryHero({
  name,
  description,
  blogCount,
  editor,
}: {
  name: string;
  description: string | null;
  blogCount: number;
  editor: CategoryEditor | null;
}) {
  return (
    <section
      aria-labelledby="category-heading"
      className="pt-10 sm:pt-12 lg:pt-14"
    >
      <div aria-hidden="true" className="h-px w-full bg-border" />

      <div className="pt-14 sm:pt-16 lg:pt-20">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:items-start lg:gap-16">
          {/* --------------------------------------------------
              LEFT — kicker, headline, description, metadata
              -------------------------------------------------- */}
          <div className="lg:col-span-8">
            <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-primary">
              Category
            </p>

            <h1
              id="category-heading"
              className="mt-6 max-w-3xl font-serif text-5xl font-bold leading-[1.05] tracking-[-0.03em] text-foreground sm:text-6xl lg:text-7xl xl:text-[5rem]"
            >
              {name}.
            </h1>

            {description && (
              <p className="mt-8 max-w-2xl font-serif text-lg italic leading-relaxed text-muted-foreground sm:text-xl">
                {description}
              </p>
            )}

            <p className="mt-6 text-[12px] text-muted-foreground">
              {blogCount} {blogCount === 1 ? "article" : "articles"}
            </p>
          </div>

          {/* --------------------------------------------------
              RIGHT — editor card (avatar + name + bio + socials)
              -------------------------------------------------- */}
          {editor && (
            <aside className="lg:col-span-4 lg:pt-2">
              <div className="rounded-2xl border border-border bg-card/40 p-5 sm:p-6">
                <div className="flex items-center gap-4">
                  {/* Avatar */}
                  <div className="relative size-14 shrink-0 overflow-hidden rounded-full border border-border">
                    {editor.imageUrl ? (
                      <Image
                        src={editor.imageUrl}
                        alt={editor.name}
                        fill
                        sizes="56px"
                        className="object-cover scale-[1.01]"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-primary text-[14px] font-semibold text-primary-foreground">
                        {editor.name.charAt(0)}
                      </div>
                    )}
                  </div>

                  {/* Name + role */}
                  <div className="min-w-0 leading-tight">
                    <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-primary">
                      Edited by
                    </p>
                    <p className="mt-1 truncate font-serif text-lg font-semibold tracking-tight text-foreground sm:text-xl">
                      {editor.name}
                    </p>
                  </div>
                </div>

                {/* Bio */}
                {/* {editor.bio && (
                  <p className="mt-4 text-[13px] leading-6 text-muted-foreground">
                    {editor?.bio}
                  </p>
                )} */}

                {/* Socials */}
                {/* <EditorSocials socials={editor.socials} /> */}
              </div>
            </aside>
          )}
        </div>
      </div>
    </section>
  );
}