'use client'

import { Card, CardDescription, CardTitle } from "@/components/ui/card"
import { ConnectButton } from '@/components/integrations/ConnectButton'
import { CalendlyTemplates } from "@/components/integrations/CalendlyTemplates"
import { useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import { useToast } from '@/hooks/use-toast'
import { generateZoomAuthURL } from '@/lib/recall'
import { getCalendlyAuthUrl } from '@/lib/calendly'

interface OAuthCredentials {
  access_token: string;
  refresh_token: string;
  expires_at: number;
}

interface RecallOauthAppCredentials {
  recall_id: string;
  recall_oauth_app: string;
  recall_user_id: string;
  connected: boolean;
  created_at: string;
}

interface CalendlyTemplate {
  id: string;
  name: string;
  uri: string;
  spreadsheet_id: string | null;
  prompt: string | null;
  active: boolean;
}

interface IntegrationsContentProps {
  recallOauthAppCredentials: RecallOauthAppCredentials | null;
  calendlyCredentials: OAuthCredentials | null;
  googleCredentials: OAuthCredentials | null;
  calendlyTemplates: CalendlyTemplate[] | null;
  googleAuthUrl: string;
}

export function IntegrationsContent({
  recallOauthAppCredentials,
  calendlyCredentials,
  googleCredentials,
  calendlyTemplates,
  googleAuthUrl
}: IntegrationsContentProps) {
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [isGoogleConnected, setIsGoogleConnected] = useState(!!googleCredentials)
  const [isZoomConnected, setIsZoomConnected] = useState(!!recallOauthAppCredentials)
  const [isCalendlyConnected, setIsCalendlyConnected] = useState(!!calendlyCredentials)

  useEffect(() => {
    const googleConnected = searchParams.get('google_connected')
    const zoomConnected = searchParams.get('zoom_connected')
    const calendlyConnected = searchParams.get('calendly_connected')

    if (googleConnected === 'true') {
      setIsGoogleConnected(true)
      toast({
        title: "Success",
        description: "Successfully connected to Google"
      })
    }
    if (zoomConnected === 'true') {
      // Update connection status in database
      fetch('/api/callback/zoom/connected', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      }).then(async (response) => {
        if (response.ok) {
          setIsZoomConnected(true)
          toast({
            title: "Success",
            description: "Successfully connected to Zoom"
          })
        } else {
          console.error('Failed to update Zoom connection status')
          toast({
            title: "Warning",
            description: "Connected to Zoom but failed to save status",
            variant: "destructive"
          })
        }
      }).catch((error) => {
        console.error('Error updating Zoom connection:', error)
      })
    }
    if (calendlyConnected === 'true') {
      setIsCalendlyConnected(true)
      toast({
        title: "Success",
        description: "Successfully connected to Calendly"
      })
    }
    // Clear connected params from URL after handling them
    if (googleConnected || zoomConnected || calendlyConnected) {
      window.history.replaceState({}, document.title, window.location.pathname);
    }

  }, [searchParams, toast])

  const handleGoogleConnect = () => {
    if (!isGoogleConnected) {
      window.location.href = googleAuthUrl
    }
  }

  const handleZoomConnect = () => {
    if (!isZoomConnected) {
      const authUrl = generateZoomAuthURL()
      window.location.href = authUrl
    }
  }

  const handleCalendlyConnect = () => {
    if (!isCalendlyConnected) {
      const authUrl = getCalendlyAuthUrl()
      window.location.href = authUrl
    }
  }

  return (
    <div className="container mx-auto px-8 py-6">
      <h1 className="text-3xl font-bold mb-6">Integrations</h1>
      <div className="space-y-6">
        <Card>
          <div className="flex justify-between items-center p-6">
            <div>
              <CardTitle>Google</CardTitle>
              <CardDescription>Connect your Google account to enable spreadsheet integration</CardDescription>
            </div>
            <ConnectButton 
              provider="Google"
              isConnected={isGoogleConnected}
              onConnect={handleGoogleConnect}
            />
          </div>
        </Card>

        <Card>
          <div className="flex justify-between items-center p-6">
            <div>
              <CardTitle>Zoom</CardTitle>
              <CardDescription>Connect your Zoom account to enable meeting recordings</CardDescription>
            </div>
            <ConnectButton 
              provider="Zoom"
              isConnected={isZoomConnected}
              onConnect={handleZoomConnect}
            />
          </div>
        </Card>

        <Card>
          <div className="flex justify-between items-center p-6">
            <div>
              <CardTitle>Calendly</CardTitle>
              <CardDescription>Connect your Calendly account to automate meeting scheduling</CardDescription>
            </div>
            <ConnectButton 
              provider="Calendly"
              isConnected={isCalendlyConnected}
              onConnect={handleCalendlyConnect}
            />
          </div>
          {isCalendlyConnected && calendlyTemplates && (
            <CalendlyTemplates initialTemplates={calendlyTemplates} />
          )}
        </Card>
      </div>
    </div>
  )
} 