import { createServerSupabaseClient } from '@/lib/supabase-server'
import { IntegrationsContent } from '@/components/integrations/IntegrationsContent'
import { getGoogleAuthUrl } from '@/lib/google-auth'


export default async function IntegrationsPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const googleAuthUrl = getGoogleAuthUrl('integrations')

  // Fetch all OAuth credentials
  const { data: recallOauthAppCreds } = await supabase
    .from('recall_oauth_app_credentials')
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
        recallOauthAppCredentials={recallOauthAppCreds}
        calendlyCredentials={calendlyCreds}
        googleCredentials={googleCreds}
        calendlyConfigs={calendlyConfigs}
        googleAuthUrl={googleAuthUrl}
      />
    </div>
  )
} 