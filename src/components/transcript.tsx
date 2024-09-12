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

  useEffect(() => {
    const fetchTranscript = async () => {
      try {
        const response = await fetch(`/api/get-transcript?botId=${botId}`)
        const data = await response.json()
        console.log('Received data from API:', data)
        if (data.success) {
          setTranscript(prevTranscript => {
            if (JSON.stringify(data.transcript) !== JSON.stringify(prevTranscript)) {
              console.log('New transcript:', data.transcript)
              return data.transcript
            }
            return prevTranscript
          })
        } else {
          console.error('Failed to fetch transcript:', data.message)
        }
      } catch (error) {
        console.error('Error:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchTranscript()
    const intervalId = setInterval(fetchTranscript, 5000)
    return () => clearInterval(intervalId)
  }, [botId])

  console.log('Current transcript state:', transcript)

  if (isLoading) {
    return <div>Loading transcript...</div>
  }

  return (
    <div className="mt-8">
      <h2 className="text-xl font-bold mb-4">Meeting Transcript</h2>
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