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
});

export const emailSequences = pgTable('email_sequences', {
  id: uuid('id').primaryKey().defaultRandom(),
  funnelId: uuid('funnel_id').notNull().references(() => funnels.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  active: boolean('active').default(false).notNull(),
  triggerTier: tierEnum('trigger_tier'),
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
  leadId: uuid('lead_id').notNull().references(() => leads.id, { onDelete: 'cascade' }),
  currentStep: integer('current_step').default(0).notNull(),
  status: text('status').default('active').notNull(),
  nextSendAt: timestamp('next_send_at'),
  completedAt: timestamp('completed_at'),
  enrolledAt: timestamp('enrolled_at').defaultNow().notNull(),
});

export const teamRoleEnum = pgEnum('team_role', ['owner', 'admin', 'member']);

export const teams = pgTable('teams', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  ownerId: text('owner_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
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
