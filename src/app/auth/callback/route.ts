import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  console.log("request", request)
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  console.log('Callback - Full request URL:', request.url);
  console.log('Callback - Search params:', requestUrl.searchParams.toString());
  console.log('Callback - Received code:', code);

  const supabase = createRouteHandlerClient({ cookies });

  if (code) {
    console.log('Callback - Attempting to exchange code for session');
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error('Callback - Auth error:', error);
      return NextResponse.redirect(`${requestUrl.origin}/auth-error?reason=${encodeURIComponent(error.message)}`);
    }
    console.log('Callback - Successfully exchanged code for session', data);
  } else {
    console.log('Callback - No code received, checking existing session');
    const { data: { session } } = await supabase.auth.getSession();
    console.log('Callback - Existing session:', session ? 'Found' : 'Not found');
    if (!session) {
      console.log('Callback - No existing session found, redirecting to auth error');
      return NextResponse.redirect(`${requestUrl.origin}/auth-error?reason=no_session`);
    }
  }

  console.log('Callback - Redirecting to dashboard');
  return NextResponse.redirect(`${requestUrl.origin}/private/dashboard`);
}