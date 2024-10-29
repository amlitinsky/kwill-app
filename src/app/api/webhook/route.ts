import { NextResponse } from 'next/server'
import { Webhook } from 'svix'
import { analyzeMedia, getTranscript } from '@/lib/recall'
import { getGoogleCreds, getMeetingDetails, incrementMeetingCount, updateMeetingProcessedData, updateMeetingStatus } from '@/lib/supabase-server'
import { processTranscriptWithClaude } from '@/lib/anthropic'
import { mapHeadersAndAppendData } from '@/lib/google-auth'
import { ProcessedTranscriptSegment, processRawTranscript } from '@/lib/transcript-utils'
// import { processRawTranscript } from '@/lib/transcript-utils'

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
    console.error('Webhook verification failed')
    return NextResponse.json({}, { status: 400 })
  }

  const { event, data } = evt

  if (event === 'bot.status_change') {
    const { bot_id, status } = data

    if (status.code === 'done') {
      try {
        await analyzeMedia(bot_id)
        await updateMeetingStatus(bot_id, 'Recording Complete')
      } catch (error) {
        console.error(`Error initiating analysis: Bot ${bot_id}`)
        return NextResponse.json({ error: 'Failed to initiate analysis' }, { status: 500 })
      }
    } else if (status.code === 'analysis_done') {
      try {
        const meetingDetails = await getMeetingDetails(bot_id)

        if (!meetingDetails) {
            throw new Error('Failed to retrieve meeting details')
        }

        const { user_id, spreadsheet_id, column_headers, custom_instructions, status: meetingStatus} = meetingDetails

        // if the webhook refires for some reason
        if (meetingStatus === 'Done') {
          return NextResponse.json({ received: true })
        }

        // retrieving and processing the transcript
        const raw_transcript = await getTranscript(bot_id)
        const transcript: ProcessedTranscriptSegment[] = processRawTranscript(raw_transcript)
        
        // call claude API (with the transcript)
        const processed_data = await processTranscriptWithClaude(transcript, column_headers, custom_instructions)

        await updateMeetingStatus(bot_id, 'Analyzed Transcript')

        // get access token
        const google_creds = await getGoogleCreds(user_id)

        // update supabase
        await updateMeetingProcessedData(bot_id, processed_data)

        // appned to google sheets
        await mapHeadersAndAppendData(spreadsheet_id, "", processed_data, google_creds.access_token)

        await updateMeetingStatus(bot_id, 'Done')

        await incrementMeetingCount(user_id)

      } catch (error) {
        console.error(`Error analyzing transcript: Bot ${bot_id}`, error)
        return NextResponse.json({ error: 'Failed to retrieve or process transcript' }, { status: 500 })
      }
    }
  }

  return NextResponse.json({ received: true })
}
