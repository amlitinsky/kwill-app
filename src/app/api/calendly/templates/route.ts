import { NextResponse } from 'next/server';
import { createServerSupabaseClient, getCalendlyTemplates, getCalendlyCreds, getValidCalendlyToken, syncCalendlyEventTypes, updateCalendlyTemplate } from '@/lib/supabase-server';
import { getCalendlyEventTypes } from '@/lib/calendly';
import { getSubscription } from '@/lib/supabase-server';

export async function GET() {
  const supabase = await createServerSupabaseClient();

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const templates = await getCalendlyTemplates(user.id);
    const userData = await getSubscription();
    return NextResponse.json({ templates, calendlyEnabled: userData.calendly_enabled });
  } catch (error) {
    console.error('Error fetching templates:', error);
    return NextResponse.json({ error: 'Failed to fetch templates' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const supabase = await createServerSupabaseClient();

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, ...updates } = await request.json();
    if (!id) {
      return NextResponse.json({ error: 'Config ID is required' }, { status: 400 });
    }

    await updateCalendlyTemplate(user.id, id, updates);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating template:', error);
    return NextResponse.json({ error: 'Failed to update template' }, { status: 500 });
  }
}

// Optional: Add sync endpoint
export async function POST() {
  const supabase = await createServerSupabaseClient();

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const calendlyCreds = await getCalendlyCreds(user.id);
    if (!calendlyCreds) {
      return NextResponse.json({ error: 'No Calendly connection' }, { status: 404 });
    }

    const validToken = await getValidCalendlyToken(user.id)


    const eventTypes = await getCalendlyEventTypes(
      validToken, 
      calendlyCreds.uri
    );

    const { added } = await syncCalendlyEventTypes(user.id, eventTypes);
    const templates = await getCalendlyTemplates(user.id);

    return NextResponse.json({ templates, added });
  } catch (error) {
    console.error('Error syncing templates:', error);
    return NextResponse.json({ error: 'Sync failed' }, { status: 500 });
  }
}