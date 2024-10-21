import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { FREE_MEETING_USAGE, PRO_MEETING_USAGE } from '@/constants/plan';

export async function GET() {
  const supabase = createServerSupabaseClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (!user || error) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('payment_plan, stripe_subscription_id, meetings_used, subscription_end_date')
      .eq('id', user.id)
      .single();

    if (userError) {
      return NextResponse.json({ error: 'User data not found' }, { status: 400 });
    }

    const now = new Date();
    const subscriptionEndDate = userData.subscription_end_date ? new Date(userData.subscription_end_date) : null;

    if (subscriptionEndDate && now > subscriptionEndDate) {
    // Subscription has ended, downgrade to free plan
    await supabase
        .from('users')
        .update({ 
        payment_plan: 'Free',
        subscription_end_date: null
        })
        .eq('id', user.id);
    userData.payment_plan = 'Free';
    }

    let canCreateMeeting = false;
    let upgradeUrl = null;

    // TODO CONSTNATS
    switch (userData.payment_plan) {
      case 'Free':
        canCreateMeeting = userData.meetings_used < FREE_MEETING_USAGE;
        upgradeUrl = canCreateMeeting ? null : '/pricing?plan=pro';
        break;
      case 'Pro':
        if (userData.meetings_used >= PRO_MEETING_USAGE) {
          upgradeUrl = '/pricing?plan=premium';
        } else {
          canCreateMeeting = true;
        }
        break;
      case 'Premium':
        canCreateMeeting = true;
        break;
    }

    return NextResponse.json({ canCreateMeeting, upgradeUrl });
  } catch (error) {
    console.error('Error checking meeting limit:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}