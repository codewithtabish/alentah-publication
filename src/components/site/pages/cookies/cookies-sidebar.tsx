"use client";

// ============================================================
// CookiesSidebar — ALENTAH
// Sticky TOC for the Cookies page.
// Watches the section headings, highlights the active one,
// and smooth-scrolls when a link is clicked.
// Desktop only — hidden on lg and below.
// ============================================================

import { useEffect, useState, type MouseEvent } from "react";

type SidebarSection = {
  id: string;
  label: string;
};

export function CookiesSidebar({
  sections,
}: {
  sections: SidebarSection[];
}) {
  const [activeId, setActiveId] = useState(sections[0]?.id ?? "");

  // Scroll-spy: track which section is currently in view
  useEffect(() => {
    const headings = sections
      .map((s) => document.getElementById(s.id))
      .filter((el): el is HTMLElement => Boolean(el));

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
  }, [sections]);

  const handleTocClick = (
    e: MouseEvent<HTMLAnchorElement>,
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
    <aside className="hidden lg:block">
      <nav
        aria-label="On this page"
        className="sticky top-24 rounded-xl border border-border p-6"
      >
        <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-muted-foreground">
          On this page
        </p>

        <ul className="mt-5 space-y-1">
          {sections.map((section) => {
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
  );
}