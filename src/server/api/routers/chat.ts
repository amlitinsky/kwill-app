import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { chatMessages } from "@/server/db/schema";
import { desc, eq } from "drizzle-orm";

export const chatRouter = createTRPCRouter({
  sendMessage: protectedProcedure
    .input(
      z.object({
        content: z.string(),
        meetingId: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Insert user message
      await ctx.db.insert(chatMessages).values({
        content: input.content,
        userId: ctx.userId,
        role: "user",
        meetingId: input.meetingId,
      });

      // TODO: Process message with AI
      // For now, just echo back
      await ctx.db.insert(chatMessages).values({
        content: `You said: ${input.content}`,
        userId: ctx.userId,
        role: "assistant",
        meetingId: input.meetingId,
      });

      return { success: true };
    }),

  getMessages: protectedProcedure
    .input(
      z.object({
        limit: z.number().default(50),
        cursor: z.number().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const messages = await ctx.db
        .select()
        .from(chatMessages)
        .where(eq(chatMessages.userId, ctx.userId))
        .orderBy(desc(chatMessages.createdAt))
        .limit(input.limit);

      return messages;
    }),
}); 