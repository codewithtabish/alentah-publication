"use client";

// ============================================================
// Category Banner Uploader — ALENTAH
// Drag & drop cover image → upload → CloudFront URL
// ============================================================

import * as React from "react";
import Image from "next/image";
import { toast } from "sonner";
import { UploadCloud, Loader2, X, ImageIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { uploadCategoryBannerAction } from "@/actions/images/upload-category-banner-action";

// ============================================================
// TYPES
// ============================================================

interface CategoryBannerUploaderProps {
  value: string;
  onChange: (url: string) => void;
  error?: string;
}

// ============================================================
// COMPONENT
// ============================================================

export function CategoryBannerUploader({
  value,
  onChange,
  error,
}: CategoryBannerUploaderProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);

  const [uploading, setUploading] = React.useState(false);
  const [dragging, setDragging] = React.useState(false);
  const [localPreview, setLocalPreview] = React.useState<string | null>(null);

  // Clean up local preview on unmount
  React.useEffect(() => {
    return () => {
      if (localPreview) URL.revokeObjectURL(localPreview);
    };
  }, [localPreview]);

  // ============================================================
  // UPLOAD
  // ============================================================

  const handleFile = async (picked: File | null) => {
    if (!picked) return;

    // Basic client-side checks
    if (picked.size > 5 * 1024 * 1024) {
      toast.error("Cover image must be smaller than 5 MB.");
      return;
    }

    if (!picked.type.startsWith("image/")) {
      toast.error("Please upload an image file.");
      return;
    }

    // Show instant local preview
    if (localPreview) URL.revokeObjectURL(localPreview);
    setLocalPreview(URL.createObjectURL(picked));

    setUploading(true);
    const toastId = toast.loading("Uploading cover…");

    try {
      const formData = new FormData();
      formData.append("file", picked);

      const result = await uploadCategoryBannerAction(formData);

      if (!result.success) {
        toast.error(result.error, { id: toastId });
        // Revert preview
        if (localPreview) URL.revokeObjectURL(localPreview);
        setLocalPreview(null);
        return;
      }

      toast.success("Cover uploaded!", { id: toastId });
      onChange(result.data.url);

      // Clear local preview — the real URL will display now
      if (localPreview) URL.revokeObjectURL(localPreview);
      setLocalPreview(null);
    } catch (err) {
      console.error("[CategoryBannerUploader] error:", err);
      toast.error(
        err instanceof Error ? err.message : "Upload failed.",
        { id: toastId },
      );
      if (localPreview) URL.revokeObjectURL(localPreview);
      setLocalPreview(null);
    } finally {
      setUploading(false);
    }
  };

  const handleClear = () => {
    if (localPreview) URL.revokeObjectURL(localPreview);
    setLocalPreview(null);
    onChange("");
    if (inputRef.current) inputRef.current.value = "";
  };

  const displayUrl = localPreview ?? value;

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div>
      <div
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          handleFile(e.dataTransfer.files?.[0] ?? null);
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          setDragging(false);
        }}
        onClick={() => !uploading && inputRef.current?.click()}
        className={cn(
          "relative cursor-pointer aspect-video w-full overflow-hidden",
          "rounded-2xl border-2 border-dashed",
          "transition-all duration-200",
          dragging
            ? "border-primary bg-primary/10 scale-[1.01]"
            : "border-border bg-muted/40 hover:border-primary/50",
          uploading && "pointer-events-none opacity-70",
          error && "border-destructive/50",
        )}
      >
        {displayUrl ? (
          <>
            {/* Preview image */}
            <Image
              src={displayUrl}
              alt="Cover preview"
              fill
              sizes="(max-width: 768px) 100vw, 640px"
              className="object-cover"
              unoptimized
            />

            {/* Uploading overlay */}
            {uploading && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/70 backdrop-blur-sm">
                <div className="flex items-center gap-2 rounded-full bg-background px-4 py-2 shadow-lg">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-foreground">
                    Uploading…
                  </span>
                </div>
              </div>
            )}

            {/* Clear button */}
            {!uploading && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleClear();
                }}
                aria-label="Remove cover"
                className={cn(
                  "absolute top-2 right-2 z-10",
                  "inline-flex h-8 w-8 items-center justify-center rounded-full",
                  "border border-border bg-background/90 backdrop-blur",
                  "text-foreground hover:bg-destructive hover:text-destructive-foreground",
                  "transition-colors",
                )}
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </>
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-3 p-6 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <UploadCloud
                className="h-5 w-5 text-primary"
                strokeWidth={1.75}
              />
            </div>
            <div>
              <p className="text-[13px] font-medium text-foreground">
                Drag & drop or click to upload
              </p>
              <p className="mt-1 text-[10px] text-muted-foreground">
                PNG, JPG or WEBP · 16:9 · Max 5MB
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
        className="hidden"
      />

      {/* URL input — for pasting a URL instead */}
      <div className="mt-3">
        <div className="relative">
          <ImageIcon
            className="pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground/70"
            strokeWidth={1.75}
          />
          <input
            type="url"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="or paste an image URL"
            className={cn(
              "h-10 w-full rounded-xl pl-10 pr-3.5",
              "border border-border bg-background text-[12px] text-foreground",
              "placeholder:text-muted-foreground/60",
              "transition-all duration-200",
              "focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/30",
            )}
          />
        </div>
      </div>

      {error && (
        <p className="mt-1.5 text-[10px] text-destructive">{error}</p>
      )}
    </div>
  );
}