import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { handleFailedPayment, handlePaidInvoice, handleSubscriptionDeleted, handleSubscriptionUpdate } from '@/lib/supabase-server';
import Stripe from 'stripe';

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature') as string;

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: unknown) {
    if (err instanceof Error) {
      return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
    }
    return NextResponse.json({ error: 'Unknown Webhook Error' }, { status: 400 });
  }

  switch (event.type) {
    case 'invoice.payment_failed':
      const invoice = event.data.object as Stripe.Invoice;
      await handleFailedPayment(invoice);
      break;
    case 'invoice.payment_succeeded':
      const paidInvoice = event.data.object as Stripe.Invoice;
      await handlePaidInvoice(paidInvoice)
   case 'customer.subscription.updated':
     const updatedSubscription = event.data.object as Stripe.Subscription;
     await handleSubscriptionUpdate(updatedSubscription);
     break;
  case 'customer.subscription.deleted':
    const deletedSubscription = event.data.object as Stripe.Subscription;
    await handleSubscriptionDeleted(deletedSubscription);
    break;
  }

  return NextResponse.json({ received: true });
}
