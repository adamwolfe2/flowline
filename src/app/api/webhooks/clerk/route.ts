import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { sendWelcomeEmail } from "@/lib/resend";
import { logger } from "@/lib/logger";

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;
  if (!WEBHOOK_SECRET) {
    return new Response("No webhook secret configured", { status: 500 });
  }

  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Missing svix headers", { status: 400 });
  }

  const payload = await req.json();
  const body = JSON.stringify(payload);

  const wh = new Webhook(WEBHOOK_SECRET);
  let evt: WebhookEvent;

  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    logger.error("Clerk webhook signature verification failed", { error: err instanceof Error ? err.message : String(err) });
    return new Response("Invalid signature", { status: 400 });
  }

  if (evt.type === "user.created") {
    const { id, email_addresses } = evt.data;
    const email = email_addresses[0]?.email_address ?? "";

    // Check if user already exists (may have been created by funnel API with placeholder email)
    const [existing] = await db.select({ id: users.id, email: users.email }).from(users).where(eq(users.id, id));

    if (!existing) {
      await db.insert(users).values({ id, email }).onConflictDoNothing();
      if (email) {
        sendWelcomeEmail(email).catch(() => {});
      }
    } else if (email && existing.email !== email) {
      // User exists but with placeholder email — update to real Clerk email
      await db.update(users).set({ email }).where(eq(users.id, id));
    }
  }

  return new Response("OK", { status: 200 });
}
