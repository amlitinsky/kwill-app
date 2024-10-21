import { NextResponse } from 'next/server';
import { cancelSubscription } from '@/lib/stripe';
import { createServerSupabaseClient } from '@/lib/supabase-server';

export async function POST() {
  const supabase = createServerSupabaseClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (!user || error ) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('stripe_subscription_id')
      .eq('id', user.id)
      .single();

    if (userError || !userData?.stripe_subscription_id) {
      return NextResponse.json({ error: 'User has no active subscription' }, { status: 400 });
    }

    const canceledSubscription = await cancelSubscription(userData.stripe_subscription_id);

    // Update user's payment plan in the database
    await supabase
      .from('users')
      .update({ 
        subscription_end_date: new Date(canceledSubscription.current_period_end * 1000).toISOString(),
        stripe_subscription_id: null
      })
      .eq('id', user.id);

    return NextResponse.json({ success: true, canceledSubscription });
  } catch (error) {
    console.error('Error canceling subscription:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}