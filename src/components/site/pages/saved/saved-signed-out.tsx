// src/components/site/pages/saved/saved-signed-out.tsx
// ============================================================
// SavedSignedOut — shown when a signed-out visitor opens /saved
// ============================================================

"use client";

import { SignInButton } from "@clerk/nextjs";
import { Bookmark } from "lucide-react";

export function SavedSignedOut() {
  return (
    <section className="flex flex-col items-center px-4 py-16 text-center sm:py-24">
      <div className="mb-6 flex size-16 items-center justify-center rounded-full border border-border bg-muted/40">
        <Bookmark
          className="size-7 text-primary"
          strokeWidth={1.5}
          aria-hidden="true"
        />
      </div>

      <h2 className="font-serif text-2xl tracking-[-0.02em] text-foreground sm:text-[1.75rem]">
        Sign in to see your saved stories.
      </h2>

      <p className="mt-3 max-w-md text-[14px] leading-7 text-muted-foreground sm:text-[15px]">
        Your reading list is tied to your account, so you can pick up
        where you left off on any device.
      </p>

      <SignInButton
        mode="modal"
        forceRedirectUrl="/saved"
        signUpForceRedirectUrl="/saved"
      >
        <button
          type="button"
          className={[
            "mt-8 inline-flex h-11 items-center justify-center rounded-full px-6",
            "bg-primary text-primary-foreground",
            "text-[11px] font-semibold uppercase tracking-[0.18em]",
            "transition-colors hover:bg-primary/90",
          ].join(" ")}
        >
          Sign in
        </button>
      </SignInButton>
    </section>
  );
}