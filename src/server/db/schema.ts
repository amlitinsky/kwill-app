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

export const spreadsheets = createTable('spreadsheets', {
  id: serial('id').primaryKey(),
  userId: varchar('user_id', { length: 255 }).notNull(),
  googleSheetId: varchar('google_sheet_id', { length: 255 }).notNull(),
  name: text('name'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const meetings = createTable('meetings', {
  id: serial('id').primaryKey(),
  userId: varchar('user_id', { length: 255 }).notNull(),
  spreadsheetId: integer('spreadsheet_id').references(() => spreadsheets.id),
  botId: varchar('bot_id', { length: 255 }),
  llmExtractedData: jsonb('llm_extracted_data'),
  processingStatus: varchar('processing_status', { length: 50 }).default('pending'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const chatMessages = createTable('chat_messages', {
  id: serial('id').primaryKey(),
  userId: varchar('user_id', { length: 255 }).notNull(),
  meetingId: integer('meeting_id').references(() => meetings.id),
  role: varchar('role', { length: 50 }).notNull(),
  content: text('content').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
