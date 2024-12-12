import { NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';
import { createBot } from '@/lib/recall';
import { getMeetingByEventUri, updateMeetingBotId } from '@/lib/supabase-server';

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!
});

export async function POST(request: Request) {
  try {
    const { eventUri } = await request.json();
    console.log('Received deploy request for event:', eventUri);
    
    // Check if meeting was cancelled
    const scheduleData = await redis.get(`schedule:${eventUri}`);
    console.log('Redis schedule data:', scheduleData);

    if (!scheduleData) {
      console.log('No schedule data found');
      return NextResponse.json({ 
        message: 'No schedule data found' 
      }, { status: 404 });
    }

    const parsedData = typeof scheduleData === 'string' 
      ? JSON.parse(scheduleData)
      : scheduleData;

    if (parsedData.canceled) {
      return NextResponse.json({ 
        message: 'Meeting cancelled, bot not deployed' 
      });
    }

    // Get meeting details from Supabase
    const meeting = await getMeetingByEventUri(eventUri);
    if (!meeting) {
      throw new Error('Meeting not found');
    }

    // Create Recall bot with the zoom link
    const botResponse = await createBot(meeting.zoom_link);
    
    // Update meeting with bot ID
    await updateMeetingBotId(meeting.id, botResponse.id);

    console.log("Bot deployed successfully:", botResponse.id);
    return NextResponse.json({ 
      success: true,
      botId: botResponse.id
    });

  } catch (error) {
    console.error('Error deploying meeting bot:', error);
    return NextResponse.json({ 
      error: 'Failed to deploy bot' 
    }, { status: 500 });
  }
}