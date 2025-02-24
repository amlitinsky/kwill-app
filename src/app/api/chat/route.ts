import { NoSuchToolError, InvalidToolArgumentsError, streamText, ToolExecutionError, smoothStream, tool, type Message, appendClientMessage, appendResponseMessages } from 'ai';
import { z } from 'zod';
import { createTRPCContext } from '@/server/api/trpc';
import { createCaller } from '@/server/api/root';
import { systemPrompt } from '@/lib/ai/prompts';
import { deepseekChat } from '@/lib/ai/models';


// Allow streaming responses up to 30 seconds
export const maxDuration = 30;


export async function POST(req: Request) {

  const context = await createTRPCContext({headers: req.headers});
  const caller = createCaller(context);

  const {message, chatId} = await req.json() as {message: Message, chatId: string};

  const previousMessages = await caller.message.load({chatId}) as Message[]
  await caller.chat.generateName({text: message.content, id: chatId})
  const messages = appendClientMessage({messages: previousMessages, message})

  const result = streamText({
    model: deepseekChat,
    system: systemPrompt,
    messages,
    toolCallStreaming: true,
    experimental_transform: smoothStream({
      delayInMs: 20, // optional: defaults to 10ms
      chunking: 'word', // optional: defaults to 'word'
    }),
    tools: {
      getSpreadsheetURL : tool({
        description: 'Get the URL of the Google Spreadsheet associated with this conversation',
        parameters: z.object({
          spreadsheetUrl: z.string().describe('The full Google Sheets URL'),
          analysisPrompt: z.string().describe('Spreadsheet specific prompt for analysis').optional(),
        }),
        execute: async ({ spreadsheetUrl, analysisPrompt}) => await caller.tool.linkSpreadsheet({ chatId, spreadsheetUrl, analysisPrompt }),
      }),
      getMeetingURL: tool({
        description: 'Get the URL of the Zoom meeting associated with this conversation',
        parameters: z.object({
          meetingUrl: z.string().describe('The full meeting URL'),
        }),
        execute: async ({ meetingUrl}) => await caller.tool.joinMeeting({ chatId, meetingUrl }),
      }),

    }, 
    onFinish: async ({response }) => {

      await caller.message.save({
        messages: appendResponseMessages({messages, responseMessages: response.messages}),
        chatId
      })

    },
  });

  void result.consumeStream();

  return result.toDataStreamResponse({
  getErrorMessage: error => {
      if (NoSuchToolError.isInstance(error)) {
      return 'The model tried to call a unknown tool.';
      } else if (InvalidToolArgumentsError.isInstance(error)) {
      return 'The model called a tool with invalid arguments.';
      } else if (ToolExecutionError.isInstance(error)) {
      return 'An error occurred during tool execution.';
      } else {
      return 'An unknown error occurred.';
      }
  },
  });

}