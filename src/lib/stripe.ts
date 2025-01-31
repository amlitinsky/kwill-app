import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_API_SECRET_KEY!, {
  apiVersion: '2025-01-27.acacia',
});

export async function createCheckoutSession(
  priceId: string,
  customerId: string,
  returnUrl: string = `${process.env.NEXT_PUBLIC_BASE_URL}/settings`
) {
  try {
    // Get the price details to access metadata
    const price = await stripe.prices.retrieve(priceId);
    const product = await stripe.products.retrieve(price.product as string);
    
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/settings?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/settings?canceled=true`,
      metadata: {
        hours: product.metadata.hours,
        calendly_enabled: product.metadata.calendly_enabled,
        order: product.metadata.order
      },
      allow_promotion_codes: true,
    });

    return { sessionId: session.id };
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw error;
  }
}

export async function getPlans() {
  try {
    const prices = await stripe.prices.list({
      expand: ['data.product'],
      active: true,
    });

    return prices.data
      .filter(price => {
        const product = price.product as Stripe.Product;
        // Only include active paid web-based plans
        return price.active === true && 
               product.active === true &&
               product.metadata.web === 'true' &&
               price.unit_amount! > 0; // Exclude free plans
      })
      .map(price => {
        const product = price.product as Stripe.Product;
        return {
          id: price.id,
          name: product.name,
          price: price.unit_amount ? price.unit_amount / 100 : 0,
          description: product.description,
          hours: parseInt(product.metadata.hours || '0'),
          calendlyEnabled: product.metadata.calendly_enabled === 'true',
          order: parseInt(product.metadata.order || '0'),
          features: product.metadata.features ? JSON.parse(product.metadata.features) : []
        };
      })
      .sort((a, b) => a.order - b.order);
  } catch (error) {
    console.error('Error fetching plans:', error);
    throw error;
  }
}

export async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  try {
    const customerId = subscription.customer as string;
    const hours = parseInt(subscription.metadata?.hours || '0');
    const calendlyEnabled = subscription.metadata?.calendly_enabled === 'true';

    // Return the processed information
    return {
      customerId,
      hours,
      calendlyEnabled,
      status: subscription.status,
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      subscriptionId: subscription.id
    };
  } catch (error) {
    console.error('Error handling subscription update:', error);
    throw error;
  }
}

export async function createStripeCustomer(email: string) {
  const customer = await stripe.customers.create({
    email,
  });
  return customer;
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

export async function getSubscriptionHistory(customerId: string) {
  try {
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      limit: 10,
      expand: ['data.default_payment_method']
    });

    return subscriptions.data.map(sub => ({
      id: sub.id,
      status: sub.status,
      currentPeriodEnd: new Date(sub.current_period_end * 1000).toLocaleDateString(),
      amount: `$${(sub.items.data[0].price.unit_amount! / 100).toFixed(2)}`,
      interval: sub.items.data[0].price.recurring?.interval || 'month',
      hours: sub.metadata.hours || '0',
      paymentMethod: sub.default_payment_method ? {
        brand: (sub.default_payment_method as Stripe.PaymentMethod).card?.brand,
        last4: (sub.default_payment_method as Stripe.PaymentMethod).card?.last4,
      } : null
    }));
  } catch (error) {
    console.error('Error fetching subscription history:', error);
    throw error;
  }
}

export async function createCustomerPortalSession(stripeCustomerId: string) {
  const session = await stripe.billingPortal.sessions.create({
    customer: stripeCustomerId,
    return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/settings`,
  });

  return session;
}

export async function cancelSubscription(subscriptionId: string) {
  try {
    const subscription = await stripe.subscriptions.cancel(subscriptionId);
    return subscription;
  } catch (error) {
    console.error('Error canceling subscription:', error);
    throw error;
  }
}