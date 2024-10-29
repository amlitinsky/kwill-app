import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export const supabase = createClientComponentClient();

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
      ...(process.env.VERCEL_ENV === 'production' && {
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        }
      })
    },
  });

  if (error) throw error;

  return data;
}
