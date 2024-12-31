import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createServerSupabaseClient, getStripeCustomerId } from '@/lib/supabase-server';

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const customerId = await getStripeCustomerId(user.id);
    if (!customerId) {
      return NextResponse.json({ paymentMethods: [] });
    }

    // Get the default payment method
    const paymentMethods = await stripe.paymentMethods.list({
      customer: customerId,
      type: 'card',
      limit: 1,
    });

    return NextResponse.json({ paymentMethods: paymentMethods.data});
  } catch (error) {
    console.error('Error fetching payment methods:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payment methods' },
      { status: 500 }
    );
  }
} 