// src/components/site/general/sections/from-the-editor.tsx
// ============================================================
// From the Editor — ALENTAH
// Editorial letter section: portrait, quote, letter, CTA.
// Right-side text starts at the top of the image (not centered).
// Uses Next.js Image with full SEO + accessibility support.
// Signature is an inline SVG, clean handwritten-style.
// Tight spacing between name, role, and signature.
// No horizontal padding — the global Container handles it.
// ============================================================

import Image from "next/image";
import Link from "next/link";

// ============================================================
// DATA
// ============================================================

const EDITOR = {
  name: "Talha Tabish",
  role: "Editor-in-Chief",
  image: "/images/editor.webp",
  imageAlt: "Talha Tabish, Editor-in-Chief of Alentah",
};

const QUOTE =
  "We don't chase trends. We chase truth, taste, and time.";

const PARAGRAPHS = [
  "At Alentah, we believe that great stories do more than inform — they help us see the world more clearly. In a time of endless noise, we choose depth over speed, quality over quantity, and perspective over popularity.",
  "This magazine is a space for curious minds, thoughtful conversations, and ideas that matter. We're here for the dreamers, the builders, the travelers, and everyone who still believes in the power of a well-told story.",
];

// ============================================================
// SIGNATURE — clean handwritten-style SVG for "Talha Tabish"
// ============================================================

function TalhaTabishSignature({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 240 56"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="Talha Tabish signature"
    >
      {/* "T" */}
      <path
        d="M4 14 C 12 12, 20 11, 28 11 C 22 14, 18 24, 16 34 C 15 40, 17 42, 22 40"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* "a" */}
      <path
        d="M34 38 C 30 32, 34 26, 40 28 C 44 29, 42 36, 38 40 C 36 42, 40 42, 44 38"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* "l" */}
      <path
        d="M48 12 C 50 11, 52 14, 50 22 L 46 38 C 45 42, 48 42, 52 38"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* "h" */}
      <path
        d="M56 14 C 58 13, 60 16, 58 24 L 54 38 C 54 42, 57 42, 60 38 M 56 30 C 60 26, 68 26, 66 34 C 65 40, 60 42, 64 42 C 68 42, 72 38, 74 34"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* "a" */}
      <path
        d="M80 38 C 76 32, 80 26, 86 28 C 90 29, 88 36, 84 40 C 82 42, 86 42, 90 38"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* underline flourish under "Talha" */}
      <path
        d="M2 48 C 30 44, 70 43, 94 46"
        stroke="currentColor"
        strokeWidth="0.85"
        strokeLinecap="round"
        opacity="0.65"
      />

      {/* "T" */}
      <path
        d="M110 24 C 118 22, 126 21, 134 21 C 128 24, 124 32, 122 42 C 121 46, 123 47, 128 45"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* "a" */}
      <path
        d="M140 42 C 136 36, 140 30, 146 32 C 150 33, 148 40, 144 44 C 142 46, 146 46, 150 42"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* "b" */}
      <path
        d="M156 12 C 158 11, 160 14, 158 22 L 152 42 C 152 46, 156 47, 162 43 M 158 32 C 162 26, 170 28, 168 36 C 166 42, 158 46, 154 42"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* "i" */}
      <path
        d="M176 32 C 178 31, 180 34, 178 40 C 177 44, 179 44, 182 42 M 177 26 C 177 24, 180 24, 180 26"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* "s" */}
      <path
        d="M190 34 C 194 30, 200 32, 198 36 C 196 40, 190 40, 192 44 C 194 46, 200 44, 204 40"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* "h" */}
      <path
        d="M210 14 C 212 13, 214 16, 212 24 L 208 42 C 208 46, 211 46, 214 42 M 210 34 C 214 30, 222 30, 220 38 C 219 42, 214 44, 218 44 C 222 44, 226 40, 228 36"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* underline flourish under "Tabish" */}
      <path
        d="M108 50 C 140 46, 190 46, 232 49"
        stroke="currentColor"
        strokeWidth="0.85"
        strokeLinecap="round"
        opacity="0.65"
      />
    </svg>
  );
}

// ============================================================
// COMPONENT
// ============================================================

export function FromTheEditor() {
  return (
    <section
      aria-labelledby="from-the-editor-heading"
      className="my-16 sm:my-20"
    >
      {/* Kicker row */}
      <div className="flex items-center gap-6">
        <h2
          id="from-the-editor-heading"
          className="text-[11px] font-bold uppercase tracking-[0.28em] text-foreground"
        >
          From the Editor
        </h2>

        <span aria-hidden="true" className="h-px flex-1 bg-border" />
      </div>

      {/* Main grid */}
      <div className="mt-12 grid grid-cols-1 gap-12 lg:grid-cols-[320px_minmax(0,1fr)] lg:gap-16 xl:grid-cols-[360px_minmax(0,1fr)] xl:gap-20 lg:items-start">
        {/* ---------- LEFT: portrait + name + signature ---------- */}
        <div className="flex flex-col">
          <figure className="flex flex-col">
            <div className="relative aspect-4/5 w-full overflow-hidden bg-muted">
              <Image
                src={EDITOR.image}
                alt={EDITOR.imageAlt}
                fill
                priority={false}
                sizes="(max-width: 1024px) 100vw, (max-width: 1280px) 320px, 360px"
                className="object-cover object-top"
              />
            </div>

            <figcaption className="mt-4">
              <p className="font-serif text-3xl p-1 m-1 font-semibold leading-none tracking-tight text-foreground sm:text-[2rem]">
                {EDITOR.name}
              </p>

              <p className=" text-[10px] font-bold p-0 m-0 uppercase tracking-[0.28em] text-muted-foreground">
                {EDITOR.role}
              </p>
                  <div className="">
            <TalhaTabishSignature className="h-10 w-[190px] text-foreground/80 sm:w-[200px]" />
          </div>
            </figcaption>
          </figure>

          {/* Signature — sits right under the role */}
      
        </div>

        {/* ---------- RIGHT: quote + letter + CTA ---------- */}
        <div className="flex flex-col items-start justify-start">
          <blockquote className="font-serif italic text-foreground">
            <p className="text-3xl leading-[1.15] tracking-[-0.01em] sm:text-4xl lg:text-[2.75rem] lg:leading-[1.15] xl:text-5xl">
              <span aria-hidden="true" className="text-muted-foreground/60">
                &ldquo;
              </span>
              {QUOTE}
              <span aria-hidden="true" className="text-muted-foreground/60">
                &rdquo;
              </span>
            </p>
          </blockquote>

          <div className="mt-9 space-y-5">
            {PARAGRAPHS.map((paragraph, index) => (
              <p
                key={index}
                className="text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8"
              >
                {paragraph}
              </p>
            ))}
          </div>

          <Link
            href="/about"
            className="group mt-9 inline-flex items-center gap-2 self-start text-[11px] font-bold uppercase tracking-[0.2em] text-foreground transition-colors duration-200 hover:text-primary"
          >
            <span>Read the full letter</span>
            <span
              aria-hidden="true"
              className="transition-transform duration-300 group-hover:translate-x-1"
            >
              &rarr;
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}

export default FromTheEditor;