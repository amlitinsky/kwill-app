import { NextResponse } from 'next/server';
import { createCheckoutSession, createStripeCustomer} from '@/lib/stripe';
import { createServerSupabaseClient } from '@/lib/supabase-server';

export async function POST(request: Request) {
  const supabase = createServerSupabaseClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { priceId } = await request.json();
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .single();


    if (userError) throw userError;

    let stripeCustomerId = userData?.stripe_customer_id;
    // If user doesn't have a Stripe customer ID, create one
    if (!stripeCustomerId) {
      const customer = await createStripeCustomer(user.email!);
      await supabase
        .from('users')
        .update({ stripe_customer_id: customer.id })
        .eq('id', user.id);
      stripeCustomerId = customer.id;
    }


    const session = await createCheckoutSession(priceId)

    return NextResponse.json({ 
        sessionId: session.id
     });
  } catch (error) {
    console.error('Error creating subscription:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}