import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_API_SECRET_KEY!, {
  apiVersion: '2024-09-30.acacia',
});

export async function createCheckoutSession(
  priceId: string,
  customerId: string,
  mode: 'payment' | 'setup',
  returnUrl: string = `${process.env.NEXT_PUBLIC_BASE_URL}/private/settings`
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
      mode: mode,
      success_url: `${returnUrl}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${returnUrl}?canceled=true`,
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
        // Double-check both price and product active status
        return price.active === true && product.active === true;
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
          order: parseInt(product.metadata.order || '0')
        };
      })
      .sort((a, b) => a.order - b.order);
  } catch (error) {
    console.error('Error fetching plans:', error);
    throw error;
  }
}

export async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  try {
    const customerId = session.customer as string;
    const hours = parseInt(session.metadata?.hours || '0');
    const calendlyEnabled = session.metadata?.calendly_enabled === 'true';

    // Return the processed information
    return {
      customerId,
      hours,
      calendlyEnabled
    };
  } catch (error) {
    console.error('Error handling checkout completion:', error);
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

export async function getPaymentHistory(customerId: string) {
  try {
    const paymentIntents = await stripe.paymentIntents.list({
      customer: customerId,
      limit: 10,
    });

    return paymentIntents.data.map(pi => ({
      id: pi.id,
      date: new Date(pi.created * 1000).toLocaleDateString(),
      total: `$${(pi.amount / 100).toFixed(2)}`,
      status: pi.status,
      hours: pi.metadata.hours || '0',
    }));
  } catch (error) {
    console.error('Error fetching payment history:', error);
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