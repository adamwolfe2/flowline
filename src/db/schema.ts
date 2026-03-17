import { pgTable, uuid, text, boolean, integer, jsonb, timestamp, pgEnum } from 'drizzle-orm/pg-core';

export const planEnum = pgEnum('plan', ['free', 'pro', 'agency']);
export const tierEnum = pgEnum('calendar_tier', ['high', 'mid', 'low']);

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
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const funnelSessions = pgTable('funnel_sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  funnelId: uuid('funnel_id').notNull().references(() => funnels.id, { onDelete: 'cascade' }),
  completed: boolean('completed').default(false).notNull(),
  converted: boolean('converted').default(false).notNull(),
  startedAt: timestamp('started_at').defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type Funnel = typeof funnels.$inferSelect;
export type Lead = typeof leads.$inferSelect;
export type FunnelSession = typeof funnelSessions.$inferSelect;
export type NewFunnel = typeof funnels.$inferInsert;
export type NewLead = typeof leads.$inferInsert;
