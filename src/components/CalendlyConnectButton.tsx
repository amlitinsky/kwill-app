import { useState, useEffect } from 'react'
import { getCalendlyAuthUrl } from '@/lib/calendly'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'

export function CalendlyConnectButton() {
  const [isConnected, setIsConnected] = useState(false)
  const searchParams = useSearchParams()

  useEffect(() => {
    // Check connection status on mount and when URL params change
    const calendlyConnected = searchParams.get('calendly_connected')
    if (calendlyConnected === 'true') {
      setIsConnected(true)
    }

    // Check current connection status
    checkConnectionStatus()
  }, [searchParams])

  const checkConnectionStatus = async () => {
    try {
      const response = await fetch('/api/check-calendly-connection')
      const data = await response.json()
      setIsConnected(data.isConnected)
    } catch (error) {
      console.error('Error checking Calendly connection:', error)
    }
  }

  const handleConnect = () => {
    if (!isConnected) {
      const authUrl = getCalendlyAuthUrl()
      window.location.href = authUrl
    }
  }

  return (
    <div className="flex flex-col space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-medium">Calendly</h3>
          <p className="text-sm text-muted-foreground">
            Connect to Calendly 
          </p>
        </div>
        <Button onClick={handleConnect} disabled={isConnected}>
          {isConnected ? 'Connected to Calendly' : 'Connect to Calendly'}
        </Button>
      </div>
    </div>
  )
}