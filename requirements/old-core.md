# Old Core Files


@/webook/recall/route.ts
```typescript

import { NextResponse } from 'next/server'
import { Webhook } from 'svix'
import { calculateMeetingDuration, retrieveBotTranscript } from '@/lib/recall'
import { getMeetingDetails, getValidGoogleToken, updateMeetingMetrics,updateMeetingAIInsights, updateMeetingProcessedData, updateMeetingStatus, updateMeetingTranscript, supabaseAdmin } from '@/lib/supabase-server'
import { analyzeTranscript, generateMeetingSummary, extractKeyPoints, extractActionItems, generateTimeStampedHighlights, analyzeTopicDistribution, calculateSuccessRate } from '@/lib/ai'
import { mapHeadersAndAppendData } from '@/lib/google'
import { ProcessedTranscriptSegment, processRawTranscript } from '@/lib/transcript-utils'
import { 
  acquireLock, 
  releaseLock, 
  getProcessRecord, 
  setProcessRecord 
} from '@/lib/redis'


const secret = process.env.RECALL_WEBHOOK_SECRET!

interface RecallWebhookPayload {
  event: BotStatusEvent;
  data: {
    data: {
      code: string;
      sub_code: string | null;
      updated_at: string;
      words: {
        text: string;
        start_timestamp: { relative: number };
        end_timestamp: { relative: number } | null;
      }[];
      participant: {
        id: number | null;
        name: string | null;
      };
    };
    bot: {
      id: string;
      metadata: Record<string, unknown>;
    };
  };
}
// TODO add transcript.data, transcript.done
// to fetch transcript done via async we call retrieveBotTranscript or retrieveTranscript endpoint from recall

type BotStatusEvent = 
  | 'bot.joining'
  | 'bot.in_waiting_room'
  | 'bot.in_call_not_recording'
  | 'bot.recording_permission_allowed'
  | 'bot.recording_permission_denied'
  | 'bot.in_call_recording'
  | 'bot.call_ended'
  | 'bot.done'
  | 'bot.fatal';

export async function POST(req: Request) {
  const payload = await req.text()
  const headers = Object.fromEntries(req.headers)

  const wh = new Webhook(secret)
  let evt: RecallWebhookPayload 
  try {
    evt = wh.verify(payload, headers) as RecallWebhookPayload
  } catch (error) {
    console.error('Webhook verification failed', error)
    return NextResponse.json({}, { status: 400 })
  }

  // Early environment check
  const botEnvironment = evt.data.bot.metadata?.environment as string | undefined
  const currentEnvironment = process.env.NODE_ENV // 'development' | 'production' | 'test'

  if (botEnvironment && botEnvironment !== currentEnvironment) {
    return NextResponse.json({ 
      skipped: true, 
      reason: 'environment_mismatch' 
    }, { status: 200 }) // Still return 200 to acknowledge receipt
  }

  const { event, data } = evt
  const botId = data.bot.id

  // Handle each bot status event
  switch (event) {
    case 'bot.joining':
      break

    case 'bot.in_waiting_room':
      break

    case 'bot.in_call_not_recording':
      break

    case 'bot.recording_permission_allowed':
      break

    case 'bot.recording_permission_denied':
      break

    case 'bot.in_call_recording':
      await updateMeetingStatus(botId, 'in-progress')
      break

    case 'bot.call_ended':
      break
    
    case 'bot.done':
      // TODO if we ever want to include async transcription, we start async job here
      try {
        // Check if already processed
        const processRecord = await getProcessRecord(botId)
        if (processRecord) {
          return NextResponse.json({ received: true })
        }

        // Try to acquire lock
        const locked = await acquireLock(botId)
        if (!locked) {
          return NextResponse.json({ received: true })
        }

        try {
          // Mark as processing
          await setProcessRecord(botId, {
            status: 'processing',
            startedAt: new Date().toISOString(),
            eventTimestamp: data.data.updated_at
          })
          await updateMeetingStatus(botId, 'processing')
          // Process the completed meeting
          await processCompletedMeeting(botId)

          await updateMeetingStatus(botId, 'completed')

          // Mark as completed
          await setProcessRecord(botId, {
            status: 'completed',
            completedAt: new Date().toISOString(),
            eventTimestamp: data.data.updated_at
          })
        } finally {
          // Always release the lock
          await releaseLock(botId)
          // TODO we can also delete the bot's data if required from recall
        }
      } catch (error) {
        console.error(`Error processing webhook: Bot ${botId}`, error)
        return NextResponse.json(
          { error: 'Failed to process webhook' }, 
          { status: 500 }
        )
      }
      break

    case 'bot.fatal':
      await updateMeetingStatus(botId, 'failed')
      break
  }

  return NextResponse.json({ received: true })
}

// Helper functions for transcript analysis
function calculateSpeakerParticipation(transcript: ProcessedTranscriptSegment[]): Record<string, number> {
  const speakerDurations: Record<string, number> = {};
  let totalDuration = 0;

  transcript.forEach(segment => {
    const duration = segment.end_time - segment.start_time;
    speakerDurations[segment.speaker] = (speakerDurations[segment.speaker] || 0) + duration;
    totalDuration += duration;
  });

  // Convert to percentages
  Object.keys(speakerDurations).forEach(speaker => {
    speakerDurations[speaker] = (speakerDurations[speaker] / totalDuration) * 100;
  });

  return speakerDurations;
}
// Separate function for the analysis pipeline
async function processCompletedMeeting(botId: string) {
  try {
          const meetingDetails = await getMeetingDetails(botId)
          const processStart = Date.now()
          const durationInMinutes = await calculateMeetingDuration(botId)

          if (!meetingDetails) {
            throw new Error('Failed to retrieve meeting details')
          }

          // retrieving and processing the transcript
          const raw_transcript = await retrieveBotTranscript(botId)
          const transcript: ProcessedTranscriptSegment[] = processRawTranscript(raw_transcript)
          await updateMeetingTranscript(botId, transcript)
          
          // call deepseek API (with the transcript)
          const processed_data = await analyzeTranscript(
            transcript, 
            meetingDetails.column_headers, 
            meetingDetails.prompt
          )

          // update supabase with processed data
          await updateMeetingProcessedData(botId, processed_data)

          // get valid access_token
          const access_token = await getValidGoogleToken(meetingDetails.user_id)

          // append to google sheets
          // TODO eventually we will have to adapt to different sheet names with different headers or maybe exporting to different sheets at once
          await mapHeadersAndAppendData(
            meetingDetails.spreadsheet_id, 
            "", 
            processed_data, 
            access_token,
            meetingDetails.spreadsheet_row_number,
            false 
          )

          // Calculate success rate after processing data
          const success_rate = await calculateSuccessRate(processed_data, meetingDetails.column_headers)

          // Calculate meeting metrics
          const metrics = {
            duration: durationInMinutes,
            fields_analyzed: meetingDetails.column_headers.length,
            success_rate: success_rate,
            processing_duration: Date.now() - processStart,
            speaker_participation: calculateSpeakerParticipation(transcript),
            topic_distribution: await analyzeTopicDistribution(transcript)
          }
          await updateMeetingMetrics(botId, metrics)

          // Generate AI insights
          const aiInsights = {
            summary: await generateMeetingSummary(transcript),
            key_points: await extractKeyPoints(transcript),
            action_items: await extractActionItems(transcript),
            highlights: await generateTimeStampedHighlights(transcript)
          }
          await updateMeetingAIInsights(botId, aiInsights)



          const { error: deductionError } = await supabaseAdmin
            .rpc('deduct_hours_atomic', {
              user_id: meetingDetails.user_id,
              duration_minutes: durationInMinutes
            })
            .single();

          if (deductionError) {
            console.error('Hour deduction failed:', {
              userId: meetingDetails.user_id,
              duration: durationInMinutes,
              error: deductionError
            });
            throw new Error('Could not deduct hours - insufficient balance or expired subscription');
          }



  } catch (error) {
    console.error(`Error processing completed meeting: Bot ${botId}`, error)
    return NextResponse.json(
      { error: 'Failed to process completed meeting' }, 
      { status: 500 }
    )
  }
}
```

@/webook/calendly/route.ts
```typescript

import { NextResponse } from 'next/server';
import { cancelCalendlyMeeting, createMeeting, getCalendlyTemplateByUri, getCalendlyUser, getMeetingByEventUri, supabaseAdmin } from '@/lib/supabase-server';
import crypto from 'crypto';
import { createBot, deleteBot } from '@/lib/recall';

const WEBHOOK_SECRET = process.env.CALENDLY_WEBHOOK_SECRET!;

function verifyWebhookSignature(payload: string, signature: string): boolean {
  if (!WEBHOOK_SECRET) {
    throw new Error('Calendly webhook secret not configured');
  }
  try {
    const sigComponents = signature.split(',').reduce((acc: { timestamp: string, signature: string }, curr) => {
      const [key, value] = curr.split('=');
      if (key === 't') acc.timestamp = value;
      if (key === 'v1') acc.signature = value;
      return acc;
    }, { timestamp: '', signature: '' });

    if (!sigComponents.timestamp || !sigComponents.signature) {
      return false;
    }

    const signedPayload = `${sigComponents.timestamp}.${payload}`;
    const computedSignature = crypto
      .createHmac('sha256', WEBHOOK_SECRET)
      .update(signedPayload)
      .digest('hex');

    return crypto.timingSafeEqual(
      Buffer.from(sigComponents.signature),
      Buffer.from(computedSignature)
    );
  } catch (error) {
    console.error('Webhook signature verification failed', error)
    return false;
  }
}

export async function POST(request: Request) {
  const signature = request.headers.get('Calendly-Webhook-Signature');

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature header' }, { status: 401 });
  }

  const rawPayload = await request.text();

  try {
    const isValid = verifyWebhookSignature(rawPayload, signature);
    
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const payload = JSON.parse(rawPayload);

    switch (payload.event) {
      case 'invitee.created': {
        const eventData = payload.payload;
        const locationData = eventData.scheduled_event.location;

        if (!locationData?.join_url) {
          return NextResponse.json({ 
            message: 'Meeting skipped - no Zoom URL provided',
            success: true 
          });
        }

        const data = await getCalendlyUser(eventData.invitee_scheduled_by)
        const userId = data?.user_id

        if (!userId) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }        // Check if user has active Calendly access

        const user = await supabaseAdmin
          .from('subscriptions')
          .select('calendly_enabled, hours')
          .eq('id', userId)
          .single();

        if (!user?.data?.calendly_enabled || !user?.data?.hours) {
            return NextResponse.json({ 
              error: 'Calendly access is disabled or expired' 
            }, { status: 403 });
        }

        const eventUri = eventData.scheduled_event.uri;
        const eventTypeUri = eventData.scheduled_event.event_type
        const startTime = eventData.scheduled_event.start_time;
        const name = `${eventData.scheduled_event.name} - ${new Date(startTime).toLocaleString()}`

        const template = await getCalendlyTemplateByUri(eventTypeUri);
        if (!template || !template.active || !template.spreadsheet_id) {
          return NextResponse.json({ message: 'Event type not configured or inactive' });
        }

        const joinTime = new Date(new Date(startTime).getTime() - 30000);
        const automaticLeave = Math.floor(user.data.hours * 3600)
        const scheduledBot = await createBot(locationData.join_url, {
          join_at: joinTime.toISOString(),
          automatic_leave: automaticLeave
        });

        await createMeeting(
          userId,
          name,
          locationData.join_url,
          template.spreadsheet_id,
          template.prompt,
          scheduledBot.id,
          {
            useAdmin: true,
            status: "Scheduled",
            eventUri: eventUri
          }
        );
        break;
      }

      case 'invitee.canceled': {
        const eventData = payload.payload;
        const eventUri = eventData.scheduled_event.uri;
        const meeting = await getMeetingByEventUri(eventUri);
        
        if (meeting?.bot_id) {
          await deleteBot(meeting.bot_id);
        }
        await cancelCalendlyMeeting(eventUri);
        break;
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ 
      error: 'Internal Server Error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
```

@/webook/stripe/route.ts
```typescript

import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { 
  getUserSubscriptionByStripeCustomerId,
  supabaseAdmin,
} from '@/lib/supabase-server';
import Stripe from 'stripe';
import { isStripeWebhookProcessed, markStripeWebhookProcessed } from '@/lib/redis';

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

    // Atomic check for duplicate webhook
    if (await isStripeWebhookProcessed(event.id)) {
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
          await syncStripeSubscription(customerId, event.type);
          break;

        // Add more cases as needed
        default:
          break;
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


async function syncStripeSubscription(customerId: string, eventType: Stripe.Event['type']) {
  try {
    // Get latest subscription from Stripe
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      limit: 1,
      status: 'all',
      expand: ['data.default_payment_method'],
    });

    const subscription = subscriptions.data[0];
    
    let hours: number | undefined;
    let calendlyEnabled: boolean | undefined;

    if (eventType === 'invoice.paid' || eventType === 'checkout.session.completed') {
      const price = subscription.items.data[0].price;
      const product = await stripe.products.retrieve(
        typeof price.product === 'string' ? price.product : price.product.id
      );

      hours = product.metadata.hours 
        ? parseInt(product.metadata.hours)
        : 0;

      calendlyEnabled = product.metadata.calendly_enabled === 'true';
    }
    // Get associated user
    const userSubscription = await getUserSubscriptionByStripeCustomerId(customerId);
    if (!userSubscription) throw new Error('User not found');

    // Base update payload
    const updatePayload = {
      status: subscription?.status || 'none',
      current_period_end: new Date(subscription.current_period_end * 1000),
      current_period_start: new Date(subscription.current_period_start * 1000),
      cancel_at_period_end: subscription?.cancel_at_period_end || false,
      price_id: subscription?.items.data[0].price.id || null,
      payment_method: subscription?.default_payment_method
        ? {
            brand: (subscription.default_payment_method as Stripe.PaymentMethod).card?.brand,
            last4: (subscription.default_payment_method as Stripe.PaymentMethod).card?.last4,
          }
        : null,
      ...(hours !== undefined && { hours: hours }),
      ...(calendlyEnabled !== undefined && { calendly_enabled: calendlyEnabled })
    };

    // Upsert to Supabase
    const { data, error } = await supabaseAdmin
      .from('subscriptions')
      .upsert({
        user_id: userSubscription.user_id,
        stripe_customer_id: customerId,
        stripe_subscription_id: subscription?.id,
        ...updatePayload
      }, {
        onConflict: 'stripe_customer_id',
        ignoreDuplicates: false
      })
      .select()
      .single();

    if (error) throw error;
    return data;

  } catch (error) {
    console.error('Failed to sync Stripe data:', error);
    throw new Error('Subscription sync failed');
  }
}
```

@/lib/calendly.ts
```typescript

interface CalendlyTokens {
  access_token: string;
  refresh_token: string;
  expiry_date: number
  created_at: number;
}

interface CalendlyUserInfo {
  uri: string;
  email: string;
  name: string;
  scheduling_url: string;
  timezone: string;
  current_organization: string;
}

// Generate the Calendly OAuth URL for user authorization
export function getCalendlyAuthUrl(source?: string) {
  const clientId = process.env.NEXT_PUBLIC_CALENDLY_API_CLIENT_ID;
  const redirectUri = `${process.env.NEXT_PUBLIC_BASE_URL}/api/callback/calendly`;
  
  const params = new URLSearchParams({
    client_id: clientId!,
    response_type: 'code',
    redirect_uri: redirectUri,
    ...(source && { state: source })
  });

  return `https://auth.calendly.com/oauth/authorize?${params.toString()}`;
}

// Exchange authorization code for tokens
export async function getCalendlyTokens(code: string): Promise<CalendlyTokens> {
  const response = await fetch('https://auth.calendly.com/oauth/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      client_id: process.env.NEXT_PUBLIC_CALENDLY_API_CLIENT_ID!,
      client_secret: process.env.CALENDLY_API_CLIENT_SECRET!,
      redirect_uri: `${process.env.NEXT_PUBLIC_BASE_URL}/api/callback/calendly`
    })
  });

  if (!response.ok) {
    throw new Error('Failed to get Calendly tokens');
  }

  const tokens = await response.json();
  return {
    ...tokens,
    expiry_date: Date.now() + (tokens.expires_in * 1000) // Convert seconds to milliseconds

  };
}

// Refresh access token using refresh token
// TODO  have to test this and confirm with docs
export async function refreshCalendlyToken(refreshToken: string): Promise<CalendlyTokens> {
  const response = await fetch('https://auth.calendly.com/oauth/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: process.env.NEXT_PUBLIC_CALENDLY_API_CLIENT_ID!,
      client_secret: process.env.CALENDLY_API_CLIENT_SECRET!
    })
  });

  if (!response.ok) {
    throw new Error('Failed to refresh Calendly token');
  }

  const tokens = await response.json();
  return {
    ...tokens,
    expiry_date: Date.now() + (tokens.expires_in * 1000)
  };
}

// Check if token is valid
export async function checkCalendlyTokenValidity(accessToken: string): Promise<boolean> {
  try {
    const response = await fetch('https://api.calendly.com/users/me', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    return response.ok;
  } catch (error) {
    console.error('Error checking token validity:', error);
    return false;
  }
}

// Get Calendly user information
export async function getCalendlyUserInfo(accessToken: string): Promise<CalendlyUserInfo> {
  const response = await fetch('https://api.calendly.com/users/me', {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });

  if (!response.ok) {
    throw new Error('Failed to fetch Calendly user info');
  }

  const data = await response.json();
  return data.resource;
}

// Get user's event types
export async function getCalendlyEventTypes(accessToken: string, userUri: string) {
  const response = await fetch(`https://api.calendly.com/event_types?user=${userUri}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    }
  });

  const data = await response.json();
  if (!response.ok) {
    throw data;
  }

  return data.collection;
}

export async function subscribeToCalendlyWebhooks(accessToken: string, userUri: string, organization: string) {
  const response = await fetch('https://api.calendly.com/webhook_subscriptions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      url: `${process.env.NEXT_PUBLIC_NGROK_URL}/api/webhook/calendly`,
      events: ['invitee.created', 'invitee.canceled'],
      user: userUri,
      organization: organization,
      scope: 'user',
      signing_key: process.env.CALENDLY_WEBHOOK_SECRET
    })
  });

  const result = await response.json();
  return result;
}

export async function getEventTypeDetails(accessToken: string, eventTypeUri: string) {
    const response = await fetch(`${eventTypeUri}`, {
    method: 'GET',
    headers: {
        'Authorization': `Bearer ${accessToken}`
    }
    });

    if (!response.ok) {
    throw new Error('Failed to fetch event type details');
    }

    return response.json();
}
```

@/lib/stripe.ts
```typescript

import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_API_SECRET_KEY!, {
  apiVersion: '2025-01-27.acacia',
});

export async function createCheckoutSession(
  priceId: string,
  customerId: string,
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
```

@/lib/redis.ts
```typescript

import { kv } from '@vercel/kv'

export const LOCK_EXPIRY = 300 // 5 minutes
export const PROCESS_RECORD_EXPIRY = 3600 // 1 hour

interface ProcessRecord {
  status: 'processing' | 'completed'
  startedAt?: string
  completedAt?: string
  eventTimestamp: string
}

export async function acquireLock(botId: string): Promise<boolean> {
  const lockKey = `lock:${botId}`
  // SET NX (Not Exists) is atomic - guaranteed only one process can acquire it
  return (await kv.set(lockKey, Date.now(), { nx: true, ex: LOCK_EXPIRY })) !== null
}

export async function releaseLock(botId: string): Promise<void> {
  const lockKey = `lock:${botId}`
  await kv.del(lockKey)
}

export async function getProcessRecord(botId: string): Promise<ProcessRecord | null> {
  const processKey = `process:${botId}`
  return await kv.get(processKey)
}

export async function setProcessRecord(
  botId: string,
  record: ProcessRecord
): Promise<void> {
  const processKey = `process:${botId}`
  await kv.set(processKey, record, { ex: PROCESS_RECORD_EXPIRY })
}

export async function isProcessing(botId: string): Promise<boolean> {
  const lockExists = await kv.exists(`lock:${botId}`)
  return lockExists === 1
}

// Add these new functions to your redis.ts
export async function markStripeWebhookProcessed(
  webhookId: string,
  eventType: string
): Promise<void> {
  const key = `stripe:webhook:${webhookId}`  // More specific prefix
  await kv.set(key, {
    status: 'completed',
    eventType,
    processedAt: new Date().toISOString()
  }, { 
    ex: 24 * 60 * 60 // 24 hour expiry
  })
}

export async function isStripeWebhookProcessed(webhookId: string): Promise<boolean> {
  const key = `stripe:webhook:${webhookId}`  // More specific prefix
  const record = await kv.get(key)
  return record !== null
}
```

