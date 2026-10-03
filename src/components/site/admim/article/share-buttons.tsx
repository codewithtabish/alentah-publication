"use client";

import { Share2, Bookmark } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ShareButtonsProps {
  url: string;
  title: string;
}

export function ShareButtons({ url, title }: ShareButtonsProps) {
  const fullUrl =
    typeof window !== "undefined" ? window.location.origin + url : url;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(fullUrl);
      toast.success("Link copied");
    } catch {
      toast.error("Failed to copy");
    }
  };

  return (
    <div className="flex items-center gap-1.5">
      <button
        type="button"
        onClick={handleCopy}
        aria-label="Copy link"
        title="Copy link"
        className={cn(
          "inline-flex h-9 w-9 items-center justify-center rounded-full",
          "border border-border text-muted-foreground",
          "transition-colors hover:bg-accent hover:text-foreground",
        )}
      >
        <Share2 className="h-3.5 w-3.5" strokeWidth={1.75} />
      </button>

      <button
        type="button"
        aria-label="Save"
        title="Save"
        className={cn(
          "inline-flex h-9 w-9 items-center justify-center rounded-full",
          "border border-border text-muted-foreground",
          "transition-colors hover:bg-accent hover:text-foreground",
        )}
      >
        <Bookmark className="h-3.5 w-3.5" strokeWidth={1.75} />
      </button>
    </div>
  );
}