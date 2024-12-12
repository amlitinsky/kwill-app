import { Redis } from '@upstash/redis'
import { Client } from '@upstash/qstash'

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!
})

const qstash = new Client({
  token: process.env.QSTASH_TOKEN!
})

export async function scheduleMeeting(eventUri: string, startTime: string) {
  try {
    const botStartTime = new Date(new Date(startTime).getTime() - 30000);
    const delaySeconds = Math.max(0, Math.floor((botStartTime.getTime() - Date.now()) / 1000));
    console.log("scheduling meeting via qstash and redis and these are the delay seconds: ", delaySeconds)

    const scheduleResponse = await qstash.publishJSON({
      url: `${process.env.NEXT_PUBLIC_NGROK_URL}/api/deploy-meeting-bot`, 
      body: { eventUri },
      delay: delaySeconds,
      retries: 3,
      retryDelay: 30
    });

    console.log("we should have a scheduled response: ", scheduleResponse)

    // Calculate TTL: meeting start time + 2 hours (typical meeting duration) + 1 hour buffer
    const ttlSeconds = Math.floor(
      (new Date(startTime).getTime() + (3 * 60 * 60 * 1000) - Date.now()) / 1000
    );

    const response = await redis.set(
      `schedule:${eventUri}`,
      JSON.stringify({
        qstash_message_id: scheduleResponse.messageId,
        start_time: startTime,
        canceled: false
      }),
      { 
        ex: ttlSeconds // Set expiration in seconds
      }
    );
    console.log("redist set response: ", response)

    return scheduleResponse.messageId;
  } catch (error) {
    console.error('Error scheduling meeting:', error);
    throw new Error('Failed to schedule meeting');
  }
}

export async function cancelScheduledMeeting(eventUri: string) {
  const scheduleData = await redis.get(`schedule:${eventUri}`);
  if (scheduleData) {
    await redis.set(`schedule:${eventUri}`, JSON.stringify({
      ...scheduleData,
      canceled: true
    }));
  }
}