'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ClientRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Check if there's a redirect path stored
    const redirect = sessionStorage.getItem('redirect');
    if (redirect && redirect !== '/') {
      sessionStorage.removeItem('redirect');
      router.replace(redirect);
    }
  }, [router]);

  return null;
}
