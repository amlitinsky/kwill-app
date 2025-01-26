import { getGoogleTokens } from '@/lib/google-auth';
import { createStripeCustomer } from '@/lib/stripe';
import { listStripeCustomer } from '@/lib/stripe';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  const supabase = await createServerSupabaseClient();

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error(`Auth error: ${error}, Description: ${error.message}`);
      return NextResponse.redirect(`${requestUrl.origin}/auth-error?reason=${encodeURIComponent(error.message)}`);
    }
    
    const tokens = await getGoogleTokens(code);
    // TODO If we want to add other providers we need to add a check here

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) throw userError || new Error('No user found');
      // Check if tokens already exist for this user
    const { data: existingTokens } = await supabase
      .from('google_oauth_credentials')
      .select('*')
      .eq('user_id', user.id)
      .single();

    // Store the tokens in your database
    if (!existingTokens) {
    const { error: tokenError } = await supabase
      .from('google_oauth_credentials')
      .upsert({
        user_id: user.id,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expiry_date: tokens.expiry_date ? new Date(tokens.expiry_date).toISOString() : null,
      }, {
          onConflict: 'user_id',

        });
      if (tokenError) throw tokenError;
    }

    // Check/Create Stripe customer
    if (user.email && user.id) {
      // Always get or create Stripe customer
      let stripeCustomerId = await listStripeCustomer(user.email);
      if (!stripeCustomerId) {
        const customer = await createStripeCustomer(user.email);
        stripeCustomerId = customer.id;
      }

      // Always upsert subscription record
      const { error } = await supabase
        .from('subscriptions')
        .upsert(
          {
            user_id: user.id,
            stripe_customer_id: stripeCustomerId
          },
          { 
            onConflict: 'user_id',
            ignoreDuplicates: false // Force update if exists
          }
        );

      if (error) {
        console.error('Subscription sync failed:', error);
        throw error;
      }
    }

  } else {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.redirect(`${requestUrl.origin}/auth-error?reason=no_session`);
    }
  }

  return NextResponse.redirect(`${requestUrl.origin}/private/dashboard`);
}
