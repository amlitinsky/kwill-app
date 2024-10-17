import { NextResponse } from 'next/server'
import { Webhook } from 'svix'
import { analyzeMedia, getTranscript } from '@/lib/recall'
import { getGoogleCreds, getMeetingDetails, updateMeetingProcessedData, updateMeetingStatus, updateMeetingTranscript } from '@/lib/supabase-server'
import { processTranscriptWithClaude } from '@/lib/anthropic'
import { mapHeadersAndAppendData } from '@/lib/google-auth'

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

    if (status.code === 'done') {
      try {
        await analyzeMedia(bot_id)
        await updateMeetingStatus(bot_id, 'recording complete')
        console.log(`Analysis initiated: Bot ${bot_id}`)
      } catch (error) {
        console.error(`Error initiating analysis: Bot ${bot_id}`)
        return NextResponse.json({ error: 'Failed to initiate analysis' }, { status: 500 })
      }
    } else if (status.code === 'analysis_done') {
      try {
        const raw_transcript = await getTranscript(bot_id)
        
        const transcript = raw_transcript.map((segment: { speaker: string; words: { text: string }[] }) => ({
          speaker: segment.speaker,
          text: segment.words.map((word) => word.text).join(' ')
        }))

        console.log('Transcript in webhook:', JSON.stringify(transcript, null, 2))
        console.log('bot id', bot_id)

        await updateMeetingTranscript(bot_id, transcript)
        await updateMeetingStatus(bot_id, 'transcript_ready')

        const meetingDetails = await getMeetingDetails(bot_id)
        if (!meetingDetails) {
            throw new Error('Failed to retrieve meeting details')
        }

        const { user_id, spreadsheet_id, column_headers, custom_instructions } = meetingDetails

        // call claude API (with the transcript)
        const processed_data = await processTranscriptWithClaude(transcript, column_headers, custom_instructions)
        console.log("LLM output: ", processed_data)

        // get access token
        const google_creds = await getGoogleCreds(user_id)
        console.log("retrieved google creds in web hook", google_creds)

        // update supabase
        await updateMeetingProcessedData(bot_id, processed_data)

        // appned to google sheets
        await mapHeadersAndAppendData(spreadsheet_id, "", processed_data, google_creds.access_token)

      } catch (error) {
        console.error(`Error retrieving or processing transcript: Bot ${bot_id}`, error)
        return NextResponse.json({ error: 'Failed to retrieve or process transcript' }, { status: 500 })
      }
    }
  }

  return NextResponse.json({ received: true })
}
