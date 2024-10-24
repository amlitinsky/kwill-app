import axios from 'axios'

const RECALL_API_KEY = process.env.RECALL_API_KEY
const RECALL_API_URL = 'https://us-west-2.recall.ai/api/v1/bot'
const RECALL_API_URL_ANALYZE = 'https://us-west-2.recall.ai/api/v2beta/bot'
const RECALL_API_ZOOM_OAUTH_CREDENTIALS = 'https://us-west-2.recall.ai/api/v2/zoom-oauth-credentials'

export async function createBot(meetingUrl: string) {
  try {
    const response = await axios.post(RECALL_API_URL, {
      meeting_url: meetingUrl,
      bot_name: "Kwill Scribe",
      transcription_options: {
        provider: 'gladia',
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
    const response = await axios.post(`${RECALL_API_URL_ANALYZE}/${botId}/analyze`, {gladia_async_transcription: {}}, {
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
    const response = await axios.post(`${RECALL_API_ZOOM_OAUTH_CREDENTIALS}/`, {
      headers: {
        'Authorization': `Bearer ${RECALL_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        oauth_app: process.env.RECALL_ZOOM_OAUTH_APP_ID,
        authorization_code: {
          code: code,
          redirect_uri: `${process.env.NEXT_PUBLIC_NGROK_URL}/api/zoom-oauth-callback`,
        },
      }),
    });

    if (response.status !== 201) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = response.data;
    return data;
  } catch (error) {
    console.error('Error creating Zoom OAuth credential:', error);
    throw error;
  }
}

export async function deleteZoomOAuthCredential(credentialId: string) {
  const response = await axios.delete(`${RECALL_API_ZOOM_OAUTH_CREDENTIALS}/${credentialId}/`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${process.env.RECALL_API_KEY}`,
    },
  })

  if (response.status !== 204) {
    throw new Error(`Failed to delete Zoom OAuth Credential. Status: ${response.status}`)
  }
}

export function generateZoomAuthURL(): string {
  const baseUrl = "https://zoom.us/oauth/authorize"
  const queryParams = {
    "response_type": "code",
    "redirect_uri": `${process.env.NEXT_PUBLIC_NGROK_URL}/api/zoom-oauth-callback`,
    "client_id": process.env.NEXT_PUBLIC_ZOOM_CLIENT_ID!,
  }
  const queryString = new URLSearchParams(queryParams).toString()
  return `${baseUrl}?${queryString}`
}