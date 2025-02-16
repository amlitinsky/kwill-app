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
  json,
} from "drizzle-orm/pg-core";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = pgTableCreator((name) => `kwill-app_${name}`);

export const chats = createTable('chats', {
  id: serial('id').primaryKey(),
  userId: varchar('user_id', { length: 255 }).notNull(),
  googleSheetId: varchar('google_sheet_id', { length: 255 }),  // Optional, can be linked later
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
  content: text('content').notNull(),
  parts: json('parts').default([]),
  metadata: json('metadata').default({}),
  createdAt: timestamp('created_at').defaultNow().notNull(),

  // My Fields
  userId: varchar('user_id', { length: 255 }).notNull(),
  chatId: integer('chat_id').references(() => chats.id).notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

export const meetings = createTable('meetings', {
  id: serial('id').primaryKey(),
  chatId: integer('chat_id').references(() => chats.id).notNull(),
  userId: varchar('user_id', { length: 255 }).notNull(),
  botId: varchar('bot_id', { length: 255 }),  // Changed from recallAiTranscriptId to botId
  extractedHeaders: jsonb('extracted_headers'),
  llmExtractedData: jsonb('llm_extracted_data'),
  processingStatus: varchar('processing_status', { length: 50 }).default('pending'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
