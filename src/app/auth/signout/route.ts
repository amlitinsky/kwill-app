import { createServerSupabaseClient } from '@/lib/supabase-server';
import { NextResponse } from 'next/server';

export async function POST() {
  const supabase = await createServerSupabaseClient();

  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session) {
      // Invalidate the current session
      await supabase.auth.admin.signOut(session.access_token);
      
      // Clear session cookies
      const response = NextResponse.json({ success: true });
      response.cookies.delete('sb-access-token');
      response.cookies.delete('sb-refresh-token');
      
      return response;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error signing out:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}