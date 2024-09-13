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
  const payload = await req.text()
  const headers = Object.fromEntries(req.headers)

  const wh = new Webhook(secret)
  let evt: BotStatusChangeEvent 
  try {
    evt = wh.verify(payload, headers) as BotStatusChangeEvent
  } catch (err) {
    console.error('Webhook verification failed:', err)
    return NextResponse.json({}, { status: 400 })
  }

  const { event, data } = evt

  if (event === 'bot.status_change') {
    const { bot_id, status } = data

    await updateClient(bot_id, { status: status.code })

    if (status.code === 'done') {
      try {
        await analyzeMedia(bot_id)
      } catch (error) {
        console.error('Error initiating analysis:', error)
        return NextResponse.json({ error: 'Failed to initiate analysis' }, { status: 500 })
      }
    } else if (status.code === 'analysis_done') {
      try {
        const transcript = await getTranscript(bot_id)
        await updateClient(bot_id, { status: 'analysis_done', transcript })
      } catch (error) {
        console.error('Error retrieving transcript:', error)
        return NextResponse.json({ error: 'Failed to retrieve transcript' }, { status: 500 })
      }
    }
  }

  return NextResponse.json({ received: true })
}
