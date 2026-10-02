"use client";

// ============================================================
// New Subcategory Form — ALENTAH
// ============================================================

import * as React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, Check, FolderTree } from "lucide-react";

import {
  subcategorySchema,
  type SubcategoryFormValues,
} from "@/schemas/subcategory-schema";
import { cn } from "@/lib/utils";
import { createSubcategory } from "@/actions/subcategory/create-subcategory";
import { CategoryWithSubs } from "@/actions/subcategory/get-category-with-subs";

// ============================================================
// TYPES
// ============================================================

interface NewSubcategoryFormProps {
  category: CategoryWithSubs;
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

export function NewSubcategoryForm({ category }: NewSubcategoryFormProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = React.useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    formState: { errors },
  } = useForm<SubcategoryFormValues>({
    resolver: zodResolver(subcategorySchema),
    defaultValues: {
      categoryId: category.id,
      name: "",
      slug: "",
      description: "",
      sortOrder: category.subcategoryCount + 1,
      isActive: true,
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

  const onSubmit = async (data: SubcategoryFormValues) => {
    setSubmitting(true);
    const toastId = toast.loading("Creating subcategory…");

    try {
      const formData = new FormData();
      formData.append("categoryId", data.categoryId);
      formData.append("name", data.name);
      formData.append("slug", data.slug);
      formData.append("description", data.description ?? "");
      formData.append("sortOrder", String(data.sortOrder));
      formData.append("isActive", String(data.isActive));
      formData.append("metaTitle", data.metaTitle ?? "");
      formData.append("metaDescription", data.metaDescription ?? "");

      const result = await createSubcategory(formData);

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

      toast.success(`Subcategory "${result.subcategory.name}" created!`, {
        id: toastId,
        description: `It's now live under ${category.name}.`,
      });

      router.push(`/admin/categories/${category.id}`);
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

  return (
    <div className="grid grid-cols-1 gap-8 xl:grid-cols-[minmax(0,1fr)_320px]">
      <form
        onSubmit={handleSubmit(onSubmit, onInvalid)}
        className="min-w-0"
        noValidate
      >
        {/* Hidden field: categoryId */}
        <input type="hidden" {...register("categoryId")} />

        <div className="space-y-8 rounded-2xl border border-border bg-card p-6 sm:p-8">
          {/* PARENT CATEGORY */}
          <section>
            <h2 className="mb-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">
              Parent Category
            </h2>

            <div className="flex items-center gap-4 rounded-2xl border border-border bg-muted/40 p-4">
              {/* Parent thumbnail */}
              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-border bg-muted">
                {category.coverImage ? (
                  <Image
                    src={category.coverImage}
                    alt={category.name}
                    fill
                    sizes="56px"
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <FolderTree
                      className="h-5 w-5 text-muted-foreground/60"
                      strokeWidth={1.75}
                    />
                  </div>
                )}
              </div>

              {/* Parent info */}
              <div className="min-w-0 flex-1">
                <p className="font-serif text-lg leading-tight text-foreground">
                  {category.name}
                </p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  Currently {category.subcategoryCount} subcategor
                  {category.subcategoryCount === 1 ? "y" : "ies"} ·{" "}
                  {category.blogCount} article
                  {category.blogCount === 1 ? "" : "s"}
                </p>
              </div>

              {/* Change category */}
              <button
                type="button"
                onClick={() => router.push("/admin/categories")}
                className={cn(
                  "inline-flex h-9 shrink-0 items-center justify-center rounded-full px-4",
                  "border border-border bg-transparent text-foreground",
                  "text-[10px] font-semibold uppercase tracking-[0.15em]",
                  "transition-colors hover:bg-accent",
                )}
              >
                Change Category
              </button>
            </div>
          </section>

          <Hr />

          {/* ESSENTIALS */}
          <section>
            <h2 className="mb-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">
              Essentials
            </h2>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Subcategory Name" error={errors.name?.message}>
                <input
                  {...register("name")}
                  placeholder="e.g. Artificial Intelligence"
                  className={fieldClass}
                />
                <p className="mt-1.5 text-[10px] text-muted-foreground">
                  {(values.name ?? "").length} / 60
                </p>
              </Field>

              <Field label="Slug" error={errors.slug?.message}>
                <div className="flex items-center">
                  <span className="inline-flex h-11 max-w-[180px] items-center truncate rounded-l-xl border border-r-0 border-border bg-muted px-3 text-[11px] text-muted-foreground">
                    /category/{category.slug}/
                  </span>
                  <input
                    {...register("slug")}
                    placeholder="artificial-intelligence"
                    className={cn(fieldClass, "flex-1 rounded-l-none")}
                  />
                </div>
                <p className="mt-1.5 text-[10px] text-muted-foreground">
                  Auto-generated from name. You can edit.
                </p>
              </Field>
            </div>

            <div className="mt-4">
              <Field label="Description" error={errors.description?.message}>
                <textarea
                  {...register("description")}
                  rows={3}
                  maxLength={200}
                  placeholder="A short description that appears on the subcategory page."
                  className={cn(
                    fieldClass,
                    "min-h-[80px] resize-none py-2.5",
                  )}
                />
                <p className="mt-1.5 text-[10px] text-muted-foreground">
                  {(values.description ?? "").length} / 200
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

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <Field label="Sort Order" error={errors.sortOrder?.message}>
                <input
                  {...register("sortOrder", { valueAsNumber: true })}
                  type="number"
                  min={0}
                  max={999}
                  className={fieldClass}
                />
                <p className="mt-1.5 text-[10px] text-muted-foreground">
                  Lower numbers appear first in the category page.
                </p>
              </Field>

              <Field label="Visibility">
                <Controller
                  control={control}
                  name="isActive"
                  render={({ field }) => (
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => field.onChange(true)}
                        className={cn(
                          "inline-flex h-9 items-center gap-2 rounded-full px-4",
                          "text-[11px] font-semibold uppercase tracking-[0.15em]",
                          "transition-colors",
                          field.value === true
                            ? "bg-primary text-primary-foreground"
                            : "border border-border bg-transparent text-muted-foreground hover:bg-accent",
                        )}
                      >
                        <span
                          className={cn(
                            "h-1.5 w-1.5 rounded-full",
                            field.value === true
                              ? "bg-primary-foreground"
                              : "bg-muted-foreground",
                          )}
                        />
                        Active
                      </button>

                      <button
                        type="button"
                        onClick={() => field.onChange(false)}
                        className={cn(
                          "inline-flex h-9 items-center gap-2 rounded-full px-4",
                          "text-[11px] font-semibold uppercase tracking-[0.15em]",
                          "transition-colors",
                          field.value === false
                            ? "bg-primary text-primary-foreground"
                            : "border border-border bg-transparent text-muted-foreground hover:bg-accent",
                        )}
                      >
                        <span
                          className={cn(
                            "h-1.5 w-1.5 rounded-full",
                            field.value === false
                              ? "bg-primary-foreground"
                              : "bg-muted-foreground",
                          )}
                        />
                        Hidden
                      </button>
                    </div>
                  )}
                />
                <p className="mt-1.5 text-[10px] text-muted-foreground">
                  Visible to all readers
                </p>
              </Field>
            </div>
          </section>

          <Hr />

          {/* OPTIONAL */}
          <section>
            <h2 className="mb-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">
              Optional
            </h2>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Meta Title" error={errors.metaTitle?.message}>
                <input
                  {...register("metaTitle")}
                  placeholder={`${values.name || "Artificial Intelligence"} — ${category.name}`}
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
                  placeholder="Short description for search engines."
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
              onClick={() =>
                router.push(`/admin/categories/${category.id}`)
              }
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
                  Create Subcategory
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
            <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-foreground">
              {category.name}
            </div>
            <div className="space-y-0.5 rounded-lg border border-border bg-muted/40 p-1.5">
              {/* New subcategory highlighted */}
              <div className="flex items-center justify-between rounded-md bg-primary px-2.5 py-1.5 text-[11px] font-medium text-primary-foreground">
                <span>{values.name || "Artificial Intelligence"}</span>
              </div>
              {/* Existing siblings */}
              {category.subcategories.slice(0, 4).map((sub) => (
                <div
                  key={sub.id}
                  className="rounded-md px-2.5 py-1.5 text-[11px] text-muted-foreground"
                >
                  {sub.name}
                </div>
              ))}
            </div>
          </div>

          {/* Card preview */}
          <div className="mb-5">
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
              Subcategory Card Preview
            </p>
            <div className="rounded-2xl border border-border bg-card p-4">
              <p className="font-serif text-xl tracking-tight">
                {values.name || "Artificial Intelligence"}
              </p>
              <p className="mt-1 text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
                0 articles
              </p>
              <p className="mt-3 text-[12px] italic text-muted-foreground">
                {values.description?.trim() || "No description yet"}
              </p>
            </div>
          </div>

          {/* Checklist */}
          <div>
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
                done={
                  values.sortOrder !== undefined &&
                  values.sortOrder !== null
                }
                label="Sort order set"
              />
            </ul>
            <p className="mt-4 text-[11px] italic text-muted-foreground">
              You can add articles to this subcategory next.
            </p>
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