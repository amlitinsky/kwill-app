import { createBrowserClient } from '@supabase/ssr';


export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

export const supabase = createClient();

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
  try {
    // 1. Server-side invalidation
    await fetch('/auth/signout', {
      method: 'POST',
      credentials: 'include',
    });

    // Clear specific items
    localStorage.removeItem('ally-supports-cache');
    localStorage.removeItem('pendingMeeting');
    localStorage.removeItem('settingsActiveTab');
    localStorage.removeItem('zoomConnected');

    // 2. Global scope logout (invalidates all sessions)
    await supabase.auth.signOut({ scope: 'global' });
    
    // 3. Clear all stored data
    localStorage.clear();
    sessionStorage.clear();
    
    // 4. Clear cookies
    document.cookie.split(";").forEach((c) => {
      document.cookie = c
        .replace(/^ +/, "")
        .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });
    
  } catch (error) {
    console.error('Error during sign out:', error);
    throw error;
  }
  // Original Supabase Sign out
  // const { error } = await supabase.auth.signOut();
  // if (error) throw error;
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
    .eq('id', user.id);

  if (error) throw error;

  const { error: updateAuthError } = await supabase.auth.updateUser({
    data: { first_name: firstName, last_name: lastName },
  });

  if (updateAuthError) throw updateAuthError;
}

export async function getUserMeetings(userId: string) {
  const { data, error } = await supabase
    .from('meetings')
    .select('*')
    .eq('user_id', userId);

  if (error) throw error;
  return data;
}

export async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      }
    },
  });

  if (error) throw error;

  return data;
}

export async function deleteUser(userId: string) {
  const { error: dbError } = await supabase
    .from('users')
    .delete()
    .eq('id', userId);

  if (dbError) throw dbError

  // Delete user's meetings
  const { error: meetingsError } = await supabase
    .from('meetings')
    .delete()
    .eq('user_id', userId);

  if (meetingsError) throw meetingsError;

  const { error: subscriptionsError } = await supabase
    .from('subscriptions')
    .delete()
    .eq('user_id', userId);

  if (subscriptionsError) throw subscriptionsError;

  const { error: templatesError } = await supabase
    .from('templates')
    .delete()
    .eq('user_id', userId);

  if (templatesError) throw templatesError;

  const { error: oauthError } = await supabase
    .from('google_oauth_credentials')
    .delete()
    .eq('user_id', userId);

  if (oauthError) throw oauthError;

  const { data, error } = await supabase.auth.admin.deleteUser(userId);
  if (error) throw error;
  return data;
}
