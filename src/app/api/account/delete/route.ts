import { createServerSupabaseClient, supabaseAdmin} from "@/lib/supabase-server";
import { NextResponse } from "next/server";

export async function DELETE() {
  const supabase = await createServerSupabaseClient();
  try {
    // 1. Verify active session
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (!user || authError) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Delete related data first
    await Promise.all([
      supabaseAdmin.from('subscriptions').delete().eq('user_id', user.id),
      supabaseAdmin.from('google_oauth_credentials').delete().eq('user_id', user.id),
      supabaseAdmin.from('calendly_oauth_credentials').delete().eq('user_id', user.id),
      supabaseAdmin.from('meetings').delete().eq('user_id', user.id),
      supabaseAdmin.from('recall_oauth_app_credentials').delete().eq('user_id', user.id),
      supabaseAdmin.from('templates').delete().eq('user_id', user.id),
      supabaseAdmin.from('calendly_templates').delete().eq('user_id', user.id)
    ]);

    // TODO later cancel stripe subscription

    // 3. Delete auth user
    const { error: deleteError } = 
      await supabaseAdmin.auth.admin.deleteUser(user.id);

    if (deleteError) throw deleteError;

    // 4. Invalidate all sessions
    await supabaseAdmin.auth.admin.signOut(user.id);

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Account deletion failed:', error);
    return NextResponse.json(
      { error: 'Account deletion failed' },
      { status: 500 }
    );
  }
}