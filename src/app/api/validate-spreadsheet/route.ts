import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { validateSpreadsheet } from '@/lib/google-auth';

export async function POST(request: Request) {
  const supabase = createServerSupabaseClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { spreadsheetId } = await request.json();

    
    // Fetch the user's Google OAuth credentials
    const { data: credentials, error } = await supabase
      .from('google_oauth_credentials')
      .select('access_token')
      .eq('user_id', session.user.id)
      .single();

    if (error || !credentials) {
      return NextResponse.json({ error: 'Google credentials not found' }, { status: 400 });
    }

    await validateSpreadsheet(spreadsheetId, credentials.access_token);
    return NextResponse.json({ valid: true });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }
}