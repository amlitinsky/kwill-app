import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { chatMessages } from "@/server/db/schema";
import { eq, and, asc } from "drizzle-orm";

export const chatRouter = createTRPCRouter({
  sendMessage: protectedProcedure
    .input(
      z.object({
        content: z.string(),
        conversationId: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verify conversation exists and belongs to user
      const messages = await ctx.db
        .select()
        .from(chatMessages)
        .where(
          and(
            eq(chatMessages.conversationId, input.conversationId),
            eq(chatMessages.userId, ctx.userId)
          )
        )
        .limit(1);

      if (!messages[0]) {
        throw new Error("Conversation not found or unauthorized");
      }

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
        .where(
          and(
            eq(chatMessages.conversationId, input.conversationId),
            eq(chatMessages.userId, ctx.userId)
          )
        )
        .orderBy(asc(chatMessages.createdAt))
        .limit(input.limit);

      return messages;
    }),
}); 