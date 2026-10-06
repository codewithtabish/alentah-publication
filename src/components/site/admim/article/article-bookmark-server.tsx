// src/components/site/pages/article/article-bookmark-server.tsx
// ============================================================
// ArticleBookmarkServer
// Fetches initial bookmark state, renders the client button.
// ============================================================

import { getBookmarkStatus } from "@/actions/bookmarks/get-bookmark-status";
import { ArticleBookmarkButton } from "./article-bookmark-button";

export async function ArticleBookmarkServer({
  blogId,
}: {
  blogId: string;
}) {
  const result = await getBookmarkStatus(blogId);

  const initialSaved = result.success ? result.saved : false;

  return (
    <ArticleBookmarkButton
      blogId={blogId}
      initialSaved={initialSaved}
    />
  );
}