import { deepseek } from '@ai-sdk/deepseek';
import { generateText } from 'ai';
import { ProcessedTranscriptSegment } from './transcript-utils';

const model = deepseek('deepseek-chat');

export async function processTranscriptWithClaude(
  transcript: ProcessedTranscriptSegment[], 
  columnHeaders: string[], 
  customInstructions: string
): Promise<Record<string, string>> {
  const prompt = `
  You are an AI assistant tasked with extracting specific information from a transcript and producing a valid JSON object. The JSON object should have keys corresponding to the provided column headers and values based on your analysis of the transcript.
  
  Column Headers:
  ${columnHeaders.join(', ')}
  
  Transcript (speaker names included):
  ${JSON.stringify(transcript)}

  Instructions:
    1. Analyze the provided transcript.
    2. Extract relevant information for each column header.
    3. Exclude any context or responses from "[VC person name here]".
    4. Incorporate the following custom instructions in your analysis, as long as they don't conflict with producing a valid JSON object:
    ${customInstructions}

    5. Create a JSON object where:
    - Keys are the provided column headers
    - Values are the extracted information from your analysis
    - If you don't find a relevant value for an associated header, leave it as an empty string

    6. Ensure the output is a valid JSON object.
  `;

  const { text } = await generateText({
    model,
    prompt
  });

  return JSON.parse(text);
}

export async function generateMeetingSummary(transcript: ProcessedTranscriptSegment[]): Promise<string> {
  const prompt = `
  You are an expert meeting analyst. Given a meeting transcript, provide a concise yet comprehensive summary.
  Focus on key decisions, main discussion points, and overall meeting outcomes.
  
  Format the summary in clear, professional language that captures the essence of the meeting.
  Avoid including unnecessary details or tangential discussions.
  
  Transcript (with speaker names and timestamps):
  ${JSON.stringify(transcript)}
  
  Instructions:
  1. Analyze the entire conversation flow
  2. Identify the main topics and decisions
  3. Note any significant agreements or disagreements
  4. Highlight key outcomes and next steps
  5. Keep the summary under 300 words
  `;

  const { text } = await generateText({
    model,
    prompt
  });

  return text;
}

export async function extractKeyPoints(transcript: ProcessedTranscriptSegment[]): Promise<string[]> {
  const prompt = `
  You are an expert meeting analyst. Extract the key points from this meeting transcript.
  Focus on important decisions, action items, and significant insights.
  
  Return ONLY an array of strings, each representing a key point.
  Each point should be clear, concise, and actionable.
  
  Transcript (with speaker names and timestamps):
  ${JSON.stringify(transcript)}
  
  Instructions:
  1. Identify the most important points discussed
  2. Include any decisions made
  3. Note any significant insights or revelations
  4. Format each point as a clear, standalone statement
  5. Limit to 5-7 most important points
  6. Return as a valid JSON array of strings
  `;

  const { text } = await generateText({
    model,
    prompt
  });

  return JSON.parse(text);
}

export async function extractActionItems(transcript: ProcessedTranscriptSegment[]): Promise<string[]> {
  const prompt = `
  You are an expert meeting analyst. Extract specific action items from this meeting transcript.
  Focus on tasks, assignments, and commitments made during the meeting.
  
  Return ONLY an array of strings, each representing a clear action item.
  Each action item should include WHO is responsible and WHAT needs to be done.
  
  Transcript (with speaker names and timestamps):
  ${JSON.stringify(transcript)}
  
  Instructions:
  1. Identify explicit and implicit action items
  2. Include the responsible person's name
  3. Specify deadlines if mentioned
  4. Format as clear, actionable statements
  5. Return as a valid JSON array of strings
  `;

  const { text } = await generateText({
    model,
    prompt
  });

  return JSON.parse(text);
}

export async function generateTimeStampedHighlights(
  transcript: ProcessedTranscriptSegment[]
): Promise<Array<{ timestamp: number; text: string }>> {
  const prompt = `
  You are an expert meeting analyst. Generate timestamped highlights from this meeting transcript.
  Focus on key moments, important statements, and significant transitions in the discussion.
  
  Return an array of objects, each with a 'timestamp' (number in seconds) and 'text' (string) property.
  
  Transcript (with speaker names and timestamps):
  ${JSON.stringify(transcript)}
  
  Instructions:
  1. Identify important moments in the conversation
  2. Include the exact timestamp in seconds
  3. Write a brief, clear description of each highlight
  4. Cover the entire meeting duration
  5. Include 5-10 highlights
  6. Return as a valid JSON array of objects with 'timestamp' and 'text' properties
  `;

  const { text } = await generateText({
    model,
    prompt
  });

  return JSON.parse(text);
}

export async function analyzeTopicDistribution(
  transcript: ProcessedTranscriptSegment[]
): Promise<Record<string, number>> {
  const prompt = `
  You are an expert meeting analyst. Analyze the topic distribution in this meeting transcript.
  Calculate the approximate percentage of time spent on different topics.
  
  Return an object where keys are topic names and values are percentages (numbers).
  The percentages should sum to 100.
  
  Transcript (with speaker names and timestamps):
  ${JSON.stringify(transcript)}
  
  Instructions:
  1. Identify main topics discussed
  2. Calculate percentage of time spent on each topic
  3. Use clear, concise topic names
  4. Consider topic transitions and overlaps
  5. Return as a valid JSON object with topic names as keys and percentages as values
  6. Ensure percentages sum to 100
  `;

  const { text } = await generateText({
    model,
    prompt
  });

  return JSON.parse(text);
}

export async function calculateSuccessRate(
  processedData: Record<string, string>,
  columnHeaders: string[]
): Promise<number> {
  // Count how many fields we successfully extracted values for
  const filledFields = Object.values(processedData).filter(value => value && value.trim() !== '').length;
  return filledFields / columnHeaders.length;
} 