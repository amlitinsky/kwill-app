import { useState, useEffect } from 'react'

interface TranscriptSegment {
  speaker: string;
  text: string;
}

interface TranscriptComponentProps {
  botId: string;
}

export default function TranscriptComponent({ botId }: TranscriptComponentProps) {
  const [transcript, setTranscript] = useState<TranscriptSegment[]>([])
  const [status, setStatus] = useState<string>('waiting')

  useEffect(() => {
    const eventSource = new EventSource(`/api/transcript-stream?botId=${botId}`)

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data)
      if (data.status) {
        setStatus(data.status)
      }
      if (data.transcript) {
        setTranscript(data.transcript)
      }
    }

    eventSource.onerror = (error) => {
      console.error('EventSource failed:', error)
      eventSource.close()
    }

    return () => {
      eventSource.close()
    }
  }, [botId])

  return (
    <div className="mt-8">
      <h2 className="text-xl font-bold mb-4">Meeting Status: {status}</h2>
      {status === 'analysis_done' ? (
        transcript.length > 0 ? (
          <div>
            {transcript.map((segment, index) => (
              <div key={index} className="mb-2">
                <strong>{segment.speaker}:</strong> {segment.text}
              </div>
            ))}
          </div>
        ) : (
          <p>Transcript is being processed. Please wait.</p>
        )
      ) : (
        <p>Meeting is still in progress or being analyzed. Transcript will be available when the analysis is complete.</p>
      )}
    </div>
  )
}