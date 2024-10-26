import Anthropic from '@anthropic-ai/sdk';
import { ProcessedTranscriptSegment } from './transcript-utils';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

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

  const response = await anthropic.messages.create({
    model: 'claude-3-sonnet-20240229',
    max_tokens: 1000,
    messages: [
      { role: 'user', content: prompt }
    ]
  });


  const result = response.content
  .filter(block => block.type === 'text')
  .map(block => (block as { text: string }).text)
  .join('\n');

  return JSON.parse(result);
}