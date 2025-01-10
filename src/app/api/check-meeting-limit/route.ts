import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { getUserById} from '@/lib/supabase-server';
export async function GET() {
  const supabase = await createServerSupabaseClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (!user || error) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const userData = await getUserById(user.id);
    let canCreateMeeting = false;
    let upgradeUrl = null;

    // Check if user has enough hours remaining
    if (userData.meeting_hours_remaining > 0) {
      canCreateMeeting = true;
    } else {
      upgradeUrl = '/private/settings';
    }

    return NextResponse.json({ 
      canCreateMeeting, 
      upgradeUrl,
      hoursRemaining: userData.meeting_hours_remaining 
    });
  } catch (error) {
    console.error('Error checking meeting hours:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}