import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function confirmTestUserEmail(userId: string) {
  const { data, error } = await supabaseAdmin.auth.admin.updateUserById(
    userId,
    { email_confirm: true }
  );

  if (error) {
    throw error;
  }

  return data;
}