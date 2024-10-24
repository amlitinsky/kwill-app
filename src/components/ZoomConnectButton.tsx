import { useState, useEffect } from 'react'
import { generateZoomAuthURL } from '@/lib/recall'
import { useSearchParams } from 'next/navigation'

export function ZoomConnectButton() {
  const [isConnected, setIsConnected] = useState(false)
  const searchParams = useSearchParams()

  useEffect(() => {
    const storedConnectionStatus = localStorage.getItem('zoomConnected')
    if (storedConnectionStatus === 'true') {
      setIsConnected(true)
    }

    const zoomConnected = searchParams.get('zoom_connected')
    if (zoomConnected === 'true') {
      setIsConnected(true)
      localStorage.setItem('zoomConnected', 'true')
    }
  }, [searchParams])

  const handleConnect = () => {
    if (!isConnected) {
      const authUrl = generateZoomAuthURL()
      window.location.href = authUrl
    }
  }

  return (
    <button onClick={handleConnect} disabled={isConnected}>
      {isConnected ? 'Connected to Zoom' : 'Connect to Zoom'}
    </button>
  )
}
