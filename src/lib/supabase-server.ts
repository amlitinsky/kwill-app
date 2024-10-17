import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { createClient } from '@supabase/supabase-js';

export function createServerSupabaseClient() { 
    return createServerComponentClient({cookies})
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

// Add function for updating user's payment plan
export async function updatePaymentPlan(userId: string, plan: string, stripeCustomerId: string) {
  const supabase = createServerSupabaseClient()
  const { data, error } = await supabase
    .from('users')
    .update({ 
      payment_plan: plan, 
      stripe_customer_id: stripeCustomerId 
    })
    .match({ id: userId });

  if (error) throw error;
  return data;
}


export async function deleteAccount() {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('No user logged in');

  // Delete user data from the users table
  const { error: deleteUserError } = await supabase
    .from('users')
    .delete()
    .match({ auth_id: user.id });

  if (deleteUserError) throw deleteUserError;

  // Delete the auth user
  const { error } = await supabase.rpc('delete_user');
  if (error) throw error;
}

export async function fetchTemplates() {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('No user logged in');

  const { data, error } = await supabase
    .from('templates')
    .select('*')
    .eq('user_id', user.id);

  if (error) throw error;
  return data;
}

export async function createTemplate(name: string, spreadsheetLink: string, customInstructions: string) {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('No user logged in');
  console.log("hello")

  const { data, error } = await supabase
    .from('templates')
    .insert([{ 
      name, 
      spreadsheet_link: spreadsheetLink, 
      custom_instructions: customInstructions,
      user_id: user.id
    }]);

  if (error) throw error;
  return data;
}

export async function updateTemplate(id: string, name: string, spreadsheetLink: string, customInstructions: string) {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('No user logged in');

  const { data, error } = await supabase
    .from('templates')
    .update({ 
      name, 
      spreadsheet_link: spreadsheetLink, 
      custom_instructions: customInstructions 
    })
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) throw error;
  return data;
}

export async function deleteTemplate(id: string) {
  const supabase = createServerSupabaseClient()
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

// creating a initial meeting, updating other columns later
export async function createMeeting(name: string, zoomLink: string, spreadsheetId: string, customInstructions: string, botId: string) {
  const supabase = createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('No user logged in');

  // Get Google OAuth credentials
  const { data: googleCreds, error: googleCredsError } = await supabase
    .from('google_oauth_credentials')
    .select('*')
    .eq('user_id', user.id)
    .single();


  if (googleCredsError || !googleCreds) throw new Error('Google OAuth credentials not found');

  // Validate spreadsheet and get headers
  const auth = new OAuth2Client();
  auth.setCredentials({
    access_token: googleCreds.access_token,
    refresh_token: googleCreds.refresh_token,
    expiry_date: googleCreds.expiry_date
  });


  // we need to replace this with the new column headers function
  const sheets = google.sheets({ version: 'v4', auth });

  let response;
  try {
    response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'A1:ZZ1',
    });
  } catch (error) {
    console.error('Error fetching spreadsheet headers:', error);
    throw new Error('Failed to fetch spreadsheet headers');
  }

  const fetchedColumnHeaders = response.data.values?.[0] || [];


  const { data, error } = await supabase
    .from('meetings')
    .insert({
      user_id: user.id,
      name: name,
      zoom_link: zoomLink,
      spreadsheet_id: spreadsheetId,
      column_headers: fetchedColumnHeaders,
      custom_instructions: customInstructions,
      bot_id: botId
    });

  if (error) throw error;
  return data;
}

export async function fetchMeetings() {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('No user logged in');

  const { data, error } = await supabase
    .from('meetings')
    .select('*')
    .eq('user_id', user.id);

  if (error) throw error;
  return data;
}

export async function updateMeetingStatus(botId: string, status: string) {
  // const supabase = createServerSupabaseClient()
  console.log('in supabase file with the following: ', botId, 'status ', status)
  const { data, error } = await supabaseAdmin
    .from('meetings')
    .update({ status: status})
    .eq('bot_id', botId)

  console.log("data: ", data)
  if (error) throw error;
  return data;
}

export async function updateMeetingTranscript(botId: string, transcript: string) {
  // const supabase = createServerSupabaseClient()
  const { data, error } = await supabaseAdmin
    .from('meetings')
    .update({ transcript: transcript })
    .eq('bot_id', botId)

  console.log("data: ", data)
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
    .select('user_id, spreadsheet_id, column_headers, custom_instructions')
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
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('No user logged in');

  const { error } = await supabase
    .from('meetings')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) throw error;
}
