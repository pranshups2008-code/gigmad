import { pgTable, text, timestamp, integer, jsonb, primaryKey } from 'drizzle-orm/pg-core';
import type { Gig } from '../src/lib/types';

export const profiles = pgTable('profiles', {
  id: text().primaryKey(),
  name: text().notNull().default(''),
  roleTitle: text('role_title').notNull().default(''),
  portfolioUrl: text('portfolio_url').notNull().default(''),
  trialEndsAt: timestamp('trial_ends_at', { withTimezone: true }),
  stripeCustomerId: text('stripe_customer_id').unique(),
  stripeSubscriptionId: text('stripe_subscription_id').unique(),
});
export const bookmarks = pgTable('bookmarks', {
  userId: text('user_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  gigId: text('gig_id').notNull(),
  gig: jsonb().$type<Gig>().notNull(),
}, (t) => [primaryKey({ columns: [t.userId, t.gigId] })]);
export const aiUsage = pgTable('ai_usage', {
  userId: text('user_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  day: text().notNull(),
  count: integer().notNull().default(0),
}, (t) => [primaryKey({ columns: [t.userId, t.day] })]);
export const telegramLinks = pgTable('telegram_links', {
  userId: text('user_id').primaryKey().references(() => profiles.id, { onDelete: 'cascade' }),
  tokenHash: text('token_hash').unique(),
  tokenExpiresAt: timestamp('token_expires_at', { withTimezone: true }),
  chatId: text('chat_id').unique(),
  category: text().notNull().default('all'),
  minBudget: integer('min_budget').notNull().default(0),
  linkedAt: timestamp('linked_at', { withTimezone: true }),
});
export const telegramDeliveries = pgTable('telegram_deliveries', {
  userId: text('user_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  gigId: text('gig_id').notNull(),
}, (t) => [primaryKey({ columns: [t.userId, t.gigId] })]);
export const serviceState = pgTable('service_state', {
  key: text().primaryKey(),
  value: text().notNull(),
});
