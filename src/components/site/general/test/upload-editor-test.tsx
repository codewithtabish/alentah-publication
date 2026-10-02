"use client";

// ============================================================
// Upload Editor Image — Test Component
// Drop into any page to verify the upload pipeline.
// <UploadEditorTest />
// ============================================================

import * as React from "react";
import {
  UploadCloud,
  Loader2,
  CheckCircle2,
  XCircle,
  X,
  Image as ImageIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { uploadEditorAction } from "@/actions/images/upload-editor-image-action";

type UploadResult =
  | {
      success: true;
      data: {
        url: string;
        key: string;
        width: number;
        height: number;
        format: string;
      };
    }
  | { success: false; error: string };

export function UploadEditorTest() {
  const inputRef = React.useRef<HTMLInputElement>(null);

  const [file, setFile] = React.useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
  const [dragging, setDragging] = React.useState(false);
  const [uploading, setUploading] = React.useState(false);
  const [result, setResult] = React.useState<UploadResult | null>(null);

  React.useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleFile = (picked: File | null) => {
    if (!picked) return;

    if (previewUrl) URL.revokeObjectURL(previewUrl);

    setFile(picked);
    setPreviewUrl(URL.createObjectURL(picked));
    setResult(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFile(e.target.files?.[0] ?? null);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files?.[0] ?? null);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
  };

  const clearAll = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(null);
    setPreviewUrl(null);
    setResult(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await uploadEditorAction(formData);
      setResult(res);
    } catch (err) {
      setResult({
        success: false,
        error: err instanceof Error ? err.message : "Unexpected error",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <p className="text-[11px] uppercase tracking-[0.25em] text-primary font-semibold mb-2">
          Test
        </p>
        <h2 className="font-serif text-3xl tracking-tight">
          Upload Editor Image
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Drop a photo, then click Upload. Verifies Sharp → S3 → CloudFront.
        </p>
      </div>

      {/* Dropzone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "relative cursor-pointer",
          "aspect-square w-full max-w-xs mx-auto",
          "rounded-full overflow-hidden",
          "border-2 border-dashed",
          "transition-all duration-200",
          dragging
            ? "border-primary bg-primary/10 scale-[1.02]"
            : "border-border bg-muted/40 hover:border-primary/50",
        )}
      >
        {previewUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={previewUrl}
            alt="Preview"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-3 p-6 text-center">
            <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
              <UploadCloud
                className="h-6 w-6 text-primary"
                strokeWidth={1.75}
              />
            </div>
            <p className="text-sm font-medium">Click or drop image</p>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              PNG · JPG · WebP · AVIF
              <br />
              Max 5 MB
            </p>
          </div>
        )}

        {previewUrl && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              clearAll();
            }}
            className={cn(
              "absolute top-3 right-3 z-10",
              "h-8 w-8 rounded-full",
              "bg-background/90 backdrop-blur",
              "border border-border",
              "inline-flex items-center justify-center",
              "text-foreground hover:bg-destructive hover:text-destructive-foreground",
              "transition-colors",
            )}
            aria-label="Remove image"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif,image/tiff"
        onChange={handleChange}
        className="hidden"
      />

      {/* File meta */}
      {file && (
        <div className="mt-4 mx-auto max-w-xs flex items-center gap-3 text-xs text-muted-foreground">
          <ImageIcon className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} />
          <span className="truncate flex-1">{file.name}</span>
          <span className="shrink-0">
            {(file.size / 1024 / 1024).toFixed(2)} MB
          </span>
        </div>
      )}

      {/* Actions */}
      <div className="mt-8 flex items-center justify-center gap-3">
        <button
          type="button"
          onClick={clearAll}
          disabled={!file || uploading}
          className={cn(
            "inline-flex h-11 items-center justify-center",
            "px-6 rounded-full",
            "border border-border bg-transparent text-foreground",
            "text-[11px] font-semibold uppercase tracking-[0.18em]",
            "hover:bg-accent transition-colors",
            "disabled:opacity-40 disabled:cursor-not-allowed",
          )}
        >
          Clear
        </button>

        <button
          type="button"
          onClick={handleUpload}
          disabled={!file || uploading}
          className={cn(
            "inline-flex h-11 items-center justify-center gap-2",
            "px-6 rounded-full",
            "bg-primary text-primary-foreground",
            "text-[11px] font-semibold uppercase tracking-[0.18em]",
            "hover:bg-primary/90 transition-colors",
            "disabled:opacity-40 disabled:cursor-not-allowed",
          )}
        >
          {uploading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Uploading…
            </>
          ) : (
            <>
              <UploadCloud className="h-4 w-4" />
              Upload
            </>
          )}
        </button>
      </div>

      {/* Result */}
      {result && (
        <div
          className={cn(
            "mt-10 rounded-2xl border p-5",
            result.success
              ? "border-primary/40 bg-primary/5"
              : "border-destructive/40 bg-destructive/5",
          )}
        >
          {result.success ? (
            <>
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                <p className="text-sm font-semibold text-primary">
                  Upload successful
                </p>
              </div>

              <div className="flex items-center gap-4 mb-5">
                <div className="h-20 w-20 rounded-full overflow-hidden border border-border shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={result.data.url}
                    alt="Uploaded avatar"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-muted-foreground mb-1">
                    CloudFront URL
                  </p>
                  <a
                    href={result.data.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[13px] text-primary hover:underline underline-offset-4 break-all"
                  >
                    {result.data.url}
                  </a>
                </div>
              </div>

              <pre className="text-[11px] font-mono leading-relaxed p-3 rounded-lg bg-background border border-border overflow-x-auto">
                {JSON.stringify(result.data, null, 2)}
              </pre>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2 mb-2">
                <XCircle className="h-5 w-5 text-destructive" />
                <p className="text-sm font-semibold text-destructive">
                  Upload failed
                </p>
              </div>
              <p className="text-sm text-foreground/80">{result.error}</p>
            </>
          )}
        </div>
      )}
    </div>
  );
}