// src/components/site/pages/article/article-comments-server.tsx
// ============================================================
// ArticleCommentsServer
// Fetches comments on the server, renders the client list.
// ============================================================

import { getComments } from "@/actions/comments/get-comments";
import { ArticleComments } from "./article-comments";

export async function ArticleCommentsServer({
  blogId,
  blogSlug,
}: {
  blogId: string;
  blogSlug: string;
}) {
  const result = await getComments(blogId);

  if (!result.success) {
    return (
      <section className="mt-14 sm:mt-16">
        <p className="rounded-2xl border border-border bg-muted/30 p-6 text-center text-sm text-muted-foreground">
          Comments are temporarily unavailable.
        </p>
      </section>
    );
  }

  return (
    <ArticleComments
      blogId={blogId}
      blogSlug={blogSlug}
      initialComments={result.comments}
    />
  );
}