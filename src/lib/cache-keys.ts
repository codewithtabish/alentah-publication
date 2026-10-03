// src/lib/cache-keys.ts
// ============================================================
// CENTRAL CACHE TAGS — ALENTAH
// Used with `use cache` + `revalidateTag`
// Every key has a matching revalidate* helper.
// ============================================================

import { revalidateTag, revalidatePath } from "next/cache";

// ============================================================
// TAGS
// ============================================================

export const CACHE_TAGS = {
  // ── Categories ──
  categories: "categories",
  category: (slug: string) => `category:${slug}`,
  categoryPageBlogs: (slug: string) => `category:blogs:${slug}`,
  subcategoryPageBlogs: (slug: string) => `subcategory:blogs:${slug}`,

  // ── Users ──
  users: "users",
  user: (clerkId: string) => `user:${clerkId}`,

  // ── Editors ──
  editors: "editors",
  editor: (id: string) => `editor:${id}`,
  editorBySlug: (slug: string) => `editor:slug:${slug}`,

  // ── Blogs ──
  blogs: "blogs",
  blog: (slug: string) => `blog:${slug}`,

  // ── Comments ──
  comments: (blogId: string) => `comments:${blogId}`,

  // ── Newsletter ──
  newsletterSubscribers: "newsletter:subscribers",

  // ── Home ──
  home: "homeblogs",
  homeScreen: "home:screen",

  // ── Dashboard ──
  dashboard: "dashboard",
  dashboardBlogs: "dashboard:blogs",
  dashboardCategories: "dashboard:categories",
  dashboardEditors: "dashboard:editors",
  dashboardComments: "dashboard:comments",
} as const;

// ============================================================
// HELPERS
// ============================================================

const NOW = { expire: 0 } as const;

// ─────────────────────────────────────────────
// USERS
// ─────────────────────────────────────────────

/**
 * Revalidate ONE user's cached data.
 * Call after: profile update, role change, avatar change.
 */
export function revalidateUser(clerkId: string) {
  revalidateTag(CACHE_TAGS.user(clerkId), NOW);
  revalidateTag(CACHE_TAGS.users, NOW);
}

/**
 * Revalidate ALL users.
 * Call after: bulk user ops, new user signup, user deletion.
 */
export function revalidateUsers() {
  revalidateTag(CACHE_TAGS.users, NOW);
  revalidatePath("/admin");
  revalidatePath("/admin", "layout");
}

// ─────────────────────────────────────────────
// EDITORS
// ─────────────────────────────────────────────

/**
 * Revalidate ONE editor.
 * Call after: editor update, photo change, bio change, categories assigned.
 */
export function revalidateEditor(id: string, slug?: string) {
  revalidateTag(CACHE_TAGS.editor(id), NOW);
  revalidateTag(CACHE_TAGS.editors, NOW);
  if (slug) revalidateTag(CACHE_TAGS.editorBySlug(slug), NOW);
}

/**
 * Revalidate ALL editors.
 * Call after: creating a new editor, deleting, or bulk ops.
 */
export function revalidateEditors() {
  revalidateTag(CACHE_TAGS.editors, NOW);
  revalidatePath("/admin/editors");
  revalidatePath("/admin/editors", "layout");
}

// ─────────────────────────────────────────────
// CATEGORIES
// ─────────────────────────────────────────────

/**
 * Revalidate ONE category + all its related pages.
 * Call after: category update, editor assignment, slug change.
 */
export function revalidateCategory(
  slug: string,
  options?: { previousSlug?: string },
) {
  revalidateTag(CACHE_TAGS.category(slug), NOW);
  revalidateTag(CACHE_TAGS.categoryPageBlogs(slug), NOW);
  revalidateTag(CACHE_TAGS.categories, NOW);

  // If the slug changed, invalidate the old one too
  if (options?.previousSlug && options.previousSlug !== slug) {
    revalidateTag(CACHE_TAGS.category(options.previousSlug), NOW);
    revalidateTag(CACHE_TAGS.categoryPageBlogs(options.previousSlug), NOW);
  }
}

/**
 * Revalidate ALL categories.
 * Call after: creating a category, deleting, or reordering.
 */
export function revalidateCategories() {
  revalidateTag(CACHE_TAGS.categories, NOW);
  revalidatePath("/admin/categories");
  revalidatePath("/admin/categories", "layout");
}

// ─────────────────────────────────────────────
// SUBCATEGORIES
// ─────────────────────────────────────────────

/**
 * Revalidate ONE subcategory page.
 * Call after: subcategory update, blog reassignment.
 */
export function revalidateSubcategory(slug: string, categorySlug?: string) {
  revalidateTag(CACHE_TAGS.subcategoryPageBlogs(slug), NOW);
  if (categorySlug) {
    revalidateTag(CACHE_TAGS.category(categorySlug), NOW);
    revalidateTag(CACHE_TAGS.categoryPageBlogs(categorySlug), NOW);
  }
}

// ─────────────────────────────────────────────
// BLOGS
// ─────────────────────────────────────────────

/**
 * Revalidate ONE blog.
 * Call after: editing a post, changing its status, or publishing.
 */
export function revalidateBlog(
  slug: string,
  context?: { categorySlug?: string; subcategorySlug?: string },
) {
  revalidateTag(CACHE_TAGS.blog(slug), NOW);
  revalidateTag(CACHE_TAGS.blogs, NOW);
  revalidateTag(CACHE_TAGS.home, NOW);
  revalidateTag(CACHE_TAGS.homeScreen, NOW);

  if (context?.categorySlug) {
    revalidateTag(CACHE_TAGS.categoryPageBlogs(context.categorySlug), NOW);
  }
  if (context?.subcategorySlug) {
    revalidateTag(CACHE_TAGS.subcategoryPageBlogs(context.subcategorySlug), NOW);
  }
}

/**
 * Revalidate ALL blogs.
 * Call after: bulk publish, bulk archive, importing.
 */
export function revalidateBlogs() {
  revalidateTag(CACHE_TAGS.blogs, NOW);
  revalidateTag(CACHE_TAGS.home, NOW);
  revalidateTag(CACHE_TAGS.homeScreen, NOW);
  revalidatePath("/admin/articles");
  revalidatePath("/admin/articles", "layout");
}

// ─────────────────────────────────────────────
// COMMENTS
// ─────────────────────────────────────────────

/**
 * Revalidate comments for a specific blog.
 * Call after: new comment, approval, deletion.
 */
export function revalidateComments(blogId: string, blogSlug?: string) {
  revalidateTag(CACHE_TAGS.comments(blogId), NOW);
  if (blogSlug) {
    revalidateTag(CACHE_TAGS.blog(blogSlug), NOW);
  }
}

// ─────────────────────────────────────────────
// NEWSLETTER
// ─────────────────────────────────────────────

/**
 * Revalidate newsletter subscriber data.
 * Call after: new subscriber, unsubscribe, segment change.
 */
export function revalidateNewsletter() {
  revalidateTag(CACHE_TAGS.newsletterSubscribers, NOW);
  revalidatePath("/admin/newsletter");
  revalidatePath("/admin/newsletter", "layout");
}

// ─────────────────────────────────────────────
// HOME
// ─────────────────────────────────────────────

/**
 * Revalidate the homepage + home screen caches.
 * Call after: any change that affects the homepage
 * (new hero, featured blog, editor's pick, categories).
 */
export function revalidateHome() {
  revalidateTag(CACHE_TAGS.home, NOW);
  revalidateTag(CACHE_TAGS.homeScreen, NOW);
  revalidatePath("/");
}

// ─────────────────────────────────────────────
// DASHBOARD
// ─────────────────────────────────────────────

/**
 * Revalidate the admin dashboard overview.
 * Call after: any admin write that changes counts or lists.
 */
export function revalidateDashboard() {
  revalidateTag(CACHE_TAGS.dashboard, NOW);
  revalidateTag(CACHE_TAGS.dashboardBlogs, NOW);
  revalidateTag(CACHE_TAGS.dashboardCategories, NOW);
  revalidateTag(CACHE_TAGS.dashboardEditors, NOW);
  revalidateTag(CACHE_TAGS.dashboardComments, NOW);
  revalidatePath("/admin");
}

/**
 * Revalidate a SPECIFIC dashboard subsection.
 * Call after: a write that only affects one part of the dashboard.
 */
export function revalidateDashboardSection(
  section: "blogs" | "categories" | "editors" | "comments",
) {
  switch (section) {
    case "blogs":
      revalidateTag(CACHE_TAGS.dashboardBlogs, NOW);
      break;
    case "categories":
      revalidateTag(CACHE_TAGS.dashboardCategories, NOW);
      break;
    case "editors":
      revalidateTag(CACHE_TAGS.dashboardEditors, NOW);
      break;
    case "comments":
      revalidateTag(CACHE_TAGS.dashboardComments, NOW);
      break;
  }
  revalidateTag(CACHE_TAGS.dashboard, NOW);
}