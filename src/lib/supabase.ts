import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function signUp(email: string, password: string, firstName: string, lastName: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        first_name: firstName,
        last_name: lastName,
      },
    },
  });

  if (error) throw error;

  return data;
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
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

export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function updateProfile(firstName: string, lastName: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error('No user logged in');

  const { error } = await supabase
    .from('users')
    .update({ first_name: firstName, last_name: lastName })
    .match({ user_id: user.id });

  if (error) throw error;

  const { error: updateAuthError } = await supabase.auth.updateUser({
    data: { first_name: firstName, last_name: lastName },
  });

  if (updateAuthError) throw updateAuthError;
}

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

export async function getUserMeetings(userId: string) {
  const { data, error } = await supabase
    .from('meetings')
    .select('*')
    .eq('user_id', userId);

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

export async function signInWithGoogle() {
  console.log("window origin test: ", window.location.origin)
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  });


  if (error) throw error;
  return data;
}