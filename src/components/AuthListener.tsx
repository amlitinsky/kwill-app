'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

interface AuthListenerProps {
  initialSession: boolean;
}

export default function AuthListener({ initialSession }: AuthListenerProps) {
  const [session, setSession] = useState(initialSession);
  const router = useRouter();
  const supabase = createClientComponentClient();

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
        setSession(!!session);
        router.refresh();
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase, router]);

  useEffect(() => {
    if (session !== initialSession) {
      router.refresh();
    }
  }, [session, initialSession, router]);

  return null;
}