const RECALL_API_KEY = process.env.RECALL_API_KEY;
const RECALL_API_URL = 'https://us-west-2.recall.ai/api/v1/bot';

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
        bot_name: "AI Assistant",
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

interface TranscriptResponse {
  participant: {
    id: number;
    name: string;
  };
  words: {
    text: string;
    start_timestamp: { relative: number };
    end_timestamp: { relative: number };
  };
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

    return await transcriptResponse.json() as TranscriptResponse[];
  } catch (error) {
    console.error('Error fetching transcript:', error)
    throw error
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