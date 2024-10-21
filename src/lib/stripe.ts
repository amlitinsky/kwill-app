import Stripe from 'stripe';

// should I use the api version or nah
export const stripe = new Stripe(process.env.STRIPE_API_SECRET_TEST_KEY!, {
  apiVersion: '2024-09-30.acacia', // Use the latest API version
});

export async function createStripeCustomer(email: string) {
  const customer = await stripe.customers.create({
    email,
  });
  return customer;
}

export async function createSubscription(customerId: string, priceId: string) {
  const subscription = await stripe.subscriptions.create({
    customer: customerId,
    items: [{ price: priceId }],
    payment_behavior: 'default_incomplete',
    expand: ['latest_invoice.payment_intent'],
  });
  return subscription;
}

export async function cancelSubscription(subscriptionId: string) {
  const canceledSubscription = await stripe.subscriptions.cancel(subscriptionId);
  return canceledSubscription;
}

export async function updateSubscription(subscriptionId: string, newPriceId: string) {
  const updatedSubscription = await stripe.subscriptions.retrieve(subscriptionId);
  await stripe.subscriptions.update(subscriptionId, {
    items: [
      {
        id: updatedSubscription.items.data[0].id,
        price: newPriceId,
      },
    ],
  });
  return updatedSubscription;
}

export async function createCheckoutSession(priceId: string, subscriptionId: string, existingCustomerId: string) {
    const prices = await stripe.prices.list();
    const price = prices.data.find(p => p.id === priceId);
    const planName = price?.nickname || 'unknown';

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      customer: existingCustomerId,
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/private/settings?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/private/settings`,
      metadata: {
        planName: planName,
        previous_subscription_id: subscriptionId
      }
    });

    return session
}

export async function retrieveSubscription(subscriptionId: string) {
  try {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
      expand: ['customer', 'default_payment_method', 'items.data.price.product']
    });
    return subscription;
  } catch (error) {
    console.error('Error retrieving subscription:', error);
    throw error;
  }
}

export async function listStripeCustomer(email: string): Promise<string | null> {
  try {
    const { data } = await stripe.customers.list({ email, limit: 1 });
    return data[0]?.id || null;
  } catch (error) {
    console.error('Error listing Stripe customer:', error);
    throw error;
  }
}

export async function getCustomerInvoices(customerId: string) {
  try {
    const invoices = await stripe.invoices.list({
      customer: customerId,
      limit: 10, // Adjust as needed
      status: 'paid', // Only fetch paid invoices
    });

    return invoices.data.map(invoice => ({
      id: invoice.id,
      date: new Date(invoice.created * 1000).toLocaleDateString(),
      total: `$${(invoice.total / 100).toFixed(2)}`,
      status: invoice.status,
      pdfUrl: invoice.invoice_pdf,
    }));
  } catch (error) {
    console.error('Error fetching customer invoices:', error);
    throw error;
  }
}

export async function createCustomerPortalSession(stripeCustomerId: string) {

    const session = await stripe.billingPortal.sessions.create({
      customer: stripeCustomerId,
      return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/private/settings`,
    });

    return session
}