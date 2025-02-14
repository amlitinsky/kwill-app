import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "@/server/api/trpc";
import { conversations, meetings } from "@/server/db/schema";
import { desc, eq, and } from "drizzle-orm";
import { type SQL } from "drizzle-orm";
import { db } from "@/server/db";
import { transcriptResponseSchema } from "@/lib/recall";
import { clerkClient } from "@clerk/nextjs/server";
import { getColumnHeaders } from "@/lib/google";
import { extractTranscriptHeaderValues } from "@/lib/ai/prompts";

export const meetingRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        conversationId: z.number(),
        botId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const meeting = await ctx.db
        .insert(meetings)
        .values({
          userId: ctx.userId,
          conversationId: input.conversationId,
          processingStatus: "pending",
          botId: input.botId,
        })
        .returning();

      return meeting[0];
    }),

  getAll: protectedProcedure
    .input(
      z.object({
        conversationId: z.number().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const conditions: SQL[] = [eq(meetings.userId, ctx.userId)];

      if (input.conversationId) {
        conditions.push(eq(meetings.conversationId, input.conversationId));
      }

      const userMeetings = await ctx.db
        .select()
        .from(meetings)
        .where(conditions.length === 1 ? conditions[0] : and(...conditions))
        .orderBy(desc(meetings.createdAt));

      return userMeetings;
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const meeting = await ctx.db
        .select()
        .from(meetings)
        .where(eq(meetings.id, input.id))
        .limit(1);

      if (!meeting[0] || meeting[0].userId !== ctx.userId) {
        throw new Error("Meeting not found or unauthorized");
      }

      return meeting[0];
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const meeting = await ctx.db
        .delete(meetings)
        .where(eq(meetings.id, input.id))
        .returning();

      if (!meeting[0] || meeting[0].userId !== ctx.userId) {
        throw new Error("Meeting not found or unauthorized");
      }

      return { success: true };
    }),
  getByBotId: publicProcedure
    .input(z.object({ botId: z.string() }))
    .query(async ({ input }) => {
      const meeting = await db
        .select()
        .from(meetings)
        .where(
          eq(meetings.botId, input.botId)
        )
        .limit(1);

      if (!meeting[0]) {
        throw new Error("Meeting not found or unauthorized");
      }

      return meeting[0];
    }),
  extractHeaders: publicProcedure
    .input(z.object({ 
      botId: z.string(),
      transcript: transcriptResponseSchema.array()
    }))
    .mutation(async ({ input }) => {
      const meeting = await db
        .select()
        .from(meetings)
        .where(eq(meetings.botId, input.botId))
        .limit(1);

      if (!meeting[0]) {
        throw new Error("Meeting not found");
      }
      // Get the conversation to fetch the Google Sheet ID
      const convo = await db
        .select()
        .from(conversations)
        .where(eq(conversations.id, meeting[0].conversationId))
        .limit(1);

      if (!convo[0]?.googleSheetId) {
        throw new Error("No Google Sheet linked to this conversation");
      }

      // Get user's Google OAuth token
      const tokenResponse = await (await clerkClient()).users.getUserOauthAccessToken(meeting[0].userId, 'oauth_google');
      const accessToken = tokenResponse.data[0]?.token;
      if (!accessToken) {
        throw new Error('No valid Google OAuth token found');
      }

      // Get column headers from the sheet
      const headers = await getColumnHeaders(accessToken, convo[0].googleSheetId);
      const prompt = await extractTranscriptHeaderValues(input.transcript, headers, convo[0].analysisPrompt);


    }),

  analyzeInsights: publicProcedure
    .input(z.object({
      botId: z.string(),
      transcript: transcriptResponseSchema.array()
    }))
    .mutation(async ({ input }) => {
      const meeting = await db
        .select()
        .from(meetings)
        .where(eq(meetings.botId, input.botId))
        .limit(1);

      if (!meeting[0]) {
        throw new Error("Meeting not found");
      }

      // Update the meeting with analyzed insights
      const updatedMeeting = await db
        .update(meetings)
        .set({
          llmExtractedData: input.transcript, // Store transcript in llmExtractedData for now
          processingStatus: 'completed',
          updatedAt: new Date(),
        })
        .where(eq(meetings.id, meeting[0].id))
        .returning();

      return updatedMeeting[0];
    }),



});
