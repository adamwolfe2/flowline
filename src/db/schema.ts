// Migration needed: run `npx drizzle-kit push` to add:
// - funnel_sessions.partial_email column
// - email_sequences.trigger_type column
// - sequence_enrollments.session_id column
// - sequence_enrollments.recipient_email column
// - sequence_enrollments.lead_id nullable change
// - event_type enum: 'email_captured' value
import { pgTable, uuid, text, boolean, integer, jsonb, timestamp, pgEnum, index } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const planEnum = pgEnum('plan', ['free', 'pro', 'agency']);
export const tierEnum = pgEnum('calendar_tier', ['high', 'mid', 'low']);

export const eventTypeEnum = pgEnum('event_type', [
  'funnel_viewed', 'page_viewed', 'answer_selected', 'field_focused',
  'form_submitted', 'lead_created', 'funnel_completed', 'funnel_abandoned',
  'back_navigated', 'cta_clicked', 'email_captured',
]);

export const deviceTypeEnum = pgEnum('device_type', ['mobile', 'desktop', 'tablet']);

export const users = pgTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull(),
  stripeCustomerId: text('stripe_customer_id'),
  plan: planEnum('plan').default('free').notNull(),
  hadTrial: boolean('had_trial').default(false).notNull(),
  trialEndsAt: timestamp('trial_ends_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  notificationPreferences: jsonb('notification_preferences')
    .$type<{ leadAlerts: boolean; weeklyDigest: boolean }>()
    .default(sql`'{"leadAlerts": true, "weeklyDigest": true}'::jsonb`)
    .notNull(),
});

export const funnels = pgTable('funnels', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  slug: text('slug').unique().notNull(),
  customDomain: text('custom_domain').unique(),
  config: jsonb('config').notNull(),
  published: boolean('published').default(false).notNull(),
  publishedAt: timestamp('published_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  shareToken: text('share_token').unique(),
  shareTokenExpiresAt: timestamp('share_token_expires_at'),
  shareClientEmail: text('share_client_email'),
  shareDailyDigest: boolean('share_daily_digest').default(false),
  teamId: uuid('team_id').references(() => teams.id, { onDelete: 'set null' }),
  clientId: uuid('client_id').references(() => clients.id, { onDelete: 'set null' }),
  creationSource: text('creation_source').$type<'ai' | 'template' | 'manual'>(),
}, (t) => [
  index('funnels_user_id_idx').on(t.userId),
  index('funnels_team_id_idx').on(t.teamId),
  index('funnels_client_id_idx').on(t.clientId),
]);

export const leads = pgTable('leads', {
  id: uuid('id').primaryKey().defaultRandom(),
  funnelId: uuid('funnel_id').notNull().references(() => funnels.id, { onDelete: 'cascade' }),
  email: text('email').notNull(),
  answers: jsonb('answers').notNull(),
  score: integer('score').notNull(),
  calendarTier: tierEnum('calendar_tier').notNull(),
  sessionId: uuid('session_id'),
  utmSource: text('utm_source'),
  utmMedium: text('utm_medium'),
  utmCampaign: text('utm_campaign'),
  deviceType: deviceTypeEnum('device_type'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (t) => [
  index('leads_funnel_id_idx').on(t.funnelId),
  index('leads_funnel_id_created_at_idx').on(t.funnelId, t.createdAt),
]);

export const funnelSessions = pgTable('funnel_sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  funnelId: uuid('funnel_id').notNull().references(() => funnels.id, { onDelete: 'cascade' }),
  completed: boolean('completed').default(false).notNull(),
  converted: boolean('converted').default(false).notNull(),
  leadId: uuid('lead_id'),
  abandonedAtStep: integer('abandoned_at_step'),
  furthestStepReached: integer('furthest_step_reached').default(0).notNull(),
  utmSource: text('utm_source'),
  utmMedium: text('utm_medium'),
  utmCampaign: text('utm_campaign'),
  deviceType: deviceTypeEnum('device_type'),
  partialEmail: text('partial_email'),
  totalDurationMs: integer('total_duration_ms'),
  endedAt: timestamp('ended_at'),
  startedAt: timestamp('started_at').defaultNow().notNull(),
}, (t) => [
  index('funnel_sessions_funnel_id_idx').on(t.funnelId),
  index('funnel_sessions_funnel_id_started_at_idx').on(t.funnelId, t.startedAt),
]);

export const events = pgTable('events', {
  id: uuid('id').primaryKey().defaultRandom(),
  sessionId: uuid('session_id').notNull().references(() => funnelSessions.id, { onDelete: 'cascade' }),
  funnelId: uuid('funnel_id').notNull().references(() => funnels.id, { onDelete: 'cascade' }),
  eventType: eventTypeEnum('event_type').notNull(),
  stepIndex: integer('step_index').notNull(),
  stepKey: text('step_key').notNull(),
  questionKey: text('question_key'),
  answerId: text('answer_id'),
  answerLabel: text('answer_label'),
  answerPoints: integer('answer_points'),
  cumulativeScore: integer('cumulative_score'),
  utmSource: text('utm_source'),
  utmMedium: text('utm_medium'),
  utmCampaign: text('utm_campaign'),
  utmTerm: text('utm_term'),
  utmContent: text('utm_content'),
  deviceType: deviceTypeEnum('device_type'),
  timeOnStepMs: integer('time_on_step_ms'),
  sessionDurationMs: integer('session_duration_ms'),
  abandonedAtStep: integer('abandoned_at_step'),
  reachedEmail: boolean('reached_email'),
  leadId: uuid('lead_id'),
  calendarTier: tierEnum('calendar_tier'),
  score: integer('score'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (t) => [
  index('events_funnel_id_idx').on(t.funnelId),
  index('events_session_id_idx').on(t.sessionId),
]);

export const funnelVariants = pgTable('funnel_variants', {
  id: uuid('id').primaryKey().defaultRandom(),
  funnelId: uuid('funnel_id').notNull().references(() => funnels.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  config: jsonb('config').notNull(),
  trafficWeight: integer('traffic_weight').default(50).notNull(),
  isControl: boolean('is_control').default(false).notNull(),
  active: boolean('active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const variantAssignments = pgTable('variant_assignments', {
  id: uuid('id').primaryKey().defaultRandom(),
  sessionId: uuid('session_id').notNull().references(() => funnelSessions.id, { onDelete: 'cascade' }),
  funnelId: uuid('funnel_id').notNull().references(() => funnels.id, { onDelete: 'cascade' }),
  variantId: uuid('variant_id').notNull().references(() => funnelVariants.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (t) => [
  index('variant_assignments_variant_id_idx').on(t.variantId),
  index('variant_assignments_funnel_id_idx').on(t.funnelId),
]);

export const emailSequences = pgTable('email_sequences', {
  id: uuid('id').primaryKey().defaultRandom(),
  funnelId: uuid('funnel_id').notNull().references(() => funnels.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  active: boolean('active').default(false).notNull(),
  triggerTier: tierEnum('trigger_tier'),
  // 'lead_created' = standard follow-up after form submission
  // 'abandoned' = sent to visitors who entered email but didn't complete the quiz
  triggerType: text('trigger_type').default('lead_created').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const emailSteps = pgTable('email_steps', {
  id: uuid('id').primaryKey().defaultRandom(),
  sequenceId: uuid('sequence_id').notNull().references(() => emailSequences.id, { onDelete: 'cascade' }),
  stepOrder: integer('step_order').notNull(),
  subject: text('subject').notNull(),
  body: text('body').notNull(),
  delayHours: integer('delay_hours').default(24).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const sequenceEnrollments = pgTable('sequence_enrollments', {
  id: uuid('id').primaryKey().defaultRandom(),
  sequenceId: uuid('sequence_id').notNull().references(() => emailSequences.id, { onDelete: 'cascade' }),
  leadId: uuid('lead_id').references(() => leads.id, { onDelete: 'cascade' }),
  sessionId: uuid('session_id').references(() => funnelSessions.id, { onDelete: 'cascade' }),
  recipientEmail: text('recipient_email'),
  currentStep: integer('current_step').default(0).notNull(),
  status: text('status').default('active').notNull(),
  nextSendAt: timestamp('next_send_at'),
  completedAt: timestamp('completed_at'),
  enrolledAt: timestamp('enrolled_at').defaultNow().notNull(),
}, (t) => [
  index('sequence_enrollments_status_next_send_at_idx').on(t.status, t.nextSendAt),
]);

export const teamRoleEnum = pgEnum('team_role', ['owner', 'admin', 'member']);

export const teams = pgTable('teams', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  ownerId: text('owner_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  plan: planEnum('plan').default('free').notNull(),
  stripeCustomerId: text('stripe_customer_id'),
  branding: jsonb('branding')
    .$type<{ logoUrl?: string; logoWidth?: number; primaryColor?: string; appName?: string; faviconUrl?: string }>()
    .default(sql`'{}'::jsonb`),
  customDashboardDomain: text('custom_dashboard_domain').unique(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const teamMembers = pgTable('team_members', {
  id: uuid('id').primaryKey().defaultRandom(),
  teamId: uuid('team_id').notNull().references(() => teams.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  role: teamRoleEnum('role').default('member').notNull(),
  joinedAt: timestamp('joined_at').defaultNow().notNull(),
});

export const teamInvites = pgTable('team_invites', {
  id: uuid('id').primaryKey().defaultRandom(),
  teamId: uuid('team_id').notNull().references(() => teams.id, { onDelete: 'cascade' }),
  email: text('email').notNull(),
  role: teamRoleEnum('role').default('member').notNull(),
  invitedBy: text('invited_by').notNull().references(() => users.id),
  token: text('token').notNull().unique(),
  expiresAt: timestamp('expires_at').notNull(),
  acceptedAt: timestamp('accepted_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const webhookDeliveries = pgTable('webhook_deliveries', {
  id: uuid('id').primaryKey().defaultRandom(),
  funnelId: uuid('funnel_id').notNull().references(() => funnels.id, { onDelete: 'cascade' }),
  url: text('url').notNull(),
  statusCode: integer('status_code'),
  success: boolean('success').notNull(),
  attempts: integer('attempts').notNull().default(1),
  errorMessage: text('error_message'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (t) => [
  index('webhook_deliveries_funnel_id_idx').on(t.funnelId),
]);

// ── Clients ──

export const clients = pgTable('clients', {
  id: uuid('id').primaryKey().defaultRandom(),
  teamId: uuid('team_id').notNull().references(() => teams.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  email: text('email').notNull(),
  company: text('company'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (t) => [
  index('clients_team_id_idx').on(t.teamId),
  index('clients_email_idx').on(t.email),
]);

export type Client = typeof clients.$inferSelect;

// ── Audit Logs ──

export const auditLogs = pgTable('audit_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  teamId: uuid('team_id').notNull().references(() => teams.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull(),
  action: text('action').notNull(),
  resourceType: text('resource_type').notNull(),
  resourceId: text('resource_id'),
  metadata: jsonb('metadata').$type<Record<string, unknown>>(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (t) => [
  index('audit_logs_team_id_idx').on(t.teamId),
  index('audit_logs_team_id_created_at_idx').on(t.teamId, t.createdAt),
]);

export type AuditLog = typeof auditLogs.$inferSelect;
export type NewClient = typeof clients.$inferInsert;

// ── API Keys ──

export const apiKeys = pgTable('api_keys', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  teamId: uuid('team_id').references(() => teams.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  keyPrefix: text('key_prefix').notNull(),
  keyHash: text('key_hash').notNull(),
  scopes: jsonb('scopes').$type<string[]>().default(sql`'["read","write"]'::jsonb`).notNull(),
  lastUsedAt: timestamp('last_used_at'),
  expiresAt: timestamp('expires_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (t) => [
  index('api_keys_user_id_idx').on(t.userId),
  index('api_keys_key_hash_idx').on(t.keyHash),
]);

export type ApiKey = typeof apiKeys.$inferSelect;

// ── Shopify Installations ──

export const shopifyInstallations = pgTable('shopify_installations', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  teamId: uuid('team_id').references(() => teams.id, { onDelete: 'set null' }),
  shopDomain: text('shop_domain').notNull().unique(),
  accessToken: text('access_token').notNull(),
  scopes: text('scopes').notNull(),
  installedAt: timestamp('installed_at').defaultNow().notNull(),
  uninstalledAt: timestamp('uninstalled_at'),
}, (t) => [
  index('shopify_installations_user_id_idx').on(t.userId),
  index('shopify_installations_shop_domain_idx').on(t.shopDomain),
]);

export type ShopifyInstallation = typeof shopifyInstallations.$inferSelect;

// ── GHL Connections ──

export const ghlConnections = pgTable('ghl_connections', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  teamId: uuid('team_id').references(() => teams.id, { onDelete: 'set null' }),
  locationId: text('location_id').notNull().unique(),
  companyId: text('company_id'),
  accessToken: text('access_token').notNull(),
  refreshToken: text('refresh_token').notNull(),
  tokenExpiresAt: timestamp('token_expires_at').notNull(),
  scopes: text('scopes'),
  connectedAt: timestamp('connected_at').defaultNow().notNull(),
}, (t) => [
  index('ghl_connections_user_id_idx').on(t.userId),
  index('ghl_connections_location_id_idx').on(t.locationId),
]);

export type GhlConnection = typeof ghlConnections.$inferSelect;

export type User = typeof users.$inferSelect;
export type Funnel = typeof funnels.$inferSelect;
export type Lead = typeof leads.$inferSelect;
export type FunnelSession = typeof funnelSessions.$inferSelect;
export type NewFunnel = typeof funnels.$inferInsert;
export type NewLead = typeof leads.$inferInsert;
export type Event = typeof events.$inferSelect;
export type NewEvent = typeof events.$inferInsert;
export type FunnelVariant = typeof funnelVariants.$inferSelect;
export type NewFunnelVariant = typeof funnelVariants.$inferInsert;
export type VariantAssignment = typeof variantAssignments.$inferSelect;
export type EmailSequence = typeof emailSequences.$inferSelect;
export type EmailStep = typeof emailSteps.$inferSelect;
export type SequenceEnrollment = typeof sequenceEnrollments.$inferSelect;
export type Team = typeof teams.$inferSelect;
export type TeamMember = typeof teamMembers.$inferSelect;
export type TeamInvite = typeof teamInvites.$inferSelect;
export type WebhookDelivery = typeof webhookDeliveries.$inferSelect;

// ── Popup campaigns ──

export const popupDisplayModeEnum = pgEnum('popup_display_mode', ['modal', 'slide_in', 'full_screen']);
export const popupPositionEnum = pgEnum('popup_position', ['center', 'bottom_left', 'bottom_right']);
export const popupStatusEnum = pgEnum('popup_status', ['draft', 'active', 'paused']);
export const popupImpressionActionEnum = pgEnum('popup_impression_action', [
  'triggered', 'shown', 'dismissed', 'engaged', 'converted',
]);

export const popupCampaigns = pgTable('popup_campaigns', {
  id: uuid('id').primaryKey().defaultRandom(),
  funnelId: uuid('funnel_id').notNull().references(() => funnels.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  status: popupStatusEnum('status').default('draft').notNull(),
  displayMode: popupDisplayModeEnum('display_mode').default('modal').notNull(),
  position: popupPositionEnum('position').default('center').notNull(),
  triggers: jsonb('triggers')
    .$type<{ exitIntent: boolean; timeDelay: number | null; scrollDepth: number | null; idleTime: number | null }>()
    .default(sql`'{"exitIntent": true, "timeDelay": null, "scrollDepth": null, "idleTime": null}'::jsonb`)
    .notNull(),
  targeting: jsonb('targeting')
    .$type<{ pageUrls: string[]; utmSources: string[]; deviceTypes: string[]; newVisitorsOnly: boolean }>()
    .default(sql`'{"pageUrls": [], "utmSources": [], "deviceTypes": [], "newVisitorsOnly": false}'::jsonb`)
    .notNull(),
  suppression: jsonb('suppression')
    .$type<{ dismissCookieDays: number; convertedCookieDays: number }>()
    .default(sql`'{"dismissCookieDays": 30, "convertedCookieDays": 365}'::jsonb`)
    .notNull(),
  styleOverrides: jsonb('style_overrides')
    .$type<{ overlayOpacity: number; borderRadius: number; animation: string; maxWidth: number }>()
    .default(sql`'{"overlayOpacity": 0.5, "borderRadius": 16, "animation": "slide_up", "maxWidth": 480}'::jsonb`)
    .notNull(),
  priority: integer('priority').default(0).notNull(),
  teamId: uuid('team_id').references(() => teams.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (t) => [
  index('popup_campaigns_user_id_idx').on(t.userId),
  index('popup_campaigns_funnel_id_idx').on(t.funnelId),
  index('popup_campaigns_status_idx').on(t.status),
]);

export const popupImpressions = pgTable('popup_impressions', {
  id: uuid('id').primaryKey().defaultRandom(),
  campaignId: uuid('campaign_id').notNull().references(() => popupCampaigns.id, { onDelete: 'cascade' }),
  visitorId: text('visitor_id').notNull(),
  action: popupImpressionActionEnum('action').notNull(),
  triggerType: text('trigger_type'),
  pageUrl: text('page_url'),
  referrer: text('referrer'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (t) => [
  index('popup_impressions_campaign_id_idx').on(t.campaignId),
  index('popup_impressions_campaign_id_created_at_idx').on(t.campaignId, t.createdAt),
]);

export type PopupCampaign = typeof popupCampaigns.$inferSelect;
export type NewPopupCampaign = typeof popupCampaigns.$inferInsert;
export type PopupImpression = typeof popupImpressions.$inferSelect;
export type NewPopupImpression = typeof popupImpressions.$inferInsert;

// ── Funnel Insights (AI-generated) ──

export const funnelInsights = pgTable('funnel_insights', {
  id: uuid('id').primaryKey().defaultRandom(),
  funnelId: uuid('funnel_id').notNull().references(() => funnels.id, { onDelete: 'cascade' }),
  configHash: text('config_hash').notNull(),
  timeRange: text('time_range').notNull(),
  payload: jsonb('payload').notNull(),
  inputsSnapshot: jsonb('inputs_snapshot').notNull(),
  model: text('model').notNull(),
  promptTokens: integer('prompt_tokens').notNull(),
  completionTokens: integer('completion_tokens').notNull(),
  costUsd: integer('cost_usd_millicents'),
  generationMs: integer('generation_ms').notNull(),
  sessionCountAtGeneration: integer('session_count_at_generation').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (t) => [
  index('funnel_insights_funnel_id_idx').on(t.funnelId),
  index('funnel_insights_funnel_id_expires_at_idx').on(t.funnelId, t.expiresAt),
]);

export type FunnelInsight = typeof funnelInsights.$inferSelect;
export type NewFunnelInsight = typeof funnelInsights.$inferInsert;

// ── Behavior Triggers — Lead Events (feature-flagged: ENABLE_BEHAVIOR_TRIGGERS) ──

export const leadEventTypeEnum = pgEnum('lead_event_type', [
  'email_opened', 'email_clicked', 'calendar_viewed', 'calendar_booked',
  'page_visited', 'funnel_revisited',
]);

export const leadEvents = pgTable('lead_events', {
  id: uuid('id').primaryKey().defaultRandom(),
  leadId: uuid('lead_id').notNull().references(() => leads.id, { onDelete: 'cascade' }),
  funnelId: uuid('funnel_id').references(() => funnels.id, { onDelete: 'set null' }),
  eventType: leadEventTypeEnum('event_type').notNull(),
  metadata: jsonb('metadata'),
  occurredAt: timestamp('occurred_at').defaultNow().notNull(),
}, (t) => [
  index('lead_events_lead_id_idx').on(t.leadId),
  index('lead_events_funnel_id_event_type_idx').on(t.funnelId, t.eventType),
  index('lead_events_occurred_at_idx').on(t.occurredAt),
]);

export type LeadEvent = typeof leadEvents.$inferSelect;
export type NewLeadEvent = typeof leadEvents.$inferInsert;
