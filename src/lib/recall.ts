import { base64KwillScribeImage} from '@/utils/kwill-scribe-image';
import { z } from 'zod';

const RECALL_API_KEY = process.env.RECALL_API_KEY;
const RECALL_API_URL = 'https://us-west-2.recall.ai/api/v1/bot';
const RECALL_API_ZOOM_OAUTH_CREDENTIALS = 'https://us-west-2.recall.ai/api/v2/zoom-oauth-credentials'

const participantSchema = z.object({
  id: z.number(),
  name: z.string()
});

const wordSchema = z.object({
  text: z.string(),
  start_timestamp: z.object({ relative: z.number() }),
  end_timestamp: z.object({ relative: z.number() })
});

export const transcriptResponseSchema = z.object({
  participant: participantSchema,
  words: z.array(wordSchema)
});

export type TranscriptResponse = z.infer<typeof transcriptResponseSchema>;

interface CreateBotOptions {
  join_at?: string;
  automatic_leave?: number;
}

interface BotResponse {
  id: string;
  meeting_url: string;
  status: string;
}

interface RecallErrorResponse {
  detail?: string;
  error?: string;
}

interface BotStatusResponse {
  recordings?: {
    started_at: string;
    completed_at: string;
    media_shortcuts?: {
      transcript?: {
        data?: {
          download_url: string;
        }
      }
    }
  }[];
}

export async function createBot(meetingUrl: string, options: CreateBotOptions = {}): Promise<BotResponse> {
  try {
    const response = await fetch(RECALL_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Token ${RECALL_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        meeting_url: meetingUrl,
        bot_name: "Kwill Scribe",
        ...(options.join_at && { join_at: options.join_at }),
        ...(options.automatic_leave && { 
          automatic_leave: { 
            in_call_recording_timeout: options.automatic_leave 
          } 
        }),
        recording_config: {
          transcript: {
            provider: {
              meeting_captions: {}
            }
          },
        },
        automatic_video_output: {
          in_call_recording: {
            kind: 'jpeg',
            b64_data: base64KwillScribeImage
          }
        },
        chat: {
          on_bot_join : {
            send_to: "everyone",
            message: "Hello, I'm Kwill Scribe. Please turn on meeting recording and closed captions so I can transcribe this meeting."
          }
        },
        metadata: {
          environment: process.env.NODE_ENV,
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null) as RecallErrorResponse | null;
      console.error('Bot creation failed:', {
        status: response.status,
        statusText: response.statusText,
        errorData
      });
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return (await response.json()) as BotResponse;
  } catch (error) {
    console.error('Error creating bot:', error);
    throw error;
  }
}

export async function getBotStatus(botId: string): Promise<BotStatusResponse> {
  try {
    const response = await fetch(`${RECALL_API_URL}/${botId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Token ${RECALL_API_KEY}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json() as BotStatusResponse;
  } catch (error) {
    console.error('Error fetching bot status:', error);
    throw error;
  }
}

export async function retrieveBotTranscript(botId: string): Promise<TranscriptResponse[]> {
  try {
    const botData = await getBotStatus(botId);
    const transcript = botData.recordings?.[0]?.media_shortcuts?.transcript;
    
    if (!transcript?.data?.download_url) {
      throw new Error('No transcript download URL available');
    }

    const transcriptResponse = await fetch(transcript.data.download_url, {
      method: 'GET',
      headers: {
        'Authorization': `Token ${RECALL_API_KEY}`,
      },
    });

    if (!transcriptResponse.ok) {
      throw new Error(`Failed to fetch transcript: ${transcriptResponse.status}`);
    }

    const rawData = await transcriptResponse.json() as TranscriptResponse[];
    return transcriptResponseSchema.array().parse(rawData);
  } catch (error) {
    console.error('Transcript validation failed:', error);
    throw new Error('Invalid transcript format');
  }
}

export async function calculateMeetingDuration(botId: string): Promise<number> {
  try {
    const botStatus = await getBotStatus(botId);
    const recording = botStatus.recordings?.[0];
    
    if (!recording?.started_at || !recording?.completed_at) {
      return 0;
    }
    
    const startTime = new Date(recording.started_at);
    const endTime = new Date(recording.completed_at);
    
    return (endTime.getTime() - startTime.getTime()) / (1000 * 60);
  } catch (error) {
    console.error('Error calculating meeting duration:', error);
    return 0;
  }
}

export async function createZoomOAuthCredential(code: string) {
  try {
    // TODO when we go to production I have to change this to use the base url
    // when I do locally it has to be the ngrok one
    const response = await fetch(`${RECALL_API_ZOOM_OAUTH_CREDENTIALS}/`, {
      method: 'POST',
      headers: {
        'Authorization': `Token ${RECALL_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        oauth_app: process.env.RECALL_ZOOM_OAUTH_APP_ID,
        authorization_code: {
          code: code,
          redirect_uri: `${process.env.NEXT_PUBLIC_BASE_URL}/api/callback/zoom`,
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json() as RecallErrorResponse;
      throw new Error(`HTTP error! status: ${response.status}, message: ${JSON.stringify(errorData)}`);
    }

    const data = await response.json() as RecallErrorResponse;
    return data;
  } catch (error) {
    console.error('Error creating Zoom OAuth credential:', error);
    throw error;
  }
}

export async function deleteZoomOAuthCredential(credentialId: string) {
  try {
    const response = await fetch(`${RECALL_API_ZOOM_OAUTH_CREDENTIALS}/${credentialId}/`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Token ${RECALL_API_KEY}`,
      },
    })

    if (!response.ok) {
      const errorData = await response.json() as RecallErrorResponse;
      throw new Error(`Failed to delete Zoom OAuth Credential. Status: ${response.status}, Error: ${JSON.stringify(errorData)}`)
    }

  } catch (error) {
    console.error('Error deleting Zoom OAuth credential:', error)
    throw error
  }
}