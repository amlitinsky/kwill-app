import { NextResponse } from 'next/server';
import { createServerSupabaseClient, getValidGoogleToken } from '@/lib/supabase-server';
import { getColumnHeaders } from '@/lib/google-auth';

export async function POST(request: Request) {
  const supabase = await createServerSupabaseClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
  try {
    const { spreadsheetId } = await request.json();
    

    const valid_access_token = await getValidGoogleToken(user.id)

    // Then fetch column headers
    const headers = await getColumnHeaders(valid_access_token, spreadsheetId);

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