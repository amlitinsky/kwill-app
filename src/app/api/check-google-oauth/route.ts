import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { refreshAccessToken } from '@/lib/google-auth';

export async function GET() {
  const supabase = createRouteHandlerClient({ cookies });

  try {
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ isAuthorized: false, error: 'No active session' }, { status: 401 });
    }

    console.log("verifying google oauth credentials")

    const { data: credentials, error } = await supabase
      .from('google_oauth_credentials')
      .select('access_token, refresh_token, expiry_date')
      .eq('user_id', session.user.id)
      .single();

    if (error || !credentials) {
      return NextResponse.json({ isAuthorized: false });
    }

    const now = new Date();
    const expiryDate = new Date(credentials.expiry_date);

    if (now >= expiryDate) {
      // Token is expired, refresh it
      const newCredentials = await refreshAccessToken(credentials.refresh_token);
      
      // Update the database with the new credentials
      await supabase
        .from('google_oauth_credentials')
        .update({
          access_token: newCredentials.access_token,
          expiry_date: newCredentials.expiry_date,
        })
        .eq('user_id', session.user.id);

      return NextResponse.json({ isAuthorized: true, refreshed: true });
    }

    return NextResponse.json({ isAuthorized: true });

  } catch (error) {
    console.error('Error checking Google auth:', error);
    return NextResponse.json({ isAuthorized: false, error: 'Internal server error' }, { status: 500 });
  }
}