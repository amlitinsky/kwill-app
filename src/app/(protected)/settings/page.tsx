import { Suspense } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { StripeManager } from '@/components/stripe/StripeManager'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { getSubscription } from '@/lib/supabase-server'
import { getPlans } from '@/lib/stripe'
import { ClientSettingsWrapper } from './ClientSettingsWrapper'
import { TooltipProvider } from "@/components/ui/tooltip"
import { DeleteAccount } from '@/components/DeleteAccount'

export default async function SettingsPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  const userMetadata = user?.user_metadata

  // Fetch initial data for StripeManager
  const subscription = await getSubscription()
  const plans = await getPlans()
  // TODO bruh this shit ain't centereing wtf??

  return (
    <TooltipProvider>
      <div className="container py-10">
        <Suspense>
          <ClientSettingsWrapper defaultTab="profile">
            <div className="flex">
              <div className="w-48 shrink-0">
                <div className="sticky top-4">
                  <TabsList className="flex flex-col space-y-2 w-full bg-transparent">
                    <TabsTrigger value="profile" className="w-full justify-center">Profile</TabsTrigger>
                    <TabsTrigger value="billing" className="w-full justify-center">Billing</TabsTrigger>
                  </TabsList>
                </div>
              </div>
              <div className="flex-1 pl-8">
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
                      <DeleteAccount />
                    </CardContent>
                  </Card>
                </TabsContent>
                <TabsContent value="billing">
                  <StripeManager 
                    initialSubscription={subscription} 
                    initialPlans={plans}
                  />
                </TabsContent>
              </div>
            </div>
          </ClientSettingsWrapper>
        </Suspense>
      </div>
    </TooltipProvider>
  )
}
