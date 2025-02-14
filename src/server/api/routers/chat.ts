import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "@/server/api/trpc";
import { chatMessages } from "@/server/db/schema";
import { eq, and, asc } from "drizzle-orm";
import { db } from "@/server/db";

export const chatRouter = createTRPCRouter({
  sendMessage: protectedProcedure
    .input(
      z.object({
        content: z.string(),
        role: z.enum(["user", "assistant"]),
        conversationId: z.number(),
        metadata: z.record(z.string(), z.string()).optional(),
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
        role: input.role,
        conversationId: input.conversationId,
        metadata: input.metadata,
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

  sendAnalysisMessage: publicProcedure 
    .input(
      z.object({
        content: z.string(),
        role: z.enum(["user", "assistant"]),
        conversationId: z.number(),
        userId: z.string(),
        metadata: z.record(z.string(), z.string()).optional(),
      })
    )
    .mutation(async ({ input }) => {

      // Insert user message
      await db.insert(chatMessages).values({
        content: input.content,
        userId: input.userId,
        role: input.role,
        conversationId: input.conversationId,
        metadata: input.metadata,
      });


      return { success: true };
    }),
}); 