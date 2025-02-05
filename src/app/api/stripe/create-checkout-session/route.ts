import { NextResponse } from 'next/server';
import { createServerSupabaseClient, getOrCreateStripeCustomerId } from '@/lib/supabase-server';
import { createCheckoutSession } from '@/lib/stripe';

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

    const { priceId } = await req.json();

    const customerId = await getOrCreateStripeCustomerId(user.id, user.email!)


    const session = await createCheckoutSession(
      priceId,
      customerId,
    );

    return NextResponse.json(session);
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
} 