import { ZoomLinkForm } from '@/components/ZoomLinkForm'

export default function Home() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Zoom Meeting Transcription</h1>
      <ZoomLinkForm />
    </div>
  )
}