'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CheckoutSuccessPage() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push('/settings');
    }, 3000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Checkout Successful!</h1>
        <p>Your subscription has been updated successfully.</p>
        <p>Redirecting to settings page in 3 seconds...</p>
      </div>
    </div>
  );
}