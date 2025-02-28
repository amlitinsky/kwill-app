import Stripe from 'stripe';
import { env } from "@/env";

function getBaseUrl() {
  if (typeof window !== "undefined") return window.location.origin;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return `http://localhost:${process.env.PORT ?? 3000}`;
}

export const stripe = new Stripe(env.STRIPE_API_SECRET_KEY, {
  apiVersion: '2025-01-27.acacia',
});

export async function createCheckoutSession(
  priceId: string,
  customerId: string,
  returnUrl: string,
) {
  try {
    // Handle development plans
    if (process.env.NODE_ENV === 'development' && priceId.startsWith('price_dev_')) {
      console.log('Using mock checkout session for development plan:', priceId);
      return { sessionId: 'cs_dev_' + Math.random().toString(36).substring(2, 15) };
    }
    
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
      success_url: `${getBaseUrl()}${returnUrl}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${getBaseUrl()}${returnUrl}?canceled=true`,
      metadata: {
        hours: product.metadata.hours,
        order: product.metadata.order
      },
      allow_promotion_codes: true,
    } as Stripe.Checkout.SessionCreateParams);

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

    // Filter and map prices to plans
    const stripePlans = prices.data
      .filter(price => {
        const product = price.product as Stripe.Product;
        return price.active === true && 
               product.active === true &&
               price.unit_amount! > 0 &&
               price.id === product.default_price;
      })
      .map(price => {
        const product = price.product as Stripe.Product;
        const features = product.metadata.features 
          ? JSON.parse(product.metadata.features) as string[]
          : [];
          
        return {
          id: price.id,
          name: product.name,
          price: price.unit_amount ? price.unit_amount / 100 : 0,
          description: product.description,
          hours: parseInt(product.metadata.hours ?? '0'),
          order: parseInt(product.metadata.order ?? '0'),
          features
        };
      })
      .sort((a, b) => a.order - b.order);

    return stripePlans;
  } catch (error) {
    console.error('Error fetching plans:', error);
    throw error;
  }
}

export async function createStripeCustomer(email: string) {
  const customer = await stripe.customers.create({
    email,
  });
  return customer;
}

export async function createCustomerPortalSession(stripeCustomerId: string, returnUrl: string) {
  const session = await stripe.billingPortal.sessions.create({
    customer: stripeCustomerId,
    return_url: `${getBaseUrl()}${returnUrl}`,
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

export async function getCustomerSubscription(customerId: string) {
  const stripeSubscriptions = await stripe.subscriptions.list({
    customer: customerId,
    limit: 1,
    status: 'all',
    expand: ['data.default_payment_method'],
  });

  const subscription = stripeSubscriptions.data[0];
  if (!subscription) {
    throw new Error("No subscription found for customer");
  }

  const defaultPaymentMethod = subscription.default_payment_method as Stripe.PaymentMethod | null;
  const firstItem = subscription.items.data[0];
  if (!firstItem) {
    throw new Error("No subscription item found");
  }

  let hours: number | undefined;

  if (firstItem.price) {
    const product = await stripe.products.retrieve(
      typeof firstItem.price.product === 'string' ? firstItem.price.product : firstItem.price.product.id
    );
    hours = product.metadata.hours ? parseInt(product.metadata.hours) : 0;
  }

  return {
    subscription,
    defaultPaymentMethod,
    firstItem,
    hours
  };
} 