// src/app/(site)/terms/page.tsx
// ============================================================
// Terms — ALENTAH
// Editorial Terms of Service page: hero, sticky TOC + body,
// closing strip.
//
// Back button behaviour:
//   - Shows when there is browser history to return to.
//   - Uses Next.js useRouter for the actual navigation.
//   - Falls back to "/" when there is no history.
//
// No horizontal padding on page-level elements — the global
// Container handles it. No bg-background on any panel.
//
// ⚠️ This is a CLIENT component. It cannot export `metadata`.
//    All SEO for /terms lives in the sibling `layout.tsx`.
// ============================================================

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

// ============================================================
// DATA
// ============================================================

const SECTIONS = [
  { id: "acceptance-of-terms", label: "Acceptance of terms" },
  { id: "using-alentah", label: "Using Alentah" },
  { id: "your-account", label: "Your account" },
  { id: "content-you-post", label: "Content you post" },
  { id: "our-content", label: "Our content" },
  { id: "newsletter-and-email", label: "Newsletter and email" },
  { id: "third-party-links", label: "Third-party links" },
  { id: "disclaimer", label: "Disclaimer" },
  { id: "limitation-of-liability", label: "Limitation of liability" },
  { id: "changes-to-these-terms", label: "Changes to these terms" },
  { id: "governing-law", label: "Governing law" },
  { id: "delete-your-account", label: "Delete your account" },
  { id: "contact-us", label: "Contact us" },
];

// ============================================================
// PAGE
// ============================================================

export default function TermsPage() {
  const router = useRouter();

  const [activeId, setActiveId] = useState<string>("acceptance-of-terms");
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
        aria-labelledby="terms-heading"
        className={
          hasHistory ? "pt-10 sm:pt-12 lg:pt-14" : "pt-16 sm:pt-20 lg:pt-24"
        }
      >
        <div aria-hidden="true" className="h-px w-full bg-border" />

        <div className="pt-14 sm:pt-16 lg:pt-20">
          <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-primary">
            Terms of use at Alentah
          </p>

          <h1
            id="terms-heading"
            className="mt-6 max-w-3xl font-serif text-5xl font-bold leading-[1.05] tracking-[-0.03em] text-foreground sm:text-6xl lg:text-7xl xl:text-[5rem]"
          >
            The rules of the road.
          </h1>

          <p className="mt-8 max-w-2xl font-serif text-lg italic leading-relaxed text-muted-foreground sm:text-xl">
            What you can expect from us, what we expect from you, and how we
            handle disagreement.
            <br />
            Written to be read, not skimmed.
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
          <Section
            id="acceptance-of-terms"
            eyebrow="Acceptance of terms"
            heading="Acceptance of terms"
          >
            <p className="text-[16px] leading-7 text-muted-foreground">
              By accessing or using Alentah, you agree to these Terms of Use.
              If you do not agree, please do not use our site.
            </p>
          </Section>

          <Section
            id="using-alentah"
            eyebrow="Using Alentah"
            heading="Using Alentah"
          >
            <p className="text-[16px] leading-7 text-muted-foreground">
              You can read our articles, share links, subscribe to our
              newsletter, and comment on our content. You may not scrape,
              mirror, republish, or otherwise copy our content for commercial
              purposes, or use our site in any way that harms others or
              violates the law.
            </p>
          </Section>

          <Section
            id="your-account"
            eyebrow="Your account"
            heading="Your account"
          >
            <p className="text-[16px] leading-7 text-muted-foreground">
              We are responsible for keeping your data secure on our side. We
              store your information with the same care we apply to our own
              editorial work, we never sell it, and we never share it with
              third parties for advertising.
            </p>
          </Section>

          <Section
            id="content-you-post"
            eyebrow="Content you post"
            heading="Content you post"
          >
            <p className="text-[16px] leading-7 text-muted-foreground">
              Comments, questions and pitches you submit remain yours. By
              posting them, you grant Alentah a non-exclusive license to
              publish, edit and moderate them.
            </p>
          </Section>

          <Section
            id="our-content"
            eyebrow="Our content"
            heading="Our content"
          >
            <p className="text-[16px] leading-7 text-muted-foreground">
              All articles, illustrations and diagrams on Alentah are
              copyrighted to us. You are welcome to quote or excerpt our
              content with proper attribution. Wholesale republishing is not
              permitted.
            </p>
          </Section>

          <Section
            id="newsletter-and-email"
            eyebrow="Newsletter and email"
            heading="Newsletter and email"
          >
            <p className="text-[16px] leading-7 text-muted-foreground">
              When you subscribe, you&rsquo;ll receive our newsletter,
              editorial updates and occasional announcements. You can
              unsubscribe at any time using the link in any email.
            </p>
          </Section>

          <Section
            id="third-party-links"
            eyebrow="Third-party links"
            heading="Third-party links"
          >
            <p className="text-[16px] leading-7 text-muted-foreground">
              We may link to third-party websites for your convenience.
              Alentah is not responsible for the content, accuracy or practices
              of any external sites.
            </p>
          </Section>

          <Section
            id="disclaimer"
            eyebrow="Disclaimer"
            heading="Disclaimer"
          >
            <p className="text-[16px] leading-7 text-muted-foreground">
              Alentah publishes analysis and reporting, but does not provide
              professional advice. Nothing on our site should be considered
              legal, financial or medical advice.
            </p>
          </Section>

          <Section
            id="limitation-of-liability"
            eyebrow="Limitation of liability"
            heading="Limitation of liability"
          >
            <p className="text-[16px] leading-7 text-muted-foreground">
              To the fullest extent permitted by law, Alentah is not liable
              for any indirect, incidental or consequential damages arising
              from your use of our site.
            </p>
          </Section>

          <Section
            id="changes-to-these-terms"
            eyebrow="Changes to these terms"
            heading="Changes to these terms"
          >
            <p className="text-[16px] leading-7 text-muted-foreground">
              We may update these Terms of Use from time to time. Material
              changes will be announced on our site or by email.
            </p>
          </Section>

          <Section
            id="governing-law"
            eyebrow="Governing law"
            heading="Governing law"
          >
            <p className="text-[16px] leading-7 text-muted-foreground">
              These terms are governed by the laws of Pakistan, and any
              disputes will be subject to the exclusive jurisdiction of its
              courts.
            </p>
          </Section>

          <Section
            id="delete-your-account"
            eyebrow="Delete your account"
            heading="Delete your account"
          >
            <p className="text-[16px] leading-7 text-muted-foreground">
              You can request deletion of your Alentah account at any time.
              Send an email to{" "}
              <a
                href="mailto:privacy@alentah.com"
                className="text-foreground underline decoration-border underline-offset-4 transition-colors hover:text-primary hover:decoration-primary/60"
              >
                privacy@alentah.com
              </a>{" "}
              and we&rsquo;ll take care of it manually within a reasonable
              time. When we delete your account, your profile, saved articles,
              comment history, and newsletter preferences are permanently
              removed.
            </p>
          </Section>

          <Section
            id="contact-us"
            eyebrow="Contact us"
            heading="Contact us"
            last
          >
            <p className="text-[16px] leading-7 text-muted-foreground">
              If you have any questions about these terms, please contact us
              at{" "}
              <a
                href="mailto:legal@alentah.com"
                className="text-foreground underline decoration-border underline-offset-4 transition-colors hover:text-primary hover:decoration-primary/60"
              >
                legal@alentah.com
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
            Good rules, like good writing, are short and clear.
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