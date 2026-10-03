"use client";

import type { TableOfContentsItem } from "@/schemas/blog-schema";
import { BlogPreviewer } from "./artcile-previewer";

interface ArticleRendererProps {
  content: unknown;
  tableOfContents: unknown;
}

export function ArticleRenderer({
  content,
  tableOfContents,
}: ArticleRendererProps) {
  return (
    <BlogPreviewer
      content={content as { blocks: unknown[] }}
      tableOfContents={(tableOfContents as TableOfContentsItem[]) ?? []}
    />
  );
}