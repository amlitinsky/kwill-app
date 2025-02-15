import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "@/server/api/trpc";
import { meetings } from "@/server/db/schema";
import { desc, eq, and } from "drizzle-orm";
import { type SQL } from "drizzle-orm";
import { db } from "@/server/db";


export const meetingRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        conversationId: z.number(),
        botId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const meeting = await ctx.db
        .insert(meetings)
        .values({
          userId: ctx.userId,
          conversationId: input.conversationId,
          processingStatus: "pending",
          botId: input.botId,
        })
        .returning();

      return meeting[0];
    }),

  getAll: protectedProcedure
    .input(
      z.object({
        conversationId: z.number().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const conditions: SQL[] = [eq(meetings.userId, ctx.userId)];

      if (input.conversationId) {
        conditions.push(eq(meetings.conversationId, input.conversationId));
      }

      const userMeetings = await ctx.db
        .select()
        .from(meetings)
        .where(conditions.length === 1 ? conditions[0] : and(...conditions))
        .orderBy(desc(meetings.createdAt));

      return userMeetings;
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const meeting = await ctx.db
        .select()
        .from(meetings)
        .where(eq(meetings.id, input.id))
        .limit(1);

      if (!meeting[0] || meeting[0].userId !== ctx.userId) {
        throw new Error("Meeting not found or unauthorized");
      }

      return meeting[0];
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const meeting = await ctx.db
        .delete(meetings)
        .where(eq(meetings.id, input.id))
        .returning();

      if (!meeting[0] || meeting[0].userId !== ctx.userId) {
        throw new Error("Meeting not found or unauthorized");
      }

      return { success: true };
    }),
  getByBotId: publicProcedure
    .input(z.object({ botId: z.string() }))
    .query(async ({ input }) => {
      const meeting = await db
        .select()
        .from(meetings)
        .where(
          eq(meetings.botId, input.botId)
        )
        .limit(1);

      if (!meeting[0]) {
        throw new Error("Meeting not found or unauthorized");
      }

      return meeting[0];
    }),
});
