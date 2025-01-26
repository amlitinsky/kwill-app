import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { 
  getUserByStripeCustomerId,
  supabaseAdmin,
} from '@/lib/supabase-server';
import Stripe from 'stripe';
import { isStripeWebhookProcessed, markStripeWebhookProcessed } from '@/lib/redis';

export async function POST(req: Request) {
  const payload = await req.text();
  const sig = req.headers.get('stripe-signature');
  console.log("received a stripe webhook event")
  
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
      console.log(`Duplicate Stripe webhook event: ${event.id}`);
      return NextResponse.json({ received: true });
    }

    let success = false;
    try {
      // Handle different webhook events
      switch (event.type) {
        case 'invoice.paid':
          await handleInvoicePaid(event.data.object as Stripe.Invoice);
          break;

        case 'invoice.payment_failed':
          await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
          break;

        case 'customer.subscription.deleted':
          await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
          break;

        // Add more cases as needed
        default:
          console.log(`Unhandled event type: ${event.type}`);
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

// Helper function to handle invoice payment success
async function handleInvoicePaid(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string;
  
  // Get the subscription to access metadata
  const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string);
  const hours = parseInt(subscription.metadata?.hours || '0');
  const calendlyEnabled = subscription.metadata?.calendly_enabled === 'true';
  
  const user = await getUserByStripeCustomerId(customerId);
  if (!user) {
    throw new Error(`No user found for Stripe customer: ${customerId}`);
  }

  // Update subscription info in Supabase
  await supabaseAdmin
    .from('subscriptions')
    .upsert({
      user_id: user.id,
      stripe_customer_id: customerId,
      stripe_subscription_id: subscription.id,
      status: subscription.status,
      current_period_start: new Date(subscription.current_period_start * 1000),
      current_period_end: new Date(subscription.current_period_end * 1000),
      hours: hours,
      calendly_enabled: calendlyEnabled
    });
}

// Helper function to handle invoice payment failure
async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string;
  
  const user = await getUserByStripeCustomerId(customerId);
  if (!user) {
    throw new Error(`No user found for Stripe customer: ${customerId}`);
  }

  // Update subscription status to past_due
  await supabaseAdmin
    .from('subscriptions')
    .update({ 
      status: 'past_due',
    })
    .eq('user_id', user.id);
}

// Helper function to handle subscription deletion
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;
  
  const user = await getUserByStripeCustomerId(customerId);
  if (!user) {
    throw new Error(`No user found for Stripe customer: ${customerId}`);
  }

  // Update subscription status to canceled
  await supabaseAdmin
    .from('subscriptions')
    .update({ 
      status: 'canceled',
      current_period_end: new Date(subscription.current_period_end * 1000)
    })
    .eq('user_id', user.id);
}
