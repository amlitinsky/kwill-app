Design Document: Kwill - Core Functionality MVP (2025-02-08)
This document outlines the design for the core functionality of Kwill Minimum Viable Product (MVP).

1. Overall Architecture (MVP)

+---------------------+      +---------------------+      +---------------------+
|   Frontend (Client)   | <--> |     Backend (API)     | <--> |  Integrations & LLM  |
|  (Next.js 15,       |      |  (tRPC, Next.js API  |      |  (Recall.ai,        |
|   shadcn/ui,         |      |   Drizzle ORM,       |      |   Google Sheets API, |
|   Next.js AI SDK)    |      |   Neon Postgres)        |      |   Gemini Pro)        |
+---------------------+      +---------------------+      +---------------------+
         ^                                ^                                ^
         | User Interaction               | API, Orchestration, Data      | AI Processing & Data Sources
         |                                | Logic, Database               |
+---------------------------------------------------------------------------+
|                             Data Storage (Neon Postgres)                       |
|                 (Spreadsheets, Meetings, Chat History)                     |
+---------------------------------------------------------------------------+
2. Database Design (Drizzle ORM - MVP)

TypeScript

// backend/db/schema.ts (Drizzle ORM - MVP Schema)

import { pgTable, serial, text, timestamp, jsonb, varchar, integer, foreignKey } from 'drizzle-orm/pg-core';

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
3. API Endpoints (tRPC - MVP)

TypeScript

// backend/src/router.ts (tRPC Router - MVP)

import { publicProcedure, router } from './trpc';
import { z } from 'zod';
import { db } from '../db'; // Your Drizzle DB Client
import { spreadsheets, meetings, chatMessages } from '../db/schema'; // Import your schema
import { OpenAIStream } from 'ai'; // Or GroqStream for Groq
import { clerk } from '@clerk/nextjs/server'; // Clerk backend SDK

export const appRouter = router({
  chat: router({
    sendMessage: publicProcedure
      .input(z.object({ message: z.string(), userId: z.string() }))
      .mutation(async ({ input }) => {
        const { message, userId } = input;

        // --- 1. LLM Intent Recognition & URL Extraction (Groq LPU) ---
        const intentPrompt = `... (Your Intent Recognition Prompt - include finance jargon context) ... User Message: ${message} ... Response Format: JSON ...`;
        const intentStream = await OpenAIStream(intentPrompt, { apiKey: process.env.GROQ_API_KEY }); // Or GroqStream
        const intentResponse = await streamToString(intentStream); // Helper function to convert stream to string
        const intentJson = JSON.parse(intentResponse);
        const { intent, zoom_url, spreadsheet_id } = intentJson;

        if (intent === "link_spreadsheet") {
          if (spreadsheet_id) {
            await db.insert(spreadsheets).values({ userId, googleSheetId: spreadsheet_id });
            return { response: `Spreadsheet linked: ${spreadsheet_id}` };
          } else {
            return { response: "Please provide a valid Spreadsheet ID." };
          }
        } else if (intent === "process_zoom_meeting") {
          if (zoom_url) {
             // --- 2. Database: Record Meeting Start ---
            const newMeeting = await db.insert(meetings).values({
              userId,
              zoomMeetingLink: zoom_url,
              processingStatus: 'processing'
            }).returning();
            const meetingId = newMeeting[0].id; // Get generated meeting ID

            // --- 3. Recall.ai API Call (Synchronous for MVP) ---
            const recallAiResponse = await callRecallAiApi(zoom_url); // Implement this function
            const transcript = recallAiResponse.transcript; // Extract transcript from Recall.ai response
            const recallAiTranscriptId = recallAiResponse.transcriptId; // Extract transcript ID

            // --- 4. LLM Entity Extraction (Groq LPU) ---
            const extractionPrompt = `... (Your Entity Extraction Prompt - include finance jargon context) ... Transcript: ${transcript} ... Response Format: JSON ...`;
            const extractionStream = await OpenAIStream(extractionPrompt, { apiKey: process.env.GROQ_API_KEY }); // Or GroqStream
            const extractionResponse = await streamToString(extractionStream);
            const extractionJson = JSON.parse(extractionResponse);

            // --- 5. Google Sheets API Update (Synchronous for MVP) ---
            const linkedSpreadsheet = await db.query.spreadsheets.findFirst({
              where: (spreadsheets, { eq }) => eq(spreadsheets.userId, userId), // Assuming 1 linked sheet per user for MVP
            });
            if (linkedSpreadsheet) {
              const googleAccessToken = await clerk.session.getToken({ provider: "google" }); // Get Google Access Token from Clerk
              await updateGoogleSheet(googleAccessToken, linkedSpreadsheet.googleSheetId, extractionJson); // Implement this function
            }

            // --- 6. Database: Update Meeting with Results ---
            await db.update(meetings)
              .set({
                recallAiTranscriptId: recallAiTranscriptId,
                llmExtractedData: extractionJson,
                processingStatus: 'completed',
                updatedAt: new Date()
              })
              .where(eq(meetings.id, meetingId));

            // --- 7. Construct Agent Response (Summary + Action Items from extractionJson) ---
            const summaryResponse = constructSummaryResponse(extractionJson); // Implement this
            return { response: summaryResponse };

          } else {
            return { response: "Please provide a Zoom meeting URL." };
          }
        } else {
          return { response: "Sorry, I didn't understand that." }; // Default response
        }
      }),
  }),
  spreadsheet: router({
    linkSpreadsheet: publicProcedure
      .input(z.object({ googleSheetId: z.string(), clerkId: z.string() }))
      .mutation(async ({ input }) => {
        const { googleSheetId, clerkId } = input;
        await db.insert(spreadsheets).values({ clerkId, googleSheetId });
        return { success: true, message: 'Spreadsheet linked successfully' };
      }),
    getLinkedSpreadsheet: publicProcedure
      .input(z.object({ clerkId: z.string() }))
      .query(async ({ input }) => {
        const { clerkId } = input;
        const linkedSheet = await db.query.spreadsheets.findFirst({
          where: (spreadsheets, { eq }) => eq(spreadsheets.clerkId, clerkId),
        });
        return linkedSheet;
      }),
  }),
});

// Helper function to convert stream to string (for OpenAIStream/GroqStream response)
async function streamToString(stream: ReadableStream<Uint8Array>): Promise<string> {
  const reader = stream.getReader();
  let result = '';
  const decoder = new TextDecoder();
  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      break;
    }
    result += decoder.decode(value);
  }
  return result;
}


export type AppRouter = typeof appRouter;
4. AI Agent Orchestration Flow (Synchronous MVP - Detail)

(As described in detail in the code comments within the sendMessage function above.)

5. LLM Selection (MVP)

Google Gemini Pro remains the recommended LLM for its integration with Google ecosystem and structured output capabilities, with prompt engineering as key for optimization.
Also considering DeepSeek, Claude 3, and Llama 3 as alternatives.

6. Frontend (Next.js 15, AI SDK - MVP)

(Frontend design remains as previously described).

7. Authentication and Authorization (Clerk - Simplified MVP)

(Authentication flow simplified by Clerk remains as previously described).

8. Data Flow Walkthrough (Zoom Link Processing - MVP)

(Data flow walkthrough remains conceptually similar to previous description, now aligned with the simplified database and code structure above.)

9. Technology Stack Summary (MVP)

(Technology stack list remains consistent with previous descriptions).

10. Implementation Steps (Core Functionality MVP - Concise)

(Implementation steps remain consistent with the previous concise list, now directly aligned with the simplified and code-centric design document above.)   

This comprehensive and code-integrated Design Document provides a detailed blueprint for implementing the core functionality of Kwill MVP. Let me know if you have any further questions or require any adjustments!   

# Implementation Steps
1. Clerk OAuth
2. Database Design and Integration with Drizzle ORM (make the necessary schema updates)
3. Chat Interface UI 
4. API Routes and Integration with LLM and Groq LPU
5. Recall.ai API Integration
6. Google Sheets API Integration
7. Error Handling and Logging
8. Testing and Validation


