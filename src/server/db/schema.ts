// Example model schema from the Drizzle docs
// https://orm.drizzle.team/docs/sql-schema-declaration

import { sql } from "drizzle-orm";
import {
  pgTableCreator,
  timestamp,
  varchar,
  text,
  jsonb,
  json,
  boolean,
  integer,
} from "drizzle-orm/pg-core";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = pgTableCreator((name) => `kwill-app_${name}`);

export const chats = createTable('chats', {
  id: varchar('id', { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar('user_id', { length: 255 }).notNull(),
  googleSheetId: varchar('google_sheet_id', { length: 50}),  // Optional, can be linked later
  name: text('name'),
  analysisPrompt: text('analysis_prompt'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const messages = createTable('messages', {
  // AI SDK required
  id: varchar('id', { length: 255 }).primaryKey().notNull(),
  role: varchar('role', { 
    enum: ['user', 'assistant', 'system', 'data'],
    length: 20
  }).notNull(),
  content: text('content').default(''),
  parts: json('parts').default([]),
  metadata: json('metadata').default({}),
  createdAt: timestamp('created_at').defaultNow().notNull(),

  // My Fields
  userId: varchar('user_id', { length: 255 }).notNull(),
  chatId: varchar('chat_id', { length: 36 }).references(() => chats.id).notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

export const meetings = createTable('meetings', {
  id: varchar('id', { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),  // Changed to UUID
  chatId: varchar('chat_id', { length: 36 }).references(() => chats.id).notNull(),
  userId: varchar('user_id', { length: 255 }).notNull(),
  botId: varchar('bot_id', { length: 255 }),  // Changed from recallAiTranscriptId to botId
  extractedHeaders: jsonb('extracted_headers'),
  llmExtractedData: jsonb('llm_extracted_data'),
  processingStatus: varchar('processing_status', { length: 50 }).default('pending'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const subscriptions = createTable('subscriptions', {
  id: varchar('id', { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar('user_id', { length: 255 }).notNull().unique(),
  stripeCustomerId: varchar('stripe_customer_id', { length: 255 }).unique(),
  stripeSubscriptionId: varchar('stripe_subscription_id', { length: 255 }).unique(),
  status: varchar('status', { length: 50 }).default('none').notNull(),
  priceId: varchar('price_id', { length: 255 }),
  hours: integer('hours').default(2).notNull(), // Default 2 hours for new users
  currentPeriodStart: timestamp('current_period_start'),
  currentPeriodEnd: timestamp('current_period_end'),
  cancelAtPeriodEnd: boolean('cancel_at_period_end').default(false),
  paymentMethod: jsonb('payment_method'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
