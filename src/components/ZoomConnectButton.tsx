import { useState, useEffect } from 'react'
import { generateZoomAuthURL } from '@/lib/recall'

export function ZoomConnectButton() {
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    async function checkZoomConnection() {
      try {
        const response = await fetch('/api/check-zoom-connection');
        const data = await response.json();
        setIsConnected(data.isConnected);
      } catch (error) {
        console.error('Error checking Zoom connection:', error);
        setIsConnected(false);
      }
    }

    checkZoomConnection();
  }, []);

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