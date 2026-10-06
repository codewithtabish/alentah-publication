// src/actions/newsletter/subscribe-to-newsletter.ts
// ============================================================
// subscribeToNewsletter — ALENTAH
// Server action. Does three things:
//   1. Saves the subscriber to OUR database (NewsletterSubscriber)
//   2. Adds them to a Resend audience
//   3. Sends them a welcome email
//
// Env required (in .env.local):
//   RESEND_API_KEY       — your Resend API key
//   RESEND_AUDIENCE_ID   — the audience to add contacts to
//   RESEND_FROM_EMAIL    — e.g. "Alentah <hello@alentah.com>"
// ============================================================

"use server";

import { Resend } from "resend";
import prisma from "@/lib/clients/prisma-client";
import { CACHE_TAGS } from "@/lib/cache-keys";
import { revalidateTag } from "next/cache";
import { buildWelcomeEmail } from "@/lib/resend/welcome-email";

const resend = new Resend(process.env.RESEND_API_KEY);

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const IS_DEV = process.env.NODE_ENV === "development";

// ────────────────────────────────────────────────────────────
// TYPES
// ────────────────────────────────────────────────────────────

export type SubscribeResult =
  | { success: true; message: string }
  | { success: false; error: string };

// ────────────────────────────────────────────────────────────
// HELPERS
// ────────────────────────────────────────────────────────────

function envError(name: string): SubscribeResult {
  return {
    success: false,
    error: IS_DEV
      ? `Dev: ${name} is missing in .env.local`
      : "Subscription is temporarily unavailable.",
  };
}

// ────────────────────────────────────────────────────────────
// MAIN ACTION
// ────────────────────────────────────────────────────────────

export async function subscribeToNewsletter(
  formData: FormData,
): Promise<SubscribeResult> {
  const rawEmail = formData.get("email");
  const rawSource = formData.get("source");

  const email =
    typeof rawEmail === "string" ? rawEmail.trim().toLowerCase() : "";
  const source =
    typeof rawSource === "string" && rawSource.trim().length > 0
      ? rawSource.trim()
      : "unknown";

  // ── 1. Validate ──
  if (!email || !EMAIL_RE.test(email)) {
    return { success: false, error: "Please enter a valid email address." };
  }

  // ── 2. Env guard ──
  if (!process.env.RESEND_API_KEY) {
    console.error("[subscribeToNewsletter] RESEND_API_KEY is not set");
    return envError("RESEND_API_KEY");
  }
  if (!process.env.RESEND_AUDIENCE_ID) {
    console.error("[subscribeToNewsletter] RESEND_AUDIENCE_ID is not set");
    return envError("RESEND_AUDIENCE_ID");
  }
  if (!process.env.RESEND_FROM_EMAIL) {
    console.error("[subscribeToNewsletter] RESEND_FROM_EMAIL is not set");
    return envError("RESEND_FROM_EMAIL");
  }

  // ── 3. Save to OUR database ──
  // If they already exist, we treat them as "already subscribed"
  // and skip both Resend and the welcome email.
  let isDuplicate = false;
  let dbRecordId: string | null = null;

  try {
    const existing = await prisma.newsletterSubscriber.findUnique({
      where: { email },
      select: { id: true, status: true },
    });

    if (existing) {
      isDuplicate = true;
      dbRecordId = existing.id;

      // If they had unsubscribed previously and are resubscribing,
      // flip their status back to SUBSCRIBED.
      if (existing.status === "UNSUBSCRIBED") {
        await prisma.newsletterSubscriber.update({
          where: { id: existing.id },
          data: {
            status: "SUBSCRIBED",
            subscribedAt: new Date(),
            unsubscribedAt: null,
          },
        });
        isDuplicate = false; // treat as a fresh subscription
      }
    } else {
      const created = await prisma.newsletterSubscriber.create({
        data: {
          email,
          status: "SUBSCRIBED",
          subscribedAt: new Date(),
        },
        select: { id: true },
      });
      dbRecordId = created.id;
    }
  } catch (err) {
    console.error("[subscribeToNewsletter] DB error:", err);
    return {
      success: false,
      error: "Something went wrong. Please try again.",
    };
  }

  // ── 4. Add to Resend audience ──
  // Best-effort. If Resend fails, we still keep the DB record
  // and show the reader a success message — we can retry later.
  if (!isDuplicate) {
    try {
      const { error } = await resend.contacts.create({
        email,
        audienceId: process.env.RESEND_AUDIENCE_ID,
        unsubscribed: false,
      });

      if (error) {
        const message = (error.message ?? "").toLowerCase();
        const alreadyInResend =
          message.includes("already") || message.includes("exists");

        if (!alreadyInResend) {
          console.error(
            "[subscribeToNewsletter] Resend contacts error:",
            error,
          );
          // Don't fail the whole thing — the DB has them.
        }
      }
    } catch (err) {
      console.error("[subscribeToNewsletter] Resend contacts threw:", err);
      // Same — log and continue.
    }
  }

  // ── 5. Send welcome email ──
  if (!isDuplicate) {
    try {
      const { subject, html, text } = buildWelcomeEmail();

      const { error: emailError } = await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL,
        to: email,
        subject,
        html,
        text,
        replyTo: "hello@alentah.com",
      });

      if (emailError) {
        console.error(
          "[subscribeToNewsletter] Welcome email failed:",
          emailError,
        );
      }
    } catch (err) {
      console.error("[subscribeToNewsletter] Welcome email threw:", err);
    }
  }

  // ── 6. Invalidate newsletter cache ──
  // So the admin dashboard reflects the new count.
  try {
    revalidateTag(CACHE_TAGS.newsletterSubscribers, { expire: 0 });
  } catch {
    /* ignore — cache invalidation is best-effort */
  }

  console.log(
    `[subscribeToNewsletter] ${isDuplicate ? "duplicate" : "new"} subscriber via ${source} (db: ${dbRecordId ?? "n/a"})`,
  );

  return {
    success: true,
    message: isDuplicate
      ? "You're already on the list. See you Sunday."
      : "You're in. Check your inbox for a welcome note.",
  };
}