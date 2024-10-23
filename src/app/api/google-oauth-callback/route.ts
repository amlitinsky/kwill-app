import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { getGoogleTokens } from '@/lib/google-auth';
import { updateUserProfileWithGoogleInfo } from '@/lib/supabase-server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (!code) {
    return NextResponse.json({ error: 'Invalid OAuth code' }, { status: 400 });
  }

  const supabase = await createRouteHandlerClient({ cookies });

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

    // Check if the user's profile needs to be updated
    const { data: profileData, error: profileError } = await supabase
      .from('users')
      .select('first_name, last_name')
      .eq('id', user.id)
      .single();

    if (profileError) throw profileError;

    if (!profileData.first_name || !profileData.last_name) {
      // Update user profile with Google info
      await updateUserProfileWithGoogleInfo(tokens.access_token!);
    }

    return NextResponse.redirect(`${requestUrl.origin}/private/meetings?google_connected=true`);
  } catch (error) {
    console.error('Error in Google OAuth callback:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}