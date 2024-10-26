import { NextResponse } from 'next/server';
import { getTranscript } from '@/lib/recall';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const botId = searchParams.get('botId');

  if (!botId) {
    return NextResponse.json({ success: false, message: 'Missing botId' }, { status: 400 });
  }

  try {
    const transcriptData = await getTranscript(botId);
    
    if (!transcriptData || !Array.isArray(transcriptData)) {
      return NextResponse.json({ success: true, transcript: [] });
    }
    
    const formattedTranscript = transcriptData.map(segment => ({
      speaker: segment.speaker,
      text: segment.words.map((word: { text: string }) => word.text).join(' ')
    }));

    return NextResponse.json({ success: true, transcript: formattedTranscript });
  } catch (error) {
    console.error('Error fetching transcript:', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch transcript' }, { status: 500 });
  }
}