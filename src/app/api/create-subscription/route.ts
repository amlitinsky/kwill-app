import { NextResponse } from 'next/server';
import { createCheckoutSession, createStripeCustomer, listStripeCustomer} from '@/lib/stripe';
import { createServerSupabaseClient } from '@/lib/supabase-server';

export async function POST(request: Request) {
  const supabase = await createServerSupabaseClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { priceId } = await request.json();
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('stripe_customer_id, stripe_subscription_id')
      .eq('id', user.id)
      .single();


    if (userError) throw userError;

    let stripeCustomerId = userData?.stripe_customer_id;

    // Check for existing customer in Stripe
    const existingCustomerId = await listStripeCustomer(user.email!)

    if (existingCustomerId) {
      // If a customer exists in Stripe
      if (!stripeCustomerId || stripeCustomerId !== existingCustomerId) {
        // Update our database with the Stripe customer ID
        stripeCustomerId = existingCustomerId;
        await supabase
          .from('users')
          .update({ stripe_customer_id: stripeCustomerId })
          .eq('id', user.id);
      }
    } else if (!stripeCustomerId) {
    // If no customer in Stripe and no customer ID in our database, create a new one
    const customer = await createStripeCustomer(user.email!);
    stripeCustomerId = customer.id;
    await supabase
        .from('users')
        .update({ stripe_customer_id: stripeCustomerId })
        .eq('id', user.id);
    }

    const previous_subscription_id = userData.stripe_subscription_id
    const session = await createCheckoutSession(priceId, previous_subscription_id, stripeCustomerId)

    return NextResponse.json({ 
        sessionId: session.id
     });
  } catch (error) {
    console.error('Error creating subscription:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}