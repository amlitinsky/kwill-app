import { NextResponse } from 'next/server';
import { createServerSupabaseClient, getStripeCustomerId } from '@/lib/supabase-server';
import { createCustomerPortalSession } from '@/lib/stripe';


export async function POST() {
  const supabase = await createServerSupabaseClient();
  
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const stripeCustomerId = await getStripeCustomerId(user.id);
    
    if (!stripeCustomerId) {
      return NextResponse.json({ error: 'No Stripe customer found' }, { status: 404 });
    }

    const session = await createCustomerPortalSession(stripeCustomerId)

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Error creating customer portal session:', error);
    return NextResponse.json({ error: 'Failed to create customer portal session' }, { status: 500 });
  }
}
