import { google } from '@ai-sdk/google';
import { auth } from '@clerk/nextjs/server';
import { streamText } from 'ai';
import { db } from '@/server/db';
import { chatMessages, conversations } from '@/server/db/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

const model = google('gemini-2.0-flash-001');

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

// Validate the request payload
const chatRequestSchema = z.object({
  messages: z.array(z.object({
    role: z.enum(['user', 'assistant', 'system']),
    content: z.string(),
    id: z.string().optional(),
  })).min(1),
  conversationId: z.number(),
});

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return new Response('Unauthorized', { status: 401 });
  }

  // Parse and validate the request
  const body = await req.json() as unknown;
  const result = chatRequestSchema.safeParse(body);
  
  if (!result.success) {
    console.error('Invalid request payload:', result.error);
    return new Response('Invalid request payload', { status: 400 });
  }

  const { messages, conversationId } = result.data;
  const lastMessage = messages[messages.length - 1];
  if (!lastMessage) {
    return new Response('No message provided', { status: 400 });
  }

  try {
    // Verify conversation exists and belongs to user
    const conversation = await db
      .select()
      .from(conversations)
      .where(eq(conversations.id, conversationId))
      .limit(1);

    if (!conversation[0] || conversation[0].userId !== userId) {
      return new Response('Conversation not found or unauthorized', { status: 404 });
    }

    // Insert user message
    await db.insert(chatMessages).values({
      content: lastMessage.content,
      userId,
      role: 'user',
      conversationId,
      metadata: {}, // Empty metadata for now
    });

    // Get AI response first
    const result = streamText({
      model,
      messages,
      onFinish: async (text) => {
        // Save the assistant message to the database
        await db.insert(chatMessages).values({
          content: text.text,
          userId,
          role: 'assistant',
          conversationId,
          metadata: {}, // Empty metadata for now
        });
      },
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error('Error processing chat request:', error);
    return new Response('Internal server error', { status: 500 });
  }
}