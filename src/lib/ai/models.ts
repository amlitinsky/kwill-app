import { google } from '@ai-sdk/google';
import { deepseek } from '@ai-sdk/deepseek';
import { type LanguageModelV1 } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';
import { openai } from '@ai-sdk/openai';

export const gemini = google('gemini-2.0-flash-001');
export const sonnet = anthropic('claude-3-sonnet-20240229');
export const gpt4 = openai('gpt-4-turbo-preview');

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
export const deepseekChat = deepseek('deepseek-chat') as unknown as LanguageModelV1;
