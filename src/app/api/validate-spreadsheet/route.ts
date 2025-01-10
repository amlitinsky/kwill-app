import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { validateSpreadsheet, getColumnHeaders } from '@/lib/google-auth';

export async function POST(request: Request) {
  const supabase = await createServerSupabaseClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { spreadsheetId } = await request.json();
    
    // Fetch the user's Google OAuth credentials
    const { data: credentials, error } = await supabase
      .from('google_oauth_credentials')
      .select('access_token')
      .eq('user_id', user.id)
      .single();

    if (error || !credentials) {
      return NextResponse.json({ error: 'Google credentials not found' }, { status: 400 });
    }

    // First validate spreadsheet access
    await validateSpreadsheet(spreadsheetId, credentials.access_token);

    // Then fetch column headers
    const headers = await getColumnHeaders(credentials.access_token, spreadsheetId);
    
    if (!headers || headers.length === 0) {
      return NextResponse.json({ 
        error: 'Spreadsheet must have at least one column header' 
      }, { status: 400 });
    }

    return NextResponse.json({ 
      valid: true,
      columnHeaders: headers 
    });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }
}