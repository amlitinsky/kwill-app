import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';

export async function POST(req: Request) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const { enabled, packageHours } = await req.json();

    // Update user's auto-renewal settings in Supabase
    const { error } = await supabase
      .from('users')
      .update({ 
        auto_renewal_enabled: enabled,
        auto_renewal_package_hours: packageHours
      })
      .eq('id', user.id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating auto-renewal:', error);
    return NextResponse.json(
      { error: 'Failed to update auto-renewal settings' },
      { status: 500 }
    );
  }
} 