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
        case 'checkout.session.completed':
          await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
          break;
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
  const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string);
  
  await upsertSubscription({
    customerId: invoice.customer as string,
    subscriptionId: subscription.id,
    status: subscription.status,
    periodStart: new Date(subscription.current_period_start * 1000),
    periodEnd: new Date(subscription.current_period_end * 1000),
    hours: parseInt(subscription.metadata.hours || '0'),
    calendlyEnabled: subscription.metadata.calendly_enabled === 'true'
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
async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  const subscription = await stripe.subscriptions.retrieve(session.subscription as string)
  
  await upsertSubscription({
    customerId: session.customer as string,
    subscriptionId: subscription.id,
    status: subscription.status,
    periodStart: new Date(subscription.current_period_start * 1000),
    periodEnd: new Date(subscription.current_period_end * 1000),
    hours: parseInt(subscription.metadata.hours || '0'),
    calendlyEnabled: subscription.metadata.calendly_enabled === 'true'
  })
}

async function upsertSubscription({
  customerId,
  subscriptionId,
  status,
  periodStart,
  periodEnd,
  hours,
  calendlyEnabled
}: {
  customerId: string
  subscriptionId: string
  status: string
  periodStart: Date
  periodEnd: Date
  hours: number
  calendlyEnabled: boolean
}) {
  const { error } = await supabaseAdmin
    .from('subscriptions')
    .upsert(
      {
        stripe_customer_id: customerId,
        stripe_subscription_id: subscriptionId,
        status,
        current_period_start: periodStart,
        current_period_end: periodEnd,
        hours,
        calendly_enabled: calendlyEnabled,
        last_reset: new Date() // Only set on initial creation
      },
      {
        onConflict: 'stripe_subscription_id',
        ignoreDuplicates: false
      }
    )
    .select()

  if (error) throw error
}