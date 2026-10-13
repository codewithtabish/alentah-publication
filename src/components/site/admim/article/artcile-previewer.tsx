"use client";

import { TableOfContentsItem } from "@/schemas/blog-schema";
import Image from "next/image";
import React, { useEffect, useMemo, useRef, useState } from "react";
import CodeBlockSwitcher from "./code-article-switcher";
import {
  ADS_ENABLED,
  Banner300x250,
  Banner728x90,
  NativeAd,
} from "../../general/ads/site-ads";

type PreviewerProps = {
  content: any;
  tableOfContents?: TableOfContentsItem[];
  stickyOffset?: number;
};

type SidebarProps = {
  content: any;
  tableOfContents?: TableOfContentsItem[];
  stickyOffset?: number;
  showAd?: boolean;
};

const AD_FIRST_AFTER = 2;
const AD_GAP = 3;
const AD_MAX_INLINE = 5;

const NATIVE_EARLY_VARIANT = 10;
const NATIVE_MID_VARIANT = 11;
const NATIVE_LATE_VARIANT = 12;

const SIDEBAR_AD_VARIANT = 20;

const TOC_TYPES = new Set([
  "toc",
  "tableofcontents",
  "table-of-contents",
  "table_of_contents",
]);

const renderHTML = (html: string | undefined | null) => {
  if (!html || html.trim() === "") return undefined;
  return { __html: html };
};

const stripHtml = (html: string) =>
  html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const ImageBlock: React.FC<{ file?: any; caption?: string }> = ({
  file,
  caption,
}) => {
  if (!file?.url) return null;

  return (
    <figure className="not-prose my-10 flex flex-col items-center">
      <div className="w-full overflow-hidden rounded-2xl border border-border bg-muted/20 shadow-sm">
        <Image
          src={file.url}
          alt={caption || "Blog image"}
          width={1200}
          height={675}
          sizes="(min-width: 1024px) 760px, 100vw"
          className="h-auto max-h-[650px] w-full object-contain"
        />
      </div>

      {caption && (
        <figcaption className="mt-3 max-w-2xl text-center text-sm leading-6 text-muted-foreground">
          {caption}
        </figcaption>
      )}
    </figure>
  );
};

const CodeBlock: React.FC<{
  code?: string;
  language?: string;
  title?: string;
}> = ({ code, language = "javascript", title = "Code" }) => {
  const [copied, setCopied] = useState(false);

  if (!code?.trim()) return null;

  const normalizedLanguage = language.toLowerCase();

  const languageLabels: Record<string, string> = {
    javascript: "JavaScript",
    js: "JavaScript",
    typescript: "TypeScript",
    ts: "TypeScript",
    jsx: "JSX",
    tsx: "TSX",
    python: "Python",
    py: "Python",
    html: "HTML",
    css: "CSS",
    json: "JSON",
    bash: "Bash",
    shell: "Shell",
    sh: "Shell",
    sql: "SQL",
    java: "Java",
    go: "Go",
    rust: "Rust",
    php: "PHP",
    c: "C",
    cpp: "C++",
    csharp: "C#",
    cs: "C#",
  };

  const languageLabel = languageLabels[normalizedLanguage] || language;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch (error) {
      console.error("Failed to copy code:", error);
    }
  };

  return (
    <div
      data-code-switcher
      className="not-prose my-8 w-full overflow-hidden rounded-2xl border border-border bg-muted/20 shadow-sm"
    >
      <div className="flex min-h-[58px] items-center justify-between gap-4 border-b border-border bg-background/80 px-4 py-3 backdrop-blur-sm sm:px-5">
        <div className="flex min-w-0 items-center gap-3">
          <div className="hidden items-center gap-1.5 sm:flex">
            <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground/30" />
            <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground/30" />
            <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground/30" />
          </div>

          <div className="hidden h-4 w-px bg-border sm:block" />

          <div className="flex min-w-0 items-center gap-2">
            <span className="truncate text-sm font-medium text-foreground">
              {title}
            </span>
            <span className="hidden rounded-md border border-border bg-muted px-2 py-0.5 font-mono text-[11px] font-medium text-muted-foreground sm:inline-flex">
              {languageLabel}
            </span>
          </div>
        </div>

        <button
          type="button"
          data-code-copy
          onClick={handleCopy}
          className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-xs font-medium text-muted-foreground shadow-sm transition-all hover:bg-muted hover:text-foreground active:scale-[0.98]"
          aria-label="Copy code"
        >
          {copied ? (
            <>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="h-4 w-4 text-primary"
                aria-hidden="true"
              >
                <path
                  d="m5 12 4 4L19 6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span>Copied</span>
            </>
          ) : (
            <>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="h-4 w-4"
                aria-hidden="true"
              >
                <rect
                  x="9"
                  y="9"
                  width="11"
                  height="11"
                  rx="2"
                  stroke="currentColor"
                  strokeWidth="1.8"
                />
                <path
                  d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      <div
        data-code-language-content={normalizedLanguage}
        className="overflow-x-auto"
      >
        <pre className="m-0 min-w-full bg-transparent px-5 py-6 text-[13px] leading-7 sm:px-6 sm:py-7 sm:text-sm">
          <code className="font-mono text-foreground">{code}</code>
        </pre>
      </div>
    </div>
  );
};

function slugifyHeader(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function getHeadingIds(blocks: any[]): Record<number, string> {
  const used: Record<string, number> = {};
  const result: Record<number, string> = {};

  blocks.forEach((block, index) => {
    if (block?.type?.toLowerCase() !== "header") return;
    const raw = block.data?.text;
    if (typeof raw !== "string" || !raw.trim()) return;

    const base = slugifyHeader(stripHtml(raw)) || `section-${index}`;
    const count = used[base] ?? 0;
    used[base] = count + 1;
    result[index] = count === 0 ? base : `${base}-${count}`;
  });

  return result;
}

type TocItem = { id: string; title: string; level: number };

function buildToc(
  blocks: any[],
  headingIds: Record<number, string>,
  fallback: TableOfContentsItem[],
): TocItem[] {
  const all: TocItem[] = [];

  blocks.forEach((block, index) => {
    const id = headingIds[index];
    if (!id) return;
    all.push({
      id,
      title: stripHtml(String(block.data.text)),
      level: Math.min(Math.max(block.data.level || 2, 1), 6),
    });
  });

  const main = all.filter((item) => item.level >= 2 && item.level <= 3);
  if (main.length) return main;
  if (all.length) return all;

  return fallback
    .map((item) => {
      const t = item as TableOfContentsItem & {
        id?: string;
        text?: string;
        title?: string;
        label?: string;
        href?: string;
        slug?: string;
        level?: number;
      };
      const title = t.title || t.text || t.label || "";
      const rawId = (t.slug || t.id || t.href || "").replace(/^#/, "").trim();
      return {
        id: rawId || slugifyHeader(title),
        title,
        level: t.level || 2,
      };
    })
    .filter((item) => item.id && item.title);
}

function getReadingMinutes(blocks: any[]) {
  let words = 0;

  blocks.forEach((b: any) => {
    const d = b?.data ?? {};
    const texts: string[] = [];
    if (typeof d.text === "string") texts.push(d.text);
    if (typeof d.itemsContent === "string") texts.push(d.itemsContent);
    if (typeof d.message === "string") texts.push(d.message);
    if (Array.isArray(d.items)) {
      d.items.forEach((it: any) =>
        texts.push(typeof it === "string" ? it : it?.content || it?.text || ""),
      );
    }
    texts.forEach((t) => {
      const clean = stripHtml(t);
      if (clean) words += clean.split(/\s+/).length;
    });
  });

  return Math.max(1, Math.round(words / 220));
}

function useArticleScroll(toc: TocItem[], stickyOffset: number) {
  const [progress, setProgress] = useState(0);
  const [activeId, setActiveId] = useState("");

  useEffect(() => {
    const headings = toc
      .map((item) => document.getElementById(item.id))
      .filter((el): el is HTMLElement => Boolean(el));

    let ticking = false;

    const update = () => {
      ticking = false;

      const article = document.querySelector<HTMLElement>(
        "[data-blog-article]",
      );
      if (article) {
        const rect = article.getBoundingClientRect();
        const total = Math.max(rect.height - window.innerHeight * 0.6, 1);
        setProgress(Math.min(Math.max(-rect.top / total, 0), 1));
      }

      if (headings.length) {
        const offset = stickyOffset + 60;
        let current = headings[0].id;
        for (const heading of headings) {
          if (heading.getBoundingClientRect().top <= offset) {
            current = heading.id;
          } else {
            break;
          }
        }
        setActiveId(current);
      }
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
  }, [toc, stickyOffset]);

  return { progress, activeId, setActiveId };
}

function scrollToId(id: string) {
  const target = document.getElementById(id);
  if (!target) return;
  window.requestAnimationFrame(() => {
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  });
}

function isRenderableBlock(block: any): boolean {
  if (!block) return false;

  const type = block.type?.toLowerCase();
  if (!type || TOC_TYPES.has(type)) return false;

  const data = block.data ?? {};

  switch (type) {
    case "paragraph":
    case "aitext":
    case "quote":
    case "header":
      return typeof data.text === "string" && data.text.trim() !== "";
    case "list":
    case "checklist":
      return Array.isArray(data.items) && data.items.length > 0;
    case "image":
      return Boolean(data.file?.url);
    case "code":
      return typeof data.code === "string" && data.code.trim() !== "";
    case "table":
      return Array.isArray(data.content) && data.content.length > 0;
    case "alert":
    case "warning":
      return typeof data.message === "string" && data.message.trim() !== "";
    case "toggle":
      return Boolean(data.text || data.itemsContent);
    case "linktool":
      return Boolean(data.link);
    case "attaches":
      return Boolean(data.file?.url);
    case "raw":
      return Boolean(data.html);
    case "delimiter":
      return true;
    default:
      return false;
  }
}

function getAdBlockIndexes(blocks: any[]): Set<number> {
  const result = new Set<number>();
  const renderableIndexes: number[] = [];

  blocks.forEach((block, index) => {
    if (isRenderableBlock(block)) renderableIndexes.push(index);
  });

  const total = renderableIndexes.length;
  if (total < 2) return result;

  let lastAdNumber = 0;

  for (let position = 0; position < renderableIndexes.length; position++) {
    if (result.size >= AD_MAX_INLINE) break;

    const number = position + 1;
    if (number >= total) break;

    const blockIndex = renderableIndexes[position];
    const blockType = blocks[blockIndex]?.type?.toLowerCase();
    if (blockType === "header") continue;

    const nextBlockIndex = renderableIndexes[position + 1];
    const nextBlockType =
      nextBlockIndex !== undefined
        ? blocks[nextBlockIndex]?.type?.toLowerCase()
        : undefined;
    if (nextBlockType === "header") continue;

    const farEnough =
      result.size === 0
        ? number >= AD_FIRST_AFTER
        : number - lastAdNumber >= AD_GAP;

    if (farEnough) {
      result.add(blockIndex);
      lastAdNumber = number;
    }
  }

  if (result.size === 0) {
    for (
      let position = 0;
      position < renderableIndexes.length - 1;
      position++
    ) {
      const blockIndex = renderableIndexes[position];
      const blockType = blocks[blockIndex]?.type?.toLowerCase();
      if (blockType !== "header") {
        result.add(blockIndex);
        break;
      }
    }
  }

  return result;
}

function getEarlyNativeIndex(blocks: any[]): number {
  const renderable: number[] = [];
  blocks.forEach((b, i) => {
    if (isRenderableBlock(b)) renderable.push(i);
  });

  if (renderable.length < 3) return -1;

  for (let pos = AD_FIRST_AFTER - 1; pos < renderable.length - 1; pos++) {
    const idx = renderable[pos];
    const t = blocks[idx]?.type?.toLowerCase();
    const nextIdx = renderable[pos + 1];
    const nextT =
      nextIdx !== undefined ? blocks[nextIdx]?.type?.toLowerCase() : undefined;
    if (t === "header" || nextT === "header") continue;
    return idx;
  }
  return -1;
}

function getMidNativeIndex(blocks: any[]): number {
  const renderable: number[] = [];
  blocks.forEach((b, i) => {
    if (isRenderableBlock(b)) renderable.push(i);
  });

  const total = renderable.length;
  if (total < 5) return -1;

  const target = Math.floor(total / 2);

  for (let off = 0; off < total; off++) {
    const candidates = [target - off, target + off];
    for (const pos of candidates) {
      if (pos <= 0 || pos >= total) continue;
      const idx = renderable[pos - 1];
      const t = blocks[idx]?.type?.toLowerCase();
      const nextIdx = renderable[pos];
      const nextT =
        nextIdx !== undefined
          ? blocks[nextIdx]?.type?.toLowerCase()
          : undefined;
      if (t === "header" || nextT === "header") continue;
      return idx;
    }
  }
  return -1;
}

function getLateNativeIndex(blocks: any[]): number {
  const renderable: number[] = [];
  blocks.forEach((b, i) => {
    if (isRenderableBlock(b)) renderable.push(i);
  });

  const total = renderable.length;
  if (total < 8) return -1;

  const target = Math.floor(total * 0.78);

  for (let off = 0; off < total; off++) {
    const candidates = [target - off, target + off];
    for (const pos of candidates) {
      if (pos <= 0 || pos >= total - 1) continue;
      const idx = renderable[pos - 1];
      const t = blocks[idx]?.type?.toLowerCase();
      const nextIdx = renderable[pos];
      const nextT =
        nextIdx !== undefined
          ? blocks[nextIdx]?.type?.toLowerCase()
          : undefined;
      if (t === "header" || nextT === "header") continue;
      return idx;
    }
  }
  return -1;
}

function AdFrame({
  label,
  children,
  className = "",
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <aside
      aria-label={label}
      className={[
        "not-prose flex w-full min-w-0 max-w-full flex-col items-center",
        "rounded-2xl border border-border/60 bg-muted/20 px-2 py-3",
        className,
      ].join(" ")}
    >
      <span className="mb-2 text-[11px] text-muted-foreground/70">{label}</span>
      {children}
    </aside>
  );
}

function InArticleAd({ order }: { order: number }) {
  if (!ADS_ENABLED) return null;

  const slot = order % 3;

  if (slot === 0) {
    return (
      <div className="flex min-h-[250px] w-full items-center justify-center overflow-hidden">
        <Banner300x250 variant={order} />
      </div>
    );
  }

  if (slot === 1) {
    return (
      <div className="flex min-h-[180px] w-full items-center justify-center overflow-hidden">
        <NativeAd variant={order} />
      </div>
    );
  }

  return (
    <div className="flex min-h-[90px] w-full items-center justify-center overflow-hidden">
      <div className="hidden md:block">
        <Banner728x90 variant={order} />
      </div>
      <div className="md:hidden">
        <Banner300x250 variant={order} />
      </div>
    </div>
  );
}

function NativeSlot({ variant }: { variant: number }) {
  if (!ADS_ENABLED) return null;

  return (
    <AdFrame label="Sponsored" className="my-10">
      <div className="flex min-h-[180px] w-full items-center justify-center overflow-hidden">
        <NativeAd variant={variant} />
      </div>
    </AdFrame>
  );
}

function TocList({
  items,
  activeId,
  onSelect,
}: {
  items: TocItem[];
  activeId: string;
  onSelect: (id: string) => void;
}) {
  return (
    <ul className="relative m-0 list-none space-y-0.5 border-l border-border p-0">
      {items.map((item, index) => {
        const isActive = activeId === item.id;
        return (
          <li key={`${item.id}-${index}`} className="m-0 p-0">
            <button
              type="button"
              data-toc-id={item.id}
              onClick={() => onSelect(item.id)}
              aria-current={isActive ? "location" : undefined}
              style={{
                paddingLeft: `${Math.max(item.level - 2, 0) * 14 + 14}px`,
              }}
              className={[
                "relative -ml-px block w-full border-l-2 py-2 pr-3 text-left text-[13.5px] leading-5 transition-colors duration-200",
                isActive
                  ? "border-primary font-semibold text-primary"
                  : "border-transparent text-muted-foreground hover:border-muted-foreground/40 hover:text-foreground",
              ].join(" ")}
            >
              {item.title}
            </button>
          </li>
        );
      })}
    </ul>
  );
}

export const BlogSidebar: React.FC<SidebarProps> = ({
  content,
  tableOfContents = [],
  stickyOffset = 88,
  showAd = true,
}) => {
  const blocks = useMemo(
    () => (Array.isArray(content?.blocks) ? content.blocks : []),
    [content],
  );
  const headingIds = useMemo(() => getHeadingIds(blocks), [blocks]);
  const toc = useMemo(
    () => buildToc(blocks, headingIds, tableOfContents),
    [blocks, headingIds, tableOfContents],
  );
  const readingMinutes = useMemo(() => getReadingMinutes(blocks), [blocks]);

  const { progress, activeId } = useArticleScroll(toc, stickyOffset);
  const tocBoxRef = useRef<HTMLDivElement>(null);

  const percent = Math.round(progress * 100);
  const minutesLeft = Math.max(0, Math.ceil(readingMinutes * (1 - progress)));

  useEffect(() => {
    const box = tocBoxRef.current;
    if (!box || !activeId) return;
    const el = box.querySelector<HTMLElement>(
      `[data-toc-id="${CSS.escape(activeId)}"]`,
    );
    if (!el) return;
    const top =
      el.getBoundingClientRect().top -
      box.getBoundingClientRect().top +
      box.scrollTop -
      box.clientHeight / 2 +
      el.clientHeight / 2;
    box.scrollTo({ top, behavior: "smooth" });
  }, [activeId]);

  if (!blocks.length) return null;

  return (
    <aside aria-label="Article sidebar" className="hidden min-w-0 lg:block">
      <div
        className="sticky flex flex-col gap-4 overflow-y-auto pb-1 scrollbar-none [&::-webkit-scrollbar]:hidden"
        style={{
          top: stickyOffset,
          maxHeight: `calc(100vh - ${stickyOffset + 16}px)`,
        }}
      >
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          <div className="px-5 py-4">
            <div className="mb-2.5 flex items-baseline justify-between">
              <span className="text-sm font-semibold text-foreground">
                {progress >= 0.98 ? "You finished reading" : "Reading progress"}
              </span>
              <span className="text-sm tabular-nums text-muted-foreground">
                {percent}%
              </span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-[width] duration-150"
                style={{ width: `${percent}%` }}
              />
            </div>
            <p className="mt-2.5 text-xs text-muted-foreground">
              {progress >= 0.98
                ? `${readingMinutes} min read`
                : `${minutesLeft} min left of ${readingMinutes} min`}
            </p>
          </div>

          {toc.length > 0 && (
            <div className="border-t border-border px-5 py-4">
              <p className="mb-3 text-sm font-semibold text-foreground">
                In this article
              </p>
              <div
                ref={tocBoxRef}
                className="relative max-h-[38vh] overflow-y-auto pr-1 scrollbar-thin"
              >
                <TocList
                  items={toc}
                  activeId={activeId}
                  onSelect={(id) => scrollToId(id)}
                />
              </div>
            </div>
          )}
        </div>

        {ADS_ENABLED && showAd && (
          <AdFrame label="Advertisement">
            <div className="flex min-h-[250px] w-full items-center justify-center overflow-hidden">
              <Banner300x250 variant={SIDEBAR_AD_VARIANT} />
            </div>
          </AdFrame>
        )}

        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
            <path
              d="m6 15 6-6 6 6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Back to top
        </button>
      </div>
    </aside>
  );
};

export const BlogPreviewer: React.FC<PreviewerProps> = ({
  content,
  tableOfContents = [],
  stickyOffset = 88,
}) => {
  const [openToggles, setOpenToggles] = useState<Record<string, boolean>>({});

  const blocks = useMemo(
    () => (Array.isArray(content?.blocks) ? content.blocks : []),
    [content],
  );

  const headingIds = useMemo(() => getHeadingIds(blocks), [blocks]);
  const toc = useMemo(
    () => buildToc(blocks, headingIds, tableOfContents),
    [blocks, headingIds, tableOfContents],
  );

  const adBlockIndexes = useMemo(() => getAdBlockIndexes(blocks), [blocks]);
  const adOrder = useMemo(
    () => Array.from(adBlockIndexes).sort((a, b) => a - b),
    [adBlockIndexes],
  );
  const earlyNativeIndex = useMemo(() => getEarlyNativeIndex(blocks), [blocks]);
  const midNativeIndex = useMemo(() => getMidNativeIndex(blocks), [blocks]);
  const lateNativeIndex = useMemo(() => getLateNativeIndex(blocks), [blocks]);

  const { progress } = useArticleScroll(toc, stickyOffset);

  useEffect(() => {
    const html = document.documentElement;
    const previous = html.style.scrollBehavior;
    html.style.scrollBehavior = "smooth";
    return () => {
      html.style.scrollBehavior = previous;
    };
  }, []);

  const handleToggleClick = (id: string) => {
    setOpenToggles((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  if (!content || !content.blocks?.length) {
    return (
      <div className="py-20 text-center text-muted-foreground">
        Start writing to see the preview...
      </div>
    );
  }

  const alertClasses: Record<string, string> = {
    primary: "border-primary/30 bg-primary/10 text-foreground",
    secondary: "border-border bg-muted text-foreground",
    info: "border-primary/30 bg-primary/10 text-foreground",
    success: "border-primary/30 bg-primary/10 text-foreground",
    warning: "border-border bg-muted text-foreground",
    danger: "border-destructive/30 bg-destructive/10 text-foreground",
    light: "border-border bg-background text-foreground",
    dark: "border-border bg-foreground text-background",
  };

  const alignClasses: Record<string, string> = {
    left: "text-left",
    center: "text-center",
    right: "text-right",
  };

  const readableText: React.CSSProperties = {
    textAlign: "left",
    hyphens: "none",
    WebkitHyphens: "none",
    overflowWrap: "break-word",
  };

  const renderBlock = (block: any, index: number): React.ReactNode => {
    const type = block.type?.toLowerCase();

    if (TOC_TYPES.has(type)) return null;

    switch (type) {
      case "toggle": {
        const toggleId = String(block.id ?? `toggle-${index}`);
        const isOpen = openToggles[toggleId] ?? block.data.status === "open";
        if (!block.data.text && !block.data.itemsContent) return null;

        return (
          <div
            key={index}
            className="not-prose mb-5 overflow-hidden rounded-xl border border-border bg-card shadow-sm"
          >
            <button
              type="button"
              aria-expanded={isOpen}
              onClick={() => handleToggleClick(toggleId)}
              className="flex w-full items-center justify-between gap-4 bg-muted/40 px-4 py-3.5 text-left font-semibold text-foreground transition-colors hover:bg-muted/60"
            >
              <span>{block.data.text}</span>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
                className={[
                  "h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200",
                  isOpen ? "rotate-180" : "rotate-0",
                ].join(" ")}
              >
                <path
                  d="m6 9 6 6 6-6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            {isOpen && block.data.itemsContent && (
              <div
                className="px-4 py-4 text-foreground"
                style={readableText}
                dangerouslySetInnerHTML={renderHTML(block.data.itemsContent)}
              />
            )}
          </div>
        );
      }

      case "alert": {
        if (!block.data) return null;
        const alertMessage = block.data.message?.trim();
        if (!alertMessage) return null;

        const alertTitle =
          block.data.title === "Be Attentivte"
            ? "Be Attentive"
            : block.data.title;
        const alertType = block.data.type || "warning";
        const alertAlign = block.data.align || "left";

        return (
          <div
            key={block.id || index}
            className={[
              "not-prose mb-6 rounded-xl border p-4 sm:p-5",
              alertClasses[alertType] || alertClasses.warning,
              alignClasses[alertAlign],
            ].join(" ")}
            style={{ hyphens: "none" }}
          >
            {alertTitle && (
              <strong className="mb-1 block font-semibold">
                {alertTitle}
              </strong>
            )}
            <span dangerouslySetInnerHTML={renderHTML(alertMessage)} />
          </div>
        );
      }

      case "warning": {
        if (!block.data) return null;
        const alertTitle = block.data.title?.trim() || "Warning";
        const alertMessage = block.data.message?.trim();
        if (!alertMessage) return null;

        return (
          <div
            key={index}
            className="not-prose mb-6 rounded-xl border border-border bg-muted p-4 text-foreground sm:p-5"
            style={readableText}
          >
            <strong className="mb-1 block font-semibold">{alertTitle}</strong>
            <span>{alertMessage}</span>
          </div>
        );
      }

      case "paragraph":
      case "aitext": {
        const text = block.data.text?.trim();
        if (!text) return null;

        return (
          <p
            key={index}
            style={readableText}
            className="mb-6 text-[1.0625rem] leading-[1.85] tracking-[-0.005em] text-foreground/90 sm:text-lg sm:leading-8"
            dangerouslySetInnerHTML={renderHTML(text)}
          />
        );
      }

      case "linktool": {
        const link = block.data.link;
        const meta = block.data.meta;
        if (!link) return null;

        return (
          <a
            key={index}
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="not-prose group my-6 flex items-start gap-4 rounded-xl border border-border bg-card p-4 shadow-sm transition-shadow hover:shadow-md"
          >
            {meta?.image?.url && (
              <Image
                src={meta.image.url}
                alt={meta.title || "Link preview"}
                width={100}
                height={100}
                className="h-20 w-20 shrink-0 rounded-lg object-cover"
              />
            )}

            <div className="min-w-0 flex-1" style={readableText}>
              <span className="block font-semibold text-primary group-hover:underline">
                {meta?.title || link}
              </span>

              {meta?.description && (
                <p className="mt-1 line-clamp-2 text-sm leading-6 text-muted-foreground">
                  {meta.description}
                </p>
              )}

              <p className="mt-1 truncate text-xs text-muted-foreground">
                {link}
              </p>
            </div>
          </a>
        );
      }

      case "attaches": {
        const file = block.data.file;
        const title = block.data.title || file?.name || "Download";
        if (!file?.url) return null;

        return (
          <div key={index} className="not-prose mb-6">
            <a
              href={file.url}
              download={title}
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2.5 text-sm font-medium text-primary shadow-sm transition-colors hover:bg-muted"
            >
              <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
                <path
                  d="M12 3v12m0 0 4-4m-4 4-4-4M5 21h14"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              {title}
            </a>
          </div>
        );
      }

      case "image":
        return (
          <ImageBlock
            key={index}
            file={block.data.file}
            caption={block.data.caption}
          />
        );

      case "code":
        return (
          <CodeBlock
            key={index}
            code={block.data.code}
            language={block.data.language || block.data.lang || "javascript"}
            title={block.data.title || "Code"}
          />
        );

      case "header": {
        if (!block.data.text) return null;
        const level = Math.min(Math.max(block.data.level || 2, 1), 6);
        const id = headingIds[index] || slugifyHeader(block.data.text);

        const classes =
          level === 1
            ? "mb-5 mt-14 text-4xl font-bold tracking-tight text-foreground sm:text-5xl"
            : level === 2
              ? "mb-4 mt-12 text-[1.75rem] font-bold leading-tight tracking-tight text-foreground sm:text-4xl"
              : level === 3
                ? "mb-3 mt-9 text-2xl font-bold leading-snug tracking-tight text-foreground sm:text-3xl"
                : "mb-3 mt-8 text-xl font-semibold tracking-tight text-foreground sm:text-2xl";

        const Tag = `h${level}` as keyof React.JSX.IntrinsicElements;

        return (
          <Tag
            key={index}
            id={id}
            style={{ scrollMarginTop: stickyOffset + 16, ...readableText }}
            className={`group relative ${classes}`}
          >
            {block.data.text}
            <a
              href={`#${id}`}
              aria-label="Link to this section"
              className="ml-2 hidden text-muted-foreground/40 no-underline opacity-0 transition-opacity hover:text-primary group-hover:opacity-100 lg:inline"
            >
              #
            </a>
          </Tag>
        );
      }

      case "list": {
        if (!block.data.items?.length) return null;

        const ListTag = block.data.style === "ordered" ? "ol" : "ul";
        const listClass =
          block.data.style === "ordered"
            ? "mb-6 list-outside list-decimal space-y-2.5 pl-6 text-[1.0625rem] leading-8 marker:font-semibold marker:text-primary sm:text-lg"
            : "mb-6 list-outside list-disc space-y-2.5 pl-6 text-[1.0625rem] leading-8 marker:text-primary sm:text-lg";

        return (
          <ListTag key={index} className={listClass} style={readableText}>
            {block.data.items.map((item: any, i: number) => (
              <li
                key={i}
                className="pl-1"
                dangerouslySetInnerHTML={renderHTML(
                  typeof item === "string" ? item : item.content || "",
                )}
              />
            ))}
          </ListTag>
        );
      }

      case "checklist": {
        if (!block.data.items?.length) return null;

        return (
          <ul
            key={index}
            className="not-prose mb-6 space-y-3"
            style={readableText}
          >
            {block.data.items.map((item: any, i: number) => (
              <li
                key={i}
                className="flex items-start gap-3 text-base leading-7"
              >
                <input
                  type="checkbox"
                  checked={!!item.checked}
                  readOnly
                  className="mt-1.5 h-4 w-4 shrink-0 accent-primary"
                />
                <span dangerouslySetInnerHTML={renderHTML(item.text || "")} />
              </li>
            ))}
          </ul>
        );
      }

      case "delimiter": {
        const style = block.data?.style || "star";
        const delimiterStyles: Record<string, string> = {
          star: "★ ★ ★ ★ ★",
          dash: "— — — — —",
          line: "────────────────",
        };

        return (
          <div
            key={index}
            className="not-prose my-12 text-center text-sm tracking-[0.35em] text-muted-foreground/60"
          >
            {delimiterStyles[style] || delimiterStyles.star}
          </div>
        );
      }

      case "raw":
        if (!block.data.html) return null;

        return (
          <div
            key={index}
            className="my-8 max-w-full overflow-x-auto"
            dangerouslySetInnerHTML={renderHTML(block.data.html)}
          />
        );

      case "quote":
        if (!block.data.text) return null;

        return (
          <blockquote
            key={index}
            style={readableText}
            className="not-prose relative my-10 overflow-hidden rounded-2xl border border-border bg-muted/30 py-6 pl-7 pr-6 text-lg italic leading-8 text-foreground/80 sm:text-xl"
          >
            <span
              aria-hidden="true"
              className="absolute inset-y-0 left-0 w-1.5 bg-primary"
            />
            {block.data.text}
            {block.data.caption && (
              <footer className="mt-4 text-sm font-medium not-italic text-muted-foreground">
                — {block.data.caption}
              </footer>
            )}
          </blockquote>
        );

      case "table": {
        if (!block.data?.content) return null;

        return (
          <div
            key={index}
            className="not-prose my-8 overflow-x-auto rounded-xl border border-border shadow-sm"
          >
            <table className="w-full min-w-[480px] border-collapse text-left">
              <tbody>
                {block.data.content.map((row: string[], rowIdx: number) => (
                  <tr
                    key={rowIdx}
                    className={[
                      "border-b border-border last:border-b-0",
                      rowIdx === 0 && block.data.withHeadings
                        ? "bg-muted/50 font-semibold"
                        : rowIdx % 2 === 1
                          ? "bg-muted/20"
                          : "",
                    ].join(" ")}
                  >
                    {row.map((cell, cellIdx) => (
                      <td
                        key={cellIdx}
                        style={readableText}
                        className="border-r border-border px-4 py-3 text-sm leading-6 text-foreground last:border-r-0"
                        dangerouslySetInnerHTML={renderHTML(cell)}
                      />
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      }

      default:
        return null;
    }
  };

  return (
    <div className="min-w-0">
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-x-0 top-0 z-60 h-[3px]"
      >
        <div
          className="h-full origin-left bg-primary transition-transform duration-100"
          style={{ transform: `scaleX(${progress})` }}
        />
      </div>

      <CodeBlockSwitcher />

      {/* Removed horizontal padding — parent container handles it */}
      <article
        data-blog-article
        className="prose min-w-0 max-w-none dark:prose-invert"
      >
        {content.blocks.map((block: any, index: number) => (
          <React.Fragment key={index}>
            {renderBlock(block, index)}

            {index === earlyNativeIndex &&
              index !== midNativeIndex &&
              index !== lateNativeIndex &&
              !adBlockIndexes.has(index) && (
                <NativeSlot variant={NATIVE_EARLY_VARIANT} />
              )}

            {index === midNativeIndex &&
              index !== lateNativeIndex &&
              !adBlockIndexes.has(index) && (
                <NativeSlot variant={NATIVE_MID_VARIANT} />
              )}

            {index === lateNativeIndex && !adBlockIndexes.has(index) && (
              <NativeSlot variant={NATIVE_LATE_VARIANT} />
            )}

            {adBlockIndexes.has(index) && ADS_ENABLED && (
              <AdFrame label="Advertisement" className="my-10">
                <InArticleAd order={adOrder.indexOf(index)} />
              </AdFrame>
            )}
          </React.Fragment>
        ))}
      </article>
    </div>
  );
};