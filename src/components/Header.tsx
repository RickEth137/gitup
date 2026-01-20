'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { signIn, signOut, useSession } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import { Github, LogOut, Wallet } from 'lucide-react';

export function Header() {
  const { data: session, status } = useSession();
  const { connected, publicKey } = useWallet();

  const shortenAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-dark/90 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-semibold tracking-tight">git.fun</span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link
              href="/launch"
              className="text-muted hover:text-primary transition-colors text-sm"
            >
              Launch
            </Link>
            <Link
              href="/explore"
              className="text-muted hover:text-primary transition-colors text-sm"
            >
              Explore
            </Link>
            <Link
              href="/docs"
              className="text-muted hover:text-primary transition-colors text-sm"
            >
              Docs
            </Link>
          </nav>

          {/* Auth Buttons */}
          <div className="flex items-center gap-3">
            {/* GitHub Auth */}
            {status === 'loading' ? (
              <div className="w-32 h-9 bg-surface rounded-md animate-pulse" />
            ) : session ? (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-surface rounded-md border border-border">
                  <Image
                    src={session.user?.image || '/default-avatar.png'}
                    alt="Avatar"
                    width={20}
                    height={20}
                    className="rounded-full"
                  />
                  <span className="text-sm text-secondary">
                    {(session as any).user?.githubLogin || session.user?.name}
                  </span>
                </div>
                <button
                  onClick={() => signOut()}
                  className="p-2 text-muted hover:text-primary transition-colors"
                  title="Sign out"
                >
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => signIn('github')}
                className="flex items-center gap-2 px-3 py-1.5 bg-surface rounded-md border border-border hover:border-border-light transition-colors text-sm"
              >
                <Github size={16} />
                <span>GitHub</span>
              </button>
            )}

            {/* Wallet */}
            <WalletMultiButton />
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
