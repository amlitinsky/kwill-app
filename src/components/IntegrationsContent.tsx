'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ConnectButton } from '@/components/ConnectButton'
import { CalendlyConfigs } from "@/components/CalendlyConfigs"
import { useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import { useToast } from '@/hooks/use-toast'
import { generateZoomAuthURL } from '@/lib/recall'
import { getCalendlyAuthUrl } from '@/lib/calendly'
import { getGoogleAuthUrl } from "@/lib/google-auth"

interface OAuthCredentials {
  access_token: string;
  refresh_token: string;
  expires_at: number;
}

interface CalendlyConfig {
  id: string;
  name: string;
  uri: string;
  spreadsheet_id: string | null;
  custom_instructions: string | null;
  active: boolean;
}

interface IntegrationsContentProps {
  zoomCredentials: OAuthCredentials | null;
  calendlyCredentials: OAuthCredentials | null;
  googleCredentials: OAuthCredentials | null;
  calendlyConfigs: CalendlyConfig | null;
}

export function IntegrationsContent({
  zoomCredentials,
  calendlyCredentials,
  googleCredentials,
  calendlyConfigs
}: IntegrationsContentProps) {
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [isGoogleConnected, setIsGoogleConnected] = useState(!!googleCredentials)
  const [isZoomConnected, setIsZoomConnected] = useState(!!zoomCredentials)
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
      setIsZoomConnected(true)
      toast({
        title: "Success",
        description: "Successfully connected to Zoom"
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
      const authUrl = getGoogleAuthUrl()
      window.location.href = authUrl
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
    <>
      <h1 className="text-3xl font-bold mb-6">Integrations</h1>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Google</CardTitle>
            <CardDescription>Connect your Google account to enable spreadsheet integration</CardDescription>
          </CardHeader>
          <CardContent>
            <ConnectButton 
              provider="Google"
              isConnected={isGoogleConnected}
              onConnect={handleGoogleConnect}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Zoom</CardTitle>
            <CardDescription>Connect your Zoom account to enable meeting recordings</CardDescription>
          </CardHeader>
          <CardContent>
            <ConnectButton 
              provider="Zoom"
              isConnected={isZoomConnected}
              onConnect={handleZoomConnect}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Calendly</CardTitle>
            <CardDescription>Connect your Calendly account to automate meeting scheduling</CardDescription>
          </CardHeader>
          <CardContent>
            <ConnectButton 
              provider="Calendly"
              isConnected={isCalendlyConnected}
              onConnect={handleCalendlyConnect}
            />
            {calendlyCredentials && (
              <div className="mt-6">
                <CalendlyConfigs 
                  initialConfigs={calendlyConfigs}
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  )
} 