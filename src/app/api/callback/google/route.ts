import { NextResponse } from 'next/server';
import { getGoogleTokens } from '@/lib/google-auth';
import { createServerSupabaseClient } from '@/lib/supabase-server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const state = requestUrl.searchParams.get('state');

  if (!code) {
    return NextResponse.json({ error: 'Invalid OAuth code' }, { status: 400 });
  }

  const supabase = await createServerSupabaseClient();

  try {
    const { data: { user} } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tokens = await getGoogleTokens(code);

    // Store the tokens in your database
    const { error } = await supabase
      .from('google_oauth_credentials')
      .upsert({
        user_id: user.id,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expiry_date: tokens.expiry_date ? new Date(tokens.expiry_date).toISOString() : null,
      }, {
        onConflict: 'user_id',

      });

    if (error) throw error;

    return NextResponse.redirect(`${requestUrl.origin}/${state}`);

  } catch (error) {
    console.error('Error in Google OAuth callback:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}