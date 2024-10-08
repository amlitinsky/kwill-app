import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { getGoogleTokens } from '@/lib/google-auth';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (!code) {
    return NextResponse.json({ error: 'Invalid OAuth code' }, { status: 400 });
  }

  const supabase = createRouteHandlerClient({ cookies });

  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tokens = await getGoogleTokens(code);
    console.log("getting google tokens")

    // Store the tokens in your database
    const { error } = await supabase
      .from('google_oauth_credentials')
      .upsert({
        user_id: session.user.id,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expiry_date: tokens.expiry_date ? new Date(tokens.expiry_date).toISOString() : null,
      }, {
        onConflict: 'user_id',
      });

    if (error) throw error;

    console.log("redirecting back to the meetings page")

    return NextResponse.redirect(`${requestUrl.origin}/private/meetings?google_connected=true`);
  } catch (error) {
    console.error('Error in Google OAuth callback:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}