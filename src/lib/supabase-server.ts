import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';
import { createStripeCustomer } from './stripe';
import { findNextEmptyRow, getColumnHeaders, getGoogleUserInfo, refreshAccessToken } from './google-auth';
import { createServerClient } from '@supabase/ssr';
import { checkCalendlyTokenValidity, refreshCalendlyToken } from './calendly';
import { ProcessedTranscriptSegment } from './transcript-utils';

export async function createServerSupabaseClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}


const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)


export async function fetchTemplates() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('No user logged in');

  const { data, error } = await supabase
    .from('templates')
    .select('*')
    .eq('user_id', user.id);

  if (error) throw error;
  return data;
}

export async function createTemplate(name: string, spreadsheetId: string, prompt: string, meetingLink: string, columnHeaders: string[]) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('No user logged in');

  const { data, error } = await supabase
    .from('templates')
    .insert([{ 
      user_id: user.id,
      name: name, 
      spreadsheet_id: spreadsheetId, 
      prompt: prompt,
      meeting_link: meetingLink,
      column_headers: columnHeaders,
      created_at: new Date().toISOString(),
    }]);

  if (error) throw error;
  return data;
}

export async function updateTemplate(id: string, name: string, spreadsheetId: string, prompt: string, meetingLink: string) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('No user logged in');

  const { data, error } = await supabase
    .from('templates')
    .update({ 
      name, 
      spreadsheet_id: spreadsheetId, 
      prompt: prompt,
      meeting_link: meetingLink
    })
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) throw error;
  return data;
}

export async function deleteTemplate(id: string) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('No user logged in');

  const { error } = await supabase
    .from('templates')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) throw error;
}
// MEETINGS

export async function fetchMeetings() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('No user logged in');

  const { data, error } = await supabase
    .from('meetings')
    .select('*')
    .order('created_at', {ascending: false})
    .eq('user_id', user.id);

  if (error) throw error;
  return data;
}

export async function updateMeetingStatus(botId: string, status: string) {
  const { data, error } = await supabaseAdmin
    .from('meetings')
    .update({ status: status})
    .eq('bot_id', botId)

  if (error) throw error;
  return data;
}

export async function updateMeetingTranscript(botId: string, transcript: ProcessedTranscriptSegment[]) {
  const { data, error } = await supabaseAdmin
    .from('meetings')
    .update({ transcript: transcript })
    .eq('bot_id', botId)

  if (error) throw error;
  return data;
}

// updating the dictionary/JSON for the result of the zoom meeting
export async function updateMeetingProcessedData(botId: string, processedData: Record<string, unknown>) {
  const { data, error } = await supabaseAdmin
    .from('meetings')
    .update({ processed_data: processedData })
    .eq('bot_id', botId);

  if (error) throw error;
  return data;
}

export async function getMeetingDetails(botId: string) {
  const { data, error } = await supabaseAdmin
    .from('meetings')
    .select('user_id, spreadsheet_id, column_headers, prompt, status, spreadsheet_row_number')
    .eq('bot_id', botId)
    .single()

  if (error) {
    console.error('Error fetching meeting details:', error)
    return null
  }

  return data
}

export async function getGoogleCreds(userId: string) {
  const { data, error } = await supabaseAdmin
    .from('google_oauth_credentials')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) {
    console.error('Error fetching Google credentials:', error);
    return null;
  }

  return data;
}

export async function deleteMeeting(id: string) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('No user logged in');

  const { error } = await supabase
    .from('meetings')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) throw error;
}

export async function getStripeCustomerId(userId: string) {
  const { data, error } = await supabaseAdmin
    .from('subscriptions')
    .select('stripe_customer_id')
    .eq('user_id', userId)
    .single();

  if (error) {
    console.error('Error incrementing meeting count:', error);
    throw error;
  }

  return data?.stripe_customer_id;
}


export async function getCalendlyCreds(userId: string) {
  const { data, error } = await supabaseAdmin
    .from('calendly_oauth_credentials')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) {
    console.error('Error fetching Calendly credentials:', error);
    return null;
  }

  return data;
}

export async function updateCalendlyTokens(
  userId: string, 
  tokens: { 
    access_token: string; 
    refresh_token: string; 
    expiry_date: number;
  }
) {
  const supabase = await createServerSupabaseClient();
  
  const { error } = await supabase
    .from('calendly_oauth_credentials')
    .update({
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expiry_date: new Date(tokens.expiry_date).toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('user_id', userId);

  if (error) {
    console.error('Error updating Calendly tokens:', error);
    throw new Error('Failed to update Calendly tokens');
  }
}

export async function getValidCalendlyToken(userId: string): Promise<string> {
  
  const credentials = await getCalendlyCreds(userId);

  if (!credentials) {
    throw new Error('No Calendly credentials found');
  }

  // Check if token needs refresh
  if (Date.now() >= credentials.expiry_date || !(await checkCalendlyTokenValidity(credentials.access_token))) {
    try {
      const newTokens = await refreshCalendlyToken(credentials.refresh_token);
      
      // Update database with new tokens
      await updateCalendlyTokens(userId, {
        access_token: newTokens.access_token,
        refresh_token: newTokens.refresh_token,
        expiry_date: newTokens.expiry_date
      });

      return newTokens.access_token;
    } catch (error) {
      console.error('Token refresh failed:', error);
      throw error;
    }
  }

  return credentials.access_token;
}

interface PendingOAuthFlow {
  id: string;
  user_id: string;
  type: 'calendly' | 'google';
  data: Record<string, unknown>;
  created_at: string;
}

export async function createPendingOAuthFlow(
  userId: string, 
  type: PendingOAuthFlow['type'], 
  data: string
) {
  const supabase = await createServerSupabaseClient();
  
  const { data: flow, error } = await supabase
    .from('pending_oauth_flows')
    .insert({
      user_id: userId,
      type: type,
      data: data,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating pending OAuth flow:', error);
    throw new Error('Failed to create pending OAuth flow');
  }

  return flow;
}

export async function getPendingOAuthFlow(
  userId: string, 
  type: PendingOAuthFlow['type']
): Promise<PendingOAuthFlow | null> {
  const supabase = await createServerSupabaseClient();
  
  const { data, error } = await supabase
    .from('pending_oauth_flows')
    .select('*')
    .eq('user_id', userId)
    .eq('type', type)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error) {
    if (error.code === 'PGRST116') { // no rows returned
      return null;
    }
    console.error('Error fetching pending OAuth flow:', error);
    throw error;
  }

  return data;
}

export async function deletePendingOAuthFlow(
  userId: string, 
  type: PendingOAuthFlow['type']
) {
  const supabase = await createServerSupabaseClient();
  
  const { error } = await supabase
    .from('pending_oauth_flows')
    .delete()
    .eq('user_id', userId)
    .eq('type', type);

  if (error) {
    console.error('Error deleting pending OAuth flow:', error);
    throw new Error('Failed to delete pending OAuth flow');
  }
}

// Utility function to clean up stale flows (older than 1 hour)
export async function cleanupStaleOAuthFlows() {
  const supabase = await createServerSupabaseClient();
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  
  const { error } = await supabase
    .from('pending_oauth_flows')
    .delete()
    .lt('created_at', oneHourAgo);

  if (error) {
    console.error('Error cleaning up stale OAuth flows:', error);
    throw new Error('Failed to cleanup stale OAuth flows');
  }
}

export async function updateGoogleTokens(
  userId: string,
  access_token: string,
  expiry_date: number
) {
  const supabase = await createServerSupabaseClient();
  
  const { error } = await supabase
    .from('google_oauth_credentials')
    .update({
      access_token: access_token,
      expiry_date: expiry_date ? new Date(expiry_date).toISOString() : null,
    })
    .eq('user_id', userId)
    .select();

  if (error) {
    console.error('Error updating Google tokens:', error);
    throw new Error('Failed to update Google tokens');
  }
}

export async function getValidGoogleToken(userId: string): Promise<string> {
  const credentials = await getGoogleCreds(userId);
  
  if (!credentials) {
    throw new Error('No Google credentials found');
  }

  const now = Date.now();
  const expiryDate = new Date(credentials.expiry_date).getTime();

  if (now >= expiryDate) {
    try {
      const newCredentials = await refreshAccessToken(credentials.refresh_token);
      
      await updateGoogleTokens(
        userId,
        newCredentials.access_token!,
        newCredentials.expiry_date!,
      );

      return newCredentials.access_token!;
    } catch (error) {
      console.error('Token refresh failed:', error);
      throw error;
    }
  }

  return credentials.access_token;
}

interface MeetingOptions {
  useAdmin?: boolean;
  status?: string;
  eventUri?:string;
}

export async function createMeeting(userId: string, name: string, spreadsheetId: string, prompt: string, meetingLink: string, botId: string, options: MeetingOptions = {}) {

  const supabase = options.useAdmin ? supabaseAdmin : await createServerSupabaseClient();

  const googleAccessToken = await getValidGoogleToken(userId)

  if (!googleAccessToken) throw new Error('Google OAuth credentials not found');

  const fetchedColumnHeaders = await getColumnHeaders(googleAccessToken, spreadsheetId)

  const newRow = await findNextEmptyRow(googleAccessToken, spreadsheetId, '')

  const { data, error } = await supabase
    .from('meetings')
    .insert({
      user_id: userId,
      name: name,
      spreadsheet_id: spreadsheetId,
      spreadsheet_row_number: newRow,
      column_headers: fetchedColumnHeaders,
      prompt: prompt,
      meeting_link: meetingLink,
      bot_id: botId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...(options.status && { status: options.status }),
      ...(options.eventUri && { event_uri: options.eventUri })
    })
    .select('id')
    .single();

  if (error) throw error;
  return data;
}

export async function getCalendlyUser(uri: string) {
  const { data, error } = await supabaseAdmin
    .from('calendly_oauth_credentials')
    .select('user_id')
    .eq('uri', uri)
    .single()

  if (error) {
    console.error('Error fetching meeting details:', error)
    return null
  }

  return data
}


interface CalendlyTemplate {
  id: string;
  user_id: string;
  uri: string;
  name: string;
  spreadsheet_id: string | null;
  prompt: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
}

// 1. Function to fetch existing configs
export async function getCalendlyTemplates(userId: string) {
  const supabase = await createServerSupabaseClient();
  
  const { data, error } = await supabase
    .from('calendly_templates')
    .select('*')
    .eq('user_id', userId);

  if (error) throw error;
  return data as CalendlyTemplate[];
}

// 2. Function to create initial configs (used in OAuth callback)
export async function createInitialCalendlyTemplates(userId: string, eventTypes: CalendlyTemplate[]) {
  
  const templates = eventTypes.map(eventType => ({
    user_id: userId,
    uri: eventType.uri,
    name: eventType.name,
    spreadsheet_id: null,
    prompt: null,
    active: false
  }));

  const { error } = await supabaseAdmin
    .from('calendly_templates')
    .insert(templates);

  if (error) throw error;
}

// 3. Function to add new event types (used when checking for updates)
// TODO when user has deleted an event type on their calendly, we should update by deleting it too
export async function addNewCalendlyEventTypes(userId: string, eventTypes: CalendlyTemplate[]) {
  const supabase = await createServerSupabaseClient();
  
  // Get existing event type URIs
  const { data: existing } = await supabase
    .from('calendly_templates')
    .select('uri')
    .eq('user_id', userId);

  const existingUris = new Set(existing?.map(e => e.uri) || []);
  
  // Filter to only new event types
  const newEventTypes = eventTypes.filter(et => !existingUris.has(et.uri));
  
  if (newEventTypes.length === 0) {
    return { added: 0 };
  }

  const configs = newEventTypes.map(eventType => ({
    user_id: userId,
    uri: eventType.uri,
    name: eventType.name,
    spreadsheet_id: null,
    prompt: null,
    active: false
  }));

  const { error } = await supabase
    .from('calendly_templates')
    .insert(configs);

  if (error) throw error;
  return { added: newEventTypes.length };
}

// 4. Function to update a single config
export async function updateCalendlyTemplate(
  userId: string, 
  templateId: string, 
  updates: Partial<CalendlyTemplate>
) {
  const supabase = await createServerSupabaseClient();
  
  const { error } = await supabase
    .from('calendly_templates')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', templateId)
    .eq('user_id', userId); // Extra safety check

  if (error) throw error;
}

export async function updateMeetingBotId(meetingId: string, botId: string) {
  const { error } = await supabaseAdmin
    .from('meetings')
    .update({ 
      bot_id: botId,
      updated_at: new Date().toISOString()
    })
    .eq('id', meetingId);

  if (error) throw error;
}

export async function getMeetingByEventUri(eventUri: string) {
  const { data, error } = await supabaseAdmin
    .from('meetings')
    .select('*')
    .eq('event_uri', eventUri)
    .maybeSingle();

  if (error) throw error;
  return data;
}
export async function getCalendlyTemplateByUri(eventTypeUri: string) {
  const { data, error } = await supabaseAdmin
    .from('calendly_templates')
    .select('*')
    .eq('uri', eventTypeUri)
    .maybeSingle();

  if (error) throw error;
  return data;
}
export async function cancelCalendlyMeeting(eventUri: string) {
  const { error } = await supabaseAdmin
    .from('meetings')
    .delete()
    .eq('event_uri', eventUri);

  if (error) throw error;
}

export async function syncCalendlyEventTypes(userId: string, eventTypes: CalendlyTemplate[]) {
  const supabase = await createServerSupabaseClient();
  
  // Get existing event types with names
  const { data: existing } = await supabase
    .from('calendly_templates')
    .select('uri, id, name')
    .eq('user_id', userId);

  if (!existing) return { added: 0, deleted: 0, updated: 0 };

  // Create maps for efficient lookup
  const existingMap = new Map(existing.map(e => [e.uri, e]));
  const newMap = new Map(eventTypes.map(e => [e.uri, e]));

  // Find event types to add, delete, and update
  const toAdd = eventTypes.filter(et => !existingMap.has(et.uri));
  const toDelete = existing.filter(et => !newMap.has(et.uri));
  const toUpdate = eventTypes.filter(et => {
    const existing = existingMap.get(et.uri);
    return existing && existing.name !== et.name;
  });

  // Handle additions
  if (toAdd.length > 0) {
    const configs = toAdd.map(eventType => ({
      user_id: userId,
      uri: eventType.uri,
      name: eventType.name,
      spreadsheet_id: null,
      prompt: null,
      active: false
    }));

    await supabase
      .from('calendly_templates')
      .insert(configs);
  }

  // Handle updates
  if (toUpdate.length > 0) {
    for (const eventType of toUpdate) {
      await supabase
        .from('calendly_templates')
        .update({ name: eventType.name })
        .eq('uri', eventType.uri)
        .eq('user_id', userId);
    }
  }

  // Handle deletions
  if (toDelete.length > 0) {
    await supabase
      .from('calendly_templates')
      .delete()
      .in('id', toDelete.map(et => et.id));
  }

  return { 
    added: toAdd.length,
    updated: toUpdate.length,
    deleted: toDelete.length
  };
}

export async function getUserSubscriptionByStripeCustomerId(stripeCustomerId: string) {
  const { data, error } = await supabaseAdmin
    .from('subscriptions')
    .select('*')
    .eq('stripe_customer_id', stripeCustomerId)
    .single();

  if (error) {
    console.error('Error fetching user by Stripe customer ID:', error);
    return null;
  }

  return data;
}

export async function getOrCreateStripeCustomerId(userId: string, email: string) {
  try {
    // First try to get existing customer ID
    const { data: userData } = await supabaseAdmin
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', userId)
      .maybeSingle();

    if (userData?.stripe_customer_id) {
      return userData.stripe_customer_id;
    }

    // If no customer ID exists, create one using existing function
    const customer = await createStripeCustomer(email);

    // Update user with new Stripe customer ID
    await supabaseAdmin
      .from('subscriptions')
      .update({ stripe_customer_id: customer.id })
      .eq('user_id', userId);

    return customer.id;
  } catch (error) {
    console.error('Error in getOrCreateStripeCustomerId:', error);
    throw error;
  }
}

export interface Meeting {
  id: string
  user_id: string
  name: string
  status: 'scheduled'| 'created' | 'in-progress' | 'processing' | 'completed' | 'failed'
  spreadsheet_id: string
  spreadsheet_name: string
  spreadsheet_row_number?: number
  meeting_link: string
  bot_id: string
  prompt: string
  transcript: string | null
  processed_data: Record<string, unknown> | null
  column_headers: string[]
  event_uri?: string
  metrics: {
    duration: number
    fields_analyzed: number
    success_rate: number
    processing_duration: number
    progress?: number // 0-100 percentage of processing completion
    speaker_participation: Record<string, number>
    topic_distribution: Record<string, number>
  } | null
  ai_insights: {
    summary: string
    key_points: string[]
    action_items: string[]
    highlights: Array<{
      timestamp: number
      text: string
    }>
  } | null
  created_at: Date
  updated_at: Date
}

export async function updateMeetingMetrics(botId: string, metrics: Meeting['metrics']) {
  const { data, error } = await supabaseAdmin
    .from('meetings')
    .update({ metrics })
    .eq('bot_id', botId);

  if (error) throw error;
  return data;
}

export async function updateMeetingAIInsights(botId: string, aiInsights: Meeting['ai_insights']) {
  const { data, error } = await supabaseAdmin
    .from('meetings')
    .update({ ai_insights: aiInsights })
    .eq('bot_id', botId);

  if (error) throw error;
  return data;
}

export async function getMeetingWithDetails(meetingId: string) {
  const { data, error } = await supabaseAdmin
    .from('meetings')
    .select('*, users(first_name, last_name)')
    .eq('id', meetingId)
    .single();

  if (error) throw error;
  return data;
}

export async function getMeetingsWithFilters(
  userId: string,
  filters: {
    status?: Meeting['status'][]
    dateRange?: { start: Date; end: Date }
    hasprompt?: boolean
  },
  sort: {
    field: keyof Meeting
    direction: 'asc' | 'desc'
  } = { field: 'created_at', direction: 'desc' }
) {
  let query = supabaseAdmin
    .from('meetings')
    .select('*')
    .eq('user_id', userId);

  if (filters.status?.length) {
    query = query.in('status', filters.status);
  }

  if (filters.dateRange) {
    query = query
      .gte('date', filters.dateRange.start.toISOString())
      .lte('date', filters.dateRange.end.toISOString());
  }

  if (filters.hasprompt !== undefined) {
    if (filters.hasprompt) {
      query = query.not('prompt', 'eq', '');
    } else {
      query = query.eq('prompt', '');
    }
  }

  query = query.order(sort.field, { ascending: sort.direction === 'asc' });

  const { data, error } = await query;

  if (error) throw error;
  return data;
}

export async function getSubscription() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error('Not authenticated');

  const { data: subscription, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (error) {
    console.error('Error fetching subscription:', error);
    return null;
  }

  return subscription;
}
