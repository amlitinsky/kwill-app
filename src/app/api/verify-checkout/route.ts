import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createServerSupabaseClient } from '@/lib/supabase-server';

export async function POST(request: Request) {
  const supabase = createServerSupabaseClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { sessionId } = await request.json();

    // Retrieve the session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status === 'paid') {

      const planName = session.metadata?.planName || 'pro';

      // Update the user's subscription status in your database
      const { error: updateError } = await supabase
        .from('users')
        .update({ 
          payment_plan: planName,
          stripe_subscription_id: session.subscription as string
        })
        .eq('id', user.id);

      if (updateError) throw updateError;

      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ success: false, error: 'Payment not completed' });
    }
  } catch (error) {
    console.error('Error verifying checkout:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}