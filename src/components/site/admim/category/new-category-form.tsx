"use client";

// ============================================================
// New Category Form — ALENTAH
// Cover image is uploaded via <CategoryBannerUploader />.
// No URL paste — upload only.
// ============================================================

import * as React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, Check } from "lucide-react";

import {
  categorySchema,
  type CategoryFormValues,
} from "@/schemas/category-schema";
import { cn } from "@/lib/utils";
import { createCategory } from "@/actions/category/create-category";
import { CategoryBannerUploader } from "./category-banner-uploader";
import { EditorListItem } from "@/actions/editor/get-editors";

// ============================================================
// TYPES
// ============================================================

interface NewCategoryFormProps {
  editors: EditorListItem[];
}

// ============================================================
// HELPERS
// ============================================================

function toSlug(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// ============================================================
// COMPONENT
// ============================================================

export function NewCategoryForm({ editors }: NewCategoryFormProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = React.useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    formState: { errors },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      coverImage: "",
      editorId: "",
      sortOrder: 0,
      isActive: true,
      accentColor: "#6B5744",
      metaTitle: "",
      metaDescription: "",
    },
  });

  const values = watch();

  // Auto-generate slug from name if slug is empty
  React.useEffect(() => {
    if (!values.slug && values.name) {
      setValue("slug", toSlug(values.name), { shouldValidate: false });
    }
  }, [values.name, values.slug, setValue]);

  // ============================================================
  // SUBMIT
  // ============================================================

  const onSubmit = async (data: CategoryFormValues) => {
    setSubmitting(true);
    const toastId = toast.loading("Creating category…");

    try {
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("slug", data.slug);
      formData.append("description", data.description ?? "");
      formData.append("coverImage", data.coverImage ?? "");
      formData.append("editorId", data.editorId ?? "");
      formData.append("sortOrder", String(data.sortOrder));
      formData.append("isActive", String(data.isActive));
      formData.append("accentColor", data.accentColor ?? "");
      formData.append("metaTitle", data.metaTitle ?? "");
      formData.append("metaDescription", data.metaDescription ?? "");

      const result = await createCategory(formData);

      if (!result.success) {
        toast.error(result.error, { id: toastId });
        if (result.field) {
          const el = document.querySelector<HTMLInputElement>(
            `[name="${result.field}"]`,
          );
          el?.focus();
        }
        return;
      }

      toast.success(`Category "${result.category.name}" created!`, {
        id: toastId,
        description: "It's now live across Alentah.",
      });

      router.push("/admin/categories");
      router.refresh();
    } catch (err) {
      console.error("[FORM] submit error:", err);
      toast.error(
        err instanceof Error ? err.message : "Something went wrong.",
        { id: toastId },
      );
    } finally {
      setSubmitting(false);
    }
  };

  const onInvalid = (errs: unknown) => {
    console.error("[FORM] validation failed:", errs);
    toast.error("Please fix the highlighted fields.");
  };

  // Only show active editors in the dropdown
  const activeEditors = editors.filter((editor) => editor.isActive);

  return (
    <div className="grid grid-cols-1 gap-8 xl:grid-cols-[minmax(0,1fr)_320px]">
      <form
        onSubmit={handleSubmit(onSubmit, onInvalid)}
        className="min-w-0"
        noValidate
      >
        <div className="space-y-8 rounded-2xl border border-border bg-card p-6 sm:p-8">
          {/* ESSENTIALS */}
          <section>
            <h2 className="mb-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">
              Essentials
            </h2>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Field label="Category Name" error={errors.name?.message}>
                <input
                  {...register("name")}
                  placeholder="e.g. Technology"
                  className={fieldClass}
                />
              </Field>

              <Field label="Slug" error={errors.slug?.message}>
                <div className="flex items-center">
                  <span className="inline-flex h-11 items-center rounded-l-xl border border-r-0 border-border bg-muted px-3 text-[12px] text-muted-foreground">
                    /category/
                  </span>
                  <input
                    {...register("slug")}
                    placeholder="technology"
                    className={cn(fieldClass, "flex-1 rounded-l-none")}
                  />
                </div>
              </Field>

              <Field label="Description" error={errors.description?.message}>
                <textarea
                  {...register("description")}
                  rows={2}
                  maxLength={200}
                  placeholder="A short description that appears on the category page."
                  className={cn(
                    fieldClass,
                    "min-h-[44px] resize-none py-2.5",
                  )}
                />
              </Field>
            </div>
          </section>

          <Hr />

          {/* PRESENTATION */}
          <section>
            <h2 className="mb-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">
              Presentation
            </h2>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* Cover — upload only, no URL paste */}
              <Field label="Cover Image" error={errors.coverImage?.message}>
                <Controller
                  control={control}
                  name="coverImage"
                  render={({ field }) => (
                    <CategoryBannerUploader
                      value={field.value ?? ""}
                      onChange={field.onChange}
                    />
                  )}
                />
              </Field>

              <Field label="Editor" error={errors.editorId?.message}>
                <Controller
                  control={control}
                  name="editorId"
                  render={({ field }) => (
                    <select
                      value={field.value ?? ""}
                      onChange={(e) => field.onChange(e.target.value)}
                      onBlur={field.onBlur}
                      className={cn(fieldClass, "cursor-pointer")}
                    >
                      <option value="">No editor assigned</option>
                      {activeEditors.map((editor) => (
                        <option key={editor.id} value={editor.id}>
                          {editor.name}
                        </option>
                      ))}
                    </select>
                  )}
                />
                <p className="mt-1.5 text-[10px] text-muted-foreground">
                  Only active editors are shown.
                </p>
              </Field>
            </div>
          </section>

          <Hr />

          {/* ORGANIZATION */}
          <section>
            <h2 className="mb-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">
              Organization
            </h2>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <Field label="Sort Order" error={errors.sortOrder?.message}>
                <input
                  {...register("sortOrder", { valueAsNumber: true })}
                  type="number"
                  min={0}
                  max={999}
                  className={fieldClass}
                />
                <p className="mt-1.5 text-[10px] text-muted-foreground">
                  Lower numbers appear first in the navigation.
                </p>
              </Field>

              <Field label="Visibility">
                <Controller
                  control={control}
                  name="isActive"
                  render={({ field }) => (
                    <div className="flex items-center gap-6">
                      <label className="inline-flex cursor-pointer items-center gap-2">
                        <input
                          type="radio"
                          name={field.name}
                          checked={field.value === true}
                          onChange={() => field.onChange(true)}
                          onBlur={field.onBlur}
                          className="accent-primary"
                        />
                        <span className="text-sm font-medium">Active</span>
                      </label>

                      <label className="inline-flex cursor-pointer items-center gap-2">
                        <input
                          type="radio"
                          name={field.name}
                          checked={field.value === false}
                          onChange={() => field.onChange(false)}
                          onBlur={field.onBlur}
                          className="accent-primary"
                        />
                        <span className="text-sm text-muted-foreground">
                          Hidden
                        </span>
                      </label>
                    </div>
                  )}
                />
              </Field>
            </div>
          </section>

          <Hr />

          {/* OPTIONAL */}
          <section>
            <h2 className="mb-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">
              Optional
            </h2>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Field label="Accent Color" error={errors.accentColor?.message}>
                <div className="flex items-center gap-2">
                  <div
                    className="h-11 w-11 shrink-0 rounded-xl border border-border"
                    style={{
                      backgroundColor: values.accentColor || "#6B5744",
                    }}
                  />
                  <input
                    {...register("accentColor")}
                    placeholder="#6B5744"
                    className={fieldClass}
                  />
                </div>
              </Field>

              <Field label="Meta Title" error={errors.metaTitle?.message}>
                <input
                  {...register("metaTitle")}
                  placeholder="Technology — Alentah"
                  className={fieldClass}
                />
              </Field>

              <Field
                label="Meta Description"
                error={errors.metaDescription?.message}
              >
                <textarea
                  {...register("metaDescription")}
                  rows={2}
                  maxLength={160}
                  placeholder="A short meta description for search engines."
                  className={cn(
                    fieldClass,
                    "min-h-[44px] resize-none py-2.5",
                  )}
                />
              </Field>
            </div>
          </section>
        </div>

        {/* ACTION BAR */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-card px-6 py-4">
          <p className="flex items-center gap-2 text-[11px] text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            Draft will be saved automatically
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => router.push("/admin/categories")}
              disabled={submitting}
              className={cn(
                "inline-flex h-10 items-center justify-center rounded-full px-5",
                "border border-border bg-transparent text-foreground",
                "text-[11px] font-semibold uppercase tracking-[0.15em]",
                "transition-colors hover:bg-accent",
                "disabled:opacity-50",
              )}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting}
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
                  Creating…
                </>
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  Create Category
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* PREVIEW SIDEBAR */}
      <aside className="h-fit xl:sticky xl:top-24">
        <div className="rounded-2xl border border-border bg-muted/40 p-6">
          <h2 className="mb-5 text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">
            Preview
          </h2>

          {/* Nav preview */}
          <div className="mb-5 rounded-2xl border border-border bg-card p-4">
            <p className="mb-3 font-serif text-lg tracking-tight">ALENTAH</p>
            <div className="flex gap-3 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
              <span className="border-b border-primary pb-0.5 text-primary">
                {values.name || "Technology"}
              </span>
              <span>Lifestyle</span>
              <span>Finance</span>
            </div>
          </div>

          {/* Card preview — next/image */}
          <div className="overflow-hidden rounded-2xl border border-border bg-card">
            <div className="relative aspect-video bg-muted">
              {values.coverImage ? (
                <Image
                  src={values.coverImage}
                  alt={values.name || "Cover preview"}
                  fill
                  sizes="(max-width: 768px) 100vw, 320px"
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <p className="text-[10px] text-muted-foreground">
                    Cover image preview
                  </p>
                </div>
              )}
            </div>
            <div className="p-4">
              <p className="font-serif text-xl tracking-tight">
                {values.name || "Technology"}
              </p>
              <p className="mt-1 text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
                0 articles
              </p>
            </div>
          </div>

          {/* Checklist */}
          <div className="mt-6">
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">
              Before you publish
            </p>
            <ul className="space-y-2">
              <ChecklistItem
                done={!!values.name?.trim()}
                label="Name added"
              />
              <ChecklistItem
                done={!!values.slug?.trim()}
                label="Slug generated"
              />
              <ChecklistItem
                done={!!values.description?.trim()}
                label="Description written"
              />
              <ChecklistItem
                done={!!values.coverImage?.trim()}
                label="Cover image uploaded"
              />
              <ChecklistItem
                done={!!values.editorId?.trim()}
                label="Editor assigned"
              />
            </ul>
          </div>
        </div>
      </aside>
    </div>
  );
}

// ============================================================
// SUB-COMPONENTS
// ============================================================

const fieldClass = cn(
  "h-11 w-full rounded-xl px-3.5",
  "border border-border bg-background text-[13px] text-foreground",
  "placeholder:text-muted-foreground/60",
  "transition-all duration-200",
  "focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/30",
);

function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-2 block text-[11px] font-medium text-foreground">
        {label}
      </label>
      {children}
      {hint && !error && (
        <p className="mt-1.5 text-[10px] text-muted-foreground">{hint}</p>
      )}
      {error && <p className="mt-1.5 text-[10px] text-destructive">{error}</p>}
    </div>
  );
}

function Hr() {
  return <hr className="border-t border-border" />;
}

function ChecklistItem({ done, label }: { done: boolean; label: string }) {
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