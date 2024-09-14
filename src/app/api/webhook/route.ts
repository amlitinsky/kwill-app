import { NextResponse } from 'next/server'
import { Webhook } from 'svix'
import { analyzeMedia, getTranscript } from '@/lib/recall'
import { updateClient } from '@/app/api/transcript-stream/route'

const secret = process.env.RECALL_WEBHOOK_SECRET!

interface BotStatusChangeEvent {
  event: 'bot.status_change';
  data: {
    bot_id: string;
    status: {
      code: string;
      created_at: string;
      sub_code: string | null;
      message: string | null;
      recording_id?: string;
    };
  };
}
export async function POST(req: Request) {
  console.log('Webhook received')
  const payload = await req.text()
  const headers = Object.fromEntries(req.headers)

  const wh = new Webhook(secret)
  let evt: BotStatusChangeEvent 
  try {
    evt = wh.verify(payload, headers) as BotStatusChangeEvent
    console.log('Webhook verified successfully')
  } catch (err) {
    console.error('Webhook verification failed')
    return NextResponse.json({}, { status: 400 })
  }

  const { event, data } = evt
  console.log(`Event: ${event}, Bot ID: ${data.bot_id}, Status: ${data.status.code}`)

  if (event === 'bot.status_change') {
    const { bot_id, status } = data

    try {
      await updateClient(bot_id, { status: status.code })
      console.log(`Client updated: Bot ${bot_id}, Status: ${status.code}`)
    } catch (error) {
      console.error(`Error updating client: Bot ${bot_id}, Status: ${status.code}`)
    }

    if (status.code === 'done') {
      try {
        await analyzeMedia(bot_id)
        console.log(`Analysis initiated: Bot ${bot_id}`)
      } catch (error) {
        console.error(`Error initiating analysis: Bot ${bot_id}`)
        return NextResponse.json({ error: 'Failed to initiate analysis' }, { status: 500 })
      }
    } else if (status.code === 'analysis_done') {
      try {
        const transcript = await getTranscript(bot_id)
        console.log('Transcript in webhook:', JSON.stringify(transcript, null, 2))
        
        const processedTranscript = transcript.map((segment: { speaker: string; words: { text: string }[] }) => ({
          speaker: segment.speaker,
          text: segment.words.map((word) => word.text).join(' ')
        }))

        console.log('Processed transcript:', JSON.stringify(processedTranscript, null, 2))
        await updateClient(bot_id, { status: 'analysis_done', transcript: processedTranscript })
        console.log(`Processed transcript and client updated: Bot ${bot_id}`)
      } catch (error) {
        console.error(`Error retrieving or processing transcript: Bot ${bot_id}`, error)
        return NextResponse.json({ error: 'Failed to retrieve or process transcript' }, { status: 500 })
      }
    }
  }

  return NextResponse.json({ received: true })
}
