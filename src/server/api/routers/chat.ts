import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { chatMessages, conversations } from "@/server/db/schema";
import { desc, eq } from "drizzle-orm";

export const chatRouter = createTRPCRouter({
  sendMessage: protectedProcedure
    .input(
      z.object({
        content: z.string(),
        conversationId: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Insert user message
      await ctx.db.insert(chatMessages).values({
        content: input.content,
        userId: ctx.userId,
        role: "user",
        conversationId: input.conversationId,
        metadata: {}, // Empty metadata for now
      });

      // TODO: Process message with AI
      // For now, just echo back
      await ctx.db.insert(chatMessages).values({
        content: `You said: ${input.content}`,
        userId: ctx.userId,
        role: "assistant",
        conversationId: input.conversationId,
        metadata: {}, // Empty metadata for now
      });

      return { success: true };
    }),

  getMessages: protectedProcedure
    .input(
      z.object({
        conversationId: z.number(),
        limit: z.number().default(50),
        cursor: z.number().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const messages = await ctx.db
        .select()
        .from(chatMessages)
        .where(eq(chatMessages.conversationId, input.conversationId))
        .orderBy(desc(chatMessages.createdAt))
        .limit(input.limit);

      return messages;
    }),

  createConversation: protectedProcedure
    .input(
      z.object({
        name: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const conversation = await ctx.db
        .insert(conversations)
        .values({
          userId: ctx.userId,
          name: input.name,
        })
        .returning();

      return conversation[0];
    }),

  getConversations: protectedProcedure
    .query(async ({ ctx }) => {
      const userConversations = await ctx.db
        .select()
        .from(conversations)
        .where(eq(conversations.userId, ctx.userId))
        .orderBy(desc(conversations.updatedAt));

      return userConversations;
    }),
}); 