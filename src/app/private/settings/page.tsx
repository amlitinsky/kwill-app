'use client'

import { useState, useEffect } from 'react'
// import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { updateProfile, getCurrentUser } from '@/lib/supabase-client'

export default function SettingsPage() {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [loading, setLoading] = useState(false)
//   const router = useRouter()

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const user = await getCurrentUser()
        console.log("user: ", user)
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await updateProfile(firstName, lastName)
      alert('Profile updated successfully')
    } catch (error) {
      console.error('Error updating profile:', error)
      alert('Error updating profile')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-10">
      <Tabs defaultValue="profile" className="w-full">
        <div className="flex">
          <TabsList className="flex flex-col h-full space-y-2 mr-8">
            <TabsTrigger value="profile" className="w-full justify-start">Profile</TabsTrigger>
            <TabsTrigger value="billing" className="w-full justify-start">Billing</TabsTrigger>
            <TabsTrigger value="integrations" className="w-full justify-start">Integrations</TabsTrigger>
          </TabsList>
          <div className="flex-grow">
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
              <Card>
                <CardHeader>
                  <CardTitle>Billing</CardTitle>
                  <CardDescription>Manage your billing information and subscription</CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Billing content will go here */}
                  <p>Billing information coming soon.</p>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="integrations">
              <Card>
                <CardHeader>
                  <CardTitle>Integrations</CardTitle>
                  <CardDescription>Manage your integrated services</CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Integrations content will go here */}
                  <p>Integrations information coming soon.</p>
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </div>
      </Tabs>
    </div>
  )
}