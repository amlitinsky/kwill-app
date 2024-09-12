import axios from 'axios'

const RECALL_API_KEY = process.env.RECALL_API_KEY
const RECALL_API_URL = 'https://us-west-2.recall.ai/api/v1/bot'

export async function createBot(meetingUrl: string) {
  try {
    const response = await axios.post(RECALL_API_URL, {
      meeting_url: meetingUrl,
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