import { NextRequest, NextResponse } from "next/server";
import { getFunnelById } from "@/db/queries/funnels";
import { insertLead } from "@/db/queries/leads";
import { calculateScore, getCalendarTier, getCalendarUrl } from "@/lib/scoring";
import { submitLimiter, checkRateLimit } from "@/lib/rate-limit";
import { sendLeadNotification, getTeamBrandName } from "@/lib/resend";
import { fireWebhook } from "@/lib/webhook";
import { db } from "@/db";
import { logger } from "@/lib/logger";
import { leads, users, emailSequences, sequenceEnrollments, funnelSessions } from "@/db/schema";
import { eq, and, sql, gte } from "drizzle-orm";
import type { FunnelConfig } from "@/types";
import { isSuperAdmin } from "@/lib/admin";

function isValidUUID(str: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
}

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export async function POST(req: NextRequest, { params }: { params: Promise<{ funnelId: string }> }) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "unknown";
    const rateLimitResult = await checkRateLimit(submitLimiter, ip);
    if (rateLimitResult.limited) {
      return NextResponse.json({ error: "Too many submissions" }, { status: 429 });
    }

    const { funnelId } = await params;

    // Validate funnelId format
    if (!isValidUUID(funnelId)) {
      return NextResponse.json({ error: "Invalid funnel ID" }, { status: 400 });
    }

    const body = await req.json();
    const { email, answers, sessionId } = body as {
      email: string;
      answers: Record<string, string>;
      sessionId?: string;
    };

    // Validate email
    if (!email || typeof email !== "string" || !EMAIL_REGEX.test(email)) {
      return NextResponse.json({ error: "Valid email is required" }, { status: 400 });
    }

    // Validate answers
    if (!answers || typeof answers !== "object" || Array.isArray(answers)) {
      return NextResponse.json({ error: "Answers must be an object" }, { status: 400 });
    }

    const funnel = await getFunnelById(funnelId);
    if (!funnel) return NextResponse.json({ error: "Funnel not found" }, { status: 404 });

    // Free plan submission limit: 100/month — super admin bypasses
    const [funnelOwner] = await db.select({ plan: users.plan }).from(users).where(eq(users.id, funnel.userId));
    const ownerIsAdmin = await isSuperAdmin(funnel.userId);
    if (funnelOwner?.plan === "free" && !ownerIsAdmin) {
      const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const [{ count }] = await db.select({ count: sql<number>`count(*)::int` })
        .from(leads)
        .where(and(eq(leads.funnelId, funnelId), gte(leads.createdAt, monthAgo)));
      if (Number(count) >= 100) {
        return NextResponse.json({ error: "Free plan limit reached (100 submissions/month). Ask the funnel owner to upgrade." }, { status: 403 });
      }
    }

    const config = funnel.config as FunnelConfig;
    const score = calculateScore(config, answers);
    const calendarTier = getCalendarTier(config, answers);
    const calendarUrl = getCalendarUrl(config, answers);

    // Duplicate email check — same email + same funnel = update existing answers
    const existing = await db.select({ id: leads.id }).from(leads)
      .where(and(eq(leads.funnelId, funnelId), eq(leads.email, email)));
    if (existing.length > 0) {
      await db.update(leads)
        .set({ answers, score, calendarTier })
        .where(eq(leads.id, existing[0].id));

      return NextResponse.json({
        success: true,
        leadId: existing[0].id,
        calendarUrl,
        score,
        calendarTier,
        updated: true,
      });
    }

    const lead = await insertLead({
      funnelId,
      email,
      answers,
      score,
      calendarTier,
      sessionId: sessionId ?? null,
    });

    // Auto-enroll in matching email sequences
    try {
      const activeSequences = await db.select().from(emailSequences)
        .where(and(
          eq(emailSequences.funnelId, funnelId),
          eq(emailSequences.active, true),
        ));

      for (const seq of activeSequences) {
        // Check tier match (null triggerTier = all tiers)
        if (seq.triggerTier && seq.triggerTier !== calendarTier) continue;

        await db.insert(sequenceEnrollments).values({
          sequenceId: seq.id,
          leadId: lead.id,
          currentStep: 0,
          status: "active",
          nextSendAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // First email after 24h
        });
      }
    } catch {
      // Non-critical — don't block lead creation
    }

    // Send email notification to funnel owner (non-blocking)
    const [owner] = await db
      .select({ email: users.email, notificationPreferences: users.notificationPreferences })
      .from(users)
      .where(eq(users.id, funnel.userId));
    if (owner?.email) {
      // Check user notification preferences
      const userPrefs = owner.notificationPreferences as { leadAlerts?: boolean } | null;
      if (userPrefs?.leadAlerts !== false) {
        const brandName = await getTeamBrandName(funnelId);
        sendLeadNotification({
          toEmail: owner.email,
          funnelName: config.brand.name,
          leadEmail: email,
          score,
          calendarTier,
          funnelId,
          brandName,
        }).catch(() => {});
      }
    }

    // Fire webhook if configured (retries with exponential backoff, non-blocking)
    if (config.webhook?.url) {
      // Build enhanced webhook payload
      const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://getmyvsl.com";
      const funnelUrl = `${appUrl}/f/${funnel.slug}`;

      // Format quiz answers for human readability
      const quizAnswersFormatted = config.quiz.questions.map((q, i) => {
        const chosenId = answers[q.key];
        const chosen = q.options.find(o => o.id === chosenId);
        return `Q${i + 1}: ${chosen?.label ?? "No answer"} (${chosen?.points ?? 0}pts)`;
      }).join(", ");

      const totalQuestions = config.quiz.questions.length;
      const questionsAnswered = Object.keys(answers).length;

      // Fetch session data for device type and duration (non-blocking lookup)
      let deviceType: string | null = null;
      let sessionDurationMs: number | null = null;
      let utmSource: string | null = null;
      let utmMedium: string | null = null;
      let utmCampaign: string | null = null;

      if (sessionId) {
        try {
          const [session] = await db.select({
            deviceType: funnelSessions.deviceType,
            totalDurationMs: funnelSessions.totalDurationMs,
            utmSource: funnelSessions.utmSource,
            utmMedium: funnelSessions.utmMedium,
            utmCampaign: funnelSessions.utmCampaign,
          }).from(funnelSessions).where(eq(funnelSessions.id, sessionId));
          if (session) {
            deviceType = session.deviceType;
            sessionDurationMs = session.totalDurationMs;
            utmSource = session.utmSource;
            utmMedium = session.utmMedium;
            utmCampaign = session.utmCampaign;
          }
        } catch {
          // Non-critical — proceed without session data
        }
      }

      const webhookPayload: Record<string, unknown> = {
        email,
        answers,
        score,
        calendar_tier: calendarTier,
        timestamp: new Date().toISOString(),
        source: config.brand.name,
        funnel_slug: funnel.slug,
        funnel_url: funnelUrl,
        utm_source: utmSource,
        utm_medium: utmMedium,
        utm_campaign: utmCampaign,
        device_type: deviceType,
        session_duration_ms: sessionDurationMs,
        quiz_answers_formatted: quizAnswersFormatted,
        total_questions: totalQuestions,
        questions_answered: questionsAnswered,
      };

      const webhookFormat = config.webhook?.format ?? "default";
      fireWebhook(config.webhook.url, webhookPayload, funnelId, 3, webhookFormat).catch(() => {});
    }

    return NextResponse.json({
      success: true,
      leadId: lead.id,
      score,
      calendarTier,
      calendarUrl,
    });
  } catch (error) {
    logger.error("POST /api/submit error", { error: error instanceof Error ? error.message : String(error) });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
