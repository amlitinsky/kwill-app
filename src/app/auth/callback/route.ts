import { createServerSupabaseClient } from '@/lib/supabase-server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  const supabase = await createServerSupabaseClient();

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error(`Auth error: ${error}, Description: ${error.message}`);
      return NextResponse.redirect(`${requestUrl.origin}/auth-error?reason=${encodeURIComponent(error.message)}`);
    }
  } else {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.redirect(`${requestUrl.origin}/auth-error?reason=no_session`);
    }
  }

  return NextResponse.redirect(`${requestUrl.origin}/private/dashboard`);
}
