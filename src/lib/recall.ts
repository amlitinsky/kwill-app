import axios from 'axios'

const RECALL_API_KEY = process.env.RECALL_API_KEY
const RECALL_API_URL = 'https://us-west-2.recall.ai/api/v1/bot'
const RECALL_API_URL_ANALYZE = 'https://us-west-2.recall.ai/api/v2beta/bot'

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