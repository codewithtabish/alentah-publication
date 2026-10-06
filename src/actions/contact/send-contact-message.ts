// src/actions/contact/send-contact-message.ts
// ============================================================
// sendContactMessage — ALENTAH
// Server action for the contact form.
//
// Two emails:
//   1. Notification → CONTACT_INBOX_EMAIL
//   2. Auto-reply   → the sender (with optional copy)
//
// Env required:
//   RESEND_API_KEY
//   RESEND_FROM_EMAIL
//   CONTACT_INBOX_EMAIL
// ============================================================

"use server";

import { Resend } from "resend";
import {
  buildContactNotificationEmail,
  buildContactAutoReplyEmail,
} from "@/lib/resend/contact-emails";

const resend = new Resend(process.env.RESEND_API_KEY);

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const IS_DEV = process.env.NODE_ENV === "development";

const ALLOWED_SUBJECTS = new Set([
  "editorial",
  "correction",
  "partnership",
  "feedback",
  "other",
]);

export type ContactResult =
  | { success: true; message: string }
  | { success: false; error: string; field?: string };

function envError(name: string): ContactResult {
  return {
    success: false,
    error: IS_DEV
      ? `Dev: ${name} is missing in .env.local`
      : "Something went wrong. Please try again.",
  };
}

export async function sendContactMessage(
  formData: FormData,
): Promise<ContactResult> {
  const rawName = formData.get("name");
  const rawEmail = formData.get("email");
  const rawSubject = formData.get("subject");
  const rawMessage = formData.get("message");
  const rawCopy = formData.get("copy");

  const name = typeof rawName === "string" ? rawName.trim() : "";
  const email =
    typeof rawEmail === "string" ? rawEmail.trim().toLowerCase() : "";
  const subject = typeof rawSubject === "string" ? rawSubject.trim() : "";
  const message = typeof rawMessage === "string" ? rawMessage.trim() : "";
  const sendCopy = rawCopy === "on" || rawCopy === "true";

  // ── Validate ──
  if (name.length < 2) {
    return { success: false, error: "Please enter your name.", field: "name" };
  }
  if (!email || !EMAIL_RE.test(email)) {
    return {
      success: false,
      error: "Please enter a valid email address.",
      field: "email",
    };
  }
  if (!ALLOWED_SUBJECTS.has(subject)) {
    return {
      success: false,
      error: "Please choose a subject.",
      field: "subject",
    };
  }
  if (message.length < 10) {
    return {
      success: false,
      error: "Your message is a little short. Tell us more.",
      field: "message",
    };
  }
  if (message.length > 5000) {
    return {
      success: false,
      error: "Your message is too long. Please trim to 5,000 characters.",
      field: "message",
    };
  }

  // ── Env guard ──
  if (!process.env.RESEND_API_KEY) {
    console.error("[sendContactMessage] RESEND_API_KEY is not set");
    return envError("RESEND_API_KEY");
  }
  if (!process.env.RESEND_FROM_EMAIL) {
    console.error("[sendContactMessage] RESEND_FROM_EMAIL is not set");
    return envError("RESEND_FROM_EMAIL");
  }
  if (!process.env.CONTACT_INBOX_EMAIL) {
    console.error("[sendContactMessage] CONTACT_INBOX_EMAIL is not set");
    return envError("CONTACT_INBOX_EMAIL");
  }

  const from = process.env.RESEND_FROM_EMAIL;
  const inbox = process.env.CONTACT_INBOX_EMAIL;

  // ── 1. Notification to editorial inbox ──
  try {
    const { subject: notifSubject, html, text } =
      buildContactNotificationEmail({
        name,
        email,
        subject,
        message,
        sendCopy,
      });

    const { error } = await resend.emails.send({
      from,
      to: inbox,
      replyTo: email,
      subject: notifSubject,
      html,
      text,
    });

    if (error) {
      console.error("[sendContactMessage] Notification failed:", error);
      return {
        success: false,
        error:
          IS_DEV && error.message
            ? `Dev: ${error.message}`
            : "We couldn't deliver your message. Please try again.",
      };
    }
  } catch (err) {
    console.error("[sendContactMessage] Notification threw:", err);
    return {
      success: false,
      error: "We couldn't deliver your message. Please try again.",
    };
  }

  // ── 2. Auto-reply to the sender (best-effort) ──
  try {
    const { subject: replySubject, html, text } = buildContactAutoReplyEmail({
      name,
      subject,
      message,
      includeCopy: sendCopy,
    });

    const { error } = await resend.emails.send({
      from,
      to: email,
      replyTo: inbox,
      subject: replySubject,
      html,
      text,
    });

    if (error) {
      console.error("[sendContactMessage] Auto-reply failed:", error);
    }
  } catch (err) {
    console.error("[sendContactMessage] Auto-reply threw:", err);
  }

  console.log(`[sendContactMessage] Delivered from ${email} (${subject})`);

  return {
    success: true,
    message:
      "Thanks — your message is on its way. We'll reply within 5–7 days.",
  };
}