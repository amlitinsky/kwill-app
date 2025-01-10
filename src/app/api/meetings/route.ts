import { NextResponse } from 'next/server';
import { fetchMeetings, createMeeting, updateMeetingStatus, updateMeetingTranscript, updateMeetingProcessedData, deleteMeeting, getUserById } from '@/lib/supabase-server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { createBot } from '@/lib/recall';

export async function GET() {
  const supabase = await createServerSupabaseClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const meetings = await fetchMeetings();
    return NextResponse.json(meetings);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const supabase = await createServerSupabaseClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Get user details to check meeting hours
    const userDetails = await getUserById(user.id);

    // TODO: Impleement subscription logic
    
    if (!userDetails || userDetails.meeting_hours_remaining <= 0) {
      return NextResponse.json({ 
        error: 'Insufficient meeting hours. Please purchase more hours to continue.' 
      }, { status: 403 });
    }

    const { 
      name,
      zoomLink,
      spreadsheetId, 
      customInstructions
    } = await request.json();

    const botId = await createBot(zoomLink)

    // Create meeting with recording status
    const newMeeting = await createMeeting(
      user.id,
      name,
      spreadsheetId,
      customInstructions,
      zoomLink,
      botId,
      { status: 'Recording' }
    );
    
    return NextResponse.json(newMeeting);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const supabase = await createServerSupabaseClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id, status, transcript, processedData } = await request.json();
    let updatedMeeting;

    if (status) {
      updatedMeeting = await updateMeetingStatus(id, status);
    } else if (transcript) {
      updatedMeeting = await updateMeetingTranscript(id, transcript);
    } else if (processedData) {
      updatedMeeting = await updateMeetingProcessedData(id, processedData);
    } else {
      throw new Error('Invalid update parameters');
    }

    return NextResponse.json(updatedMeeting);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const supabase = await createServerSupabaseClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await request.json();
    await deleteMeeting(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
