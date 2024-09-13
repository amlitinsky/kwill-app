import { NextResponse } from 'next/server';
import { getBotStatus } from '@/lib/recall';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const botId = searchParams.get('botId')

  if (!botId) {
    return NextResponse.json({ success: false, message: 'Missing botId' }, { status: 400 })
  }

  try {
    const status = await getBotStatus(botId)
    return NextResponse.json({ success: true, status })
  } catch (error) {
    console.error('Error fetching bot status:', error)
    return NextResponse.json({ success: false, message: 'Failed to fetch bot status' }, { status: 500 })
  }
}