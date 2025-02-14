import { tool } from 'ai';
import { z } from 'zod';
import { createBot } from '@/lib/recall';
import { extractSpreadsheetId, getColumnHeaders } from '@/lib/google';
import { db } from '@/server/db';
import { meetings, conversations } from '@/server/db/schema';
import { eq } from 'drizzle-orm';
import { clerkClient } from '@clerk/nextjs/server';
/**
 * Tool for joining a Zoom meeting.
 * This tool deploys a meeting bot (via Recall API) and creates a meeting record.
 */
export const joinMeetingTool = tool({
  description: 'Joins a Zoom meeting and creates a meeting record.',
  parameters: z.object({
    zoomUrl: z.string().describe('The full Zoom meeting URL'),
    conversationId: z.number().describe('The conversation identifier'),
    userId: z.string().describe('The ID of the user initiating the meeting'),
  }),
  async execute({ zoomUrl, conversationId, userId}) {
    // Call the Recall API to create a bot for the meeting.
    const bot = await createBot(zoomUrl);

    // Insert a new meeting record into the database.
    // Adjust this query to match your actual DB schema and fields.
    await db.insert(meetings).values({
      conversationId,
      botId: bot.id,
      userId: userId,
    });

    return { joined: true, botId: bot.id };
  },
});


/**
 * Tool for linking a spreadsheet to a conversation.
 * This tool validates the provided spreadsheet URL, fetches the column headers,
 * and if no spreadsheet is already linked to the conversation, it updates that conversation.
 */
export const linkSpreadsheetTool = tool({
  description: 'Links a Google Sheets spreadsheet to a conversation.',
  parameters: z.object({
    conversationId: z.number().describe('The conversation identifier to update'),
    spreadsheetUrl: z.string().describe('The full Google Sheets URL'),
    userId: z.string().describe('The ID of the user initiating the meeting'),
  }),
  async execute({ conversationId, spreadsheetUrl, userId }) {
    // Extract the spreadsheet ID from the URL.
    const googleSheetId = extractSpreadsheetId(spreadsheetUrl);
    if (!googleSheetId) {
      throw new Error('Invalid Google Sheets URL: Unable to extract spreadsheet ID.');
    }
    const tokenResponse = await (await clerkClient()).users.getUserOauthAccessToken(userId, 'oauth_google');

    const accessToken = tokenResponse.data[0]?.token;
    if (!accessToken) {
      throw new Error('No valid OAuth token found.');
    }

    // Fetch the column headers from the spreadsheet.
    const headers = await getColumnHeaders(accessToken, googleSheetId);
    if (headers.length === 0) {
      throw new Error('The spreadsheet does not contain any column headers.');
    }

    // Check if the conversation already has a spreadsheet linked
    const existingConversation = await db
      .select()
      .from(conversations)
      .where(eq(conversations.id, conversationId))
      .limit(1);

    if (!existingConversation[0]) {
      throw new Error('Conversation not found.');
    }

    if (existingConversation[0].googleSheetId) {
      throw new Error('A spreadsheet has already been linked to this conversation.');
    }

    // Update the conversation with the new spreadsheet ID
    await db.update(conversations)
      .set({ googleSheetId: googleSheetId })
      .where(eq(conversations.id, conversationId));

    return { linked: true, googleSheetId, headers };
  },
});

export const tools = {
  joinMeeting: joinMeetingTool,
  linkSpreadsheet: linkSpreadsheetTool,
};
