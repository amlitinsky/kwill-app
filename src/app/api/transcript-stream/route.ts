import { NextResponse } from 'next/server'

const clients = new Map()

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const botId = searchParams.get('botId')

  if (!botId) {
    return NextResponse.json({ error: 'Missing botId' }, { status: 400 })
  }

  const stream = new TransformStream()
  const writer = stream.writable.getWriter()

  clients.set(botId, writer)

  return new NextResponse(stream.readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })
}

export async function updateClient(botId: string, data: Record<string, unknown>) {
  const writer = clients.get(botId)
  if (writer) {
    const encoder = new TextEncoder()
    await writer.write(encoder.encode(`data: ${JSON.stringify(data)}\n\n`))
  }
}