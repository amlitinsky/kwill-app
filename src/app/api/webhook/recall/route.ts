
import { NextResponse } from 'next/server'
import { Webhook } from 'svix'
import { retrieveBotTranscript } from '@/lib/recall'
import { 
  acquireLock, 
  releaseLock, 
  getProcessRecord, 
  setProcessRecord 
} from '@/lib/redis'
import { env } from '@/env'

interface RecallWebhookPayload {
  event: BotStatusEvent;
  data: {
    data: {
      code: string;
      sub_code: string | null;
      updated_at: string;
      words: {
        text: string;
        start_timestamp: { relative: number };
        end_timestamp: { relative: number } | null;
      }[];
      participant: {
        id: number | null;
        name: string | null;
      };
    };
    bot: {
      id: string;
      metadata: Record<string, unknown>;
    };
  };
}
// TODO add transcript.data, transcript.done
// to fetch transcript done via async we call retrieveBotTranscript or retrieveTranscript endpoint from recall

type BotStatusEvent = 
  | 'bot.joining'
  | 'bot.in_waiting_room'
  | 'bot.in_call_not_recording'
  | 'bot.recording_permission_allowed'
  | 'bot.recording_permission_denied'
  | 'bot.in_call_recording'
  | 'bot.call_ended'
  | 'bot.done'
  | 'bot.fatal';

export async function POST(req: Request) {
  const payload = await req.text()
  const headers = Object.fromEntries(req.headers)

  const wh = new Webhook(env.RECALL_WEBHOOK_SECRET)
  let evt: RecallWebhookPayload 
  try {
    evt = wh.verify(payload, headers) as RecallWebhookPayload
  } catch (error) {
    console.error('Webhook verification failed', error)
    return NextResponse.json({}, { status: 400 })
  }

  // Early environment check
  const botEnvironment = evt.data.bot.metadata?.environment as string | undefined
  const currentEnvironment = process.env.NODE_ENV // 'development' | 'production' | 'test'

  if (botEnvironment && botEnvironment !== currentEnvironment) {
    return NextResponse.json({ 
      skipped: true, 
      reason: 'environment_mismatch' 
    }, { status: 200 }) // Still return 200 to acknowledge receipt
  }

  const { event, data } = evt
  const botId = data.bot.id

  // Handle each bot status event
  switch (event) {
    case 'bot.done':
      // TODO if we ever want to include async transcription, we start async job here
      try {
        // Check if already processed
        const processRecord = await getProcessRecord(botId)
        if (processRecord) {
          return NextResponse.json({ received: true })
        }

        // Try to acquire lock
        const locked = await acquireLock(botId)
        if (!locked) {
          return NextResponse.json({ received: true })
        }

        try {
          // Mark as processing
          await setProcessRecord(botId, {
            status: 'processing',
            startedAt: new Date().toISOString(),
            eventTimestamp: data.data.updated_at
          })
          const transcript = await retrieveBotTranscript(botId)
          // TODO send transcript to AI process

          // Mark as completed
          await setProcessRecord(botId, {
            status: 'completed',
            completedAt: new Date().toISOString(),
            eventTimestamp: data.data.updated_at
          })
        } finally {
          // Always release the lock
          await releaseLock(botId)
          // TODO we can also delete the bot's data if required from recall
        }
      } catch (error) {
        console.error(`Error processing webhook: Bot ${botId}`, error)
        return NextResponse.json(
          { error: 'Failed to process webhook' }, 
          { status: 500 }
        )
      }
      break

    case 'bot.fatal':
      // TODO update meeting status to failed
      break
  }

  return NextResponse.json({ received: true })
}
