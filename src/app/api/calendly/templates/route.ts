import { NextResponse } from 'next/server';
import { createServerSupabaseClient, getCalendlyConfigs, getCalendlyCreds, getUserById, getValidCalendlyToken, syncCalendlyEventTypes, updateCalendlyConfig } from '@/lib/supabase-server';
import { getCalendlyEventTypes } from '@/lib/calendly';

export async function GET() {
  const supabase = await createServerSupabaseClient();

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const configs = await getCalendlyConfigs(user.id);
    const userData = await getUserById(user.id);
    return NextResponse.json({ configs, calendlyEnabled: userData.calendly_enabled });
  } catch (error) {
    console.error('Error fetching configs:', error);
    return NextResponse.json({ error: 'Failed to fetch configs' }, { status: 500 });
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

    await updateCalendlyConfig(user.id, id, updates);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating config:', error);
    return NextResponse.json({ error: 'Failed to update config' }, { status: 500 });
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
    const configs = await getCalendlyConfigs(user.id);

    return NextResponse.json({ configs, added });
  } catch (error) {
    console.error('Error syncing configs:', error);
    return NextResponse.json({ error: 'Sync failed' }, { status: 500 });
  }
}