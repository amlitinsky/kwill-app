import { type TranscriptResponse } from "../recall";

export async function extractTranscriptHeaderValues(
  transcript: TranscriptResponse[], 
  columnHeaders: string[], 
  analysisPrompt?: string | null
): Promise<string> {
  return `
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
  ${analysisPrompt}

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
}

export async function generateFullMeetingInsights(
  transcript: TranscriptResponse[],
  analysisPrompt?: string
): Promise<string> {
  return `
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

  Use the following custom analysis prompt if it has been provided:
  ${analysisPrompt}
  `;
}