import { NextResponse } from 'next/server';
import { stripe, handleCheckoutCompleted } from '@/lib/stripe';
import { 
  updateUserMeetingHours,
  getUserByStripeCustomerId,
  supabaseAdmin,
  getUserById
} from '@/lib/supabase-server';
import { qstash } from '@/lib/qstash';
import Stripe from 'stripe';
import { isStripeWebhookProcessed, markStripeWebhookProcessed } from '@/lib/redis';
import { scheduleAutoRenewal } from '@/lib/auto-renewal';

import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!
})

async function handleCalendlyScheduling(userId: string, calendlyEnabled: boolean) {
  try {
    if (!calendlyEnabled) return;

    // Set new expiry date
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 30);
    console.log('Setting new expiry date for Calendly:', expiryDate);

    // Update user's Calendly access
    await supabaseAdmin
      .from('users')
      .update({ 
        calendly_enabled: true,
        calendly_access_until: expiryDate.toISOString() 
      })
      .eq('id', userId);

    // Schedule new expiry check
    // TODO: Change this to the actual URL and fix the delay
    await qstash.publishJSON({
      url: `${process.env.NEXT_BASE_NGROK_URL}/api/disable-calendly`,
      body: { userId },
      notBefore: Math.floor(expiryDate.getTime() / 1000),
      // delay: 15,
      deduplicationId: `calendly-expiry-${userId}`
    });
    console.log("Successful qstash publish?")
  } catch (error) {
    console.error('Error managing Calendly scheduling:', error);
    throw error; // Re-throw to be caught by main error handler
  }
}

export async function POST(req: Request) {
  const payload = await req.text();
  const sig = req.headers.get('stripe-signature');
  console.log("reeived a stripe webhook event")
  
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
      if (event.type === 'checkout.session.completed') {
        const session = event.data.object as Stripe.Checkout.Session;

        // Ensure we have a customer ID
        if (!session.customer) {
          throw new Error('No customer ID found in session');
        }

        // No need to do anything for setup mode
        if (session.mode === 'setup') {
          success = true;
          return NextResponse.json({ received: true });
        }

        // Process hours and Calendly for payment mode
        const { customerId, hours, calendlyEnabled } = await handleCheckoutCompleted(session);
        
        const user = await getUserByStripeCustomerId(customerId);
        if (!user) {
          throw new Error(`No user found for Stripe customer: ${customerId}`);
        }

        await updateUserMeetingHours(user.id, hours);

        if (calendlyEnabled) {
          await handleCalendlyScheduling(user.id, calendlyEnabled);
        }

      } else if (event.type === 'payment_intent.succeeded') {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const customerId = paymentIntent.customer as string;
        
        const user = await getUserByStripeCustomerId(customerId);
        if (!user) {
          throw new Error(`No user found for Stripe customer: ${customerId}`);
        }

        if (user.auto_renewal_enabled && paymentIntent.metadata?.hours) {
          const hours = parseInt(paymentIntent.metadata.hours || '0');
          const calendlyEnabled = paymentIntent.metadata.calendly_enabled === 'true';
          
          // First update the hours
          await updateUserMeetingHours(user.id, hours);
          
          // Get updated user to check new hours total
          const updatedUser = await getUserById(user.id);
          if (updatedUser) {
            if (updatedUser.meeting_hours_remaining > 5) {
              // Hours are now sufficient, stop checking
              await redis.del(`auto_renewal:${user.id}`);
            } else {
              // Hours are still low, schedule next check
              await scheduleAutoRenewal(user.id, updatedUser.auto_renewal_package_hours);
            }
          }
          
          if (calendlyEnabled) {
            await handleCalendlyScheduling(user.id, calendlyEnabled);
          }
        }

      } else if (event.type === 'payment_intent.payment_failed') {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const customerId = paymentIntent.customer as string;
        
        const user = await getUserByStripeCustomerId(customerId);
        if (user) {
          // Disable auto-renewal on payment failure
          await supabaseAdmin
            .from('users')
            .update({ auto_renewal_enabled: false })
            .eq('id', user.id);
            
          console.error('Auto-renewal payment failed for user:', user.id);
        }
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
