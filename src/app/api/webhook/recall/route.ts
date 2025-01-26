import { NextResponse } from 'next/server'
import { Webhook } from 'svix'
import { calculateMeetingDuration, retrieveBotTranscript } from '@/lib/recall'
import { getMeetingDetails, getValidGoogleToken, updateMeetingMetrics,updateMeetingAIInsights, updateMeetingProcessedData, updateMeetingStatus, updateMeetingTranscript, supabaseAdmin } from '@/lib/supabase-server'
import { analyzeTranscript, generateMeetingSummary, extractKeyPoints, extractActionItems, generateTimeStampedHighlights, analyzeTopicDistribution, calculateSuccessRate } from '@/lib/deepseek'
import { mapHeadersAndAppendData } from '@/lib/google-auth'
import { ProcessedTranscriptSegment, processRawTranscript } from '@/lib/transcript-utils'
import { 
  acquireLock, 
  releaseLock, 
  getProcessRecord, 
  setProcessRecord 
} from '@/lib/redis'


const secret = process.env.RECALL_WEBHOOK_SECRET!

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

  const wh = new Webhook(secret)
  let evt: RecallWebhookPayload 
  try {
    evt = wh.verify(payload, headers) as RecallWebhookPayload
  } catch (err) {
    console.error('Webhook verification failed')
    return NextResponse.json({}, { status: 400 })
  }

  // Early environment check
  const botEnvironment = evt.data.bot.metadata?.environment as string | undefined
  const currentEnvironment = process.env.NODE_ENV // 'development' | 'production' | 'test'

  if (botEnvironment && botEnvironment !== currentEnvironment) {
    console.log(`Skipping webhook: environment mismatch. Expected ${currentEnvironment}, got ${botEnvironment}`)
    return NextResponse.json({ 
      skipped: true, 
      reason: 'environment_mismatch' 
    }, { status: 200 }) // Still return 200 to acknowledge receipt
  }

  const { event, data } = evt
  const botId = data.bot.id

  // Handle each bot status event
  switch (event) {
    case 'bot.joining':
      break

    case 'bot.in_waiting_room':
      break

    case 'bot.in_call_not_recording':
      break

    case 'bot.recording_permission_allowed':
      break

    case 'bot.recording_permission_denied':
      break

    case 'bot.in_call_recording':
      await updateMeetingStatus(botId, 'in-progress')
      break

    case 'bot.call_ended':
      break
    
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
          await updateMeetingStatus(botId, 'processing')
          // Process the completed meeting
          await processCompletedMeeting(botId)

          await updateMeetingStatus(botId, 'completed')

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
      await updateMeetingStatus(botId, 'failed')
      break
  }

  return NextResponse.json({ received: true })
}

// Helper functions for transcript analysis
function calculateSpeakerParticipation(transcript: ProcessedTranscriptSegment[]): Record<string, number> {
  const speakerDurations: Record<string, number> = {};
  let totalDuration = 0;

  transcript.forEach(segment => {
    const duration = segment.end_time - segment.start_time;
    speakerDurations[segment.speaker] = (speakerDurations[segment.speaker] || 0) + duration;
    totalDuration += duration;
  });

  // Convert to percentages
  Object.keys(speakerDurations).forEach(speaker => {
    speakerDurations[speaker] = (speakerDurations[speaker] / totalDuration) * 100;
  });

  return speakerDurations;
}
// Separate function for the analysis pipeline
async function processCompletedMeeting(botId: string) {
  try {
          const meetingDetails = await getMeetingDetails(botId)
          const processStart = Date.now()
          const durationInMinutes = await calculateMeetingDuration(botId)

          if (!meetingDetails) {
            throw new Error('Failed to retrieve meeting details')
          }

          // retrieving and processing the transcript
          const raw_transcript = await retrieveBotTranscript(botId)
          const transcript: ProcessedTranscriptSegment[] = processRawTranscript(raw_transcript)
          await updateMeetingTranscript(botId, transcript)
          
          // call deepseek API (with the transcript)
          const processed_data = await analyzeTranscript(
            transcript, 
            meetingDetails.column_headers, 
            meetingDetails.custom_instructions
          )

          // Calculate success rate after processing data
          const success_rate = await calculateSuccessRate(processed_data, meetingDetails.column_headers)

          // Calculate meeting metrics
          const metrics = {
            duration: durationInMinutes,
            fields_analyzed: meetingDetails.column_headers.length,
            success_rate: success_rate,
            processing_duration: Date.now() - processStart,
            speaker_participation: calculateSpeakerParticipation(transcript),
            topic_distribution: await analyzeTopicDistribution(transcript)
          }
          await updateMeetingMetrics(botId, metrics)

          // Generate AI insights
          const aiInsights = {
            summary: await generateMeetingSummary(transcript),
            key_points: await extractKeyPoints(transcript),
            action_items: await extractActionItems(transcript),
            highlights: await generateTimeStampedHighlights(transcript)
          }
          await updateMeetingAIInsights(botId, aiInsights)

          // update supabase with processed data
          await updateMeetingProcessedData(botId, processed_data)

          // get valid access_token
          const access_token = await getValidGoogleToken(meetingDetails.user_id)

          // append to google sheets
          // TODO eventually we will have to adapt to different sheet names with different headers or maybe exporting to different sheets at once
          await mapHeadersAndAppendData(
            meetingDetails.spreadsheet_id, 
            "", 
            processed_data, 
            access_token,
            meetingDetails.spreadsheet_row_number,
            false 
          )

          const { data: remainingHours, error: deductionError } = await supabaseAdmin
            .rpc('deduct_hours_atomic', {
              user_id: meetingDetails.user_id,
              duration_minutes: durationInMinutes
            })
            .single();

          if (deductionError) {
            console.error('Hour deduction failed:', {
              userId: meetingDetails.user_id,
              duration: durationInMinutes,
              error: deductionError
            });
            throw new Error('Could not deduct hours - insufficient balance or expired subscription');
          }

          console.log(`Successfully deducted ${durationInMinutes} minutes from user ${meetingDetails.user_id}. Remaining: ${remainingHours}`);


  } catch (error) {
    console.error(`Error processing completed meeting: Bot ${botId}`, error)
    return NextResponse.json(
      { error: 'Failed to process completed meeting' }, 
      { status: 500 }
    )
  }
}