import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export const supabase = createServerComponentClient({ cookies });

export async function createMeeting(userId: string, zoomLink: string, spreadsheetId: string, columnHeaders: string[], customInstructions: string) {
  const { data, error } = await supabase
    .from('meetings')
    .insert({
      user_id: userId,
      zoom_link: zoomLink,
      spreadsheet_id: spreadsheetId,
      column_headers: columnHeaders,
      custom_instructions: customInstructions
    });

  if (error) throw error;
  return data;
}

export async function updateMeetingStatus(meetingId: string, status: string) {
  const { data, error } = await supabase
    .from('meetings')
    .update({ status: status })
    .match({ id: meetingId });

  if (error) throw error;
  return data;
}

export async function updateMeetingTranscript(meetingId: string, transcript: string) {
  const { data, error } = await supabase
    .from('meetings')
    .update({ transcript: transcript })
    .match({ id: meetingId });

  if (error) throw error;
  return data;
}

export async function updateProcessedData(meetingId: string, processedData: Record<string, unknown>) {
  const { data, error } = await supabase
    .from('meetings')
    .update({ processed_data: processedData })
    .match({ id: meetingId });

  if (error) throw error;
  return data;
}


// Add function for updating user's payment plan
export async function updatePaymentPlan(userId: string, plan: string, stripeCustomerId: string) {
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