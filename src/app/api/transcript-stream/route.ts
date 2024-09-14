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
    console.log(`Updating client for bot ${botId} with data:`, JSON.stringify(data, null, 2))
    try {
      await writer.write(encoder.encode(`data: ${JSON.stringify(data)}\n\n`))
      console.log(`Client updated successfully for bot ${botId}`)
    } catch (error) {
      console.error(`Error updating client for bot ${botId}:`, error)
    }
  } else {
    console.warn(`No client found for bot ${botId}`)
  }
}