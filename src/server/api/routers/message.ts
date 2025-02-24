import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { messages } from "@/server/db/schema";
import { eq, and, asc, sql } from "drizzle-orm";

export const messageRouter = createTRPCRouter({
  load: protectedProcedure
    .input(
      z.object({
        chatId: z.string(),
        limit: z.number().default(50),
        cursor: z.number().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      return ctx.db
        .select()
        .from(messages)
        .where(
          and(
            eq(messages.chatId, input.chatId),
            eq(messages.userId, ctx.userId)
          )
        )
        .orderBy(asc(messages.createdAt)) // TODO maybe change to desc
        .limit(input.limit);
    }),

  save: protectedProcedure
    .input(
      z.object({
        chatId: z.string(),
        messages: z.array(
          z.object({
            id: z.string().optional(),
            role: z.enum(["user", "assistant", "system", "data"]),
            content: z.string(),
            parts: z.array(z.any()).optional().default([]),
            metadata: z.object({
              toolCalls: z.array(z.any()).optional(),
              toolResults: z.array(z.any()).optional(),
            }).optional().default({}),
          })
        ),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.transaction(async (tx) => {
        // Extract message IDs from the input (only those that exist)
        // const inputIds = input.messages
        //   .map((msg) => msg.id)
        //   .filter((id): id is string => !!id);
        
        // Remove any messages in this chat that are not in the new list.
        // (If you do not want deletion, skip this step.)
        // await tx.delete(messages)
        //   .where(
        //     and(
        //       eq(messages.chatId, input.chatId),
        //       inputIds.length > 0 ? not(inArray(messages.id, inputIds)) : sql``
        //     )
        //   );
        
        // Prepare messages for upserting.
        const messagesToUpsert = input.messages.map((msg) => {

          // TODO verify that I don't need this specifically
          // Check if there are any tool invocations
          // const hasTool = msg.parts?.some((part: unknown) => {
          //   return (part as { type: string }).type === 'tool-invocation';
          // });

          // Get content based on message type
          // const content = hasTool
          //   ? `Tool action completed: ${(msg.parts[0] as { toolInvocation: { toolName: string } }).toolInvocation.toolName}`
          //   : msg.content;

          return {
            id: msg.id ?? crypto.randomUUID(),
            role: msg.role,
            content: msg.content || 'Action has been completed',
            parts: msg.parts,
            metadata: msg.metadata,
            userId: ctx.userId,
            chatId: input.chatId,
            updatedAt: new Date(),
          };
        });
        
        // Upsert each record: if a message with the same id exists, update it.
        const result = await tx.insert(messages)
          .values(messagesToUpsert)
          .onConflictDoUpdate({
            target: messages.id,
            set: {
              content: sql`EXCLUDED.content`,
              parts: sql`EXCLUDED.parts`,
              metadata: sql`EXCLUDED.metadata`,
              role: sql`EXCLUDED.role`,
              updatedAt: sql`EXCLUDED.updated_at`,
            },
          })
          .returning();
        
        return result;
      });
    }),

  // Optional: Add update/delete if needed
}); 