import { NextResponse } from 'next/server';
import { createBot } from '@/lib/recall';

export async function POST(request: Request) {
  try {
    const { zoomLink } = await request.json();
    const bot = await createBot(zoomLink);
    return NextResponse.json({ success: true, botId: bot.id });
  } catch (error) {
    console.error('Error creating bot:' );
    return NextResponse.json({ success: false, message: 'Failed to create bot' }, { status: 500 });
  }
}