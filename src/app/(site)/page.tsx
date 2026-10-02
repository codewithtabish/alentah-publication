// app/typography/page.tsx
// ============================================================
// Typography Showcase — The Meridian
// Preview all fonts, sizes, and weights in one place.
// Visit /typography to see it.
// ============================================================

import { UploadEditorTest } from "@/components/site/general/test/upload-editor-test";
import { ModeToggle } from "@/components/site/general/theme/mode-toggle";

export const metadata = {
  title: "Typography — The Meridian",
  description: "Font family and size showcase.",
};

// ============================================
// DATA
// ============================================

const serifSizes = [
  { label: "Display", className: "text-7xl lg:text-8xl", weight: "font-normal", note: "Hero headlines" },
  { label: "H1", className: "text-5xl lg:text-6xl", weight: "font-normal", note: "Article titles" },
  { label: "H2", className: "text-4xl lg:text-5xl", weight: "font-normal", note: "Section headers" },
  { label: "H3", className: "text-3xl lg:text-4xl", weight: "font-medium", note: "Subsections" },
  { label: "H4", className: "text-2xl lg:text-3xl", weight: "font-medium", note: "Card titles" },
  { label: "H5", className: "text-xl lg:text-2xl", weight: "font-semibold", note: "Small headers" },
  { label: "H6", className: "text-lg lg:text-xl", weight: "font-semibold", note: "Mini headers" },
];

const sansSizes = [
  { label: "Lead", className: "text-2xl", weight: "font-light", note: "Article intro" },
  { label: "Body XL", className: "text-xl", weight: "font-normal", note: "Long-form body" },
  { label: "Body", className: "text-base", weight: "font-normal", note: "Default body" },
  { label: "Small", className: "text-sm", weight: "font-normal", note: "Captions" },
  { label: "XS", className: "text-xs", weight: "font-medium", note: "Tags, labels" },
  { label: "Overline", className: "text-xs uppercase tracking-[0.2em]", weight: "font-semibold", note: "Category labels" },
];

const sampleText =
  "The Art of Slower Travel: Finding More in Less";

const bodySample =
  "In a world that moves too fast, slow travel offers a richer, deeper way to experience the places we visit — and ourselves.";

// ============================================
// PAGE
// ============================================

export default function TypographyPage() {
  return (
    <div className="py-16 space-y-24">
      <ModeToggle/>
      <UploadEditorTest/>

      {/* ============================================
          PAGE HEADER
          ============================================ */}
      <header className="border-b border-border pb-10">
        <p className="text-xs uppercase tracking-[0.25em] text-primary font-semibold mb-3">
          Design System
        </p>
        <h1 className="font-serif text-6xl lg:text-7xl tracking-tight">
          Typography
        </h1>
        <p className="font-sans text-lg text-muted-foreground mt-4 max-w-2xl">
          The type system behind The Meridian. Two families, sharp hierarchy,
          editorial rhythm.
        </p>
      </header>

      {/* ============================================
          FONT FAMILIES OVERVIEW
          ============================================ */}
      <section className="space-y-8">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-primary font-semibold mb-2">
            01 — Font Families
          </p>
          <h2 className="font-serif text-4xl mb-8">Two Voices</h2>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Serif — Fraunces */}
          <div className="border border-border rounded-lg p-8 bg-card">
            <p className="text-xs uppercase tracking-[0.2em] text-primary font-semibold mb-6">
              Serif — Headlines
            </p>
            <p className="font-serif text-6xl mb-4">Aa</p>
            <p className="font-serif text-2xl mb-2">Fraunces</p>
            <p className="font-sans text-sm text-muted-foreground">
              Warm, editorial, magazine-grade. Used for all headlines,
              pull quotes, and the wordmark.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {["300", "400", "500", "600", "700", "900"].map((w) => (
                <span
                  key={w}
                  className="text-xs font-mono px-2 py-1 border border-border rounded"
                >
                  {w}
                </span>
              ))}
            </div>
          </div>

          {/* Sans — Plus Jakarta */}
          <div className="border border-border rounded-lg p-8 bg-card">
            <p className="text-xs uppercase tracking-[0.2em] text-primary font-semibold mb-6">
              Sans — Body
            </p>
            <p className="font-sans text-6xl mb-4">Aa</p>
            <p className="font-sans text-2xl mb-2">Plus Jakarta Sans</p>
            <p className="font-sans text-sm text-muted-foreground">
              Clean, humanist, highly legible. Used for body copy, UI,
              labels, and everything functional.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {["200", "300", "400", "500", "600", "700", "800"].map((w) => (
                <span
                  key={w}
                  className="text-xs font-mono px-2 py-1 border border-border rounded"
                >
                  {w}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============================================
          SERIF SCALE — HEADLINES
          ============================================ */}
      <section className="space-y-8">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-primary font-semibold mb-2">
            02 — Serif Scale
          </p>
          <h2 className="font-serif text-4xl mb-8">Headline Hierarchy</h2>
        </div>

        <div className="space-y-12">
          {serifSizes.map((item) => (
            <div key={item.label} className="border-b border-border pb-8">
              <div className="flex items-baseline justify-between mb-4">
                <span className="text-xs uppercase tracking-[0.2em] text-primary font-semibold">
                  {item.label}
                </span>
                <span className="text-xs font-mono text-muted-foreground">
                  {item.className} · {item.weight} · {item.note}
                </span>
              </div>
              <p className={`font-serif ${item.className} ${item.weight} tracking-tight`}>
                {sampleText}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ============================================
          SANS SCALE — BODY
          ============================================ */}
      <section className="space-y-8">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-primary font-semibold mb-2">
            03 — Sans Scale
          </p>
          <h2 className="font-serif text-4xl mb-8">Body Hierarchy</h2>
        </div>

        <div className="space-y-10">
          {sansSizes.map((item) => (
            <div key={item.label} className="border-b border-border pb-6">
              <div className="flex items-baseline justify-between mb-3">
                <span className="text-xs uppercase tracking-[0.2em] text-primary font-semibold">
                  {item.label}
                </span>
                <span className="text-xs font-mono text-muted-foreground">
                  {item.className} · {item.weight} · {item.note}
                </span>
              </div>
              <p className={`font-sans ${item.className} ${item.weight} text-foreground`}>
                {bodySample}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ============================================
          WEIGHT SHOWCASE
          ============================================ */}
      <section className="space-y-8">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-primary font-semibold mb-2">
            04 — Weights
          </p>
          <h2 className="font-serif text-4xl mb-8">Every Weight, Side by Side</h2>
        </div>

        <div className="space-y-6">
          {[
            { w: "font-light", label: "Light 300" },
            { w: "font-normal", label: "Regular 400" },
            { w: "font-medium", label: "Medium 500" },
            { w: "font-semibold", label: "Semibold 600" },
            { w: "font-bold", label: "Bold 700" },
            { w: "font-black", label: "Black 900" },
          ].map((item) => (
            <div key={item.label} className="flex flex-col md:flex-row md:items-baseline gap-4 border-b border-border pb-4">
              <span className="text-xs font-mono text-muted-foreground md:w-40 shrink-0">
                {item.label}
              </span>
              <p className={`font-serif text-3xl ${item.w} tracking-tight`}>
                Fraunces {item.label}
              </p>
            </div>
          ))}
        </div>

        <div className="space-y-6 pt-8">
          {[
            { w: "font-light", label: "Light 300" },
            { w: "font-normal", label: "Regular 400" },
            { w: "font-medium", label: "Medium 500" },
            { w: "font-semibold", label: "Semibold 600" },
            { w: "font-bold", label: "Bold 700" },
            { w: "font-extrabold", label: "Extrabold 800" },
          ].map((item) => (
            <div key={item.label} className="flex flex-col md:flex-row md:items-baseline gap-4 border-b border-border pb-4">
              <span className="text-xs font-mono text-muted-foreground md:w-40 shrink-0">
                {item.label}
              </span>
              <p className={`font-sans text-2xl ${item.w}`}>
                Plus Jakarta Sans {item.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ============================================
          REAL-WORLD PREVIEW — ARTICLE CARD
          ============================================ */}
      <section className="space-y-8">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-primary font-semibold mb-2">
            05 — In Context
          </p>
          <h2 className="font-serif text-4xl mb-8">Real Editorial Preview</h2>
        </div>

        <article className="max-w-3xl border border-border rounded-lg p-8 bg-card">
          <p className="text-xs uppercase tracking-[0.2em] text-primary font-semibold mb-3">
            Travel
          </p>
          <h3 className="font-serif text-4xl lg:text-5xl tracking-tight mb-4">
            The Art of Slower Travel: Finding More in Less
          </h3>
          <p className="font-sans text-lg text-muted-foreground leading-relaxed mb-6">
            {bodySample}
          </p>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="font-sans font-medium text-foreground">Talha Tabish</span>
            <span>·</span>
            <span className="font-sans">Editor-in-Chief</span>
            <span>·</span>
            <span className="font-sans">6 min read</span>
          </div>
        </article>
      </section>

      {/* ============================================
          FOOTER NOTE
          ============================================ */}
      <footer className="border-t border-border pt-8">
        <p className="text-xs font-mono text-muted-foreground">
          Serif: <span className="text-foreground">Fraunces</span> · Sans:{" "}
          <span className="text-foreground">Plus Jakarta Sans</span> · Mono:{" "}
          <span className="text-foreground">Geist Mono</span>
        </p>
      </footer>

    </div>
  );
}