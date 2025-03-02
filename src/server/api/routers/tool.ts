import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { meetings, chats, subscriptions } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { clerkClient } from "@clerk/nextjs/server";
import { extractSpreadsheetId, getColumnHeaders } from "@/lib/google";
import { createBot } from "@/lib/recall";

export const toolRouter = createTRPCRouter({
  joinMeeting: protectedProcedure
    .input(
      z.object({
        chatId: z.string(),
        meetingUrl: z.string().url()
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if user has available hours
      const [subscription] = await ctx.db
        .select()
        .from(subscriptions)
        .where(eq(subscriptions.userId, ctx.userId));

      // Check if user has available minutes
      if (!subscription || subscription.minutes <= 0) {
        return "No available meeting time in subscription. Please upgrade your plan.";
      }

      // Convert minutes to seconds for the bot's automatic leave timeout
      const secondsAvailable = subscription.minutes * 60;
      
      const bot = await createBot(input.meetingUrl, {
        automatic_leave: secondsAvailable
      });
      
      await ctx.db.insert(meetings).values({
        chatId: input.chatId,
        botId: bot.id,
        userId: ctx.userId,
      });

      return "Meeting bot deployed successfully!";
    }),

  linkSpreadsheet: protectedProcedure
    .input(
      z.object({
        chatId: z.string(),
        spreadsheetUrl: z.string().url(),
        analysisPrompt: z.string().optional()
      })
    )
    .mutation(async ({ ctx, input }) => {

      if (!input.spreadsheetUrl.includes('docs.google.com/spreadsheets')) {
        throw new Error('Invalid spreadsheet URL.');
      }

      const spreadsheetId = extractSpreadsheetId(input.spreadsheetUrl);
      if (!spreadsheetId) {
        throw new Error("Invalid Google Sheets URL");
      }

      const tokenResponse = await (await clerkClient()).users.getUserOauthAccessToken(
        ctx.userId, 
        'oauth_google'
      );

      const accessToken = tokenResponse.data[0]?.token;

      const headers = await getColumnHeaders(accessToken!, spreadsheetId);
      if (headers.length === 0) {
        return "Spreadsheet has no column headers"
      }

      const existingChat = await ctx.db.query.chats.findFirst({
        where: eq(chats.id, input.chatId)
      });

      if (!existingChat) {
        throw new Error("Chat not found");
      }

      if (existingChat.googleSheetId) {
        return "Spreadsheet already linked to this chat"
      }

      await ctx.db.update(chats)
        .set({ 
          googleSheetId: spreadsheetId,
          analysisPrompt: input.analysisPrompt,
          updatedAt: new Date()
        })
        .where(eq(chats.id, input.chatId));

      return "Spreadsheet linked successfully!";
    })
});
