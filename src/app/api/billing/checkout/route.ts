import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import Stripe from "stripe";
import { db } from "@/db";
import { logger } from "@/lib/logger";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({ error: "Billing not configured" }, { status: 503 });
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { priceId } = await req.json();
    if (!priceId) return NextResponse.json({ error: "Missing priceId" }, { status: 400 });

    const PRICE_LOOKUP: Record<string, string | undefined> = {
      pro_monthly: process.env.STRIPE_PRO_MONTHLY_PRICE_ID,
      pro_annual: process.env.STRIPE_PRO_ANNUAL_PRICE_ID,
      agency_monthly: process.env.STRIPE_AGENCY_MONTHLY_PRICE_ID,
      agency_annual: process.env.STRIPE_AGENCY_ANNUAL_PRICE_ID,
    };

    const resolvedPriceId = PRICE_LOOKUP[priceId];
    if (!resolvedPriceId) {
      return NextResponse.json({ error: "Invalid or unconfigured plan" }, { status: 400 });
    }

    if (!resolvedPriceId.startsWith("price_")) {
      return NextResponse.json(
        { error: "Stripe price not configured. Set STRIPE_*_PRICE_ID env vars with valid Stripe price IDs." },
        { status: 400 }
      );
    }

    // Fetch user from DB, auto-create if missing (same upsert pattern as POST /api/funnels)
    let [user] = await db.select().from(users).where(eq(users.id, userId));
    if (!user) {
      const clerkUser = await currentUser();
      const email = clerkUser?.emailAddresses?.[0]?.emailAddress || "unknown@getmyvsl.com";
      const inserted = await db.insert(users).values({ id: userId, email }).onConflictDoNothing().returning();
      if (inserted.length > 0) {
        user = inserted[0];
      } else {
        // Race condition: another request created the user between our select and insert
        const [retried] = await db.select().from(users).where(eq(users.id, userId));
        if (!retried) {
          return NextResponse.json({ error: "Account setup failed. Please refresh and try again." }, { status: 500 });
        }
        user = retried;
      }
    } else if (user.email === "unknown@getmyvsl.com") {
      // Fix placeholder email if it was set before Clerk webhook ran
      const clerkUser = await currentUser();
      const email = clerkUser?.emailAddresses?.[0]?.emailAddress;
      if (email) {
        await db.update(users).set({ email }).where(eq(users.id, userId));
        user = { ...user, email };
      }
    }
    let customerId = user.stripeCustomerId;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { clerkUserId: userId },
      });
      customerId = customer.id;
      await db.update(users).set({ stripeCustomerId: customerId }).where(eq(users.id, userId));
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://getmyvsl.com";
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [{ price: resolvedPriceId, quantity: 1 }],
      mode: "subscription",
      success_url: `${appUrl}/dashboard?upgraded=true`,
      cancel_url: `${appUrl}/billing`,
      metadata: { clerkUserId: userId },
      subscription_data: { metadata: { clerkUserId: userId } },
      allow_promotion_codes: true,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    const type = error instanceof Error ? error.constructor.name : typeof error;
    logger.error("Checkout error", { error: msg, type });
    return NextResponse.json({ error: "Checkout failed. Please try again or contact support." }, { status: 500 });
  }
}
