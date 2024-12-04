import { Redis } from '@upstash/redis'
import { Client } from '@upstash/qstash'

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!
})

const qstash = new Client({
  token: process.env.QSTASH_TOKEN!
})

export async function scheduleMeeting(webhookData: any) {
  const startTime = new Date(webhookData.payload.scheduled_event.start_time);
  const meetingData = {
    id: webhookData.payload.uri,
    user_id: webhookData.payload.user_id,
    event_uuid: webhookData.payload.event_uuid,
    start_time: startTime.toISOString(),
    canceled: false,
    spreadsheet_url: webhookData.payload.questions_and_answers.find(
      (qa: any) => qa.question === 'Spreadsheet URL (Required for Kwill Assistant)'
    )?.answer
  };

  // Schedule the bot start
  const botStartTime = new Date(startTime.getTime() - 60000);
  const scheduleResponse = await qstash.schedules.create({
    destination: `${process.env.NEXT_PUBLIC_BASE_URL}/api/start-meeting-bot`,
    body: JSON.stringify({ meetingId: meetingData.id }),
    notBefore: botStartTime.toISOString()
  });

  // Store meeting data with QStash schedule ID
  const meetingDataWithSchedule = {
    ...meetingData,
    qstash_schedule_id: scheduleResponse.scheduleId
  };

  await redis.set(`meeting:${meetingData.id}`, JSON.stringify(meetingDataWithSchedule));
  return meetingDataWithSchedule;
}

export async function cancelMeeting(webhookData: any) {
  const meetingId = webhookData.payload.uri;
  const meetingData = await redis.get(`meeting:${meetingId}`);
  
  if (meetingData) {
    const parsedMeeting = JSON.parse(meetingData as string);
    
    // Cancel the scheduled QStash task
    if (parsedMeeting.qstash_schedule_id) {
      await qstash.schedules.delete(parsedMeeting.qstash_schedule_id);
    }

    // Update meeting status in Redis
    const updatedMeeting = { ...parsedMeeting, canceled: true };
    await redis.set(`meeting:${meetingId}`, JSON.stringify(updatedMeeting));
  }
}