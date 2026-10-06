"use client";

// ============================================================
// Update Article Form — ALENTAH
// ============================================================

import * as React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Loader2,
  Plus,
  Trash2,
  Check,
  X,
  Upload,
  Eye,
  PenLine,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { uploadOgAction } from "@/actions/images/upload-og-action";
import { uploadBannerAction } from "@/actions/images/upload-banner-action";
import type { CategoryListItem } from "@/actions/category/get-categories";
import type { EditableBlog } from "@/actions/blog/get-blog-for-edit";

import BlogEditor from "./create-article-editor";
import { BlogPreviewer } from "./artcile-previewer";
import { updateBlogAction } from "@/actions/blog/update-blog";

// ============================================================
// TYPES
// ============================================================

type BlogBlock = Record<string, unknown>;

type BlogContent = {
  blocks: BlogBlock[];
};

type TocItem = {
  id: string;
  title: string;
  slug: string;
  level?: number;
};

interface UpdateArticleFormProps {
  categories: CategoryListItem[];
  initialBlog: EditableBlog;
}

// ============================================================
// CONSTANTS
// ============================================================

const TYPES = [
  "ARTICLE",
  "NEWS",
  "OPINION",
  "ANALYSIS",
  "GUIDE",
  "REVIEW",
  "INTERVIEW",
] as const;

const STATUSES = [
  "DRAFT",
  "IN_REVIEW",
  "SCHEDULED",
  "PUBLISHED",
  "ARCHIVED",
] as const;

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

// ============================================================
// HELPERS
// ============================================================

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// ============================================================
// COMPONENT
// ============================================================

export function UpdateArticleForm({
  categories,
  initialBlog,
}: UpdateArticleFormProps) {
  const router = useRouter();

  const [activeTab, setActiveTab] =
    React.useState<"write" | "preview">("write");

  const [title, setTitle] = React.useState(initialBlog.title);
  const [slug, setSlug] = React.useState(initialBlog.slug);
  const [slugManuallyEdited, setSlugManuallyEdited] =
    React.useState(true);

  const [content, setContent] = React.useState<BlogContent>(
    initialBlog.content ?? { blocks: [] },
  );

  const [bannerImage, setBannerImage] = React.useState(
    initialBlog.bannerImage,
  );
  const [bannerPreview, setBannerPreview] = React.useState(
    initialBlog.bannerImage,
  );

  const [ogImage, setOgImage] = React.useState(initialBlog.ogImage);
  const [ogPreview, setOgPreview] = React.useState(initialBlog.ogImage);

  const [uploadingBanner, setUploadingBanner] = React.useState(false);
  const [uploadingOg, setUploadingOg] = React.useState(false);

  const [categoryId, setCategoryId] = React.useState(
    initialBlog.categoryId,
  );
  const [subcategoryId, setSubcategoryId] = React.useState(
    initialBlog.subcategoryId,
  );

  const [type, setType] = React.useState<string>(initialBlog.type);
  const [status, setStatus] = React.useState<string>(
    initialBlog.status,
  );
  const [featured, setFeatured] = React.useState(initialBlog.featured);

  const [toc, setToc] = React.useState<TocItem[]>(
    initialBlog.tableOfContents ?? [],
  );

  const [submitting, setSubmitting] = React.useState(false);

  const bannerRef = React.useRef<HTMLInputElement>(null);
  const ogRef = React.useRef<HTMLInputElement>(null);

  // ============================================================
  // DERIVED
  // ============================================================

  const selectedCategory = React.useMemo(
    () => categories.find((c) => c.id === categoryId),
    [categories, categoryId],
  );

  const availableSubcategories = React.useMemo(
    () =>
      (selectedCategory?.subcategories ?? []).filter(
        (sub) => sub.isActive,
      ),
    [selectedCategory],
  );

  const selectedSubcategory = React.useMemo(
    () =>
      availableSubcategories.find((sub) => sub.id === subcategoryId),
    [availableSubcategories, subcategoryId],
  );

  // ============================================================
  // TITLE / SLUG
  // ============================================================

  const handleTitleChange = (value: string) => {
    setTitle(value);

    if (!slugManuallyEdited) {
      setSlug(slugify(value));
    }
  };

  const handleCategoryChange = (value: string) => {
    setCategoryId(value);
    setSubcategoryId("");
  };

  // ============================================================
  // UPLOADS (banner + og) — same as create form
  // ============================================================

  const handleBannerUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      toast.error("Only JPG, PNG, WEBP, or GIF allowed");
      if (bannerRef.current) bannerRef.current.value = "";
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Banner must be under 10 MB");
      if (bannerRef.current) bannerRef.current.value = "";
      return;
    }

    setUploadingBanner(true);

    const localPreview = URL.createObjectURL(file);
    setBannerPreview(localPreview);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const result = await uploadBannerAction(formData);

      if (result.success) {
        setBannerImage(result.data.url);
        setBannerPreview(result.data.url);
        toast.success("Banner updated");
      } else {
        toast.error(result.error);
        setBannerImage(initialBlog.bannerImage);
        setBannerPreview(initialBlog.bannerImage);
      }
    } catch (error) {
      console.error("[UpdateArticleForm] Banner upload error:", error);
      toast.error("Banner upload failed");
      setBannerImage(initialBlog.bannerImage);
      setBannerPreview(initialBlog.bannerImage);
    } finally {
      URL.revokeObjectURL(localPreview);
      setUploadingBanner(false);
      if (bannerRef.current) bannerRef.current.value = "";
    }
  };

  const handleOgUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      toast.error("Only JPG, PNG, WEBP, or GIF allowed");
      if (ogRef.current) ogRef.current.value = "";
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("OG image must be under 10 MB");
      if (ogRef.current) ogRef.current.value = "";
      return;
    }

    setUploadingOg(true);

    const localPreview = URL.createObjectURL(file);
    setOgPreview(localPreview);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const result = await uploadOgAction(formData);

      if (result.success) {
        setOgImage(result.data.url);
        setOgPreview(result.data.url);
        toast.success("OG image updated");
      } else {
        toast.error(result.error);
        setOgImage(initialBlog.ogImage);
        setOgPreview(initialBlog.ogImage);
      }
    } catch (error) {
      console.error("[UpdateArticleForm] OG upload error:", error);
      toast.error("OG upload failed");
      setOgImage(initialBlog.ogImage);
      setOgPreview(initialBlog.ogImage);
    } finally {
      URL.revokeObjectURL(localPreview);
      setUploadingOg(false);
      if (ogRef.current) ogRef.current.value = "";
    }
  };

  // ============================================================
  // TOC
  // ============================================================

  const addTocItem = () => {
    setToc((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        title: "",
        slug: "",
        level: 2,
      },
    ]);
  };

  const updateTocItem = (
    id: string,
    field: keyof TocItem,
    value: string | number,
  ) => {
    setToc((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;

        const updated: TocItem = { ...item, [field]: value };

        if (field === "title" && typeof value === "string") {
          updated.slug = slugify(value);
        }

        return updated;
      }),
    );
  };

  const removeTocItem = (id: string) => {
    setToc((prev) => prev.filter((item) => item.id !== id));
  };

  // ============================================================
  // SUBMIT
  // ============================================================

  const handleSubmit = async (
    targetStatus: "DRAFT" | "PUBLISHED",
  ) => {
    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }

    if (!slug.trim()) {
      toast.error("Slug is required");
      return;
    }

    if (!bannerImage) {
      toast.error("Banner image is required");
      return;
    }

    if (!ogImage) {
      toast.error("OG image is required");
      return;
    }

    if (!categoryId || !subcategoryId) {
      toast.error("Select category and subcategory");
      return;
    }

    if (!content.blocks.length) {
      toast.error("Content cannot be empty");
      return;
    }

    setSubmitting(true);

    const toastId = toast.loading(
      targetStatus === "PUBLISHED"
        ? "Publishing…"
        : "Saving changes…",
    );

    try {
      const result = await updateBlogAction({
        id: initialBlog.id,
        title: title.trim(),
        slug: slug.trim(),
        content,
        bannerImage,
        bannerImageAlt: title.trim(),
        ogImage,
        categoryId,
        subcategoryId,
        type,
        status: targetStatus,
        featured,
        tableOfContents: toc
          .filter((item) => item.title.trim())
          .map((item) => ({
            id: item.id,
            title: item.title.trim(),
            slug: item.slug.trim(),
            level: item.level ?? 2,
          })),
      });

      if (!result.success) {
        toast.error(result.error, { id: toastId });

        if (result.field) {
          const element =
            document.querySelector<HTMLInputElement>(
              `[name="${result.field}"]`,
            );
          element?.focus();
        }

        return;
      }

      toast.success(
        targetStatus === "PUBLISHED"
          ? "Article published!"
          : "Changes saved!",
        {
          id: toastId,
          description: `/article/${result.data.blog.slug}`,
        },
      );

      router.push("/admin/articles");
      router.refresh();
    } catch (error) {
      console.error("[UpdateArticleForm] Submit error:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Something went wrong.",
        { id: toastId },
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ============================================================
  // CHECKLIST
  // ============================================================

  const checklist = {
    title: Boolean(title.trim()),
    content: Boolean(content.blocks.length),
    banner: Boolean(bannerImage),
    og: Boolean(ogImage),
    category: Boolean(categoryId),
    subcategory: Boolean(subcategoryId),
  };

  const allChecksPass = Object.values(checklist).every(Boolean);

  const previewUrl = `/${selectedCategory?.slug ?? initialBlog.categorySlug}/${selectedSubcategory?.slug ?? initialBlog.subcategorySlug}/${slug || "your-story-title"}`;

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="grid grid-cols-1 gap-8 xl:grid-cols-[minmax(0,1fr)_320px]">
      {/* MAIN */}
      <div className="min-w-0">
        {/* TABS */}
        <div className="mb-6 flex items-center justify-between gap-4 border-b border-border">
          <div className="flex gap-1">
            {(["write", "preview"] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "inline-flex h-10 items-center gap-2 px-4",
                  "border-b-2 text-[11px] font-semibold uppercase tracking-[0.15em]",
                  "transition-colors",
                  activeTab === tab
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground",
                )}
              >
                {tab === "write" ? (
                  <>
                    <PenLine className="h-3.5 w-3.5" strokeWidth={2} />
                    Write
                  </>
                ) : (
                  <>
                    <Eye className="h-3.5 w-3.5" strokeWidth={2} />
                    Preview
                  </>
                )}
              </button>
            ))}
          </div>

          <p className="hidden text-[11px] text-muted-foreground sm:block">
            Editing article
          </p>
        </div>

        {/* WRITE TAB */}
        {activeTab === "write" ? (
          <div className="space-y-6">
            {/* TITLE BLOCK */}
            <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
              <input
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Give your story a title…"
                className={cn(
                  "w-full border-0 bg-transparent p-0",
                  "font-serif text-3xl tracking-tight sm:text-4xl",
                  "text-foreground placeholder:text-muted-foreground/40",
                  "focus:outline-none",
                )}
              />

              <p className="mt-2 text-[11px] text-muted-foreground">
                Auto-generates slug:{" "}
                <span className="font-mono text-foreground/70">
                  {previewUrl}
                </span>
              </p>

              <div className="mt-4 flex items-center gap-2">
                <div className="flex min-w-0 flex-1 items-center">
                  <span className="inline-flex h-9 max-w-[55%] shrink-0 items-center truncate rounded-l-lg border border-r-0 border-border bg-muted px-3 font-mono text-[11px] text-muted-foreground sm:max-w-none">
                    /{selectedCategory?.slug ?? initialBlog.categorySlug}/
                    {selectedSubcategory?.slug ??
                      initialBlog.subcategorySlug}
                    /
                  </span>

                  <input
                    value={slug}
                    onChange={(e) => {
                      setSlugManuallyEdited(true);
                      setSlug(slugify(e.target.value));
                    }}
                    className={cn(
                      "h-9 min-w-0 flex-1 rounded-r-lg border border-border bg-background px-3",
                      "font-mono text-[12px] text-foreground",
                      "focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/30",
                    )}
                  />
                </div>

                <button
                  type="button"
                  onClick={() => setSlugManuallyEdited(true)}
                  className="shrink-0 text-[11px] font-medium text-primary underline-offset-4 hover:underline"
                >
                  Edit slug
                </button>
              </div>
            </div>

            {/* EDITOR */}
            <div className="overflow-hidden rounded-2xl border border-border bg-card">
              <BlogEditor value={content} onChange={setContent} />
            </div>

            {/* MEDIA + CLASSIFICATION */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
              {/* MEDIA */}
              <div className="rounded-2xl border border-border bg-card p-6 lg:col-span-3">
                <h2 className="mb-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">
                  Media
                </h2>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {/* BANNER */}
                  <div>
                    <p className="mb-2 text-[11px] font-medium text-foreground">
                      Banner Image
                    </p>

                    <div
                      className={cn(
                        "group relative aspect-video w-full overflow-hidden",
                        "rounded-xl border-2 border-dashed border-border bg-muted/40",
                        "transition-colors hover:border-primary/50",
                      )}
                    >
                      {bannerPreview ? (
                        <>
                          <Image
                            src={bannerPreview}
                            alt="Banner"
                            fill
                            unoptimized
                            className="object-cover"
                          />

                          <button
                            type="button"
                            aria-label="Remove banner image"
                            onClick={() => {
                              setBannerImage("");
                              setBannerPreview("");
                            }}
                            className="absolute right-2 top-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-background/90 text-foreground transition-colors hover:bg-destructive hover:text-white"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          onClick={() => bannerRef.current?.click()}
                          disabled={uploadingBanner}
                          className="flex h-full w-full flex-col items-center justify-center gap-2 p-4 text-center disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {uploadingBanner ? (
                            <Loader2 className="h-5 w-5 animate-spin text-primary" />
                          ) : (
                            <Upload className="h-5 w-5 text-muted-foreground" />
                          )}

                          <p className="text-[11px] text-muted-foreground">
                            {uploadingBanner
                              ? "Uploading…"
                              : "Upload banner"}
                          </p>
                        </button>
                      )}
                    </div>

                    <input
                      ref={bannerRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      onChange={handleBannerUpload}
                      className="hidden"
                    />

                    <p className="mt-2 text-[10px] text-muted-foreground">
                      Auto-resized to WebP
                    </p>
                  </div>

                  {/* OG IMAGE */}
                  <div>
                    <p className="mb-2 text-[11px] font-medium text-foreground">
                      OG Image
                    </p>

                    <div
                      className={cn(
                        "group relative aspect-video w-full overflow-hidden",
                        "rounded-xl border-2 border-dashed border-border bg-muted/40",
                        "transition-colors hover:border-primary/50",
                      )}
                    >
                      {ogPreview ? (
                        <>
                          <Image
                            src={ogPreview}
                            alt="OG image"
                            fill
                            unoptimized
                            className="object-cover"
                          />

                          <button
                            type="button"
                            aria-label="Remove OG image"
                            onClick={() => {
                              setOgImage("");
                              setOgPreview("");
                            }}
                            className="absolute right-2 top-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-background/90 text-foreground transition-colors hover:bg-destructive hover:text-white"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          onClick={() => ogRef.current?.click()}
                          disabled={uploadingOg}
                          className="flex h-full w-full flex-col items-center justify-center gap-2 p-4 text-center disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {uploadingOg ? (
                            <Loader2 className="h-5 w-5 animate-spin text-primary" />
                          ) : (
                            <Upload className="h-5 w-5 text-muted-foreground" />
                          )}

                          <p className="text-[11px] text-muted-foreground">
                            {uploadingOg
                              ? "Uploading…"
                              : "Upload OG image"}
                          </p>
                        </button>
                      )}
                    </div>

                    <input
                      ref={ogRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      onChange={handleOgUpload}
                      className="hidden"
                    />

                    <p className="mt-2 text-[10px] text-muted-foreground">
                      Auto-resized to WebP
                    </p>
                  </div>
                </div>
              </div>

              {/* CLASSIFICATION */}
              <div className="rounded-2xl border border-border bg-card p-6 lg:col-span-2">
                <h2 className="mb-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">
                  Classification
                </h2>

                <div className="space-y-4">
                  <Field label="Category">
                    <select
                      value={categoryId}
                      onChange={(e) =>
                        handleCategoryChange(e.target.value)
                      }
                      className={fieldClass}
                    >
                      <option value="">Select category</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </Field>

                  <Field label="Subcategory">
                    <select
                      value={subcategoryId}
                      onChange={(e) =>
                        setSubcategoryId(e.target.value)
                      }
                      disabled={!categoryId}
                      className={cn(fieldClass, "disabled:opacity-50")}
                    >
                      <option value="">Select subcategory</option>
                      {availableSubcategories.map((sub) => (
                        <option key={sub.id} value={sub.id}>
                          {sub.name}
                        </option>
                      ))}
                    </select>
                  </Field>

                  <Field label="Type">
                    <select
                      value={type}
                      onChange={(e) => setType(e.target.value)}
                      className={fieldClass}
                    >
                      {TYPES.map((t) => (
                        <option key={t} value={t}>
                          {t.charAt(0) + t.slice(1).toLowerCase()}
                        </option>
                      ))}
                    </select>
                  </Field>

                  <Field label="Status">
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      className={fieldClass}
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s.replace("_", " ")}
                        </option>
                      ))}
                    </select>
                  </Field>

                  <label className="flex cursor-pointer items-center gap-3 pt-2">
                    <input
                      type="checkbox"
                      checked={featured}
                      onChange={(e) => setFeatured(e.target.checked)}
                      className="h-4 w-4 accent-primary"
                    />
                    <span className="text-[12px] text-foreground">
                      Featured
                    </span>
                  </label>
                </div>
              </div>
            </div>

            {/* TOC */}
            <div className="rounded-2xl border border-border bg-card p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">
                  Table of Contents
                </h2>

                <button
                  type="button"
                  onClick={addTocItem}
                  className={cn(
                    "inline-flex h-8 items-center gap-1.5 rounded-full px-3",
                    "border border-border text-[10px] font-semibold uppercase tracking-[0.12em]",
                    "text-muted-foreground transition-colors",
                    "hover:border-primary/40 hover:bg-primary/5 hover:text-primary",
                  )}
                >
                  <Plus className="h-3 w-3" strokeWidth={2.5} />
                  Add item
                </button>
              </div>

              {toc.length === 0 ? (
                <p className="text-[12px] text-muted-foreground">
                  Optional. Add headings that appear in the article&apos;s
                  table of contents.
                </p>
              ) : (
                <ul className="space-y-2">
                  {toc.map((item, index) => (
                    <li
                      key={item.id}
                      className="flex items-center gap-3 rounded-xl border border-border bg-muted/30 p-3"
                    >
                      <span className="w-6 shrink-0 font-mono text-[11px] text-muted-foreground">
                        {String(index + 1).padStart(2, "0")}
                      </span>

                      <input
                        value={item.title}
                        onChange={(e) =>
                          updateTocItem(
                            item.id,
                            "title",
                            e.target.value,
                          )
                        }
                        placeholder="Heading title"
                        className={cn(
                          "h-9 min-w-0 flex-1 rounded-lg border border-border bg-background px-3",
                          "text-[12px] text-foreground",
                          "focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/30",
                        )}
                      />

                      <input
                        value={item.slug}
                        onChange={(e) =>
                          updateTocItem(
                            item.id,
                            "slug",
                            slugify(e.target.value),
                          )
                        }
                        placeholder="slug"
                        className={cn(
                          "h-9 min-w-0 flex-1 rounded-lg border border-border bg-background px-3",
                          "font-mono text-[11px] text-muted-foreground",
                          "focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/30",
                        )}
                      />

                      <button
                        type="button"
                        onClick={() => removeTocItem(item.id)}
                        aria-label="Remove table of contents item"
                        className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                      >
                        <Trash2
                          className="h-3.5 w-3.5"
                          strokeWidth={1.75}
                        />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* ACTION BAR */}
            <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-card px-6 py-4">
              <p className="flex items-center gap-2 text-[11px] text-muted-foreground">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                Editing existing article
              </p>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleSubmit("DRAFT")}
                  disabled={submitting}
                  className={cn(
                    "inline-flex h-10 items-center justify-center gap-2 rounded-full px-5",
                    "border border-border bg-transparent text-foreground",
                    "text-[11px] font-semibold uppercase tracking-[0.15em]",
                    "transition-colors hover:bg-accent",
                    "disabled:opacity-50",
                  )}
                >
                  Save as Draft
                </button>

                <button
                  type="button"
                  onClick={() => handleSubmit("PUBLISHED")}
                  disabled={submitting || !allChecksPass}
                  className={cn(
                    "inline-flex h-10 items-center justify-center gap-2 rounded-full px-5",
                    "bg-primary text-primary-foreground",
                    "text-[11px] font-semibold uppercase tracking-[0.15em]",
                    "transition-colors hover:bg-primary/90",
                    "disabled:cursor-not-allowed disabled:opacity-50",
                  )}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Publishing…
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4" />
                      Publish
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* PREVIEW */
          <div className="min-w-0">
            {bannerPreview && (
              <div className="relative mb-8 aspect-21/9 w-full overflow-hidden rounded-2xl border border-border">
                <Image
                  src={bannerPreview}
                  alt={title || "Banner"}
                  fill
                  unoptimized
                  priority
                  className="object-cover"
                />
              </div>
            )}

            <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">
              {selectedCategory?.name ?? "Category"} ·{" "}
              {selectedSubcategory?.name ?? "Subcategory"}
            </p>

            <h1 className="mb-6 font-serif text-3xl tracking-tight text-foreground sm:text-4xl">
              {title || "Untitled Story"}
            </h1>

            <BlogPreviewer content={content} tableOfContents={toc} />
          </div>
        )}
      </div>

      {/* SIDEBAR */}
      <aside className="h-fit xl:sticky xl:top-24">
        <div className="rounded-2xl border border-border bg-muted/40 p-6">
          <h2 className="mb-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">
            Preview
          </h2>

          <div className="overflow-hidden rounded-2xl border border-border bg-card">
            <div className="relative aspect-video bg-muted">
              {bannerPreview ? (
                <Image
                  src={bannerPreview}
                  alt={title || "Preview"}
                  fill
                  unoptimized
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <p className="text-[10px] text-muted-foreground">
                    Banner preview
                  </p>
                </div>
              )}
            </div>

            <div className="p-4">
              <p className="text-[9px] font-semibold uppercase tracking-[0.15em] text-primary">
                {selectedCategory?.name ?? "Category"} ·{" "}
                {selectedSubcategory?.name ?? "Subcategory"}
              </p>

              <p className="mt-2 font-serif text-lg leading-tight tracking-tight">
                {title || "Your headline appears here"}
              </p>

              <p className="mt-2 text-[10px] text-muted-foreground">
                {content.blocks.length
                  ? `${Math.max(
                      1,
                      Math.ceil(
                        JSON.stringify(content).length / 1000,
                      ),
                    )} min read`
                  : "0 min read"}{" "}
                ·{" "}
                {status.charAt(0) + status.slice(1).toLowerCase()}
              </p>
            </div>
          </div>

          <div className="mt-6">
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">
              Before you publish
            </p>

            <ul className="space-y-2">
              <ChecklistItem done={checklist.title} label="Title added" />
              <ChecklistItem
                done={checklist.content}
                label="Content written"
              />
              <ChecklistItem
                done={checklist.banner}
                label="Banner uploaded"
              />
              <ChecklistItem done={checklist.og} label="OG image uploaded" />
              <ChecklistItem
                done={checklist.category}
                label="Category selected"
              />
              <ChecklistItem
                done={checklist.subcategory}
                label="Subcategory selected"
              />
            </ul>
          </div>

          <div className="mt-6 border-t border-border pt-6">
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">
              Publishing
            </p>

            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 font-serif text-sm text-primary">
                T
              </div>
              <div className="min-w-0">
                <p className="truncate text-[12px] font-medium text-foreground">
                  Talha Tabish
                </p>
                <p className="text-[10px] text-muted-foreground">
                  Editor-in-Chief
                </p>
              </div>
            </div>

            <p className="mt-4 text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
              URL
            </p>

            <p className="mt-1 truncate rounded-lg border border-border bg-background px-3 py-2 font-mono text-[10px] text-foreground/70">
              {previewUrl}
            </p>

            <p className="mt-4 text-[11px] italic text-muted-foreground">
              SEO will be regenerated on save.
            </p>
          </div>
        </div>
      </aside>
    </div>
  );
}

// ============================================================
// SUBCOMPONENTS
// ============================================================

const fieldClass = cn(
  "h-9 w-full rounded-lg px-3",
  "border border-border bg-background text-[12px] text-foreground",
  "transition-all duration-200",
  "focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/30",
);

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-2 block text-[11px] font-medium text-foreground">
        {label}
      </label>
      {children}
    </div>
  );
}

function ChecklistItem({
  done,
  label,
}: {
  done: boolean;
  label: string;
}) {
  return (
    <li className="flex items-center gap-2 text-[12px]">
      <span
        className={cn(
          "inline-flex h-4 w-4 shrink-0 items-center justify-center rounded border",
          done
            ? "border-primary bg-primary text-primary-foreground"
            : "border-border bg-transparent",
        )}
      >
        {done && <Check className="h-3 w-3" strokeWidth={3} />}
      </span>
      <span
        className={cn(done ? "text-foreground" : "text-muted-foreground")}
      >
        {label}
      </span>
    </li>
  );
}