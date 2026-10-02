// src/app/api/webhooks/clerk/route.ts
// ============================================================
// Clerk Webhook Handler — ALENTAH
// Handles: user.created, user.updated, session.created, user.deleted
// ============================================================

import { ADMIN_EMAILS } from "@/lib/admin-emails";
import { CACHE_TAGS } from "@/lib/cache-keys";
import prisma from "@/lib/clients/prisma-client";
import { WebhookEvent, clerkClient } from "@clerk/nextjs/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { headers } from "next/headers";
import { Webhook } from "svix";

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SIGNING_SECRET;

  if (!WEBHOOK_SECRET) {
    console.error("[Clerk Webhook] Missing CLERK_WEBHOOK_SIGNING_SECRET");
    return new Response("Missing CLERK_WEBHOOK_SIGNING_SECRET", {
      status: 500,
    });
  }

  const headerPayload = await headers();
  const svixId = headerPayload.get("svix-id");
  const svixTimestamp = headerPayload.get("svix-timestamp");
  const svixSignature = headerPayload.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    return new Response("Missing Svix headers", { status: 400 });
  }

  // IMPORTANT: Use req.text() — NOT req.json(). Parsing JSON
  // before verification would change the body and break the signature.
  const payload = await req.text();
  const wh = new Webhook(WEBHOOK_SECRET);

  // ─────────────────────────────────────────────
  // 1. Verify the signature (Svix returns nothing on success)
  // ─────────────────────────────────────────────
  try {
    wh.verify(payload, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    });
  } catch (err) {
    console.error("[Clerk Webhook] Verification failed:", err);
    return new Response("Invalid webhook", { status: 400 });
  }

  // ─────────────────────────────────────────────
  // 2. Parse the payload AFTER verification passes
  // ─────────────────────────────────────────────
  let evt: WebhookEvent;
  try {
    evt = JSON.parse(payload) as WebhookEvent;
  } catch (err) {
    console.error("[Clerk Webhook] JSON parse failed:", err);
    return new Response("Invalid JSON", { status: 400 });
  }

  const eventType = evt.type;

  try {
    switch (eventType) {
      // ─────────────────────────────────────────────
      // USER CREATED
      // ─────────────────────────────────────────────
      case "user.created": {
        const data = evt.data;

        const email =
          data.email_addresses?.find(
            (e) => e.id === data.primary_email_address_id,
          )?.email_address ??
          data.email_addresses?.[0]?.email_address ??
          null;

        if (!email) {
          console.warn(
            "[Clerk Webhook] user.created without email, skipping:",
            data.id,
          );
          break;
        }

        const role: "USER" | "ADMIN" = ADMIN_EMAILS.includes(
          email.toLowerCase(),
        )
          ? "ADMIN"
          : "USER";

        // 1. Create or sync the User
        const user = await prisma.user.upsert({
          where: { clerkId: data.id },
          update: {
            firstName: data.first_name ?? null,
            lastName: data.last_name ?? null,
            email,
            imageUrl: data.image_url ?? null,
            role,
          },
          create: {
            clerkId: data.id,
            firstName: data.first_name ?? null,
            lastName: data.last_name ?? null,
            email,
            imageUrl: data.image_url ?? null,
            role,
          },
        });

        // 2. If admin → auto-create linked Editor record
        if (role === "ADMIN") {
          const fullName =
            `${data.first_name ?? ""} ${data.last_name ?? ""}`.trim() || email;

          await prisma.editor.upsert({
            where: { email },
            update: {
              userId: user.id,
              name: fullName,
              imageUrl: data.image_url ?? null,
              isActive: true,
            },
            create: {
              userId: user.id,
              email,
              name: fullName,
              imageUrl: data.image_url ?? null,
              isActive: true,
            },
          });
        }

        // 3. Invalidate caches
        revalidateTag(CACHE_TAGS.users, "max");
        revalidateTag(CACHE_TAGS.home, "max");

        // 4. Mirror role into Clerk publicMetadata
        try {
          const client = await clerkClient();
          await client.users.updateUserMetadata(data.id, {
            publicMetadata: { role },
          });
        } catch (metaErr) {
          console.error(
            "[Clerk Webhook] Failed to sync metadata for",
            data.id,
            metaErr,
          );
        }

        console.log("[Clerk Webhook] User created:", data.id, "role:", role);
        break;
      }

      // ─────────────────────────────────────────────
      // USER UPDATED
      // ─────────────────────────────────────────────
      case "user.updated": {
        const data = evt.data;

        const email =
          data.email_addresses?.find(
            (e) => e.id === data.primary_email_address_id,
          )?.email_address ??
          data.email_addresses?.[0]?.email_address ??
          null;

        await prisma.user.updateMany({
          where: { clerkId: data.id },
          data: {
            firstName: data.first_name ?? null,
            lastName: data.last_name ?? null,
            ...(email ? { email } : {}),
            imageUrl: data.image_url ?? null,
          },
        });

        // Keep Editor record in sync
        if (email) {
          const updatedEditor = await prisma.editor.updateMany({
            where: { email },
            data: {
              name:
                `${data.first_name ?? ""} ${data.last_name ?? ""}`.trim() ||
                email,
              imageUrl: data.image_url ?? null,
            },
          });

          if (updatedEditor.count > 0) {
            revalidateTag(CACHE_TAGS.editors, "max");
          }
        }

        revalidateTag(CACHE_TAGS.users, "max");
        revalidatePath("/dashboard/users");

        console.log("[Clerk Webhook] User updated:", data.id);
        break;
      }

      // ─────────────────────────────────────────────
      // SESSION CREATED (login)
      // ─────────────────────────────────────────────
      case "session.created": {
        const data = evt.data as { user_id: string };

        if (data.user_id) {
          await prisma.user.updateMany({
            where: { clerkId: data.user_id },
            data: {
              lastLoginAt: new Date(),
              lastSeenAt: new Date(),
            },
          });
          revalidateTag(CACHE_TAGS.users, "max");
          revalidatePath("/dashboard/users");

          console.log("[Clerk Webhook] Login tracked:", data.user_id);
        }
        break;
      }

      // ─────────────────────────────────────────────
      // USER DELETED
      // ─────────────────────────────────────────────
      case "user.deleted": {
        const data = evt.data;

        if (data.id) {
          // Unlink Editor first (keep record, set userId = null)
          const existingUser = await prisma.user.findUnique({
            where: { clerkId: data.id },
            select: { id: true, email: true },
          });

          if (existingUser?.email) {
            await prisma.editor.updateMany({
              where: { email: existingUser.email },
              data: { userId: null, isActive: false },
            });
            revalidateTag(CACHE_TAGS.editors, "max");
          }

          // Delete User row
          await prisma.user.deleteMany({
            where: { clerkId: data.id },
          });

          console.log("[Clerk Webhook] User deleted:", data.id);
          revalidateTag(CACHE_TAGS.users, "max");
          revalidatePath("/dashboard/users");
        }
        break;
      }

      default:
        // Ignore other events (organization.*, etc.)
        break;
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error("[Clerk Webhook] Error:", error);
    return new Response("Webhook Error: " + (error as Error).message, {
      status: 500,
    });
  }
}