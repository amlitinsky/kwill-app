import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { ENTERPRISE_PLAN, FREE_PLAN } from '@/constants/plan';
import Stripe from 'stripe';

export async function GET() {
  try {
    const prices = await stripe.prices.list({
      active: true,
      expand: ['data.product']
    });

    const stripePlans = prices.data.map(price => {
      const product = price.product as Stripe.Product;
      return {
        id: price.id,
        name: price.nickname,
        price: price.unit_amount! / 100,
        interval: price.recurring?.interval,
        features: product.metadata.features ? JSON.parse(product.metadata.features) : [],
        order: parseInt(product.metadata.order || '9999') // Use a high default value for items without order
      };
    });

    // Sort the plans based on the order field
    stripePlans.sort((a, b) => a.order - b.order);

    const plans = [FREE_PLAN, ...stripePlans, ENTERPRISE_PLAN];

    return NextResponse.json({ plans });
  } catch (error) {
    console.error('Error fetching plans:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}