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
export const joinMeeting= async (userId: string, conversationId: number, meetingUrl: string) => {
    // Call the Recall API to create a bot for the meeting.
    const bot = await createBot(meetingUrl);

    // Insert a new meeting record into the database.
    // Adjust this query to match your actual DB schema and fields.
    await db.insert(meetings).values({
      conversationId,
      botId: bot.id,
      userId: userId,
    });

    return "Successfully deployed meeting bot! It will join your call shortly"
}


/**
 * Tool for linking a spreadsheet to a conversation.
 * This tool validates the provided spreadsheet URL, fetches the column headers,
 * and if no spreadsheet is already linked to the conversation, it updates that conversation.
 */
export const linkSpreadsheet = async (userId: string, conversationId: number, spreadsheetUrl: string) => {
    // Extract the spreadsheet ID from the URL.
    console.log("link spreadsheet function called")
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
        return "Spreadsheet is already linked! Try linking the spreadsheet to a new conversation"
    }

    // Update the conversation with the new spreadsheet ID
    await db.update(conversations)
        .set({ googleSheetId: googleSheetId })
        .where(eq(conversations.id, conversationId));

    return "Spreadsheet sucessfully linked! I found the following headers: \n" + headers.join(", ") + "."
}
