'use client';

import { SessionProvider } from 'next-auth/react';
import { ToiletsProvider } from '@/context/ToiletsContext';
import type { ReactNode } from 'react';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider
      // 5 daqiqada bir marta tekshiradi — keraksiz so'rovlarni kamaytiradi.
      refetchInterval={5 * 60}
      refetchOnWindowFocus
    >
      <ToiletsProvider>{children}</ToiletsProvider>
    </SessionProvider>
  );
}
