// Example model schema from the Drizzle docs
// https://orm.drizzle.team/docs/sql-schema-declaration

import {
  integer,
  pgTableCreator,
  timestamp,
  varchar,
  serial,
  text,
  jsonb,
} from "drizzle-orm/pg-core";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = pgTableCreator((name) => `kwill-app_${name}`);

export const conversations = createTable('conversations', {
  id: serial('id').primaryKey(),
  userId: varchar('user_id', { length: 255 }).notNull(),
  googleSheetId: varchar('google_sheet_id', { length: 255 }),  // Optional, can be linked later
  name: text('name'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const chatMessages = createTable('chat_messages', {
  id: serial('id').primaryKey(),
  conversationId: integer('conversation_id').references(() => conversations.id).notNull(),
  userId: varchar('user_id', { length: 255 }).notNull(),
  role: varchar('role', { length: 50 }).notNull(), // 'user' | 'assistant'
  content: text('content').notNull(),
  metadata: jsonb('metadata'), // For storing any additional message-specific data
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const meetings = createTable('meetings', {
  id: serial('id').primaryKey(),
  conversationId: integer('conversation_id').references(() => conversations.id).notNull(),
  userId: varchar('user_id', { length: 255 }).notNull(),
  zoomUrl: text('zoom_url').notNull(),
  botId: varchar('bot_id', { length: 255 }),  // Changed from recallAiTranscriptId to botId
  llmExtractedData: jsonb('llm_extracted_data'),
  processingStatus: varchar('processing_status', { length: 50 }).default('pending'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
