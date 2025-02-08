import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { 
  getUserSubscriptionByStripeCustomerId,
  supabaseAdmin,
} from '@/lib/supabase-server';
import Stripe from 'stripe';
import { isStripeWebhookProcessed, markStripeWebhookProcessed } from '@/lib/redis';

export async function POST(req: Request) {
  const payload = await req.text();
  const sig = req.headers.get('Stripe-Signature');
  
  if (!sig) {
    return NextResponse.json(
      { error: 'No signature provided' },
      { status: 400 }
    );
  }

  try {
    // Verify webhook signature
    const event = stripe.webhooks.constructEvent(
      payload,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );

    // Atomic check for duplicate webhook
    if (await isStripeWebhookProcessed(event.id)) {
      return NextResponse.json({ received: true });
    }

    let success = false;
    try {
      // Handle different webhook events
      switch (event.type) {
        case 'checkout.session.completed':
        case 'invoice.paid':
        case 'invoice.payment_failed':
        case 'customer.subscription.deleted':
        case 'customer.subscription.updated':
          const customerId = event.data.object.customer as string;
          await syncStripeSubscription(customerId, event.type);
          break;

        // Add more cases as needed
        default:
          break;
      }

      success = true;
    } catch (error) {
      console.error('Error processing webhook:', error);
      throw error;
    } finally {
      if (success) {
        // Only mark as processed if everything succeeded
        await markStripeWebhookProcessed(event.id, event.type);
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 400 }
    );
  }
}


async function syncStripeSubscription(customerId: string, eventType: Stripe.Event['type']) {
  try {
    // Get latest subscription from Stripe
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      limit: 1,
      status: 'all',
      expand: ['data.default_payment_method'],
    });

    const subscription = subscriptions.data[0];
    
    let hours: number | undefined;
    let calendlyEnabled: boolean | undefined;

    if (eventType === 'invoice.paid' || eventType === 'checkout.session.completed') {
      const price = subscription.items.data[0].price;
      const product = await stripe.products.retrieve(
        typeof price.product === 'string' ? price.product : price.product.id
      );

      hours = product.metadata.hours 
        ? parseInt(product.metadata.hours)
        : 0;

      calendlyEnabled = product.metadata.calendly_enabled === 'true';
    }
    // Get associated user
    const userSubscription = await getUserSubscriptionByStripeCustomerId(customerId);
    if (!userSubscription) throw new Error('User not found');

    // Base update payload
    const updatePayload = {
      status: subscription?.status || 'none',
      current_period_end: new Date(subscription.current_period_end * 1000),
      current_period_start: new Date(subscription.current_period_start * 1000),
      cancel_at_period_end: subscription?.cancel_at_period_end || false,
      price_id: subscription?.items.data[0].price.id || null,
      payment_method: subscription?.default_payment_method
        ? {
            brand: (subscription.default_payment_method as Stripe.PaymentMethod).card?.brand,
            last4: (subscription.default_payment_method as Stripe.PaymentMethod).card?.last4,
          }
        : null,
      ...(hours !== undefined && { hours: hours }),
      ...(calendlyEnabled !== undefined && { calendly_enabled: calendlyEnabled })
    };

    // Upsert to Supabase
    const { data, error } = await supabaseAdmin
      .from('subscriptions')
      .upsert({
        user_id: userSubscription.user_id,
        stripe_customer_id: customerId,
        stripe_subscription_id: subscription?.id,
        ...updatePayload
      }, {
        onConflict: 'stripe_customer_id',
        ignoreDuplicates: false
      })
      .select()
      .single();

    if (error) throw error;
    return data;

  } catch (error) {
    console.error('Failed to sync Stripe data:', error);
    throw new Error('Subscription sync failed');
  }
}