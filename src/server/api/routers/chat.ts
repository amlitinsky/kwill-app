import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { chats, messages } from "@/server/db/schema";
import { desc, eq } from "drizzle-orm";
import { google } from "@ai-sdk/google";
import { generateText } from "ai";
import { nameChat } from "@/lib/ai/prompts";

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
      .where(
        eq(chats.userId, ctx.userId)
      )
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

  generateName: protectedProcedure
    .input(z.object({ 
      text: z.string(),
      id: z.number()
    }))
    .mutation(async ({ ctx, input }) => {
      const { text, id } = input;
      if (!text) {
        throw new Error("Missing text");
      }

      // Get current chat
      const chat = await ctx.db.query.chats.findFirst({
        where: eq(chats.id, id)
      });

      if (!chat) {
        throw new Error("Chat not found");
      }

      if (chat.name !== "New Chat") {
        return { name: chat.name };

      }

      const result = await generateText({
        model: google('gemini-2.0-flash-001'),
        prompt: nameChat(text),
        maxTokens: 20,
      });

      const name = result.text.trim() || "New Chat";

      // Update chat with new name
      const updatedChat = await ctx.db
        .update(chats)
        .set({
          name: name,
          updatedAt: new Date()
        })
        .where(eq(chats.id, id))
        .returning();

      return { name: updatedChat[0]?.name };
    }),
});
