import { deepseek } from '@ai-sdk/deepseek';
import { generateText } from 'ai';
import { ProcessedTranscriptSegment } from './transcript-utils';

const model = deepseek('deepseek-chat');

export async function analyzeTranscript(
  transcript: ProcessedTranscriptSegment[], 
  columnHeaders: string[], 
  customInstructions: string
): Promise<Record<string, string>> {
  const prompt = `
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

  Custom Analysis Instructions:
  ${customInstructions}

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

  const { text } = await generateText({
    model: model,
    prompt: prompt,
    temperature: 0.1, // Lower temperature for more consistent outputs
    maxTokens: 2000
  });

  try {
    return JSON.parse(text);
  } catch (error) {
    console.error('Failed to parse LLM response:', error);
    throw new Error('Failed to generate valid JSON from transcript analysis');
  }
}

export async function generateMeetingSummary(
  transcript: ProcessedTranscriptSegment[],
  customInstructions?: string
): Promise<string> {
  const prompt = `
  You are an expert meeting analyst specializing in executive summaries. Your task is to provide a clear, structured summary of this meeting transcript.

  Required Summary Components:
  1. Meeting Overview (1-2 sentences)
  2. Key Discussion Points (3-5 bullet points)
  3. Critical Decisions Made
  4. Action Items and Next Steps
  5. Notable Insights or Concerns

  Guidelines:
  - Write in clear, professional business language
  - Focus on actionable and strategic information
  - Maintain chronological flow where relevant
  - Highlight dependencies and deadlines
  - Include specific metrics or numbers mentioned
  - Exclude casual conversation and pleasantries
  - Keep the total summary under 300 words
  - Use objective, factual tone

  Custom Instructions:
  ${customInstructions || ''}

  Transcript (with speaker names and timestamps):
  ${JSON.stringify(transcript)}
  `;

  const { text } = await generateText({
    model: model,
    prompt: prompt,
    temperature: 0.3,
    maxTokens: 1000
  });

  return text;
}

export async function extractKeyPoints(
  transcript: ProcessedTranscriptSegment[],
  customInstructions?: string
): Promise<string[]> {
  const prompt = `
  You are an expert meeting analyst specializing in identifying critical information. Extract the most important points from this meeting transcript.

  Requirements:
  - Return ONLY a JSON array of strings
  - Each point should be a complete, actionable statement
  - Include specific details (numbers, dates, names)
  - Maintain original context and accuracy
  - Limit to 5-7 most impactful points
  
  Point Selection Criteria:
  1. Strategic decisions and commitments
  2. Key metrics and financial data
  3. Major challenges or risks identified
  4. Important deadlines or milestones
  5. Significant market insights
  6. Resource allocations or requirements
  7. Critical dependencies

  Custom Instructions:
  ${customInstructions || ''}

  Format Guidelines:
  - Each point should be 10-20 words
  - Start with action verbs where applicable
  - Include relevant quantitative data
  - Maintain professional business language
  
  Transcript: (with speaker names and timestamps)
  ${JSON.stringify(transcript)}
  `;

  const { text } = await generateText({
    model: model,
    prompt: prompt,
    temperature: 0.2,
    maxTokens: 1000
  });

  return JSON.parse(text);
}

export async function extractActionItems(
  transcript: ProcessedTranscriptSegment[],
  customInstructions?: string
): Promise<string[]> {
  const prompt = `
  You are an expert project manager specializing in action item extraction. Identify all concrete tasks and commitments from this meeting transcript.

  Requirements:
  - Return ONLY a JSON array of action items
  - Each item must include WHO is responsible and WHAT needs to be done
  - Include WHEN (deadline) if specified
  - Format: "[Owner] to [Action] by [Deadline if specified]"

  Action Item Criteria:
  1. Must be specific and actionable
  2. Must have a clear owner
  3. Must be derived from explicit or strongly implied commitments
  4. Must include any mentioned deadlines or conditions
  5. Must preserve original context and intent

  Custom Instructions:
  ${customInstructions || ''}

  Extraction Rules:
  - Include both explicit ("I will...") and implicit ("We should...") commitments
  - Convert passive voice to active assignments
  - Standardize deadline formats to ISO dates
  - Group related items if they share owner/deadline
  - Exclude general discussion or suggestions without clear ownership
  
  Transcript: (with speaker names and timestamps)
  ${JSON.stringify(transcript)}
  `;

  const { text } = await generateText({
    model: model,
    prompt: prompt,
    temperature: 0.1,
    maxTokens: 1000
  });

  return JSON.parse(text);
}

export async function generateTimeStampedHighlights(
  transcript: ProcessedTranscriptSegment[],
  customInstructions?: string
): Promise<Array<{ timestamp: number; text: string }>> {
  const prompt = `
  You are an expert meeting analyst specializing in identifying pivotal moments in discussions. Create a timeline of key moments from this transcript.

  Output Format:
  Return a JSON array of objects with exact structure:
  [
    {
      "timestamp": number (seconds),
      "text": "Description of key moment"
    }
  ]

  Highlight Selection Criteria:
  1. Critical decisions or agreements
  2. Important revelations or insights
  3. Significant topic transitions
  4. Key questions or concerns raised
  5. Notable reactions or responses
  6. Strategic direction changes
  7. Risk or opportunity identification

  Custom Instructions:
  ${customInstructions || ''}

  Guidelines:
  - Generate 5-10 highlights
  - Space highlights throughout the meeting duration
  - Use precise timestamps from the transcript
  - Keep descriptions clear and concise (15-25 words)
  - Focus on business-critical information
  - Maintain chronological order
  - Include speaker context where relevant
  
  Transcript: (with speaker names and timestamps)
  ${JSON.stringify(transcript)}
  `;

  const { text } = await generateText({
    model,
    prompt,
    temperature: 0.2,
    maxTokens: 1500
  });

  return JSON.parse(text);
}

export async function analyzeTopicDistribution(
  transcript: ProcessedTranscriptSegment[]
): Promise<Record<string, number>> {
  const prompt = `
  You are an expert conversation analyst specializing in topic analysis. Calculate the distribution of discussion topics in this meeting transcript.

  Output Format:
  Return a JSON object where:
  - Keys are clear, concise topic names
  - Values are percentages (numbers 0-100)
  - Percentages must sum to exactly 100

  Analysis Requirements:
  1. Identify main topics and subtopics
  2. Calculate time spent on each topic
  3. Account for topic overlaps and transitions
  4. Consider speaker roles and emphasis
  5. Exclude off-topic discussions
  6. Group related subtopics appropriately
  7. Account for topic depth vs. breadth

  Topic Naming Guidelines:
  - Use standard business terminology
  - Keep names concise (1-3 words)
  - Be specific but not overly detailed
  - Use consistent capitalization
  - Avoid acronyms unless widely known

  Additional Rules:
  - Minimum topic allocation: 5%
  - Round percentages to nearest integer
  - Include "Other" category if needed
  - Consider topic importance vs. duration
  
  Transcript: (with speaker names and timestamps)
  ${JSON.stringify(transcript)}
  `;

  const { text } = await generateText({
    model: model,
    prompt: prompt,
    temperature: 0.1,
    maxTokens: 1000
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