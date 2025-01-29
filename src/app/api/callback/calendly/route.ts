import { NextResponse } from 'next/server';
import { getCalendlyEventTypes, getCalendlyTokens, getCalendlyUserInfo, subscribeToCalendlyWebhooks } from '@/lib/calendly';
import { createPendingOAuthFlow, createServerSupabaseClient, getGoogleCreds} from '@/lib/supabase-server';
import { getGoogleAuthUrl } from '@/lib/google-auth';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (!code) {
    return NextResponse.json({ error: 'Invalid OAuth code' }, { status: 400 });
  }

  const supabase = await createServerSupabaseClient();

  try {
    // getUser wasn't working here for some reason even though the user is logged in?
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const googleCreds = await getGoogleCreds(user.id)
    // TODO we need to test pending oauth flow
    if (!googleCreds) {
        await createPendingOAuthFlow(user.id, 'calendly', code)

        return NextResponse.redirect(getGoogleAuthUrl())
    }

    const tokens = await getCalendlyTokens(code);

    // Get user info to get organization
    const userInfo = await getCalendlyUserInfo(tokens.access_token);

    // TODO make this into a function
    const { error } = await supabase
      .from('calendly_oauth_credentials')
      .upsert({
        user_id: user.id,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        uri: userInfo.uri,
        organization: userInfo.current_organization,
        expiry_date: new Date(tokens.expiry_date).toISOString(),
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id',
      });

    if (error) throw error;

    
    // Subscribe to webhooks
    await subscribeToCalendlyWebhooks(tokens.access_token, userInfo.uri, userInfo.current_organization);

    // Get and update event types with Kwill questions
    const eventTypes = await getCalendlyEventTypes(tokens.access_token, userInfo.uri);
    console.log("event types", eventTypes)



    return NextResponse.redirect(`${requestUrl.origin}/integrations?calendly_connected=true`);

  } catch (error) {
    console.error('Error in Calendly OAuth callback:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}