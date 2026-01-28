'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { signIn, signOut, useSession } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Github, LogOut, Gift, User } from 'lucide-react';

export function Header() {
  const { data: session, status } = useSession();
  const { connected, publicKey } = useWallet();
  const [mounted, setMounted] = useState(false);

  // Fix hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-white/5">
      <div className="max-w-6xl mx-auto px-6 relative">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/logopng.png"
              alt="GitUp.fun"
              width={32}
              height={32}
              className="rounded-lg"
            />
            <span className="text-lg font-bold">
              <span className="text-white">GitUp</span>
              <span className="text-[#00FF41]">.fun</span>
            </span>
          </Link>

          {/* Navigation - Absolute center */}
          <nav className="hidden md:flex items-center gap-1 absolute left-1/2 -translate-x-1/2">
            <Link
              href="/"
              className="px-4 py-2 text-white/50 hover:text-[#00FF41] transition-colors text-sm font-medium"
            >
              Home
            </Link>
            <Link
              href="/launch"
              className="px-4 py-2 text-white/50 hover:text-[#00FF41] transition-colors text-sm font-medium"
            >
              Launch
            </Link>
            <Link
              href="/claim"
              className="px-4 py-2 text-white/50 hover:text-[#00FF41] transition-colors text-sm font-medium"
            >
              Claim
            </Link>
            <Link
              href="/explore"
              className="px-4 py-2 text-white/50 hover:text-[#00FF41] transition-colors text-sm font-medium"
            >
              Explore
            </Link>
            <Link
              href="/docs"
              className="px-4 py-2 text-white/50 hover:text-[#00FF41] transition-colors text-sm font-medium"
            >
              Docs
            </Link>
            {mounted && connected && publicKey && (
              <Link
                href={`/profile/${publicKey.toBase58()}`}
                className="px-4 py-2 text-white/50 hover:text-[#00FF41] transition-colors text-sm font-medium"
              >
                Profile
              </Link>
            )}
          </nav>

          {/* Auth Buttons */}
          <div className="flex items-center gap-3">
            {/* GitHub Auth */}
            {status === 'loading' ? (
              <div className="w-[140px] h-10 bg-white/5 rounded-lg animate-pulse" />
            ) : session ? (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 px-3 py-2 bg-white/5 border border-white/10 rounded-lg h-10">
                  <Image
                    src={session.user?.image || '/default-avatar.png'}
                    alt="Avatar"
                    width={20}
                    height={20}
                    className="rounded-full ring-1 ring-[#00FF41]/30"
                  />
                  <span className="text-sm text-white/70">
                    {(session as { user?: { githubLogin?: string; name?: string | null } }).user?.githubLogin || session.user?.name}
                  </span>
                </div>
                <button
                  onClick={() => signOut()}
                  className="p-2 text-white/40 hover:text-white transition-colors"
                  title="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => signIn('github')}
                className="flex items-center justify-center gap-2 px-4 py-2 border border-white/10 rounded-lg transition-all text-sm text-white/60 hover:text-white hover:bg-white/5 h-10 min-w-[140px]"
              >
                <Github className="w-4 h-4" />
                <span>GitHub</span>
              </button>
            )}

            {/* Wallet */}
            <div className="header-wallet">
              {mounted ? (
                <WalletMultiButton>
                  {connected ? undefined : 'Connect Wallet'}
                </WalletMultiButton>
              ) : (
                <div className="w-[160px] h-[40px] bg-white/10 rounded-lg animate-pulse" />
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
