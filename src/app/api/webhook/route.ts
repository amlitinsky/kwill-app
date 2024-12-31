import { NextResponse } from 'next/server'
import { Webhook } from 'svix'
import { analyzeMedia, getTranscript, calculateMeetingDuration } from '@/lib/recall'
import { getMeetingDetails, getValidGoogleToken, incrementMeetingCount, updateMeetingProcessedData, updateMeetingStatus, updateUserMeetingHours } from '@/lib/supabase-server'
import { processTranscriptWithClaude } from '@/lib/anthropic'
import { mapHeadersAndAppendData } from '@/lib/google-auth'
import { ProcessedTranscriptSegment, processRawTranscript } from '@/lib/transcript-utils'
import { scheduleAutoRenewal } from '@/lib/auto-renewal'
import { 
  acquireLock, 
  releaseLock, 
  getProcessRecord, 
  setProcessRecord 
} from '@/lib/redis'


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
        // Calculate meeting duration and update user's remaining hours
        const duration = await calculateMeetingDuration(bot_id)
        const meetingDetails = await getMeetingDetails(bot_id)
        
        if (meetingDetails) {
          const updatedHours = await updateUserMeetingHours(meetingDetails.user_id, -duration)
          
          // If user has auto-renewal enabled and hours are getting low, schedule a check
          if (updatedHours.meeting_hours_remaining <= 5 && updatedHours.auto_renewal_enabled) {
            await scheduleAutoRenewal(meetingDetails.user_id, updatedHours.auto_renewal_package_hours)
          }
        }
        
        await analyzeMedia(bot_id)
        await updateMeetingStatus(bot_id, 'Recording Complete')
      } catch (error) {
        console.error(`Error processing meeting completion: Bot ${bot_id}`, error)
        return NextResponse.json({ error: 'Failed to process meeting completion' }, { status: 500 })
      }
    } else if (status.code === 'analysis_done') {

      try {
        // Check if already processed
        const processRecord = await getProcessRecord(bot_id)
        if (processRecord) {
          return NextResponse.json({ received: true })
        }

        // Try to acquire lock
        const locked = await acquireLock(bot_id)
        if (!locked) {
          return NextResponse.json({ received: true })
        }

        try {
          // Mark as processing
          await setProcessRecord(bot_id, {
            status: 'processing',
            startedAt: new Date().toISOString(),
            eventTimestamp: status.created_at
          })

          const meetingDetails = await getMeetingDetails(bot_id)
          if (!meetingDetails) {
            throw new Error('Failed to retrieve meeting details')
          }

          // Double-check meeting status
          if (['Done', 'Analyzed Transcript', 'Received Transcript'].includes(meetingDetails.status)) {
            return NextResponse.json({ received: true })
          }

          // retrieving and processing the transcript
          const raw_transcript = await getTranscript(bot_id)
          const transcript: ProcessedTranscriptSegment[] = processRawTranscript(raw_transcript)
          await updateMeetingStatus(bot_id, 'Received Transcript')
          
          // call claude API (with the transcript)
          const processed_data = await processTranscriptWithClaude(transcript, meetingDetails.column_headers, meetingDetails.custom_instructions)

          // update supabase
          await updateMeetingProcessedData(bot_id, processed_data)

          // analyze transcript
          await updateMeetingStatus(bot_id, 'Analyzed Transcript')

          // get access token
          // const google_creds = await getGoogleCreds(meetingDetails.user_id)

          // get valid access_token
          const access_token = await getValidGoogleToken(meetingDetails.user_id)

          // appned to google sheets
          await mapHeadersAndAppendData(meetingDetails.spreadsheet_id, "", processed_data, access_token)

          await updateMeetingStatus(bot_id, 'Done')

          await incrementMeetingCount(meetingDetails.user_id)

          // Mark as completed
          await setProcessRecord(bot_id, {
            status: 'completed',
            startedAt: new Date().toISOString(),
            completedAt: new Date().toISOString(),
            eventTimestamp: status.created_at
          })

          return NextResponse.json({ received: true })
        } finally {
          // Always release the lock
          await releaseLock(bot_id)
        }
      } catch (error) {
        console.error(`Error processing webhook: Bot ${bot_id}`, error)
        return NextResponse.json(
          { error: 'Failed to process webhook' }, 
          { status: 500 }
        )
      }
    }
  }

  return NextResponse.json({ received: true })
}
