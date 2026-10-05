// src/app/(site)/ethics/page.tsx
// ============================================================
// Ethics — ALENTAH
// Editorial Ethics Policy page: hero, sticky TOC + body,
// numbered commitments list, closing strip.
//
// Back button behaviour:
//   - Shows when there is browser history to return to.
//   - Uses Next.js useRouter for the actual navigation.
//   - Falls back to "/" when there is no history.
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
  { id: "our-commitments", label: "Our commitments", eyebrow: "Our commitments" },
  { id: "independence", label: "Independence", eyebrow: "Independence" },
  { id: "funding-and-advertising", label: "Funding and advertising", eyebrow: "Funding and advertising" },
  { id: "sources-and-attribution", label: "Sources and attribution", eyebrow: "Sources and attribution" },
  { id: "corrections", label: "Corrections", eyebrow: "Corrections" },
  { id: "use-of-ai-in-our-work", label: "Use of AI in our work", eyebrow: "Use of AI in our work" },
  { id: "sponsored-content", label: "Sponsored content", eyebrow: "Sponsored content" },
  { id: "reader-data", label: "Reader data", eyebrow: "Reader data" },
  { id: "complaints-and-accountability", label: "Complaints and accountability", eyebrow: "Complaints and accountability" },
  { id: "contact-us", label: "Contact us", eyebrow: "Contact us" },
];

const COMMITMENTS = [
  { number: "01", body: "We seek truth, not clicks." },
  { number: "02", body: "We give a voice to underrepresented perspectives." },
  { number: "03", body: "We are transparent about our process and our mistakes." },
  { number: "04", body: "We put our readers first, always." },
];

// ============================================================
// PAGE
// ============================================================

export default function EthicsPage() {
  const router = useRouter();

  const [activeId, setActiveId] = useState<string>("our-commitments");
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
      {/* BACK BUTTON — only when there is history */}
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
        aria-labelledby="ethics-heading"
        className={
          hasHistory
            ? "pt-10 sm:pt-12 lg:pt-14"
            : "pt-16 sm:pt-20 lg:pt-24"
        }
      >
        <div aria-hidden="true" className="h-px w-full bg-border" />

        <div className="pt-14 sm:pt-16 lg:pt-20">
          <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-primary">
            Ethics at Alentah
          </p>

          <h1
            id="ethics-heading"
            className="mt-6 max-w-4xl font-serif text-5xl font-bold leading-[1.05] tracking-[-0.03em] text-foreground sm:text-6xl lg:text-7xl xl:text-[5rem]"
          >
            How we work, and
            <br className="hidden sm:block" /> what we stand for.
          </h1>

          <p className="mt-8 max-w-2xl font-serif text-lg italic leading-relaxed text-muted-foreground sm:text-xl">
            ALENTAH is small and independent. We answer to our readers, not to
            advertisers, platforms, or press cycles. Here is what that means in
            practice.
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
          {/* 1 — Our commitments */}
          <Section
            id="our-commitments"
            eyebrow="Our commitments"
            heading="Our commitments"
          >
            <p className="text-[16px] leading-7 text-muted-foreground">
              These are the principles that guide every piece of journalism we
              publish.
            </p>

            <ol className="mt-2 space-y-3">
              {COMMITMENTS.map((item) => (
                <li
                  key={item.number}
                  className="flex items-baseline gap-4"
                >
                  <span className="shrink-0 font-mono text-[13px] font-semibold text-primary tabular-nums">
                    {item.number}
                  </span>
                  <span className="text-[16px] leading-7 text-muted-foreground">
                    {item.body}
                  </span>
                </li>
              ))}
            </ol>
          </Section>

          {/* 2 — Independence */}
          <Section
            id="independence"
            eyebrow="Independence"
            heading="Independence"
          >
            <p className="text-[16px] leading-7 text-muted-foreground">
              Alentah is editorially independent. We do not take direction from
              advertisers, partners, platforms, or any other commercial
              interests.
            </p>
            <p className="text-[16px] leading-7 text-muted-foreground">
              Our editorial decisions are made by our team, based on what we
              believe is important, not on what will generate the most traffic
              or revenue.
            </p>
          </Section>

          {/* 3 — Funding and advertising */}
          <Section
            id="funding-and-advertising"
            eyebrow="Funding and advertising"
            heading="Funding and advertising"
          >
            <p className="text-[16px] leading-7 text-muted-foreground">
              Alentah is funded by a mix of reader support and carefully
              selected advertising.
            </p>
            <p className="text-[16px] leading-7 text-muted-foreground">
              All advertising is clearly labeled. We do not accept sponsored
              editorial, and we do not sell influence, coverage, or access.
            </p>
          </Section>

          {/* 4 — Sources and attribution */}
          <Section
            id="sources-and-attribution"
            eyebrow="Sources and attribution"
            heading="Sources and attribution"
          >
            <p className="text-[16px] leading-7 text-muted-foreground">
              We credit our sources, link to primary documents, and name the
              people we interview unless there is a documented safety reason
              not to.
            </p>
            <p className="text-[16px] leading-7 text-muted-foreground">
              We do not fabricate, misrepresent, or paraphrase without
              attribution.
            </p>
          </Section>

          {/* 5 — Corrections */}
          <Section
            id="corrections"
            eyebrow="Corrections"
            heading="Corrections"
          >
            <p className="text-[16px] leading-7 text-muted-foreground">
              We publish corrections prominently and transparently. When we
              make material changes, we add an editor&rsquo;s note to the
              article.
            </p>
            <p className="text-[16px] leading-7 text-muted-foreground">
              We never silently edit or delete published work.
            </p>
          </Section>

          {/* 6 — Use of AI in our work */}
          <Section
            id="use-of-ai-in-our-work"
            eyebrow="Use of AI in our work"
            heading="Use of AI in our work"
          >
            <p className="text-[16px] leading-7 text-muted-foreground">
              We may use AI tools for research assistance, transcription, and
              translation.
            </p>
            <p className="text-[16px] leading-7 text-muted-foreground">
              Every published sentence is written, reviewed, and approved by a
              human editor.
            </p>
            <p className="text-[16px] leading-7 text-muted-foreground">
              AI is never credited as an author.
            </p>
          </Section>

          {/* 7 — Sponsored content */}
          <Section
            id="sponsored-content"
            eyebrow="Sponsored content"
            heading="Sponsored content"
          >
            <p className="text-[16px] leading-7 text-muted-foreground">
              Any sponsored or partner content is labeled at the top of the
              page, uses a distinct visual treatment, and is written or
              reviewed by our editorial team.
            </p>
          </Section>

          {/* 8 — Reader data */}
          <Section
            id="reader-data"
            eyebrow="Reader data"
            heading="Reader data"
          >
            <p className="text-[16px] leading-7 text-muted-foreground">
              We do not sell reader data. For more details, see our{" "}
              <a
                href="/privacy"
                className="text-foreground underline decoration-border underline-offset-4 transition-colors hover:text-primary hover:decoration-primary/60"
              >
                Privacy page
              </a>
              .
            </p>
          </Section>

          {/* 9 — Complaints and accountability */}
          <Section
            id="complaints-and-accountability"
            eyebrow="Complaints and accountability"
            heading="Complaints and accountability"
          >
            <p className="text-[16px] leading-7 text-muted-foreground">
              Readers can raise concerns by emailing{" "}
              <a
                href="mailto:ethics@alentah.com"
                className="text-foreground underline decoration-border underline-offset-4 transition-colors hover:text-primary hover:decoration-primary/60"
              >
                ethics@alentah.com
              </a>
              . We investigate all legitimate concerns and, where appropriate,
              publish our response.
            </p>
            <p className="text-[16px] leading-7 text-muted-foreground">
              Accountability matters, and we take it seriously.
            </p>
          </Section>

          {/* 10 — Contact us */}
          <Section
            id="contact-us"
            eyebrow="Contact us"
            heading="Contact us"
            last
          >
            <p className="text-[16px] leading-7 text-muted-foreground">
              For questions about our ethics, please contact us at{" "}
              <a
                href="mailto:ethics@alentah.com"
                className="text-foreground underline decoration-border underline-offset-4 transition-colors hover:text-primary hover:decoration-primary/60"
              >
                ethics@alentah.com
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
            We would rather lose a story than lose our readers&rsquo; trust.
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