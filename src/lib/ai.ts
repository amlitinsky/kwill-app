import { google } from '@ai-sdk/google';
import { generateText } from 'ai';
import type { ProcessedTranscriptSegment } from './transcript-utils';

const model = google('gemini-2.0-flash-001');

export type MessageIntent = 
  | { type: 'zoom_meeting'; zoomUrl: string }
  | { type: 'spreadsheet_link'; spreadsheetUrl: string }
  | { type: 'unknown' };

export async function detectMessageIntent(message: string): Promise<MessageIntent> {
  const prompt = `
  You are an AI assistant that analyzes user messages to detect their intent. Focus on identifying URLs and actions related to Zoom meetings and Google Sheets.

  Task: Analyze the following message and identify if it contains:
  1. A Zoom meeting URL (format: https://zoom.us/j/... or similar)
  2. A Google Sheets URL (format: https://docs.google.com/spreadsheets/d/...)

  Return ONLY a JSON object with the following structure:
  For Zoom meetings: { "type": "zoom_meeting", "zoomUrl": "full_zoom_url" }
  For Google Sheets: { "type": "spreadsheet_link", "spreadsheetUrl": "full_sheets_url" }
  For unknown/other: { "type": "unknown" }

  Message to analyze: "${message}"

  Rules:
  - Extract ONLY valid URLs that match the expected formats
  - Return ONLY ONE intent type, prioritizing Zoom meetings over spreadsheets if both are present
  - Do not modify or clean the URLs, return them exactly as found
  - If no valid URLs are found, return the unknown type
  `;

  try {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
    const { text } = await generateText({
      model:model,
      prompt: prompt,
    });
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    return JSON.parse(text) as MessageIntent;
  } catch (error) {
    console.error('Error detecting message intent:', error);
    // Fallback to regex-based detection
    return fallbackIntentDetection(message);
  }
}

function fallbackIntentDetection(message: string): MessageIntent {
  const zoomPattern = /https:\/\/[a-zA-Z0-9-.]+\/j\/[0-9]+/;
  const sheetsPattern = /https:\/\/docs\.google\.com\/spreadsheets\/d\/[a-zA-Z0-9-_]+/;
  
  const zoomMatch = zoomPattern.exec(message);
  if (zoomMatch) {
    return {
      type: 'zoom_meeting',
      zoomUrl: zoomMatch[0]
    };
  }
  
  const sheetsMatch = sheetsPattern.exec(message);
  if (sheetsMatch) {
    return {
      type: 'spreadsheet_link',
      spreadsheetUrl: sheetsMatch[0]
    };
  }
  
  return { type: 'unknown' };
}


export async function extractTranscriptHeaderValues(
  transcript: ProcessedTranscriptSegment[], 
  columnHeaders: string[], 
  prompt: string
): Promise<Record<string, string>> {
  const mainPrompt = `
  You are an expert data analyst specializing in extracting structured information from meeting transcripts. Your task is to analyze the provided transcript and generate a valid JSON object mapping specific data points to predefined column headers.

  Output Format:
  {
    "column_header_1": "extracted_value_1",
    "column_header_2": "extracted_value_2",
    ...
  }

  Column Headers to Map:
  ${columnHeaders.join(', ')}

  Analysis Guidelines:
  1. Focus on factual, objective information that directly maps to the column headers
  2. Exclude any comments or responses from "[VC person name here]"
  3. For numerical values, maintain original numbers and units if mentioned
  4. For dates/timelines, standardize to ISO format when possible
  5. If multiple potential values exist for a header, choose the most relevant/final one
  6. If no relevant information is found for a header, use an empty string ""
  7. Maintain context when extracting information
  8. Consider both explicit statements and implied information
  9. For pricing/financial information, be precise and include currency markers

  Custom Analysis Prompt:
  ${prompt}

  Transcript Analysis:
  ${JSON.stringify(transcript)}

  Additional Requirements:
  - Ensure all extracted values are strings in the output JSON
  - Do not add any headers not present in the provided list
  - Do not include explanations or metadata in the output
  - Focus on the most definitive/final mentions when multiple options exist
  - Exclude pleasantries, small talk, and off-topic discussions
  - Consider the entire context when extracting information
  `;

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
  const { text } = await generateText({
    model: model,
    prompt: mainPrompt,
  });

  try {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-argument
    return JSON.parse(text) 
  } catch (error) {
    console.error('Failed to parse LLM response:', error);
    throw new Error('Failed to generate valid JSON from transcript analysis');
  }
}
export interface MeetingAnalysis {
  meetingAnalysis: {
    summary: string;
    actionItems: string[];
    keyPoints: string[];
    topicDistribution: Record<string, number>;
  };
  speakerInsights: Record<string, {
    participationRate: number;
    averageSpeakingPace: number;
    totalSpeakingTime: number;
    keyContributions: string[];
  }>;
}

export async function generateFullMeetingInsights(
  transcript: ProcessedTranscriptSegment[]
): Promise<MeetingAnalysis> {
  const prompt = `
  You are an expert meeting analyst and conversation dynamics expert.
  
  Based on the provided transcript, perform the following analyses:

  1. Meeting Analysis:
     - Generate a comprehensive meeting summary (200-300 words) that covers the main discussion points, decisions, outcomes, and key takeaways.
     - Extract Action Items in the format: "[Owner] to [Action] by [Deadline if specified]".
     - List 5-7 critical Key Points that focus on strategic decisions, important metrics, and significant challenges.
     - Determine Topic Distribution: Identify main discussion topics and approximate the percentage of meeting time spent on each. Ensure each topic is at least 5% and the total sums to 100%.

  2. Speaker Dynamics:
     - For each speaker, calculate the Participation Rate (percentage of total meeting time spoken).
     - Determine the Average Speaking Pace (words per minute) and the Total Speaking Time in minutes.
     - Provide 2-3 Key Contributions for each speaker.

  Transcript to analyze:
  ${JSON.stringify(transcript)}

  Return the analysis as a JSON object with the following structure:
  {
    "meetingAnalysis": {
      "summary": "string",
      "actionItems": ["string"],
      "keyPoints": ["string"],
      "topicDistribution": { "topic": percentage }
    },
    "speakerInsights": {
       "speaker_name": {
         "participationRate": number,
         "averageSpeakingPace": number,
         "totalSpeakingTime": number,
         "keyContributions": ["string"]
       }
    }
  }
  `;

  try {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
    const { text } = await generateText({
      model:model,
      prompt: prompt,
    });
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    return JSON.parse(text) as MeetingAnalysis;
  } catch (error) {
    console.error('Error generating full meeting analysis:', error);
    throw new Error('Failed to generate full meeting analysis');
  }
}
