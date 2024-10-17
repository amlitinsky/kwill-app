import { NextResponse } from 'next/server';
import { createStripeCustomer } from '@/lib/stripe';
import { createServerSupabaseClient } from '@/lib/supabase-server';

export async function POST() {
  const supabase = createServerSupabaseClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Check if user already has a Stripe customer ID
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('stripe_customer_id, email')
      .eq('id', user.id)
      .single();

    if (userError) {
      throw userError;
    }

    if (userData?.stripe_customer_id) {
      return NextResponse.json({ stripeCustomerId: userData.stripe_customer_id });
    }

    // Use the email from the database if available, fallback to auth user email
    const email = userData?.email || user.email;

    if (!email) {
      return NextResponse.json({ error: 'User email not found' }, { status: 400 });
    }

    // Create new Stripe customer
    const customer = await createStripeCustomer(email);

    // Update user record with Stripe customer ID
    const { error: updateError } = await supabase
      .from('users')
      .update({ stripe_customer_id: customer.id })
      .eq('id', user.id);

    if (updateError) {
      throw updateError;
    }

    return NextResponse.json({ stripeCustomerId: customer.id });
  } catch (error) {
    console.error('Error creating Stripe customer:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}