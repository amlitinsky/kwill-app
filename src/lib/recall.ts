import { base64Image } from "./base64Image";

const RECALL_API_KEY = process.env.RECALL_API_KEY
const NGROK_URL = 'https://evolved-raccoon-key.ngrok-free.app/api/callback/zoom' 
const RECALL_API_URL = 'https://us-west-2.recall.ai/api/v1/bot'
const RECALL_API_ZOOM_OAUTH_CREDENTIALS = 'https://us-west-2.recall.ai/api/v2/zoom-oauth-credentials'
interface CreateBotOptions {
  join_at?: string;
  automatic_leave?: number; // Duration in seconds before bot leaves
}


export async function createBot(meetingUrl: string, options: CreateBotOptions = {}) {
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
        ...(options.automatic_leave && { automatic_leave: { in_call_recording_timeout: options.automatic_leave } }),
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
            b64_data: base64Image
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

    //TODO add realtime_endpoints
    // realtime_endpoints: [
    //   {
    //     type: 'webhook',
    //     url: `${process.env.NEXT_PUBLIC_NGROK_URL}/api/webhook`,
    //     events: ['transcript.data']
    //   }
    // ]
    if (!response.ok) {
      // Get the error details from the response
      const errorData = await response.json().catch(() => null);
      
      console.error('Bot creation failed:', {
        status: response.status,
        statusText: response.statusText,
        errorData,
        url: RECALL_API_URL
      });
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating bot:', error)
    throw error
  }
}

export async function retrieveBotTranscript(botId: string) {
  try {
    // Use existing getBotStatus function instead of duplicating fetch logic
    const botData = await getBotStatus(botId);
    const transcript = botData.recordings?.[0]?.media_shortcuts?.transcript;
    
    if (!transcript?.data?.download_url) {
      throw new Error('No transcript download URL available');
    }

    // Fetch the actual transcript
    const transcriptResponse = await fetch(transcript.data.download_url, {
      method: 'GET',
      headers: {
        'Authorization': `Token ${RECALL_API_KEY}`,
      },
    });

    if (!transcriptResponse.ok) {
      throw new Error(`Failed to fetch transcript: ${transcriptResponse.status}`);
    }

    return await transcriptResponse.json();
  } catch (error) {
    console.error('Error fetching transcript:', error)
    throw error
  }
}

export async function getBotStatus(botId: string) {
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

    return await response.json();
  } catch (error) {
    console.error('Error fetching bot status:', error)
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
          redirect_uri: `${process.env.NEXT_PUBLIC_BASE_URL}/api/callback/zoom`,
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
    "redirect_uri": `${process.env.NEXT_PUBLIC_BASE_URL}/api/callback/zoom`,
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
    const recording = botStatus.recordings?.[0]; // Get first recording
    
    if (!recording?.started_at || !recording?.completed_at) {
      return 0;
    }
    
    const startTime = new Date(recording.started_at);
    const endTime = new Date(recording.completed_at);
    
    // Return duration in minutes
    return (endTime.getTime() - startTime.getTime()) / (1000 * 60);
  } catch (error) {
    console.error('Error calculating meeting duration:', error);
    return 0;
  }
}