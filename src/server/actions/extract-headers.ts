import { db } from "@/server/db";
import { meetings, conversations } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { clerkClient } from "@clerk/nextjs/server";
import { google } from "@ai-sdk/google";
import { generateText } from "ai";
import { appendRowToSheet, getColumnHeaders } from "@/lib/google";
import { extractTranscriptHeaderValues } from "@/lib/ai/prompts";
import { type TranscriptResponse } from "@/lib/recall";

export async function extractMeetingHeaders(
  botId: string, 
  transcript: TranscriptResponse[]
) {
  const meeting = await db
    .select()
    .from(meetings)
    .where(eq(meetings.botId, botId))
    .limit(1);

  if (!meeting[0]) {
    throw new Error("Meeting not found");
  }

  const convo = await db
    .select()
    .from(conversations)
    .where(eq(conversations.id, meeting[0].conversationId))
    .limit(1);

  if (!convo[0]?.googleSheetId) {
    throw new Error("No Google Sheet linked to this conversation");
  }

  const tokenResponse = await (await clerkClient()).users.getUserOauthAccessToken(meeting[0].userId, 'oauth_google');
  const accessToken = tokenResponse.data[0]?.token;
  if (!accessToken) {
    throw new Error('No valid Google OAuth token found');
  }

  const headers = await getColumnHeaders(accessToken, convo[0].googleSheetId);
  const prompt = await extractTranscriptHeaderValues(transcript, headers, convo[0].analysisPrompt);
  const model = google('gemini-2.0-flash-001');

  const {text: result} = await generateText({
    model,
    prompt
  });

  const extractedValues = JSON.parse(result) as Record<string, string | number | boolean>;

  await appendRowToSheet(accessToken, convo[0].googleSheetId, extractedValues, headers);

  const updatedMeeting = await db
    .update(meetings)
    .set({
      extractedHeaders: extractedValues,
      processingStatus: 'completed',
      updatedAt: new Date(),
    })
    .where(eq(meetings.id, meeting[0].id))
    .returning();

  return updatedMeeting[0];
}