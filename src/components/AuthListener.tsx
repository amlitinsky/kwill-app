// 'use client';

// import { useEffect, useState } from 'react';
// import { useRouter } from 'next/navigation';
// import { createClient } from '@/lib/supabase-client';
// import { User } from '@supabase/supabase-js'

// interface AuthListenerProps {
//   initialUser: User | null;
// }

// export default function AuthListener({ initialUser }: AuthListenerProps) {
//   const [, setUser] = useState(initialUser);
//   const router = useRouter();
//   const supabase = createClient()

//   useEffect(() => {
//     const { data: { subscription } } = supabase.auth.onAuthStateChange(async () => {
//       // Verify user with getUser instead of using session directly
//       const { data: { user } } = await supabase.auth.getUser()
//       setUser(user)
      
//       if (!!initialUser !== !!user) {
//         router.refresh()
//       }
//     })

//     return () => subscription?.unsubscribe()
//   }, [supabase, router, initialUser])

//   return null
// }