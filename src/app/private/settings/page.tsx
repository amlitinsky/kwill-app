'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { StripeManager } from '@/components/StripeManager'
import { useRouter, useSearchParams } from 'next/navigation'
import { useToast } from '@/hooks/use-toast'
import { ZoomConnectButton } from '@/components/ZoomConnectButton'
import { CalendlyConnectButton } from '@/components/CalendlyConnectButton'
import { CalendlyConfigs} from "@/components/CalendlyConfigs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { supabase } from '@/lib/supabase-client'

interface UserMetadata {
  avatar_url?: string
  full_name?: string
  email?: string
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile')
  const searchParams = useSearchParams()
  const verificationCompleteRef = useRef(false)
  const router = useRouter()
  const { toast } = useToast()
  const [isCalendlyConnected, setIsCalendlyConnected] = useState(false)
  const [userMetadata, setUserMetadata] = useState<UserMetadata | null>(null)

  useEffect(() => {
    const savedTab = localStorage.getItem('settingsActiveTab')
    if (savedTab) {
      setActiveTab(savedTab)
    }

    async function loadUserMetadata() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user?.user_metadata) {
        setUserMetadata(user.user_metadata)
      }
    }
    loadUserMetadata()
  }, [])

  useEffect(() => {
    async function checkCalendlyConnection() {
      try {
        const response = await fetch('/api/check-calendly-connection');
        const data = await response.json();
        setIsCalendlyConnected(data.isConnected);
      } catch (error) {
        console.error('Error checking Calendly connection:', error);
      }
    }
    
    checkCalendlyConnection();
  }, []);

  const handleTabChange = (value: string) => {
    setActiveTab(value)
    localStorage.setItem('settingsActiveTab', value)
  }

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    const canceled = searchParams.get('canceled');
    const mode = searchParams.get('mode');
    
    if (sessionId && !verificationCompleteRef.current) {
      verificationCompleteRef.current = true;
      
      if (mode === 'setup') {
        toast({
          title: "Card Updated",
          description: "Your payment method has been successfully updated.",
          duration: 5000,
        });
      } else {
        toast({
          title: "Purchase Successful",
          description: "Your hours have been added to your account!",
          duration: 5000,
        });
      }

      // Clean up URL
      router.replace('/private/settings');
    }
    
    // Handle canceled checkout
    if (canceled && !verificationCompleteRef.current) {
      verificationCompleteRef.current = true;
      
      const cancelMessage = mode === 'setup' 
        ? "Card update was canceled. No changes were made."
        : "Purchase was canceled. No charges were made.";

      toast({
        title: "Canceled",
        description: cancelMessage,
        variant: "default",
        duration: 5000,
      });

      router.replace('/private/settings');
    }
  }, [searchParams, router, toast]);

  return (
    <div className="container py-10">
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <div className="flex">
          <div className="w-48 pr-8 fixed">
            <TabsList className="flex flex-col space-y-2 w-full bg-transparent">
              <TabsTrigger value="profile" className="w-full justify-center text-center !bg-transparent">Profile</TabsTrigger>
              <TabsTrigger value="billing" className="w-full justify-center text-center !bg-transparent">Billing</TabsTrigger>
              <TabsTrigger value="integrations" className="w-full justify-center text-center !bg-transparent">Integrations</TabsTrigger>
            </TabsList>
          </div>
          <div className="flex-grow -mt-12 pl-48">
            <TabsContent value="profile">
              <Card>
                <CardHeader>
                  <CardTitle>Profile</CardTitle>
                  <CardDescription>Your Google Account Information</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-20 w-20">
                      <AvatarImage 
                        src={userMetadata?.avatar_url} 
                        alt={userMetadata?.full_name} 
                      />
                      <AvatarFallback>
                        {userMetadata?.full_name?.[0]?.toUpperCase() || '?'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="space-y-1">
                      <h3 className="text-2xl font-medium">
                        {userMetadata?.full_name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {userMetadata?.email}
                      </p>
                    </div>
                  </div>
                  <div className="mt-6 pt-6 border-t">
                    <p className="text-sm text-muted-foreground">
                      Your profile information is managed through your Google account.
                      Any changes made to your Google profile will be reflected here.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="billing">
              <StripeManager />
            </TabsContent>
            <TabsContent value="integrations">
              <Card>
                <CardHeader>
                  <CardTitle>Integrations</CardTitle>
                  <CardDescription>Manage your integrated services</CardDescription>
                </CardHeader>
                <CardContent>
                  <ZoomConnectButton />
                </CardContent>
                <CardContent>
                  <CalendlyConnectButton/>
                  {isCalendlyConnected && (
                    <div className="mt-6">
                      <CalendlyConfigs />
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </div>
      </Tabs>
    </div>
  )
}
