// src/components/site/pages/category/editor-socials.tsx
// ============================================================
// EditorSocials — ALENTAH
// Row of small circular icon-links for an editor's social
// profiles. Unknown platforms are silently skipped. Renders
// nothing when the list is empty.
// ============================================================

import Link from "next/link";
import { SOCIAL_ICONS, SocialIconKey } from "../../general/theme/social-icons";


function isKnownPlatform(p: string): p is SocialIconKey {
  return p in SOCIAL_ICONS;
}

export function EditorSocials({
  socials,
  className,
}: {
  socials: any[];
  className?: string;
}) {
  if (!socials || socials.length === 0) return null;

  return (
    <ul
      className={[
        "flex flex-wrap items-center gap-1.5",
        className ?? "mt-3",
      ].join(" ")}
    >
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