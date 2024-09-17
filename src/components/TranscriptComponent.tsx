import { useState, useEffect } from 'react'

interface TranscriptSegment {
  speaker: string;
  text: string;
}

interface TranscriptComponentProps {
  botId: string
}

export default function TranscriptComponent({ botId }: TranscriptComponentProps) {
  const [transcript, setTranscript] = useState<TranscriptSegment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [meetingStatus, setMeetingStatus] = useState<string>('waiting')
  useEffect(() => {
    // eslint-disable-next-line prefer-const
    let statusIntervalId: NodeJS.Timeout
    let transcriptIntervalId: NodeJS.Timeout

    const checkBotStatus = async () => {
      try {
        const response = await fetch(`/api/bot-status?botId=${botId}`)
        const data = await response.json()
        if (data.success) {
          console.log('Bot status:', data.status.status)
          setMeetingStatus(data.status.status)

          if (data.status.status === 'TRANSCRIBING') {
            console.log('Meeting started')
            // Start fetching transcript
            fetchTranscript()
            transcriptIntervalId = setInterval(fetchTranscript, 10000) // Fetch every 10 seconds
          } else if (data.status.status === 'COMPLETED') {
            console.log('Meeting ended')
            // Fetch final transcript
            await fetchTranscript()
            // Clear intervals
            clearInterval(statusIntervalId)
            clearInterval(transcriptIntervalId)
          }
        }
      } catch (error) {
        console.error('Error checking bot status:', error)
      }
    }

    const fetchTranscript = async () => {
      try {
        const response = await fetch(`/api/get-transcript?botId=${botId}`)
        const data = await response.json()
        if (data.success) {
          setTranscript(data.transcript)
        }
      } catch (error) {
        console.error('Error fetching transcript:', error)
      } finally {
        setIsLoading(false)
      }
    }

    // Start checking bot status
    checkBotStatus()
    statusIntervalId = setInterval(checkBotStatus, 5000) // Check every 5 seconds

    return () => {
      clearInterval(statusIntervalId)
      if (transcriptIntervalId) clearInterval(transcriptIntervalId)
    }
  }, [botId])

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <div className="mt-8">
      <h2 className="text-xl font-bold mb-4">Meeting Status: {meetingStatus}</h2>
      {transcript.length > 0 ? (
        <div>
          {transcript.map((segment, index) => (
            <div key={index} className="mb-2">
              <strong>{segment.speaker}:</strong> {segment.text}
            </div>
          ))}
        </div>
      ) : (
        <p>No transcript available yet. It may take a few moments to appear.</p>
      )}
    </div>
  )
}