// src/actions/blog/create-blog.ts
"use server";

// ============================================================
// Server Action — Create Blog
// ============================================================

import { auth } from "@clerk/nextjs/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { Prisma } from "@/generated/prisma/client";
import prisma from "@/lib/clients/prisma-client";
import { CACHE_TAGS } from "@/lib/cache-keys";
import { generateSEO } from "@/lib/articles/generate-seo";

// ============================================================
// TYPES
// ============================================================

export type BlogContent = {
  blocks: Array<Record<string, unknown>>;
};

export type CreateBlogInput = {
  title: string;
  slug: string;
  content: BlogContent;
  bannerImage: string;
  bannerImageAlt?: string;
  ogImage: string;
  categoryId: string;
  subcategoryId: string;
  type?: string;
  status?: string;
  featured?: boolean;
  scheduledAt?: string | null;
  tableOfContents?: {
    id: string;
    title: string;
    slug: string;
    level?: number;
  }[];
};

export type CreateBlogResult =
  | {
      success: true;
      data: {
        blog: {
          id: string;
          title: string;
          slug: string;
          status: string;
          featured: boolean;
          publishedAt: Date | null;
          createdAt: Date;
          shortDescription: string | null;
        };
        seo: {
          metaTitle: string;
          metaDescription: string;
          canonicalUrl: string;
          ogDescription: string;
          twitterDescription: string;
        };
        aiGenerated: {
          shortDescription: string;
          keywords: string[];
          summary: string;
        };
      };
    }
  | { success: false; error: string; field?: string };

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

// ============================================================
// HELPERS
// ============================================================

function extractTextFromContent(content: BlogContent): string {
  if (!content?.blocks) return "";

  return content.blocks
    .map((block) => {
      const b = block as { type?: string; data?: Record<string, unknown> };
      if (!b?.data) return "";

      switch (b.type) {
        case "paragraph":
        case "aitext":
          return String(b.data.text ?? "");
        case "header":
          return `${"#".repeat(Number(b.data.level) || 2)} ${String(b.data.text ?? "")}`;
        case "list":
        case "checklist":
          return ((b.data.items ?? []) as unknown[])
            .map((item) => {
              if (typeof item === "string") return item;
              const o = item as { content?: string; text?: string };
              return o.content || o.text || "";
            })
            .join("\n");
        case "quote":
          return `> ${String(b.data.text ?? "")}`;
        case "raw":
          return String(b.data.html ?? "")
            .replace(/<[^>]+>/g, " ")
            .replace(/\s+/g, " ")
            .trim();
        default:
          return "";
      }
    })
    .filter(Boolean)
    .join("\n\n");
}

function estimateReadingTime(content: BlogContent): number {
  const text = extractTextFromContent(content);
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

function buildBlogUrl(
  categorySlug: string,
  subcategorySlug: string,
  blogSlug: string,
): string {
  const baseUrl = BASE_URL.replace(/\/+$/, "");
  return `${baseUrl}/${categorySlug}/${subcategorySlug}/${blogSlug}`;
}

function toSlug(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// ============================================================
// MAIN ACTION
// ============================================================

export async function createBlogAction(
  data: CreateBlogInput,
): Promise<CreateBlogResult> {
  try {
    // ─── Auth ───
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return { success: false, error: "You must be signed in." };
    }

    const user = await prisma.user.findUnique({
      where: { clerkId },
      select: { id: true },
    });

    if (!user) {
      return { success: false, error: "User not found in database." };
    }

    // ─── Validate ───
    const title = data.title?.trim();
    const slug = data.slug ? toSlug(data.slug) : "";

    if (!title || title.length < 3) {
      return {
        success: false,
        error: "Title must be at least 3 characters.",
        field: "title",
      };
    }

    if (!slug) {
      return { success: false, error: "Slug is required.", field: "slug" };
    }

    if (!data.bannerImage) {
      return {
        success: false,
        error: "Banner image is required.",
        field: "bannerImage",
      };
    }

    if (!data.ogImage) {
      return {
        success: false,
        error: "OG image is required.",
        field: "ogImage",
      };
    }

    if (!data.categoryId || !data.subcategoryId) {
      return {
        success: false,
        error: "Category and subcategory are required.",
        field: !data.categoryId ? "categoryId" : "subcategoryId",
      };
    }

    if (!data.content?.blocks?.length) {
      return {
        success: false,
        error: "Content cannot be empty.",
        field: "content",
      };
    }

    // ─── Slug uniqueness ───
    const conflict = await prisma.blog.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (conflict) {
      return {
        success: false,
        error: "A blog with this slug already exists.",
        field: "slug",
      };
    }

    // ─── Validate category + subcategory ───
    const subcategory = await prisma.subcategory.findFirst({
      where: {
        id: data.subcategoryId,
        categoryId: data.categoryId,
        isActive: true,
      },
      select: {
        id: true,
        slug: true,
        category: {
          select: { id: true, slug: true, isActive: true },
        },
      },
    });

    if (!subcategory || !subcategory.category?.isActive) {
      return {
        success: false,
        error: "Invalid category / subcategory combination.",
        field: "subcategoryId",
      };
    }

    const categorySlug = subcategory.category.slug;
    const subcategorySlug = subcategory.slug;

    // ─── SEO + Reading time ───
    const contentText = extractTextFromContent(data.content);
    const seoData = await generateSEO(title, contentText);
    const readingTime = estimateReadingTime(data.content);
    const canonicalUrl = buildBlogUrl(categorySlug, subcategorySlug, slug);
    const blogPath = `/${categorySlug}/${subcategorySlug}/${slug}`;

    // ─── Status ───
    const status = data.status || "DRAFT";
    const isPublished = status === "PUBLISHED";

    // ─── Create ───
    const blog = await prisma.blog.create({
      data: {
        title,
        slug,
        shortDescription: seoData.excerpt,
        content: data.content as unknown as Prisma.InputJsonValue,
        tableOfContents:
          (data.tableOfContents ?? []) as unknown as Prisma.InputJsonValue,
        type: (data.type as never) || "ARTICLE",
        status: status as never,
        bannerImage: data.bannerImage,
        bannerImageAlt: data.bannerImageAlt || title,
        featured: data.featured ?? false,
        publishedAt: isPublished ? new Date() : null,
        scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : null,
        authorId: user.id,
        categoryId: data.categoryId,
        subcategoryId: data.subcategoryId,
        readingTime,
        seo: {
          create: {
            metaTitle: seoData.metaTitle,
            metaDescription: seoData.metaDescription,
            canonicalUrl,
            noIndex: false,
            noFollow: false,
            ogTitle: title,
            ogDescription: seoData.metaDescription,
            ogImage: data.ogImage,
            twitterTitle: title,
            twitterDescription: seoData.metaDescription,
            twitterImage: data.ogImage,
            schemaType: "Article",
          },
        },
      },
      include: { seo: true },
    });

    // ─── Invalidate caches ───
    revalidatePath("/admin/articles");
    revalidatePath("/admin");

    if (isPublished) {
      revalidatePath("/");
      revalidateTag(CACHE_TAGS.home, "max");
      revalidateTag(CACHE_TAGS.homeScreen, "max");
      revalidateTag(CACHE_TAGS.categoryPageBlogs(categorySlug), "max");
      revalidateTag(CACHE_TAGS.subcategoryPageBlogs(subcategorySlug), "max");
      revalidateTag(CACHE_TAGS.blog(blog.slug), "max");
      revalidatePath(blogPath);
    }

    return {
      success: true,
      data: {
        blog: {
          id: blog.id,
          title: blog.title,
          slug: blog.slug,
          status: blog.status,
          featured: blog.featured,
          publishedAt: blog.publishedAt,
          createdAt: blog.createdAt,
          shortDescription: blog.shortDescription,
        },
        seo: {
          metaTitle: blog.seo?.metaTitle ?? "",
          metaDescription: blog.seo?.metaDescription ?? "",
          canonicalUrl: blog.seo?.canonicalUrl ?? "",
          ogDescription: blog.seo?.ogDescription ?? "",
          twitterDescription: blog.seo?.twitterDescription ?? "",
        },
        aiGenerated: {
          shortDescription: seoData.excerpt,
          keywords: seoData.keywords,
          summary: seoData.excerpt,
        },
      },
    };
  } catch (error) {
    console.error("[createBlogAction] Error:", error);

    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code: string }).code === "P2002"
    ) {
      return {
        success: false,
        error: "A blog with this slug already exists.",
        field: "slug",
      };
    }

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to create blog. Please try again.",
    };
  }
}