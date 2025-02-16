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
        chatId: z.number(),
        meetingUrl: z.string().url()
      })
    )
    .mutation(async ({ ctx, input }) => {
      const bot = await createBot(input.meetingUrl);
      
      await ctx.db.insert(meetings).values({
        chatId: input.chatId,
        botId: bot.id,
        userId: ctx.userId,
      });

      return { success: true, message: "Meeting bot deployed successfully!" };
    }),

  linkSpreadsheet: protectedProcedure
    .input(
      z.object({
        chatId: z.number(),
        spreadsheetUrl: z.string().url()
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
        return { 
          success: false,
          message: "Spreadsheet has no column headers" 
        };
      }

      const existingChat = await ctx.db.query.chats.findFirst({
        where: eq(chats.id, input.chatId)
      });

      if (!existingChat) {
        throw new Error("Chat not found");
      }

      if (existingChat.googleSheetId) {
        return { 
          success: false, 
          message: "Spreadsheet already linked to this chat" 
        };
      }

      await ctx.db.update(chats)
        .set({ 
          googleSheetId: spreadsheetId,
          updatedAt: new Date()
        })
        .where(eq(chats.id, input.chatId));

      return { 
        success: true, 
        message: "Spreadsheet linked successfully!" 
      };
    })
});
