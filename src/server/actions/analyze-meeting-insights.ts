'use server'

import { db } from "@/server/db";
import { meetings, chats, messages } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { google } from "@ai-sdk/google";
import { generateObject } from "ai";
import { generateFullMeetingInsights } from "@/lib/ai/prompts";
import { type TranscriptResponse } from "@/lib/recall";
import { z } from "zod";

const meetingInsightsSchema = z.object({
  meetingAnalysis: z.object({
    summary: z.string(),
    actionItems: z.array(z.string()),
    keyPoints: z.array(z.string()),
    topicDistribution: z.record(z.number())
  }),
  speakerInsights: z.record(z.object({
    participationRate: z.number(),
    averageSpeakingPace: z.number(),
    totalSpeakingTime: z.number(),
    keyContributions: z.array(z.string())
  }))
});

export async function analyzeMeetingInsights(
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
    .from(chats)
    .where(eq(chats.id, meeting[0].chatId))
    .limit(1);

  if (!convo[0]) {
    throw new Error("Conversation not found");
  }

  const prompt = generateFullMeetingInsights(
    transcript,
    convo[0].analysisPrompt ?? undefined
  );

  const model = google('gemini-2.0-flash-001');
  const analyzedData = await generateObject({
    model,
    prompt,
    schema: meetingInsightsSchema
  });

  await db
    .update(meetings)
    .set({
      llmExtractedData: analyzedData,
      processingStatus: 'completed',
      updatedAt: new Date(),
    })
    .where(eq(meetings.id, meeting[0].id))
    .returning();

  const data = analyzedData.object;

  const formattedMessage = 
  ` 
  Meeting Analysis Summary:
  ${data.meetingAnalysis.summary}

  Action Items:
  ${data.meetingAnalysis.actionItems.map(item => `• ${item}`).join('\n')}

  Key Points:
  ${data.meetingAnalysis.keyPoints.map(point => `• ${point}`).join('\n')}

  Topic Distribution:
  ${Object.entries(data.meetingAnalysis.topicDistribution)
    .map(([topic, percentage]) => `• ${topic}: ${percentage}%`)
    .join('\n')}

  Speaker Insights:
  ${Object.entries(data.speakerInsights)
    .map(([speaker, insights]) => `
  ${speaker}:
  • Participation Rate: ${insights.participationRate}%
  • Average Speaking Pace: ${insights.averageSpeakingPace} words/min
  • Total Speaking Time: ${insights.totalSpeakingTime} minutes
  • Key Contributions:
  ${insights.keyContributions.map(contribution => `  - ${contribution}`).join('\n')}
  `).join('\n')}
  `;

  await db.insert(messages).values({
    id: crypto.randomUUID(),
    content: formattedMessage,
    userId: meeting[0].userId,
    role: "assistant",
    chatId: meeting[0].chatId,
    metadata: {
      type: "meeting_analysis",
      meetingId: meeting[0].id
    },
  });

  return { success: true };
}