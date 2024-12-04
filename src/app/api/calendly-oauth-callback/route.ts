import { NextResponse } from 'next/server';
import { getCalendlyEventTypes, getCalendlyTokens, getCalendlyUserInfo, subscribeToCalendlyWebhooks, updateEventTypeQuestions } from '@/lib/calendly';
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
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const googleCreds = await getGoogleCreds(session.user.id)
    if (!googleCreds) {
        await createPendingOAuthFlow(session.user.id, 'calendly', code)

        return NextResponse.redirect(getGoogleAuthUrl())
    }

    const tokens = await getCalendlyTokens(code);

    // TODO make this into a function
    const { error } = await supabase
      .from('calendly_oauth_credentials')
      .upsert({
        user_id: session.user.id,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expiry_date: new Date(tokens.expiry_date).toISOString(),
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id',
      });

    if (error) throw error;

    // Get user info to get organization
    const userInfo = await getCalendlyUserInfo(tokens.access_token);
    
    // Subscribe to webhooks
    const webhook_response = await subscribeToCalendlyWebhooks(tokens.access_token, userInfo.uri, userInfo.current_organization);
    console.log("webhook response: ", webhook_response)

    // Get and update event types with Kwill questions
    const eventTypes = await getCalendlyEventTypes(tokens.access_token);
    console.log("event types", eventTypes)

    await Promise.all(eventTypes.map((eventType: { uri: string; }) => 
      updateEventTypeQuestions(tokens.access_token, eventType.uri)
    ));

    return NextResponse.redirect(`${requestUrl.origin}/private/settings?calendly_connected=true`);

  } catch (error) {
    console.error('Error in Calendly OAuth callback:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}