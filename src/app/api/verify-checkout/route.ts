import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import Stripe from 'stripe';

export async function POST(request: Request) {
  const supabase = createServerSupabaseClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { sessionId } = await request.json();

    // Retrieve the session from Stripe
    // const session = await stripe.checkout.sessions.retrieve(sessionId);
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['subscription']
    });

    if (session.payment_status === 'paid') {

      const planName = session.metadata?.planName || 'pro';
      const subscription = session.subscription as Stripe.Subscription;
      const previousSubscriptionId = session.metadata?.previous_subscription_id;

      console.log("previous subscripiton? ", previousSubscriptionId)


      if (previousSubscriptionId) {
        await stripe.subscriptions.update(previousSubscriptionId, { cancel_at_period_end: true });
      }
      if (['active', 'trialing'].includes(subscription.status)) {
        // Update the user's subscription status in your database
        const { error: updateError } = await supabase
          .from('users')
          .update({ 
            payment_plan: planName,
            stripe_subscription_id: subscription.id,
            subscription_status: subscription.status,
            subscription_end_date: new Date(subscription.current_period_end * 1000).toISOString()
          })
          .eq('id', user.id);

        if (updateError) throw updateError;
      } else {
        return NextResponse.json({ success: false, error: 'Subscription not active' });
      }

      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ success: false, error: 'Payment not completed' });
    }
  } catch (error) {
    console.error('Error verifying checkout:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
