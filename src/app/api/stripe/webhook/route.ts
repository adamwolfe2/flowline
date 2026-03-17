import { NextResponse } from "next/server";
import Stripe from "stripe";
import { db } from "@/db";
import { logger } from "@/lib/logger";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ received: true });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig) return NextResponse.json({ error: "Missing signature" }, { status: 400 });

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const PRO_PRICES = [process.env.STRIPE_PRO_MONTHLY_PRICE_ID, process.env.STRIPE_PRO_ANNUAL_PRICE_ID];
  const AGENCY_PRICES = [process.env.STRIPE_AGENCY_MONTHLY_PRICE_ID, process.env.STRIPE_AGENCY_ANNUAL_PRICE_ID];

  function getPlan(priceId: string): "pro" | "agency" | "free" {
    if (PRO_PRICES.includes(priceId)) return "pro";
    if (AGENCY_PRICES.includes(priceId)) return "agency";
    return "free";
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const clerkUserId = session.metadata?.clerkUserId;
        if (!clerkUserId || !session.subscription) break;
        const sub = await stripe.subscriptions.retrieve(session.subscription as string);
        const priceId = sub.items.data[0]?.price.id;
        if (priceId) {
          await db.update(users).set({ plan: getPlan(priceId), stripeCustomerId: session.customer as string }).where(eq(users.id, clerkUserId));
        }
        break;
      }
      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        const clerkUserId = sub.metadata?.clerkUserId;
        if (!clerkUserId) break;
        const priceId = sub.items.data[0]?.price.id;
        if (priceId) {
          await db.update(users).set({ plan: getPlan(priceId) }).where(eq(users.id, clerkUserId));
        }
        break;
      }
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const clerkUserId = sub.metadata?.clerkUserId;
        if (clerkUserId) {
          await db.update(users).set({ plan: "free" }).where(eq(users.id, clerkUserId));
        }
        break;
      }
    }
  } catch (error) {
    logger.error("Stripe webhook error", { error: error instanceof Error ? error.message : String(error) });
  }

  return NextResponse.json({ received: true });
}
