import { pgTable, uuid, text, boolean, integer, jsonb, timestamp, pgEnum } from 'drizzle-orm/pg-core';

export const planEnum = pgEnum('plan', ['free', 'pro', 'agency']);
export const tierEnum = pgEnum('calendar_tier', ['high', 'mid', 'low']);

export const eventTypeEnum = pgEnum('event_type', [
  'funnel_viewed', 'page_viewed', 'answer_selected', 'field_focused',
  'form_submitted', 'lead_created', 'funnel_completed', 'funnel_abandoned',
  'back_navigated', 'cta_clicked',
]);

export const deviceTypeEnum = pgEnum('device_type', ['mobile', 'desktop', 'tablet']);

export const users = pgTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull(),
  stripeCustomerId: text('stripe_customer_id'),
  plan: planEnum('plan').default('free').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
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
});

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
});

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
  totalDurationMs: integer('total_duration_ms'),
  endedAt: timestamp('ended_at'),
  startedAt: timestamp('started_at').defaultNow().notNull(),
});

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
});

export type User = typeof users.$inferSelect;
export type Funnel = typeof funnels.$inferSelect;
export type Lead = typeof leads.$inferSelect;
export type FunnelSession = typeof funnelSessions.$inferSelect;
export type NewFunnel = typeof funnels.$inferInsert;
export type NewLead = typeof leads.$inferInsert;
export type Event = typeof events.$inferSelect;
export type NewEvent = typeof events.$inferInsert;
