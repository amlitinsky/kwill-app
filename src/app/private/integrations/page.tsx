import { createServerSupabaseClient } from '@/lib/supabase-server'
import { IntegrationsContent } from '@/components/IntegrationsContent'

export default async function IntegrationsPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  // Fetch all OAuth credentials
  const { data: zoomCreds } = await supabase
    .from('zoom_oauth_credentials')
    .select('*')
    .eq('user_id', user.id)
    .single()

  const { data: calendlyCreds } = await supabase
    .from('calendly_oauth_credentials')
    .select('*')
    .eq('user_id', user.id)
    .single()

  const { data: googleCreds } = await supabase
    .from('google_oauth_credentials')
    .select('*')
    .eq('user_id', user.id)
    .single()

  const { data: calendlyConfigs } = await supabase
    .from('calendly_configs')
    .select('*')
    .eq('user_id', user.id)
    .single()

  return (
    <div className="container py-10">
      <IntegrationsContent 
        zoomCredentials={zoomCreds}
        calendlyCredentials={calendlyCreds}
        googleCredentials={googleCreds}
        calendlyConfigs={calendlyConfigs}
      />
    </div>
  )
} 