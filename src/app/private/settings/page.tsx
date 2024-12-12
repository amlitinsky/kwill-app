'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { updateProfile, getCurrentUser } from '@/lib/supabase-client'
import { SubscriptionManager } from '@/components/SubscriptionManager'
import { useRouter, useSearchParams } from 'next/navigation'
import { useToast } from '@/hooks/use-toast'
import { ZoomConnectButton } from '@/components/ZoomConnectButton'
import { CalendlyConnectButton } from '@/components/CalendlyConnectButton'
import { CalendlyConfigs} from "@/components/CalendlyConfigs"

export default function SettingsPage() {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('profile')
  const searchParams = useSearchParams()
  const verificationCompleteRef = useRef(false)
  const router = useRouter()
  const { toast } = useToast()
  const [isCalendlyConnected, setIsCalendlyConnected] = useState(false)

  useEffect(() => {
    // Load the active tab from localStorage
    const savedTab = localStorage.getItem('settingsActiveTab')
    if (savedTab) {
      setActiveTab(savedTab)
    }

    const fetchProfile = async () => {
      try {
        const user = await getCurrentUser()
        if (user && user.user_metadata) {
          setFirstName(user.user_metadata.first_name || '')
          setLastName(user.user_metadata.last_name || '')
        }
      } catch (error) {
        console.error('Error fetching user profile:', error)
      }
    }
    fetchProfile()

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
    // Save the active tab to localStorage
    localStorage.setItem('settingsActiveTab', value)
  }

  useEffect(() => {
    const sessionId = searchParams.get('session_id')
    
    if (sessionId && !verificationCompleteRef.current) {
      const verifyCheckout = async () => {
        try {
          verificationCompleteRef.current = true
          const response = await fetch('/api/verify-checkout', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ sessionId }),
          });
          const data = await response.json();
          if (data.success) {
            toast({
              title: "Success",
              description: "Subscription updated successfully!",
            })
            router.replace('/private/settings');

          } else {
            toast({
              title: "Error",
              description: "Failed to verify subscription. Please contact support.",
              variant: "destructive",
            })
          }
        } catch (error) {
          console.error('Error verifying checkout:', error);
          toast({
            title: "Error",
            description: "An error occurred while verifying your subscription. Please contact support.",
            variant: "destructive",
          })
        }
      };

      verifyCheckout();
    }

  }, [searchParams, router, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await updateProfile(firstName, lastName)
      toast({
        title: "Success",
        description: "Profile updated successfully",
      })
    } catch (error) {
      console.error('Error updating profile:', error)
      toast({
        title: "Error",
        description: "Error updating profile",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container py-10">
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <div className="flex">
          <div className="w-48 pr-8">
            <TabsList className="flex flex-col space-y-2 w-full bg-transparent">
              <TabsTrigger value="profile" className="w-full justify-center text-center !bg-transparent">Profile</TabsTrigger>
              <TabsTrigger value="billing" className="w-full justify-center text-center !bg-transparent">Billing</TabsTrigger>
              <TabsTrigger value="integrations" className="w-full justify-center text-center !bg-transparent">Integrations</TabsTrigger>
            </TabsList>
          </div>
          <div className="flex-grow -mt-12">
            <TabsContent value="profile">
              <Card>
                <CardHeader>
                  <CardTitle>Profile</CardTitle>
                  <CardDescription>Manage your profile information</CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <label htmlFor="firstName" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">First Name</label>
                      <Input
                        id="firstName"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="Enter your first name"
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="lastName" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Last Name</label>
                      <Input
                        id="lastName"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="Enter your last name"
                      />
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button type="submit" disabled={loading}>
                      {loading ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </CardFooter>
                </form>
              </Card>
            </TabsContent>
            <TabsContent value="billing">
              <SubscriptionManager />
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
