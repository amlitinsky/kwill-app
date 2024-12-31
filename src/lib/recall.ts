import axios from 'axios'

const RECALL_API_KEY = process.env.RECALL_API_KEY
const RECALL_API_URL = 'https://us-west-2.recall.ai/api/v1/bot'
const RECALL_API_URL_ANALYZE = 'https://us-west-2.recall.ai/api/v2beta/bot'
const RECALL_API_ZOOM_OAUTH_CREDENTIALS = 'https://us-west-2.recall.ai/api/v2/zoom-oauth-credentials'
interface CreateBotOptions {
  join_at?: string;
  automatic_leave?: number; // Duration in seconds before bot leaves
}

interface BotEvent {
  status: {
    code: string;
    created_at: string;
  };
}

export async function createBot(meetingUrl: string, options: CreateBotOptions = {}) {
  try {
    const response = await axios.post(RECALL_API_URL, {
      meeting_url: meetingUrl,
      bot_name: "Kwill Scribe",
      ...(options.join_at && { join_at: options.join_at }),
      ...(options.automatic_leave && { automatic_leave: options.automatic_leave }),
      transcription_options: {
        provider: 'assembly_ai',
      },
    }, {
      headers: {
        'Authorization': `Token ${RECALL_API_KEY}`,
        'Content-Type': 'application/json',
      },
    })
    return response.data
  } catch (error) {
    console.error('Error creating bot:', error)
    throw error
  }
}

export async function getTranscript(botId: string) {
  try {
    const response = await axios.get(`${RECALL_API_URL}/${botId}/transcript`, {
      headers: {
        'Authorization': `Token ${RECALL_API_KEY}`,
      },
    })
    return response.data
  } catch (error) {
    console.error('Error fetching transcript:', error)
    throw error
  }
}

export async function getBotStatus(botId: string) {
  try {
    const response = await axios.get(`${RECALL_API_URL}/${botId}`, {
      headers: {
        'Authorization': `Token ${RECALL_API_KEY}`,
      },
    })
    return response.data
  } catch (error) {
    console.error('Error fetching bot status:', error)
    throw error
  }
}

export async function analyzeMedia(botId: string) {
  try {
    const response = await axios.post(`${RECALL_API_URL_ANALYZE}/${botId}/analyze`, {assemblyai_async_transcription: {}}, {
      headers: {
        'Authorization': `Token ${RECALL_API_KEY}`,
        'accept': 'application/json',
        'content-type': 'application/json'
      },
    })
    return response.data
  } catch (error) {
    console.error('Error fetching bot analysis')
    throw error
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
          redirect_uri: `${process.env.NEXT_PUBLIC_BASE_URL}/api/zoom-oauth-callback`,
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`HTTP error! status: ${response.status}, message: ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
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
      const errorData = await response.json()
      throw new Error(`Failed to delete Zoom OAuth Credential. Status: ${response.status}, Error: ${JSON.stringify(errorData)}`)
    }

  } catch (error) {
    console.error('Error deleting Zoom OAuth credential:', error)
    throw error
  }
}

//TODO verify that using next public zoom api client id actually generates the valid URL and update the NGROK for production to use base url
export function generateZoomAuthURL(): string {
  const baseUrl = "https://zoom.us/oauth/authorize"
  const queryParams = {
    "response_type": "code",
    "redirect_uri": `${process.env.NEXT_PUBLIC_BASE_URL}/api/zoom-oauth-callback`,
    "client_id": process.env.NEXT_PUBLIC_ZOOM_API_CLIENT_ID!,
  }
  const queryString = new URLSearchParams(queryParams).toString()
  return `${baseUrl}?${queryString}`
}

export async function deleteBot(botId: string) {
  try {
    const response = await fetch(`${RECALL_API_URL}/${botId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Token ${RECALL_API_KEY}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Failed to delete bot: ${JSON.stringify(error)}`);
    }

    return true;
  } catch (error) {
    console.error('Error deleting bot:', error);
    throw error;
  }
}

// Add new function to calculate meeting duration
export async function calculateMeetingDuration(botId: string): Promise<number> {
  try {
    const botStatus = await getBotStatus(botId);
    const events = botStatus.events || [];
    
    // Find in_call_recording start and done events
    const recordingStart = events.find((e: BotEvent) => e.status.code === 'in_call_recording');
    const recordingEnd = events.find((e: BotEvent) => e.status.code === 'done');
    
    if (!recordingStart || !recordingEnd) {
      return 0;
    }
    
    const startTime = new Date(recordingStart.status.created_at);
    const endTime = new Date(recordingEnd.status.created_at);
    
    // Return duration in hours
    return (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
  } catch (error) {
    console.error('Error calculating meeting duration:', error);
    return 0;
  }
}