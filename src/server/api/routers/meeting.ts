import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "@/server/api/trpc";
import { meetings, chats, messages, subscriptions } from "@/server/db/schema";
import { desc, eq, and } from "drizzle-orm";
import { type SQL } from "drizzle-orm";
import { calculateMeetingDurationInMinutes, transcriptResponseSchema } from "@/lib/recall";
import { extractTranscriptHeaderValues, generateFullMeetingInsights } from "@/lib/ai/prompts";
import { generateObject, generateText } from "ai";
import { formattedMeetingInsights } from "@/lib/ai/formats";
import { getColumnHeaders } from "@/lib/google";
import { appendRowToSheet } from "@/lib/google";
import { clerkClient } from "@clerk/nextjs/server";
import { deepseekChat } from "@/lib/ai/models";

export const meetingInsightsSchema = z.object({
  meetingAnalysis: z.object({
    summary: z.string(),
    actionItems: z.array(z.string()),
    keyPoints: z.array(z.string()),
    topicDistribution: z.record(z.number())
  }).required(),
  speakerInsights: z.record(z.object({
    participationRate: z.number(),
    averageSpeakingPace: z.number(),
    totalSpeakingTime: z.number(),
    keyContributions: z.array(z.string())
  }).required())
});

export const meetingRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        chatId: z.string(),
        botId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const meeting = await ctx.db
        .insert(meetings)
        .values({
          userId: ctx.userId,
          chatId: input.chatId,
          processingStatus: "pending",
          botId: input.botId,
        })
        .returning();

      return meeting[0];
    }),

  getAll: protectedProcedure
    .input(
      z.object({
        chatId: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const conditions: SQL[] = [eq(meetings.userId, ctx.userId)];

      if (input.chatId) {
        conditions.push(eq(meetings.chatId, input.chatId));
      }

      const userMeetings = await ctx.db
        .select()
        .from(meetings)
        .where(conditions.length === 1 ? conditions[0] : and(...conditions))
        .orderBy(desc(meetings.createdAt));

      return userMeetings;
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
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
    .input(z.object({ id: z.string() }))
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
    .query(async ({ ctx, input }) => {
      const meeting = await ctx.db
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
  analyzeInsights: publicProcedure
    .input(z.object({ botId: z.string(), transcript: z.array(transcriptResponseSchema)}))
    .mutation(async ({ ctx, input }) => {

      const meeting = await ctx.db
        .select()
        .from(meetings)
        .where(eq(meetings.botId, input.botId))
        .limit(1);

      if (!meeting[0]) {
        throw new Error("Meeting not found or unauthorized");
      }

      const chat = await ctx.db
        .select()
        .from(chats)
        .where(eq(chats.id, meeting[0].chatId))
        .limit(1);

      if (!chat[0]) {
        throw new Error("Chat not found or unauthorized");
      }
      
      const prompt = generateFullMeetingInsights(input.transcript, chat[0].analysisPrompt ?? undefined);
      const analyzedData = await generateObject({
        model: deepseekChat,
        prompt,
        schema: meetingInsightsSchema
      });

      await ctx.db
        .update(meetings)
        .set({
          llmExtractedData: analyzedData.object,
          processingStatus: 'completed',
          updatedAt: new Date(),
        })
        .where(eq(meetings.id, meeting[0].id))
        .returning();

      const data = analyzedData.object;

      // I should also include column mappings if they exist
      const formattedMessage = formattedMeetingInsights(data);

      await ctx.db
      .insert(messages)
      .values({
        id: crypto.randomUUID(),
        content: formattedMessage,
        userId: meeting[0].userId,
        role: 'assistant',
        parts: [{
          type: 'text',
          text: formattedMessage
        }],
        chatId: meeting[0].chatId,
        metadata: {
          type: 'meeting_analysis',
          meetingId: meeting[0].id
        },
      });

      const meetingDuration = await calculateMeetingDurationInMinutes(input.botId);
      
      // Deduct meeting minutes from user's subscription
      if (meetingDuration > 0) {
        // Get user's current subscription
        const userSubscription = await ctx.db
          .select()
          .from(subscriptions)
          .where(eq(subscriptions.userId, meeting[0].userId))
          .limit(1);
        
        if (userSubscription[0]) {
          // Calculate new minutes balance
          const currentMinutes = userSubscription[0].minutes;
          const newMinutes = Math.max(0, currentMinutes - meetingDuration);
          
          // Update subscription with new minutes
          await ctx.db
            .update(subscriptions)
            .set({
              minutes: newMinutes,
              updatedAt: new Date(),
            })
            .where(eq(subscriptions.id, userSubscription[0].id));
        }
      }

      return { success: true };
    }),

  extractHeaders: publicProcedure
    .input(z.object({ botId: z.string(), transcript: z.array(transcriptResponseSchema)}))
    .mutation(async ({ ctx, input }) => {
      const meeting = await ctx.db
        .select()
        .from(meetings)
        .where(eq(meetings.botId, input.botId))
        .limit(1);

      if (!meeting[0]) {
        throw new Error("Meeting not found or unauthorized");
      }

      const chat = await ctx.db
        .select()
        .from(chats)
        .where(eq(chats.id, meeting[0].chatId))
        .limit(1);

      if (!chat[0]) {
        throw new Error("Chat not found or unauthorized");
      }

      if (!chat[0]?.googleSheetId) {
        return { success: false, message: "No Google Sheet linked - skipping operation" };
      }

      const tokenResponse = await (await clerkClient()).users.getUserOauthAccessToken(meeting[0].userId, 'oauth_google');
      const accessToken = tokenResponse.data[0]?.token;
      if (!accessToken) {
        throw new Error('No valid Google OAuth token found');
      }

      const headers = await getColumnHeaders(accessToken, chat[0].googleSheetId);
      const prompt = extractTranscriptHeaderValues(input.transcript, headers, chat[0].analysisPrompt);

      const {text: result} = await generateText({
        model: deepseekChat,
        prompt
      });

      const extractedValues = JSON.parse(result) as Record<string, string | number | boolean>;

      await appendRowToSheet(accessToken, chat[0].googleSheetId, extractedValues, headers);

      await ctx.db
        .update(meetings)
        .set({
          extractedHeaders: extractedValues,
          processingStatus: 'completed',
          updatedAt: new Date(),
        })
        .where(eq(meetings.id, meeting[0].id))

      return { success: true };

    })
});
