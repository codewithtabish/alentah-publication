// src/components/site/general/footers/footer.tsx
// ============================================================
// Footer — ALENTAH
// Editorial masthead footer.
//   - Sections column shows category titles with nested subs
//   - Newsletter column has room for input + button
//   - Balanced 12-column grid
//   - Year rendered client-side (no prerender error)
//   - Social icons from ../theme/social-icons
//   - Category data fetched by a dedicated async child so the
//     parent can prerender without waiting on runtime data.
//
// URL conventions (must match the navbar + category page):
//   - category    → /${categorySlug}
//   - subcategory → /${categorySlug}?sub=${subSlug}
// ============================================================

import { Suspense } from "react";
import Link from "next/link";

import { getCategories } from "@/actions/category/get-categories";
import { InstagramIcon, LinkedinIcon, XIcon } from "../theme/social-icons";
import { FooterYear } from "./footer-year";

// ============================================================
// TYPES
// ============================================================

type FooterLink = {
  label: string;
  href: string;
};

type FooterSection = {
  id: string;
  name: string;
  slug: string;
  subcategories: {
    id: string;
    name: string;
    slug: string;
  }[];
};

export interface FooterProps {
  company?: FooterLink[];
  legal?: FooterLink[];
  socials?: {
    instagram?: string;
    x?: string;
    linkedin?: string;
  };
  newsletterAction?: string;
  className?: string;
}

// ============================================================
// DEFAULTS
// ============================================================

const DEFAULT_COMPANY: FooterLink[] = [
  { label: "About", href: "/about" },
  { label: "Careers", href: "/careers" },
  { label: "Contact", href: "/contact" },
  { label: "Advertise", href: "/advertise" },
];

const DEFAULT_LEGAL: FooterLink[] = [
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
  { label: "Cookies", href: "/cookies" },
  { label: "Ethics Policy", href: "/ethics" },
];

// ============================================================
// COMPONENT
// ============================================================

export function Footer({
  company = DEFAULT_COMPANY,
  legal = DEFAULT_LEGAL,
  socials = {},
  newsletterAction = "/api/newsletter",
  className,
}: FooterProps) {
  const hasSocials = socials.instagram || socials.x || socials.linkedin;

  return (
    <footer
      className={[
        "mt-20 w-full border-t ",
        "text-foreground",
        className ?? "",
      ].join(" ")}
    >
      <div className="mx-auto w-full py-14 sm:py-16 lg:py-20">
        {/* =====================================================
            MAIN GRID
              lg: 12 cols
                brand       → 4
                sections    → 2
                company     → 2
                legal       → 2
                newsletter  → 2
        ====================================================== */}
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-12 lg:gap-8">
          {/* ---------- Brand ---------- */}
          <div className="md:col-span-2 lg:col-span-4">
            <Link
              href="/"
              aria-label="ALENTAH — Home"
              className="group inline-flex items-baseline gap-1"
            >
              <span className="font-serif text-3xl tracking-[0.02em] text-foreground transition-colors duration-300 group-hover:text-primary sm:text-4xl">
                ALENTAH
              </span>

              <span
                aria-hidden="true"
                className="block size-1.5 rounded-full bg-primary transition-transform duration-300 group-hover:scale-125"
              />
            </Link>

            <p className="mt-5 max-w-sm text-sm leading-relaxed text-muted-foreground">
              Slow journalism for curious minds. Depth over speed, quality
              over quantity, perspective over popularity.
            </p>

            {hasSocials && (
              <div className="mt-7 flex items-center gap-3">
                {socials.instagram && (
                  <SocialLink href={socials.instagram} label="Instagram">
                    <InstagramIcon className="size-4" />
                  </SocialLink>
                )}

                {socials.x && (
                  <SocialLink href={socials.x} label="X">
                    <XIcon className="size-4" />
                  </SocialLink>
                )}

                {socials.linkedin && (
                  <SocialLink href={socials.linkedin} label="LinkedIn">
                    <LinkedinIcon className="size-4" />
                  </SocialLink>
                )}
              </div>
            )}
          </div>

          {/* ---------- Sections (categories + subcategories) ---------- */}
          <div className="lg:col-span-2">
            <Suspense fallback={<SectionsSkeleton />}>
              <FooterSections />
            </Suspense>
          </div>

          {/* ---------- Company ---------- */}
          <div className="lg:col-span-2">
            <FooterColumn title="Company" links={company} />
          </div>

          {/* ---------- Legal ---------- */}
          <div className="lg:col-span-2">
            <FooterColumn title="Legal" links={legal} />
          </div>

          {/* ---------- Newsletter ---------- */}
          <div className="md:col-span-2 lg:col-span-2">
            <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-muted-foreground">
              Stay in Touch
            </p>

            <h6 className="mt-3 text-[12px] leading-relaxed text-muted-foreground/80">
              Get the best stories, once a week.
            </h6>

            <form
              action={newsletterAction}
              method="post"
              className="mt-4 flex flex-col gap-2"
            >
              <label htmlFor="footer-newsletter-email" className="sr-only">
                Email address
              </label>

              <input
                id="footer-newsletter-email"
                type="email"
                name="email"
                required
                autoComplete="email"
                placeholder="Your email"
                className={[
                  "h-10 w-full min-w-0 rounded-md px-3",
                  "border border-border bg-background",
                  "text-[12px] text-foreground",
                  "placeholder:text-muted-foreground/60",
                  "focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/30",
                ].join(" ")}
              />

              <button
                type="submit"
                className={[
                  "inline-flex h-10 w-full items-center justify-center rounded-md px-4",
                  "bg-primary text-primary-foreground",
                  "text-[10px] font-bold uppercase tracking-[0.18em]",
                  "transition-colors duration-200 hover:bg-primary/90",
                  "whitespace-nowrap",
                ].join(" ")}
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* =====================================================
            BOTTOM BAR
        ====================================================== */}
        <div className="mt-14 flex flex-col items-start justify-between gap-4 border-t border-border/60 pt-6 sm:mt-16 sm:flex-row sm:items-center">
          <p className="text-[11px] text-muted-foreground">
            © <FooterYear /> ALENTAH. All rights reserved.
          </p>

          <p className="text-[11px] text-muted-foreground">
            Crafted with intention by{" "}
            <span className="font-medium text-foreground">Talha Tabish</span>
          </p>

          <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
            <span className="font-medium text-foreground">EN</span>
            <span aria-hidden="true" className="text-muted-foreground/40">
              ·
            </span>
            <button
              type="button"
              className="transition-colors duration-200 hover:text-foreground"
            >
              العربية
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ============================================================
// FOOTER SECTIONS — async child
// ============================================================

async function FooterSections() {
  const result = await getCategories();

  const sections: FooterSection[] = result.success
    ? result.categories
        .filter((c) => c.isActive)
        .map((c) => ({
          id: c.id,
          name: c.name,
          slug: c.slug,
          subcategories: (c.subcategories ?? []).filter((s) => s.isActive),
        }))
    : [];

  if (sections.length === 0) {
    return (
      <p className="text-[13px] text-muted-foreground">No categories yet.</p>
    );
  }

  return (
    <ul className="space-y-6">
      {sections.map((section) => (
        <li key={section.id}>
          <Link
            href={`/${section.slug}`}
            className="block text-[10px] font-bold uppercase tracking-[0.24em] text-muted-foreground transition-colors duration-200 hover:text-foreground"
          >
            {section.name}
          </Link>

          {section.subcategories.length > 0 && (
            <ul className="mt-3 space-y-2.5">
              {section.subcategories.map((sub) => (
                <li key={sub.id}>
                  <Link
                    href={`/${section.slug}?sub=${sub.slug}`}
                    className="inline-block text-[13px] leading-none text-muted-foreground/80 transition-colors duration-200 hover:text-foreground"
                  >
                    {sub.name}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </li>
      ))}
    </ul>
  );
}

// ============================================================
// SECTIONS SKELETON
// ============================================================

function SectionsSkeleton() {
  return (
    <ul className="space-y-6" aria-hidden="true">
      {[0, 1, 2].map((i) => (
        <li key={i} className="space-y-3">
          <div className="h-2.5 w-24 animate-pulse rounded-full bg-muted" />
          <div className="h-3 w-20 animate-pulse rounded-full bg-muted/70" />
          <div className="h-3 w-16 animate-pulse rounded-full bg-muted/70" />
        </li>
      ))}
    </ul>
  );
}

// ============================================================
// SUBCOMPONENTS
// ============================================================

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: FooterLink[];
}) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-muted-foreground">
        {title}
      </p>

      <ul className="mt-4 space-y-3">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="inline-block text-[13px] leading-none text-muted-foreground transition-colors duration-200 hover:text-foreground"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function SocialLink({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className={[
        "inline-flex size-9 items-center justify-center rounded-full",
        "border border-border text-muted-foreground",
        "transition-colors duration-200",
        "hover:border-foreground hover:text-foreground",
      ].join(" ")}
    >
      {children}
    </a>
  );
}

export default Footer;