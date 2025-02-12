import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { conversations, chatMessages } from "@/server/db/schema";
import { desc, eq } from "drizzle-orm";

export const conversationRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().optional(),
        googleSheetId: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const conversation = await ctx.db
        .insert(conversations)
        .values({
          userId: ctx.userId,
          name: input.name,
          googleSheetId: input.googleSheetId,
        })
        .returning();

      return conversation[0];
    }),

  getAll: protectedProcedure.query(async ({ ctx }) => {
    const userConversations = await ctx.db
      .select()
      .from(conversations)
      .where(eq(conversations.userId, ctx.userId))
      .orderBy(desc(conversations.updatedAt));

    return userConversations;
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const conversation = await ctx.db
        .select()
        .from(conversations)
        .where(eq(conversations.id, input.id))
        .limit(1);

      if (!conversation[0] || conversation[0].userId !== ctx.userId) {
        throw new Error("Conversation not found or unauthorized");
      }

      return conversation[0];
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
      const conversation = await ctx.db
        .update(conversations)
        .set({
          name: input.name,
          googleSheetId: input.googleSheetId,
          updatedAt: new Date(),
        })
        .where(eq(conversations.id, input.id))
        .returning();

      if (!conversation[0] || conversation[0].userId !== ctx.userId) {
        throw new Error("Conversation not found or unauthorized");
      }

      return conversation[0];
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      // First delete all messages in the conversation
      await ctx.db
        .delete(chatMessages)
        .where(eq(chatMessages.conversationId, input.id));

      // Then delete the conversation
      const conversation = await ctx.db
        .delete(conversations)
        .where(eq(conversations.id, input.id))
        .returning();

      if (!conversation[0] || conversation[0].userId !== ctx.userId) {
        throw new Error("Conversation not found or unauthorized");
      }

      return { success: true };
    }),
});
