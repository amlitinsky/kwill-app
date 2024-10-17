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

export async function createCheckoutSession(priceId: string) {
    const prices = await stripe.prices.list();
    console.log("all prices", prices)
    const price = prices.data.find(p => p.id === priceId);
    console.log("we found the proper price: ", price)
    const planName = price?.nickname || 'unknown';
    console.log("the plan name", planName)

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/private/settings?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/private/settings`,
      metadata: {
        planName: planName 
      }
    });

    return session
}