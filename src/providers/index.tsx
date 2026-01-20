'use client';

import { SessionProvider } from 'next-auth/react';
import { ReactNode } from 'react';
import { SolanaWalletProvider } from './SolanaWalletProvider';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider>
      <SolanaWalletProvider>{children}</SolanaWalletProvider>
    </SessionProvider>
  );
}

export default Providers;
