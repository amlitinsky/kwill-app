import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { kv } from '@vercel/kv';
import { createCaller } from '@/server/api/root';
import { createTRPCContext } from '@/server/api/trpc';

// Helper function to mark webhook as processed
async function markWebhookProcessed(webhookId: string, eventType: string): Promise<void> {
  const key = `stripe:webhook:${webhookId}`;
  await kv.set(key, {
    status: 'completed',
    eventType,
    processedAt: new Date().toISOString()
  }, { 
    ex: 24 * 60 * 60 // 24 hour expiry
  });
}

// Helper function to check if webhook was already processed
async function isWebhookProcessed(webhookId: string): Promise<boolean> {
  const key = `stripe:webhook:${webhookId}`;
  const record = await kv.get(key);
  return record !== null;
}

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

    // Check for duplicate webhook
    if (await isWebhookProcessed(event.id)) {
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
          
          // Create TRPC context and caller
          const ctx = await createTRPCContext({
            headers: req.headers,
          });
          const caller = createCaller(ctx);

          // Call the TRPC method
          await caller.subscription.syncSubscriptionData({
            customerId,
            eventType: event.type,
          });
          break;

        default:
          console.log(`Unhandled event type: ${event.type}`);
          break;
      }

      success = true;
    } catch (error) {
      console.error('Error processing webhook:', error);
      throw error;
    } finally {
      if (success) {
        // Only mark as processed if everything succeeded
        await markWebhookProcessed(event.id, event.type);
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
