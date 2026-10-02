"use client";

// ============================================================
// New Editor Form — ALENTAH
// Full editorial form with photo upload, live preview, toasts.
// Uses custom social icons + shared editor schema.
// ============================================================

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  UploadCloud,
  Loader2,
  X,
  Check,
  User as UserIcon,
  Globe,
} from "lucide-react";

import { editorSchema, type EditorFormValues } from "@/schemas/editor-schema";
import { cn } from "@/lib/utils";
import { createEditor } from "@/actions/editor/create-editor";
import { FacebookIcon, GithubIcon, InstagramIcon, LinkedinIcon, TwitterIcon } from "../../general/theme/social-icons";

// ============================================================
// COMPONENT
// ============================================================

export function NewEditorForm() {
  const router = useRouter();
  const inputRef = React.useRef<HTMLInputElement>(null);

  const [photo, setPhoto] = React.useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = React.useState<string | null>(null);
  const [photoDragging, setPhotoDragging] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isDirty },
  } = useForm<EditorFormValues>({
    resolver: zodResolver(editorSchema),
    defaultValues: {
      name: "",
      email: "",
      experience: "",
      bio: "",
      location: "",
      website: "",
      twitter: "",
      linkedin: "",
      facebook: "",
      instagram: "",
      github: "",
      isActive: true,
    },
  });

  const values = watch();

  const previewName = values.name?.trim() || "Sara Chen";
  const previewRole = values.experience?.trim() || "Senior Editor";
  const previewBio =
    values.bio?.trim() ||
    "Sara Chen is a senior editor covering technology and culture...";

  // ============================================================
  // PHOTO HANDLING
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
  };

  const clearPhoto = () => {
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhoto(null);
    setPhotoPreview(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  // ============================================================
  // SUBMIT
  // ============================================================

  const onSubmit = async (data: EditorFormValues) => {
    setSubmitting(true);

    const toastId = toast.loading("Creating editor…");

    try {
      const formData = new FormData();
      Object.entries(data).forEach(([k, v]) => {
        if (v !== undefined && v !== null) formData.append(k, String(v));
      });
      if (photo) formData.append("photo", photo);

      const result = await createEditor(formData);

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

      toast.success(`Editor "${result.editor.name}" created!`, {
        id: toastId,
        description: "Their profile is now live across Alentah.",
      });

      router.push("/admin/editors");
      router.refresh();
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again.",
        { id: toastId },
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_320px] gap-8">
      {/* ============================================
          MAIN FORM
          ============================================ */}
      <form onSubmit={handleSubmit(onSubmit)} className="min-w-0">
      

        {/* ============================================
            FORM CARD
            ============================================ */}
        <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 space-y-8">
          {/* ─── IDENTITY ─── */}
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

          {/* ─── PROFILE PHOTO ─── */}
          <section>
            <h2 className="text-[10px] uppercase tracking-[0.2em] text-primary font-semibold mb-4">
              Profile Photo
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-[200px_1fr] gap-6 items-start">
              {/* Dropzone */}
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
                  {photoPreview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={photoPreview}
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

                  {photoPreview && (
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
              </div>

              {/* Photo credit + preview */}
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

                {photoPreview && (
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <div className="h-12 w-12 rounded-full overflow-hidden border border-border shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={photoPreview}
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

          {/* ─── BIO + SOCIALS ─── */}
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
                  placeholder="Sara Chen is a senior editor covering technology and culture..."
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

          {/* ─── STATUS ─── */}
          <section>
            <h2 className="text-[10px] uppercase tracking-[0.2em] text-primary font-semibold mb-4">
              Status
            </h2>
            <div className="flex items-center gap-4">
              <label className="inline-flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="status"
                  defaultChecked
                  className="accent-primary"
                />
                <span className="text-sm font-medium">Active</span>
              </label>
              <label className="inline-flex items-center gap-2 cursor-pointer">
                <input type="radio" name="status" className="accent-primary" />
                <span className="text-sm text-muted-foreground">Inactive</span>
              </label>
            </div>
          </section>
        </div>

        {/* ─── BOTTOM ACTION BAR ─── */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-card px-6 py-4">
          <p className="text-[11px] text-muted-foreground flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            Draft will be saved automatically
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
              disabled={submitting || !isDirty}
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
                  Creating…
                </>
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  Create Editor
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* ============================================
          PREVIEW SIDEBAR
          ============================================ */}
      <aside className="xl:sticky xl:top-24 h-fit">
        <div className="rounded-2xl border border-border bg-muted/40 p-6">
          <h2 className="text-[10px] uppercase tracking-[0.2em] text-primary font-semibold mb-5">
            Preview
          </h2>

          <div className="rounded-2xl border border-border bg-card p-6 text-center">
            <div className="mx-auto h-24 w-24 rounded-full overflow-hidden border border-border mb-4">
              {photoPreview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={photoPreview}
                  alt="Preview"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center bg-muted text-muted-foreground">
                  <UserIcon className="h-8 w-8" strokeWidth={1.5} />
                </div>
              )}
            </div>

            <p className="font-serif text-2xl tracking-tight">
              {previewName}
            </p>
            <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              {previewRole}
            </p>
            <p className="mt-4 text-[12px] italic text-muted-foreground leading-relaxed">
              {previewBio}
            </p>

            {/* Social icons preview */}
            <div className="mt-5 flex items-center justify-center gap-3 text-muted-foreground/70">
              {values.twitter && <TwitterIcon className="h-4 w-4" />}
              {values.linkedin && <LinkedinIcon className="h-4 w-4" />}
              {values.facebook && <FacebookIcon className="h-4 w-4" />}
              {values.instagram && <InstagramIcon className="h-4 w-4" />}
              {values.github && <GithubIcon className="h-4 w-4" />}
              {values.website && <Globe className="h-4 w-4" />}
            </div>
          </div>

          <div className="mt-6">
            <p className="text-[10px] uppercase tracking-[0.2em] text-primary font-semibold mb-3">
              Before you publish
            </p>
            <ul className="space-y-2">
              <ChecklistItem done={!!values.name?.trim()} label="Name added" />
              <ChecklistItem done={!!values.email?.trim()} label="Email added" />
              <ChecklistItem done={!!photo} label="Photo uploaded" />
              <ChecklistItem done={!!values.bio?.trim()} label="Bio written" />
              <ChecklistItem
                done={!!values.experience?.trim()}
                label="Role set"
              />
            </ul>
            <p className="mt-4 text-[11px] italic text-muted-foreground">
              An invite email will be sent to the editor.
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

function ChecklistItem({ done, label }: { done: boolean; label: string }) {
  return (
    <li className="flex items-center gap-2 text-[12px]">
      <span
        className={cn(
          "h-4 w-4 rounded border inline-flex items-center justify-center shrink-0",
          done
            ? "border-primary bg-primary text-primary-foreground"
            : "border-border bg-transparent",
        )}
      >
        {done && <Check className="h-3 w-3" strokeWidth={3} />}
      </span>
      <span className={cn(done ? "text-foreground" : "text-muted-foreground")}>
        {label}
      </span>
    </li>
  );
}