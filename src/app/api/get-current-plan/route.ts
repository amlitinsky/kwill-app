import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const { data: planInfo, error } = await supabase
      .from('users')
      .select(`
        meeting_hours_remaining,
        total_hours_purchased,
        auto_renewal_enabled,
        auto_renewal_package_hours,
        calendly_access_until
      `)
      .eq('id', user.id)
      .single();

    if (error) throw error;

    return NextResponse.json({ planInfo });
  } catch (error) {
    console.error('Error fetching current plan:', error);
    return NextResponse.json(
      { error: 'Failed to fetch current plan' },
      { status: 500 }
    );
  }
}