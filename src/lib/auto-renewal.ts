import { Client } from '@upstash/qstash'
import { Redis } from '@upstash/redis'
import { stripe } from './stripe'
import { getUserById } from './supabase-server'
import Stripe from 'stripe'

const qstash = new Client({
  token: process.env.QSTASH_TOKEN!
})

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!
})

interface AutoRenewalRecord {
  userId: string;
  packageHours: number;
  lastRenewalDate: string;
  nextCheckDate: string;
}

export async function scheduleAutoRenewal(userId: string, packageHours: number) {
  try {
    const user = await getUserById(userId);
    if (!user) return false;

    // TODO: check that these functions work before final release

    // Don't schedule checks if hours are above threshold
    if (user.meeting_hours_remaining > 5) {
      await redis.del(`auto_renewal:${userId}`);
      return false;
    }

    // Don't schedule if already scheduled
    const existingRecord = await redis.get(`auto_renewal:${userId}`);
    if (existingRecord) return false;

    const CHECK_INTERVAL_SECONDS = 2 * 60 * 60; // 2 hours in seconds
    const nextCheckDate = new Date();
    nextCheckDate.setHours(nextCheckDate.getHours() + 2);

    // Create Redis record
    await redis.set(
      `auto_renewal:${userId}`,
      JSON.stringify({
        userId,
        packageHours,
        lastRenewalDate: new Date().toISOString(),
        nextCheckDate: nextCheckDate.toISOString()
      }),
      { ex: CHECK_INTERVAL_SECONDS }
    );

    // Schedule QStash job
    await qstash.publishJSON({
      url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/check-auto-renewal`,
      body: { userId },
      delay: CHECK_INTERVAL_SECONDS,
      retries: 3
    });

    return true;
  } catch (error) {
    console.error('Error scheduling auto-renewal:', error);
    return false;
  }
}

export async function processAutoRenewal(userId: string) {
  try {
    const user = await getUserById(userId);
    if (!user) throw new Error('User not found');

    // Check if auto-renewal is enabled and package hours are set
    if (!user.auto_renewal_enabled || !user.auto_renewal_package_hours) {
      await redis.del(`auto_renewal:${userId}`);
      return false;
    }

    // Get renewal record
    const renewalRecord = await redis.get<AutoRenewalRecord>(`auto_renewal:${userId}`);
    if (!renewalRecord) return false;

    // If hours are above 5, stop checking
    if (user.meeting_hours_remaining > 5) {
      await redis.del(`auto_renewal:${userId}`);
      return false;
    }

    // If hours are between 3 and 5, keep monitoring
    if (user.meeting_hours_remaining > 3) {
      await scheduleAutoRenewal(userId, user.auto_renewal_package_hours);
      return false;
    }

    // Hours are 3 or below, process payment
    const prices = await stripe.prices.list({
      expand: ['data.product'],
      active: true,
    });

    const price = prices.data.find(p => {
      const hours = (p.product as Stripe.Product)?.metadata?.hours 
        ? parseInt((p.product as Stripe.Product).metadata.hours) 
        : 0;
      return hours === user.auto_renewal_package_hours && 
             (p.product as Stripe.Product).active === true;
    });

    if (!price || !user.stripe_customer_id) {
      return false;
    }

    // Get customer's payment methods
    const paymentMethods = await stripe.paymentMethods.list({
      customer: user.stripe_customer_id,
      type: 'card',
    });

    if (!paymentMethods.data.length) {
      return false;
    }

    // Process payment
    try {
      await stripe.paymentIntents.create({
        amount: price.unit_amount!,
        currency: price.currency,
        customer: user.stripe_customer_id,
        payment_method: paymentMethods.data[0].id,
        payment_method_types: ['card'],
        confirm: true,
        off_session: true,
        metadata: {
          is_auto_renewal: 'true',
          hours: (price.product as Stripe.Product).metadata.hours,
          calendly_enabled: (price.product as Stripe.Product).metadata.calendly_enabled
        }
      });
      
      // Don't delete Redis record here
      // Let webhook handler manage the record after confirming hours were added
      return true;
    } catch (stripeError) {
      if (stripeError instanceof Stripe.errors.StripeError && stripeError.code === 'authentication_required') {
        console.error('Authentication required for auto-renewal payment:', stripeError.message);
      }
      throw stripeError;
    }

  } catch (error) {
    console.error('Error in processAutoRenewal:', error);
    return false;
  }
} 