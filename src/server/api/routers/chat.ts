import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "@/server/api/trpc";
import { chats, messages } from "@/server/db/schema";
import { desc, eq } from "drizzle-orm";
import { google } from "@ai-sdk/google";
import { generateText } from "ai";

export const chatRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().optional(),
        googleSheetId: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const chat = await ctx.db
        .insert(chats)
        .values({
          userId: ctx.userId,
          name: input.name,
          googleSheetId: input.googleSheetId,
        })
        .returning();

      return chat[0];
    }),

  list: protectedProcedure.query(async ({ ctx }) => {
    const userChats = await ctx.db
      .select()
      .from(chats)
      .where(eq(chats.userId, ctx.userId))
      .orderBy(desc(chats.updatedAt));

    return userChats;
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const chat = await ctx.db
        .select()
        .from(chats)
        .where(eq(chats.id, input.id))
        .limit(1);

      if (!chat[0] || chat[0].userId !== ctx.userId) {
        throw new Error("Chat not found or unauthorized");
      }

      return chat[0];
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string().optional(),
        googleSheetId: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const chat = await ctx.db
        .update(chats)
        .set({
          name: input.name,
          googleSheetId: input.googleSheetId,
          updatedAt: new Date(),
        })
        .where(eq(chats.id, input.id))
        .returning();

      if (!chat[0] || chat[0].userId !== ctx.userId) {
        throw new Error("Chat not found or unauthorized");
      }

      return chat[0];
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      // First delete all messages in the conversation
      await ctx.db
        .delete(messages)
        .where(eq(messages.chatId, input.id));

      // Then delete the conversation
      const chat = await ctx.db
        .delete(chats)
        .where(eq(chats.id, input.id))
        .returning();

      if (!chat[0] || chat[0].userId !== ctx.userId) {
        throw new Error("Chat not found or unauthorized");
      }

      return { success: true };
    }),

  name: publicProcedure
    .input(z.object({ text: z.string() }))
    .mutation(async ({ input }) => {
      const { text } = input;
      if (!text) {
        throw new Error("Missing text");
      }

      // Craft the prompt for the LLM
      const prompt = `Generate a succinct and descriptive conversation title based on the following message: "${text}". The title should be no longer than 10 words. Use plain text, no markdown.`;

      // Use the LLM to generate the title
      const result = await generateText({
        model: google('gemini-2.0-flash-001'),
        prompt,
        maxTokens: 20,
      });

      const name = result.text.trim() || "New Chat";

      return { name };
    }),
});
