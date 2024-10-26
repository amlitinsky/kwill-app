import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { checkTokenValidity, refreshAccessToken } from '@/lib/google-auth';

export async function GET() {
  const supabase = await createRouteHandlerClient({ cookies });

  try {
    const { data: { user} } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ isAuthorized: false, error: 'No active session' }, { status: 401 });
    }


    const { data: credentials, error } = await supabase
      .from('google_oauth_credentials')
      .select('access_token, refresh_token, expiry_date')
      .eq('user_id', user.id)
      .single();

    if (error || !credentials) {
      return NextResponse.json({ isAuthorized: false });
    }

    const now = Date.now();
    const expiryDate = credentials.expiry_date;
    const expiryTime = expiryDate ? new Date(expiryDate).getTime() : 0;
    const tokenError = await checkTokenValidity(credentials.access_token)

    if ((expiryTime && expiryTime <= now) || tokenError) {
      try {
        const newCredentials = await refreshAccessToken(credentials.refresh_token);

        
        // Update the database with the new credentials
        const { error: updateError } = await supabase
          .from('google_oauth_credentials')
          .update({
            access_token: newCredentials.access_token,
            expiry_date: newCredentials.expiry_date ? new Date(newCredentials.expiry_date).toISOString() : null,
          })
          .eq('user_id', user.id)
          .select();

        if (updateError) {
          console.error('Error updating credentials in database:', updateError);
          return NextResponse.json({ isAuthorized: false, error: 'Failed to update credentials' }, { status: 500 });
        }


        return NextResponse.json({ isAuthorized: true, refreshed: true });
      } catch (refreshError) {
        console.error('Error refreshing token:', refreshError);
        return NextResponse.json({ isAuthorized: false, error: 'Failed to refresh token' }, { status: 500 });
      }
    }

    return NextResponse.json({ isAuthorized: true });

  } catch (error) {
    console.error('Error checking Google auth:', error);
    return NextResponse.json({ isAuthorized: false, error: 'Internal server error' }, { status: 500 });
  }
}