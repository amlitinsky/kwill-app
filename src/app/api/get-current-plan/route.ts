import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';

export async function GET() {
  const supabase = createServerSupabaseClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (!user || error) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('payment_plan')
      .eq('id', user.id)
      .single();

    if (userError) {
      throw userError;
    }

    return NextResponse.json({ currentPlan: userData?.payment_plan || 'free' });
  } catch (error) {
    console.error('Error fetching current plan:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}