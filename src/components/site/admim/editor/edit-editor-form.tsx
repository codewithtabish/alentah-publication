"use client";

// ============================================================
// Edit Editor Form — ALENTAH
// ============================================================

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  UploadCloud,
  Loader2,
  X,
  Check,
  User as UserIcon,
  Globe,
  Trash2,
} from "lucide-react";

import { editorSchema, type EditorFormValues } from "@/schemas/editor-schema";
import { cn } from "@/lib/utils";

import { updateEditor } from "@/actions/editor/update-editor";
import { FacebookIcon, GithubIcon, InstagramIcon, LinkedinIcon, TwitterIcon } from "../../general/theme/social-icons";

// ============================================================
// TYPES
// ============================================================

export type EditorInitialData = {
  id: string;
  name: string;
  email: string;
  imageUrl: string | null;
  bio: string | null;
  experience: string | null;
  location: string | null;
  website: string | null;
  twitter: string | null;
  linkedin: string | null;
  facebook: string | null;
  instagram: string | null;
  github: string | null;
  isActive: boolean;
};

interface EditEditorFormProps {
  editor: EditorInitialData;
}

// ============================================================
// COMPONENT
// ============================================================

export function EditEditorForm({ editor }: EditEditorFormProps) {
  const router = useRouter();
  const inputRef = React.useRef<HTMLInputElement>(null);

  const [photo, setPhoto] = React.useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = React.useState<string | null>(null);
  const [existingPhoto, setExistingPhoto] = React.useState<string | null>(
    editor.imageUrl,
  );
  const [removeExistingPhoto, setRemoveExistingPhoto] = React.useState(false);
  const [photoDragging, setPhotoDragging] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);

  const displayedPhoto =
    photoPreview ?? (removeExistingPhoto ? null : existingPhoto);

  const {
    register,
    handleSubmit,
    watch,
    control,
    formState: { errors },
  } = useForm<EditorFormValues>({
    resolver: zodResolver(editorSchema),
    defaultValues: {
      name: editor.name ?? "",
      email: editor.email ?? "",
      experience: editor.experience ?? "",
      bio: editor.bio ?? "",
      location: editor.location ?? "",
      website: editor.website ?? "",
      twitter: editor.twitter ?? "",
      linkedin: editor.linkedin ?? "",
      facebook: editor.facebook ?? "",
      instagram: editor.instagram ?? "",
      github: editor.github ?? "",
      isActive: editor.isActive,
    },
  });

  const values = watch();

  const previewName = values.name?.trim() || "Untitled Editor";
  const previewRole = values.experience?.trim() || "Editor";
  const previewBio =
    values.bio?.trim() || "This editor hasn't written a bio yet.";

  // ============================================================
  // PHOTO
  // ============================================================

  React.useEffect(() => {
    return () => {
      if (photoPreview) URL.revokeObjectURL(photoPreview);
    };
  }, [photoPreview]);

  const handlePhoto = (picked: File | null) => {
    if (!picked) return;
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    if (picked.size > 5 * 1024 * 1024) {
      toast.error("Photo must be smaller than 5 MB.");
      return;
    }
    setPhoto(picked);
    setPhotoPreview(URL.createObjectURL(picked));
    setRemoveExistingPhoto(false);
  };

  const clearPhoto = () => {
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhoto(null);
    setPhotoPreview(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleRemoveExisting = () => {
    clearPhoto();
    setRemoveExistingPhoto(true);
    setExistingPhoto(null);
  };

  const handleRestoreExisting = () => {
    setRemoveExistingPhoto(false);
    setExistingPhoto(editor.imageUrl);
  };

  // ============================================================
  // SUBMIT
  // ============================================================

  const onSubmit = async (data: EditorFormValues) => {
    console.log("[FORM] onSubmit fired:", data);

    setSubmitting(true);
    const toastId = toast.loading("Saving changes…");

    try {
      const formData = new FormData();

      formData.append("name", data.name);
      formData.append("email", data.email);
      formData.append("experience", data.experience ?? "");
      formData.append("bio", data.bio ?? "");
      formData.append("location", data.location ?? "");
      formData.append("website", data.website ?? "");
      formData.append("twitter", data.twitter ?? "");
      formData.append("linkedin", data.linkedin ?? "");
      formData.append("facebook", data.facebook ?? "");
      formData.append("instagram", data.instagram ?? "");
      formData.append("github", data.github ?? "");
      formData.append("isActive", data.isActive ? "true" : "false");

      if (photo) formData.append("photo", photo);
      else if (removeExistingPhoto) formData.append("removePhoto", "true");

      console.log("[FORM] calling updateEditor with id:", editor.id);

      const result = await updateEditor(editor.id, formData);

      console.log("[FORM] updateEditor result:", result);

      if (!result.success) {
        toast.error(result.error ?? "Update failed", { id: toastId });
        return;
      }

      toast.success(`Editor "${result.editor.name}" updated!`, {
        id: toastId,
        description: "The changes are live across Alentah.",
      });

      router.push("/admin/editors");
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

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_320px] gap-8">
      <form
        onSubmit={handleSubmit(onSubmit, onInvalid)}
        className="min-w-0"
        noValidate
      >
        <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 space-y-8">
          {/* IDENTITY */}
          <section>
            <h2 className="text-[10px] uppercase tracking-[0.2em] text-primary font-semibold mb-4">
              Identity
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Field label="Full Name" error={errors.name?.message}>
                <input
                  {...register("name")}
                  placeholder="e.g. Sara Chen"
                  className={fieldClass}
                />
              </Field>

              <Field label="Email" error={errors.email?.message}>
                <input
                  {...register("email")}
                  type="email"
                  placeholder="sara@alentah.com"
                  className={fieldClass}
                />
              </Field>

              <Field label="Role / Title" error={errors.experience?.message}>
                <input
                  {...register("experience")}
                  placeholder="e.g. Senior Editor"
                  className={fieldClass}
                />
              </Field>
            </div>
          </section>

          <Hr />

          {/* PHOTO */}
          <section>
            <h2 className="text-[10px] uppercase tracking-[0.2em] text-primary font-semibold mb-4">
              Profile Photo
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-[200px_1fr] gap-6 items-start">
              <div>
                <div
                  onDrop={(e) => {
                    e.preventDefault();
                    setPhotoDragging(false);
                    handlePhoto(e.dataTransfer.files?.[0] ?? null);
                  }}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setPhotoDragging(true);
                  }}
                  onDragLeave={(e) => {
                    e.preventDefault();
                    setPhotoDragging(false);
                  }}
                  onClick={() => inputRef.current?.click()}
                  className={cn(
                    "relative cursor-pointer aspect-square w-full",
                    "rounded-2xl border-2 border-dashed overflow-hidden",
                    "transition-all duration-200",
                    photoDragging
                      ? "border-primary bg-primary/10 scale-[1.02]"
                      : "border-border bg-muted/40 hover:border-primary/50",
                  )}
                >
                  {displayedPhoto ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={displayedPhoto}
                      alt="Preview"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full flex-col items-center justify-center gap-3 p-6 text-center">
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <UploadCloud
                          className="h-5 w-5 text-primary"
                          strokeWidth={1.75}
                        />
                      </div>
                      <p className="text-sm font-medium">Upload photo</p>
                    </div>
                  )}

                  {displayedPhoto && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        clearPhoto();
                      }}
                      className={cn(
                        "absolute top-2 right-2 z-10",
                        "h-7 w-7 rounded-full",
                        "bg-background/90 backdrop-blur",
                        "border border-border",
                        "inline-flex items-center justify-center",
                        "text-foreground hover:bg-destructive hover:text-destructive-foreground",
                        "transition-colors",
                      )}
                      aria-label="Remove photo"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                <input
                  ref={inputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/avif"
                  onChange={(e) => handlePhoto(e.target.files?.[0] ?? null)}
                  className="hidden"
                />

                <p className="mt-2 text-[10px] text-muted-foreground leading-relaxed">
                  Recommended 400 × 400 px
                  <br />
                  PNG or JPG · Max 5 MB
                </p>

                {(existingPhoto || removeExistingPhoto) && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {removeExistingPhoto && editor.imageUrl && (
                      <button
                        type="button"
                        onClick={handleRestoreExisting}
                        className="text-[10px] uppercase tracking-[0.15em] text-primary hover:underline underline-offset-4"
                      >
                        Undo remove
                      </button>
                    )}
                    {existingPhoto && !removeExistingPhoto && (
                      <button
                        type="button"
                        onClick={handleRemoveExisting}
                        className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.15em] text-destructive hover:underline underline-offset-4"
                      >
                        <Trash2 className="h-3 w-3" strokeWidth={2} />
                        Remove
                      </button>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <Field
                  label="Photo Credit (optional)"
                  hint="Shown in the article footer."
                >
                  <input
                    {...register("location")}
                    placeholder="e.g. Photo by Marcus Ellison"
                    className={fieldClass}
                  />
                </Field>

                {displayedPhoto && (
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <div className="h-12 w-12 rounded-full overflow-hidden border border-border shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={displayedPhoto}
                        alt="Preview"
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <span>Preview (article view)</span>
                  </div>
                )}
              </div>
            </div>
          </section>

          <Hr />

          {/* BIO + SOCIALS */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h2 className="text-[10px] uppercase tracking-[0.2em] text-primary font-semibold mb-4">
                Bio
              </h2>
              <Field label="Short Bio" error={errors.bio?.message}>
                <textarea
                  {...register("bio")}
                  rows={5}
                  maxLength={300}
                  placeholder="Write a short bio…"
                  className={cn(fieldClass, "resize-none min-h-[120px] py-3")}
                />
              </Field>
              <p className="mt-2 text-[10px] text-muted-foreground flex justify-between">
                <span>
                  Appears on the editor's public page and article bylines.
                </span>
                <span>{(values.bio ?? "").length} / 300</span>
              </p>
            </div>

            <div>
              <h2 className="text-[10px] uppercase tracking-[0.2em] text-primary font-semibold mb-4">
                Social Links
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <SocialField
                  icon={<TwitterIcon className="h-3.5 w-3.5" />}
                  placeholder="@handle"
                  {...register("twitter")}
                />
                <SocialField
                  icon={<LinkedinIcon className="h-3.5 w-3.5" />}
                  placeholder="linkedin.com/in/..."
                  {...register("linkedin")}
                />
                <SocialField
                  icon={<FacebookIcon className="h-3.5 w-3.5" />}
                  placeholder="facebook.com/..."
                  {...register("facebook")}
                />
                <SocialField
                  icon={<InstagramIcon className="h-3.5 w-3.5" />}
                  placeholder="@handle"
                  {...register("instagram")}
                />
                <SocialField
                  icon={<GithubIcon className="h-3.5 w-3.5" />}
                  placeholder="github.com/..."
                  {...register("github")}
                />
                <SocialField
                  icon={<Globe className="h-3.5 w-3.5" />}
                  placeholder="https://..."
                  {...register("website")}
                />
              </div>
            </div>
          </section>

          <Hr />

          {/* STATUS */}
          <section>
            <h2 className="text-[10px] uppercase tracking-[0.2em] text-primary font-semibold mb-4">
              Status
            </h2>

            <Controller
              control={control}
              name="isActive"
              render={({ field }) => (
                <div className="flex items-center gap-6">
                  <label className="inline-flex items-center gap-2 cursor-pointer">
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

                  <label className="inline-flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name={field.name}
                      checked={field.value === false}
                      onChange={() => field.onChange(false)}
                      onBlur={field.onBlur}
                      className="accent-primary"
                    />
                    <span className="text-sm text-muted-foreground">
                      Inactive
                    </span>
                  </label>
                </div>
              )}
            />
          </section>
        </div>

        {/* ACTION BAR */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-card px-6 py-4">
          <p className="text-[11px] text-muted-foreground flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            Changes save instantly
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => router.push("/admin/editors")}
              disabled={submitting}
              className={cn(
                "inline-flex h-10 items-center justify-center rounded-full px-5",
                "border border-border bg-transparent text-foreground",
                "text-[11px] font-semibold uppercase tracking-[0.15em]",
                "hover:bg-accent transition-colors",
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
                "hover:bg-primary/90 transition-colors",
                "disabled:opacity-50 disabled:cursor-not-allowed",
              )}
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving…
                </>
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* PREVIEW SIDEBAR */}
      <aside className="xl:sticky xl:top-24 h-fit">
        <div className="rounded-2xl border border-border bg-muted/40 p-6">
          <h2 className="text-[10px] uppercase tracking-[0.2em] text-primary font-semibold mb-5">
            Preview
          </h2>

          <div className="rounded-2xl border border-border bg-card p-6 text-center">
            <div className="mx-auto h-24 w-24 rounded-full overflow-hidden border border-border mb-4">
              {displayedPhoto ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={displayedPhoto}
                  alt="Preview"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center bg-muted text-muted-foreground">
                  <UserIcon className="h-8 w-8" strokeWidth={1.5} />
                </div>
              )}
            </div>

            <p className="font-serif text-2xl tracking-tight">{previewName}</p>
            <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              {previewRole}
            </p>
            <p className="mt-4 text-[12px] italic text-muted-foreground leading-relaxed">
              {previewBio}
            </p>

            <div className="mt-5 flex items-center justify-center gap-3 text-muted-foreground/70">
              {values.twitter && <TwitterIcon className="h-4 w-4" />}
              {values.linkedin && <LinkedinIcon className="h-4 w-4" />}
              {values.facebook && <FacebookIcon className="h-4 w-4" />}
              {values.instagram && <InstagramIcon className="h-4 w-4" />}
              {values.github && <GithubIcon className="h-4 w-4" />}
              {values.website && <Globe className="h-4 w-4" />}
            </div>
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
  "w-full h-11 px-3.5 rounded-xl",
  "bg-background border border-border text-foreground text-[13px]",
  "placeholder:text-muted-foreground/60",
  "focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40",
  "transition-all duration-200",
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
      <label className="block text-[11px] font-medium text-foreground mb-2">
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

const SocialField = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement> & { icon: React.ReactNode }
>(({ icon, className, ...props }, ref) => (
  <div className="relative">
    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/70 pointer-events-none">
      {icon}
    </span>
    <input
      ref={ref}
      {...props}
      className={cn(
        "w-full h-11 pl-10 pr-3.5 rounded-xl",
        "bg-background border border-border text-foreground text-[13px]",
        "placeholder:text-muted-foreground/60",
        "focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40",
        "transition-all duration-200",
        className,
      )}
    />
  </div>
));
SocialField.displayName = "SocialField";

function Hr() {
  return <hr className="border-t border-border" />;
}