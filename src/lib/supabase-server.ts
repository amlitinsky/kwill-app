import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';
import { retrieveSubscription } from './stripe';
import { getGoogleUserInfo } from './google-auth';
// import { CookieOptions } from '@supabase/ssr';

// import { CookieOptions, createServerClient } from '@supabase/ssr';

export async function createServerSupabaseClient() {
  return createServerComponentClient({ cookies: cookies })
}

// export async function createServerSupabaseClient() {
//   return await createRouteHandlerClient({ cookies })

// }

// export async function createServerSupabaseClient() {
//   return createServerComponentClient({
//     cookies: async () => {
//       const cookieStore = await cookies()
//       return {
//         get: async (name: string) => {
//           const cookie = cookieStore.get(name)
//           return cookie?.value
//         },
//         set: async (name: string, value: string, options: CookieOptions) => {
//           cookieStore.set(name, value, options)
//         },
//         remove: async (name: string, options: CookieOptions) => {
//           cookieStore.set(name, '', { ...options, maxAge: 0 })
//         },
//       }
//     },
//   })
// }
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

// Add function for updating user's payment plan
export async function updatePaymentPlan(userId: string, plan: string, stripeCustomerId: string) {
  const supabase = await createServerSupabaseClient()
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
  const supabase = await createServerSupabaseClient()
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

export async function createTemplate(name: string, spreadsheetLink: string, customInstructions: string) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('No user logged in');

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
  const supabase = await createServerSupabaseClient()
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

// creating a initial meeting, updating other columns later
export async function createMeeting(name: string, zoomLink: string, spreadsheetId: string, customInstructions: string, botId: string) {
  const supabase = await createServerSupabaseClient();
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

export async function updateMeetingTranscript(botId: string, transcript: string) {
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
    .select('user_id, spreadsheet_id, column_headers, custom_instructions, status')
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


export async function handleFailedPayment(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string;

  const { data: userData, error } = await supabaseAdmin
    .from('users')
    .select('id')
    .eq('stripe_customer_id', customerId)
    .single();

  if (error || !userData) {
    console.error('Error fetching user:', error);
    return;
  }

  const { error: updateError } = await supabaseAdmin
    .from('users')
    .update({ 
      payment_status: 'failed',
      subscription_status: 'inactive',
      payment_plan: 'Free'
    })
    .eq('id', userData.id);

  if (updateError) {
    console.error('Error updating user payment status:', updateError);
  }

  // TODO: Implement email sending logic here
}

export async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  const customerId = subscription.customer;
  const status = subscription.status;

  const { data: userData, error } = await supabaseAdmin
    .from('users')
    .select('id')
    .eq('stripe_customer_id', customerId)
    .single();

  if (error || !userData) {
    console.error('Error fetching user:', error);
    return;
  }

  const { error: updateError } = await supabaseAdmin
    .from('users')
    .update({ subscription_status: status })
    .eq('id', userData.id);

  if (updateError) {
    console.error('Error updating user subscription status:', updateError);
  }
}
export async function handlePaidInvoice(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string;
  const subscriptionId = invoice.subscription as string;

  const subscription = await retrieveSubscription(subscriptionId);

  const { data: userData, error } = await supabaseAdmin
    .from('users')
    .select('id')
    .eq('stripe_customer_id', customerId)
    .single();

  if (error || !userData) {
    console.error('Error fetching user:', error);
    return;
  }

  const { error: updateError } = await supabaseAdmin
    .from('users')
    .update({ 
      meetings_used: 0,
      payment_status: 'paid',
      subscription_status: subscription.status,
      payment_plan: subscription.items.data[0]?.price.nickname || 'Pro',
      subscription_end_date: new Date(subscription.current_period_end * 1000).toISOString()
    })
    .eq('id', userData.id);

  if (updateError) {
    console.error('Error updating user after paid invoice:', updateError);
  }
}

export async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;

  const { data: userData, error } = await supabaseAdmin
    .from('users')
    .select('id')
    .eq('stripe_customer_id', customerId)
    .single();

  if (error || !userData) {
    console.error('Error fetching user:', error);
    return;
  }

  const { error: updateError } = await supabaseAdmin
    .from('users')
    .update({ 
      subscription_status: 'canceled',
      stripe_subscription_id: null,
      subscription_end_date: new Date(subscription.current_period_end * 1000).toISOString()
    })
    .eq('id', userData.id);

  if (updateError) {
    console.error('Error updating user after subscription deletion:', updateError);
  }
}

export async function incrementMeetingCount(userId: string) {
  // First, get the current meetings_used count
  const { data: userData, error: fetchError } = await supabaseAdmin
    .from('users')
    .select('meetings_used')
    .eq('id', userId)
    .single();

  if (fetchError) {
    console.error('Error fetching user data:', fetchError);
    throw fetchError;
  }

  const currentCount = userData?.meetings_used || 0;
  const newCount = currentCount + 1;

  // Now, update the meetings_used count
  const { data, error } = await supabaseAdmin
    .from('users')
    .update({ meetings_used: newCount })
    .eq('id', userId)
    .select('meetings_used')
    .single();

  if (error) {
    console.error('Error incrementing meeting count:', error);
    throw error;
  }

  return data?.meetings_used;
}

export async function getStripeCustomerId(userId: string) {
  const { data, error } = await supabaseAdmin
    .from('users')
    .select('stripe_customer_id')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error incrementing meeting count:', error);
    throw error;
  }

  return data?.stripe_customer_id;
}

// Function to update user profile in Supabase
export async function updateUserProfileWithGoogleInfo(accessToken: string) {
  if (!accessToken) throw new Error('Access token is required');

  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error('No user logged in');
  const { firstName, lastName } = await getGoogleUserInfo(accessToken);

  const { error } = await supabase
    .from('users')
    .update({ first_name: firstName, last_name: lastName })
    .eq('id', user.id);

  if (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }

  return { firstName, lastName };
}

export async function getUserDisplayName(userId: string): Promise<string | null> {
  try {
    const { data, error } = await supabaseAdmin
      .from('auth.users')
      .select('raw_user_meta_data')
      .eq('id', userId)
      .single()

    if (error) throw error

    // The display name is stored in the raw_user_meta_data column
    const displayName = data?.raw_user_meta_data?.display_name

    return displayName || null
  } catch (error) {
    console.error('Error fetching user display name:', error)
    return null
  }
}