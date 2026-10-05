// src/app/(site)/cookies/page.tsx
// ============================================================
// Cookies — ALENTAH
// Editorial Cookies Policy page: hero, sticky TOC + body,
// cookie table, closing strip.
//
// Back button behaviour:
//   - Shows when the visitor navigated in from another page
//     (i.e. there is browser history to go back to).
//   - Uses Next.js useRouter for the actual navigation.
//   - Falls back to "/" when there is no history to return to.
//
// No horizontal padding on page-level elements — the global
// Container handles it. No bg-background on any panel.
// ============================================================

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

// ============================================================
// DATA
// ============================================================

const SECTIONS = [
  { id: "what-cookies-are", label: "What cookies are", eyebrow: "What cookies are" },
  { id: "how-we-use-them", label: "How we use them", eyebrow: "How we use them" },
  { id: "strictly-necessary", label: "Strictly necessary", eyebrow: "Strictly necessary" },
  { id: "analytics", label: "Analytics", eyebrow: "Analytics" },
  { id: "your-preferences", label: "Your preferences", eyebrow: "Your preferences" },
  { id: "third-party-cookies", label: "Third-party cookies", eyebrow: "Third-party cookies" },
  { id: "how-to-disable-them", label: "How to disable them", eyebrow: "How to disable them" },
  { id: "changes-to-this-policy", label: "Changes to this policy", eyebrow: "Changes to this policy" },
  { id: "contact-us", label: "Contact us", eyebrow: "Contact us" },
];

const COOKIE_TABLE = [
  {
    name: "session",
    purpose: "Keeps you logged in during your visit.",
  },
  {
    name: "csrf_token",
    purpose: "Helps protect against cross-site request forgery.",
  },
  {
    name: "theme_preference",
    purpose: "Remembers your light or dark mode choice.",
  },
];

const BROWSER_STEPS = [
  {
    browser: "Chrome",
    steps: "Settings → Privacy and security → Cookies and other site data.",
  },
  {
    browser: "Safari",
    steps: "Settings → Privacy → Manage Website Data.",
  },
  {
    browser: "Firefox",
    steps: "Settings → Privacy & Security → Cookies and Site Data.",
  },
  {
    browser: "Edge",
    steps: "Settings → Privacy, search and services → Cookies and site permissions.",
  },
];

// ============================================================
// PAGE
// ============================================================

export default function CookiesPage() {
  const router = useRouter();

  const [activeId, setActiveId] = useState<string>("what-cookies-are");
  const [hasHistory, setHasHistory] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setHasHistory(window.history.length > 1);
  }, []);

  const handleBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push("/");
    }
  };

  // Scroll-spy
  useEffect(() => {
    const headings = SECTIONS.map((s) => document.getElementById(s.id)).filter(
      (el): el is HTMLElement => Boolean(el),
    );

    if (headings.length === 0) return;

    let ticking = false;

    const update = () => {
      const offset = 140;
      let current = headings[0]?.id ?? "";

      for (const el of headings) {
        if (el.getBoundingClientRect().top <= offset) {
          current = el.id;
        } else {
          break;
        }
      }

      setActiveId(current);
      ticking = false;
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  const handleTocClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    id: string,
  ) => {
    e.preventDefault();
    const target = document.getElementById(id);
    if (!target) return;
    setActiveId(id);
    window.requestAnimationFrame(() => {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  return (
    <main className="w-full">
      {/* BACK BUTTON — only when there is history to go back to */}
      {hasHistory && (
        <div className="pt-8 sm:pt-10">
          <button
            type="button"
            onClick={handleBack}
            aria-label="Go back"
            className="group inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground transition-colors hover:text-foreground"
          >
            <span className="flex size-7 items-center justify-center rounded-full border border-border transition-colors group-hover:border-primary/40">
              <ArrowLeft className="size-3.5" aria-hidden="true" />
            </span>
            <span>Back</span>
          </button>
        </div>
      )}

      {/* HERO */}
      <section
        aria-labelledby="cookies-heading"
        className={
          hasHistory
            ? "pt-10 sm:pt-12 lg:pt-14"
            : "pt-16 sm:pt-20 lg:pt-24"
        }
      >
        <div aria-hidden="true" className="h-px w-full bg-border" />

        <div className="pt-14 sm:pt-16 lg:pt-20">
          <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-primary">
            Cookies at Alentah
          </p>

          <h1
            id="cookies-heading"
            className="mt-6 max-w-3xl font-serif text-5xl font-bold leading-[1.05] tracking-[-0.03em] text-foreground sm:text-6xl lg:text-7xl xl:text-[5rem]"
          >
            Small files, clearly explained.
          </h1>

          <p className="mt-8 max-w-2xl font-serif text-lg italic leading-relaxed text-muted-foreground sm:text-xl">
            We use as few cookies as possible. Here is exactly which ones,
            what they do, and how to turn them off if you want to.
          </p>

          <p className="mt-6 text-[12px] text-muted-foreground">
            Last updated: 5 October 2026
          </p>
        </div>
      </section>

      {/* SIDEBAR + BODY */}
      <div className="mt-16 grid grid-cols-1 gap-12 lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-16 xl:gap-20">
        {/* STICKY TOC */}
        <aside className="hidden lg:block">
          <nav
            aria-label="On this page"
            className="sticky top-24 rounded-xl border border-border p-6"
          >
            <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-muted-foreground">
              On this page
            </p>

            <ul className="mt-5 space-y-1">
              {SECTIONS.map((section) => {
                const isActive = activeId === section.id;

                return (
                  <li key={section.id}>
                    <a
                      href={`#${section.id}`}
                      onClick={(e) => handleTocClick(e, section.id)}
                      aria-current={isActive ? "location" : undefined}
                      className={[
                        "group relative flex items-center rounded-md py-2 pl-4 pr-3",
                        "text-[13px] leading-tight",
                        "transition-colors duration-200",
                        isActive
                          ? "bg-muted/40 font-medium text-foreground"
                          : "text-muted-foreground hover:text-foreground",
                      ].join(" ")}
                    >
                      <span
                        aria-hidden="true"
                        className={[
                          "absolute left-0 top-1/2 -translate-y-1/2 h-4 w-[2px] rounded-full transition-opacity duration-200",
                          isActive ? "bg-primary opacity-100" : "opacity-0",
                        ].join(" ")}
                      />
                      {section.label}
                    </a>
                  </li>
                );
              })}
            </ul>
          </nav>
        </aside>

        {/* BODY */}
        <article className="min-w-0">
          {/* 1 — What cookies are */}
          <Section
            id="what-cookies-are"
            eyebrow="What cookies are"
            heading="What cookies are"
          >
            <p className="text-[16px] leading-7 text-muted-foreground">
              A cookie is a small text file that a website stores in your
              browser. It lets the site remember things between page loads,
              like your language preference or whether you&rsquo;re logged in.
              It is not a program, and it cannot read other files on your
              computer.
            </p>
          </Section>

          {/* 2 — How we use them */}
          <Section
            id="how-we-use-them"
            eyebrow="How we use them"
            heading="How we use them"
          >
            <p className="text-[16px] leading-7 text-muted-foreground">
              Alentah uses a minimal set of cookies to keep the site working
              smoothly and to improve your experience. We do not use ad
              network cookies, and we do not track readers across other
              websites.
            </p>
          </Section>

          {/* 3 — Strictly necessary */}
          <Section
            id="strictly-necessary"
            eyebrow="Strictly necessary"
            heading="Strictly necessary"
          >
            <p className="text-[16px] leading-7 text-muted-foreground">
              These cookies are essential for the website to function. Without
              them, core features like security, session management and your
              preferences would not work properly.
            </p>

            <div className="mt-6 overflow-x-auto rounded-lg border border-border">
              <table className="w-full min-w-[480px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-border">
                    <th className="px-4 py-3 text-[12px] font-bold uppercase tracking-[0.14em] text-foreground">
                      Cookie
                    </th>
                    <th className="px-4 py-3 text-[12px] font-bold uppercase tracking-[0.14em] text-foreground">
                      Purpose
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {COOKIE_TABLE.map((cookie) => (
                    <tr
                      key={cookie.name}
                      className="border-b border-border last:border-b-0"
                    >
                      <td className="px-4 py-3 font-mono text-[13px] text-foreground">
                        {cookie.name}
                      </td>
                      <td className="px-4 py-3 text-[14px] leading-6 text-muted-foreground">
                        {cookie.purpose}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>

          {/* 4 — Analytics */}
          <Section
            id="analytics"
            eyebrow="Analytics"
            heading="Analytics"
          >
            <p className="text-[16px] leading-7 text-muted-foreground">
              We use a single analytics tool to understand how the site is
              used and to improve our content. It is privacy-friendly and
              self-hosted, does not collect personal identifiers, and stores
              no cross-site data.
            </p>
          </Section>

          {/* 5 — Your preferences */}
          <Section
            id="your-preferences"
            eyebrow="Your preferences"
            heading="Your preferences"
          >
            <p className="text-[16px] leading-7 text-muted-foreground">
              On your first visit, you can choose to accept or decline
              analytics. Your choice is stored in a strictly necessary
              cookie, so it won&rsquo;t affect your browsing experience.
            </p>
          </Section>

          {/* 6 — Third-party cookies */}
          <Section
            id="third-party-cookies"
            eyebrow="Third-party cookies"
            heading="Third-party cookies"
          >
            <p className="text-[16px] leading-7 text-muted-foreground">
              Alentah does not embed third-party ad or tracking cookies. If we
              include embedded content (such as a YouTube video), that content
              may set its own cookies. This will be disclosed on the page
              where it appears.
            </p>
          </Section>

          {/* 7 — How to disable them */}
          <Section
            id="how-to-disable-them"
            eyebrow="How to disable them"
            heading="How to disable them"
          >
            <p className="text-[16px] leading-7 text-muted-foreground">
              You can block or delete cookies at the browser level. This will
              affect all websites you visit, not just Alentah.
            </p>

            <ul className="mt-6 space-y-3">
              {BROWSER_STEPS.map((item) => (
                <li
                  key={item.browser}
                  className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:gap-3"
                >
                  <span
                    aria-hidden="true"
                    className="mt-2 hidden size-1.5 shrink-0 rounded-full bg-primary sm:block"
                  />
                  <p className="text-[15px] leading-7 text-muted-foreground">
                    <span className="font-semibold text-foreground">
                      {item.browser}:
                    </span>{" "}
                    {item.steps}
                  </p>
                </li>
              ))}
            </ul>
          </Section>

          {/* 8 — Changes to this policy */}
          <Section
            id="changes-to-this-policy"
            eyebrow="Changes to this policy"
            heading="Changes to this policy"
          >
            <p className="text-[16px] leading-7 text-muted-foreground">
              We may update this policy from time to time. If we make
              significant changes, we will let you know on this page.
            </p>
          </Section>

          {/* 9 — Contact us */}
          <Section
            id="contact-us"
            eyebrow="Contact us"
            heading="Contact us"
            last
          >
            <p className="text-[16px] leading-7 text-muted-foreground">
              If you have any questions about this policy, please get in touch
              at{" "}
              <a
                href="mailto:privacy@alentah.com"
                className="text-foreground underline decoration-border underline-offset-4 transition-colors hover:text-primary hover:decoration-primary/60"
              >
                privacy@alentah.com
              </a>
              .
            </p>
          </Section>
        </article>
      </div>

      {/* CLOSING STRIP */}
      <section
        aria-labelledby="closing-heading"
        className="mt-24 pb-24 sm:mt-28 sm:pb-28 lg:mt-32 lg:pb-32"
      >
        <h2 id="closing-heading" className="sr-only">
          Closing
        </h2>

        <div aria-hidden="true" className="h-px w-full bg-border" />

        <div className="mx-auto mt-16 max-w-3xl text-center">
          <p className="font-serif text-xl italic leading-snug tracking-tight text-foreground sm:text-2xl lg:text-3xl">
            Fewer cookies, more reading.
          </p>

          <p className="mt-8 text-[10px] font-bold uppercase tracking-[0.24em] text-muted-foreground">
            — The Editorial Team
          </p>
        </div>
      </section>
    </main>
  );
}

// ============================================================
// SECTION — eyebrow dot + serif heading + body
// ============================================================

function Section({
  id,
  eyebrow,
  heading,
  last,
  children,
}: {
  id: string;
  eyebrow: string;
  heading: string;
  last?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-heading`}
      className={last ? "scroll-mt-24" : "scroll-mt-24 mb-16 sm:mb-20"}
    >
      <div className="flex items-center gap-2.5">
        <span
          aria-hidden="true"
          className="block size-1.5 rounded-full bg-primary"
        />
        <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-primary">
          {eyebrow}
        </p>
      </div>

      <h2
        id={`${id}-heading`}
        className="mt-4 font-serif text-3xl font-semibold leading-tight tracking-tight text-foreground sm:text-4xl"
      >
        {heading}
      </h2>

      <div className="mt-5 space-y-4">{children}</div>
    </section>
  );
}