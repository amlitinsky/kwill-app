import { NextResponse } from 'next/server';
import { cancelCalendlyMeeting, createMeeting, getCalendlyConfigByUri, getCalendlyUser, getMeetingByEventUri, supabaseAdmin } from '@/lib/supabase-server';
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
          .from('users')
          .select('calendly_enabled, calendly_access_until, meeting_hours_remaining')
          .eq('id', userId)
          .single();

        if (!user?.data?.calendly_enabled || new Date(user.data.calendly_access_until) < new Date()) {
            return NextResponse.json({ 
              error: 'Calendly access is disabled or expired' 
            }, { status: 403 });
        }

        const eventUri = eventData.scheduled_event.uri;
        const eventTypeUri = eventData.scheduled_event.event_type
        const startTime = eventData.scheduled_event.start_time;
        const name = `${eventData.scheduled_event.name} - ${new Date(startTime).toLocaleString()}`

        const config = await getCalendlyConfigByUri(eventTypeUri);
        if (!config || !config.active || !config.spreadsheet_id) {
          return NextResponse.json({ message: 'Event type not configured or inactive' });
        }

        const joinTime = new Date(new Date(startTime).getTime() - 30000);
        const automaticLeave = Math.floor(user.data.meeting_hours_remaining * 3600)
        const scheduledBot = await createBot(locationData.join_url, {
          join_at: joinTime.toISOString(),
          automatic_leave: automaticLeave
        });

        await createMeeting(
          userId,
          name,
          locationData.join_url,
          config.spreadsheet_id,
          config.custom_instructions,
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