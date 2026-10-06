"use client";

// ============================================================
// MailLink — ALENTAH
// A bulletproof mailto link.
//
// Why it exists:
//   Inside Next.js App Router pages, plain `<a href="mailto:...">`
//   anchors can sometimes get swallowed by client-side navigation
//   interceptors (especially when nested inside server components).
//   This component forces the mail client to open via
//   window.location.href, and prevents any click defaults.
// ============================================================

import * as React from "react";
import { cn } from "@/lib/utils";

export interface MailLinkProps
  extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href"> {
  email: string;
  subject?: string;
  body?: string;
  children: React.ReactNode;
}

export function MailLink({
  email,
  subject,
  body,
  className,
  children,
  onClick,
  ...rest
}: MailLinkProps) {
  const handleClick = React.useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      // Let the caller handle it first
      if (onClick) onClick(e);

      // Build the mailto URL with optional subject/body
      const params = new URLSearchParams();
      if (subject) params.set("subject", subject);
      if (body) params.set("body", body);
      const query = params.toString();
      const mailto = `mailto:${email}${query ? `?${query}` : ""}`;

      // Force navigation — this bypasses any Next.js interception
      e.preventDefault();
      window.location.href = mailto;
    },
    [email, subject, body, onClick],
  );

  // Keep the real href for accessibility/copy-link/right-click
  const href = `mailto:${email}${
    subject || body
      ? `?${new URLSearchParams({
          ...(subject ? { subject } : {}),
          ...(body ? { body } : {}),
        }).toString()}`
      : ""
  }`;

  return (
    <a
      href={href}
      onClick={handleClick}
      className={cn(className)}
      {...rest}
    >
      {children}
    </a>
  );
}