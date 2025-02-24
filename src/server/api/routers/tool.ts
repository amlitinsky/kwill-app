import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { meetings, chats } from "@/server/db/schema";
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
      // TODO: add a try catch to see if it actually created the bot
      const bot = await createBot(input.meetingUrl);
      
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
