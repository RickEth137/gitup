'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { signIn, signOut, useSession } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';

export function Header() {
  const { data: session, status } = useSession();
  const { connected, publicKey } = useWallet();

  const shortenAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  return (
    <header className="border-b border-zinc-900 bg-black/95 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="text-xl font-bold text-white tracking-tight">
            gitup.fun
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link
              href="/launch"
              className="text-zinc-500 hover:text-white transition-colors text-sm"
            >
              Launch
            </Link>
            <Link
              href="/dashboard"
              className="text-zinc-500 hover:text-white transition-colors text-sm"
            >
              Dashboard
            </Link>
            <Link
              href="/explore"
              className="text-zinc-500 hover:text-white transition-colors text-sm"
            >
              Explore
            </Link>
            <Link
              href="/docs"
              className="text-zinc-500 hover:text-white transition-colors text-sm"
            >
              Docs
            </Link>
          </nav>

          {/* Auth Buttons */}
          <div className="flex items-center gap-3">
            {/* GitHub Auth */}
            {status === 'loading' ? (
              <div className="w-32 h-9 bg-zinc-900 animate-pulse" />
            ) : session ? (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-900 border border-zinc-800">
                  <Image
                    src={session.user?.image || '/default-avatar.png'}
                    alt="Avatar"
                    width={20}
                    height={20}
                    className="rounded-full"
                  />
                  <span className="text-sm text-zinc-400">
                    {(session as any).user?.githubLogin || session.user?.name}
                  </span>
                </div>
                <button
                  onClick={() => signOut()}
                  className="p-2 text-zinc-500 hover:text-white transition-colors border border-zinc-800 hover:border-zinc-700"
                  title="Sign out"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </button>
              </div>
            ) : (
              <button
                onClick={() => signIn('github')}
                className="flex items-center gap-2 px-3 py-1.5 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-colors text-sm text-zinc-400 hover:text-white"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
                <span>GitHub</span>
              </button>
            )}

            {/* Wallet */}
            <WalletMultiButton className="!bg-white !text-black !font-bold !border-0 hover:!bg-zinc-200 !transition-colors !rounded-none !h-9" />
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
