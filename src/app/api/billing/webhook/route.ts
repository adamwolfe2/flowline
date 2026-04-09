import { NextResponse } from "next/server";
import Stripe from "stripe";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { logger } from "@/lib/logger";

export async function POST(req: Request) {
  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: "Billing not configured" }, { status: 503 });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  let event: Stripe.Event;

  try {
    if (webhookSecret && signature) {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } else {
      // Degrade gracefully when webhook secret is not configured (local dev)
      event = JSON.parse(body) as Stripe.Event;
    }
  } catch (err) {
    logger.error("Stripe webhook signature verification failed", {
      error: err instanceof Error ? err.message : String(err),
    });
    return NextResponse.json({ error: "Webhook signature invalid" }, { status: 400 });
  }

  try {
    if (event.type === "customer.subscription.trial_will_end") {
      const subscription = event.data.object as Stripe.Subscription;
      await handleTrialWillEnd(subscription);
    } else if (event.type === "customer.subscription.updated") {
      const subscription = event.data.object as Stripe.Subscription;
      const previousAttributes = event.data.previous_attributes as Partial<Stripe.Subscription> | undefined;
      await handleSubscriptionUpdated(subscription, previousAttributes);
    } else if (event.type === "customer.subscription.deleted") {
      const subscription = event.data.object as Stripe.Subscription;
      await handleSubscriptionDeleted(subscription);
    } else if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      await handleCheckoutCompleted(session, stripe);
    }
  } catch (err) {
    logger.error("Stripe webhook handler error", {
      eventType: event.type,
      error: err instanceof Error ? err.message : String(err),
    });
    // Return 200 to prevent Stripe retries for handler errors
    return NextResponse.json({ received: true });
  }

  return NextResponse.json({ received: true });
}

async function getUserByStripeCustomerId(customerId: string) {
  const [user] = await db.select().from(users).where(eq(users.stripeCustomerId, customerId));
  return user ?? null;
}

async function handleTrialWillEnd(subscription: Stripe.Subscription) {
  if (!process.env.RESEND_API_KEY) return;

  const customerId = typeof subscription.customer === "string"
    ? subscription.customer
    : subscription.customer.id;

  const user = await getUserByStripeCustomerId(customerId);
  if (!user) return;

  const trialEnd = subscription.trial_end;
  if (!trialEnd) return;

  const trialEndsAt = new Date(trialEnd * 1000);
  const now = new Date();
  const daysRemaining = Math.ceil((trialEndsAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  if (daysRemaining <= 0) return;

  const { Resend } = await import("resend");
  const resend = new Resend(process.env.RESEND_API_KEY);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://getmyvsl.com";

  try {
    await resend.emails.send({
      from: "MyVSL <noreply@getmyvsl.com>",
      to: user.email,
      subject: "Your MyVSL Pro trial ends soon",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin:0;padding:0;background-color:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f9fafb;padding:40px 20px;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb;">
                  <tr>
                    <td style="padding:24px 32px;border-bottom:1px solid #f3f4f6;">
                      <span style="font-size:16px;font-weight:600;color:#111827;">MyVSL</span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:32px;color:#374151;font-size:15px;line-height:1.6;">
                      <p style="margin:0 0 16px 0;">Hi there,</p>
                      <p style="margin:0 0 16px 0;">Your 14-day free Pro trial ends in <strong>${daysRemaining} day${daysRemaining === 1 ? "" : "s"}</strong>.</p>
                      <p style="margin:0 0 24px 0;">To keep access to all Pro features — advanced analytics, custom domains, unlimited submissions, and more — upgrade before your trial ends.</p>
                      <p style="margin:0 0 0 0;">
                        <a href="${appUrl}/billing" style="display:inline-block;background-color:#2D6A4F;color:#ffffff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;">
                          Upgrade Now
                        </a>
                      </p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:20px 32px;background-color:#f9fafb;border-top:1px solid #f3f4f6;">
                      <p style="margin:0;font-size:11px;color:#9ca3af;">
                        Sent by <a href="${appUrl}" style="color:#9ca3af;">MyVSL</a>
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    });
  } catch (emailErr) {
    logger.error("Trial reminder email failed", {
      userId: user.id,
      error: emailErr instanceof Error ? emailErr.message : String(emailErr),
    });
  }
}

async function handleSubscriptionUpdated(
  subscription: Stripe.Subscription,
  previousAttributes: Partial<Stripe.Subscription> | undefined,
) {
  const customerId = typeof subscription.customer === "string"
    ? subscription.customer
    : subscription.customer.id;

  const user = await getUserByStripeCustomerId(customerId);
  if (!user) return;

  const clerkUserId = subscription.metadata?.clerkUserId;
  const targetUserId = clerkUserId ?? user.id;

  // Trial ended → subscription became active
  const wasTrialing = previousAttributes?.status === "trialing";
  const isNowActive = subscription.status === "active";

  if (wasTrialing && isNowActive) {
    await db.update(users)
      .set({ plan: "pro", trialEndsAt: null })
      .where(eq(users.id, targetUserId));
    return;
  }

  // Keep trialEndsAt in sync while subscription is trialing
  if (subscription.status === "trialing" && subscription.trial_end) {
    const trialEndsAt = new Date(subscription.trial_end * 1000);
    await db.update(users)
      .set({ plan: "pro", trialEndsAt })
      .where(eq(users.id, targetUserId));
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const customerId = typeof subscription.customer === "string"
    ? subscription.customer
    : subscription.customer.id;

  const user = await getUserByStripeCustomerId(customerId);
  if (!user) return;

  const clerkUserId = subscription.metadata?.clerkUserId;
  const targetUserId = clerkUserId ?? user.id;

  await db.update(users)
    .set({ plan: "free", trialEndsAt: null })
    .where(eq(users.id, targetUserId));
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session, stripe: Stripe) {
  if (session.mode !== "subscription") return;

  const clerkUserId = session.metadata?.clerkUserId;
  if (!clerkUserId) return;

  const subscriptionId = typeof session.subscription === "string"
    ? session.subscription
    : session.subscription?.id;

  if (!subscriptionId) return;

  const subscription = await stripe.subscriptions.retrieve(subscriptionId);

  if (subscription.status === "trialing" && subscription.trial_end) {
    const trialEndsAt = new Date(subscription.trial_end * 1000);
    await db.update(users)
      .set({ plan: "pro", trialEndsAt, hadTrial: true })
      .where(eq(users.id, clerkUserId));
  } else if (subscription.status === "active") {
    await db.update(users)
      .set({ plan: "pro", trialEndsAt: null })
      .where(eq(users.id, clerkUserId));
  }
}
