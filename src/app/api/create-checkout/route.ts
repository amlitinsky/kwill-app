import { NextResponse } from 'next/server';
import { createServerSupabaseClient, getOrCreateStripeCustomerId, getUserById } from '@/lib/supabase-server';
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

    const { priceId, setupOnly } = await req.json();

    const userData = await getUserById(user.id)

    
    const customerId = await getOrCreateStripeCustomerId(userData.id, userData.email)


    const session = await createCheckoutSession(
      priceId,
      customerId,
      setupOnly ? 'setup' : 'payment',
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