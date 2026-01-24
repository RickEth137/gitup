'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { signIn } from 'next-auth/react';
import { Github, ArrowRight, FileCode, ChevronDown } from 'lucide-react';

// GitLab icon component
const GitLabIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M22.65 14.39L12 22.13 1.35 14.39a.84.84 0 01-.3-.94l1.22-3.78 2.44-7.51A.42.42 0 014.82 2a.43.43 0 01.58 0 .42.42 0 01.11.18l2.44 7.49h8.1l2.44-7.51A.42.42 0 0118.6 2a.43.43 0 01.58 0 .42.42 0 01.11.18l2.44 7.51L23 13.45a.84.84 0 01-.35.94z"/>
  </svg>
);

export default function HomePage() {
  const { data: session } = useSession();
  const { connected } = useWallet();

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Ambient glow effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-[#00FF41]/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-[#00FF41]/3 rounded-full blur-[100px]" />
      </div>

      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center">
        <div className="max-w-5xl mx-auto px-6 py-20 text-center relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#00FF41]/20 bg-[#00FF41]/5 mb-8">
            <span className="text-xs text-[#00FF41]/80 font-medium tracking-wide uppercase">
              Powered by
            </span>
            <img src="/Pumpfun.webp" alt="Pump.fun" className="w-5 h-5 rounded-full" />
            <span className="text-xs text-[#00FF41]/80 font-medium tracking-wide uppercase">
              pump.fun
            </span>
          </div>

          {/* Main headline */}
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
            <span className="text-white">Tokenize </span>
            <span className="text-[#00FF41]">Repositories</span>
          </h1>

          <p className="text-lg md:text-xl text-white/50 max-w-2xl mx-auto mb-4 font-light">
            Fund your development by tokenizing your repo, or support your favorite dev by tokenizing theirs.
          </p>
          
          <p className="text-sm text-white/30 max-w-xl mx-auto mb-12">
            Anyone can launch. Real owners verify & claim creator fees forever.
          </p>

          {/* CTA Section */}
          <div className="flex flex-col items-center gap-6">
            {/* Primary CTA */}
            <Link
              href="/launch"
              className="group relative inline-flex items-center gap-3 px-8 py-4 bg-[#00FF41] text-black font-semibold rounded-xl hover:bg-[#00FF41]/90 transition-all duration-300 hover:scale-105 hover:shadow-[0_0_40px_rgba(0,255,65,0.3)]"
            >
              <FileCode className="w-5 h-5" />
              Tokenize Repo
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>

            {/* Auth buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3">
              {!session && (
                <button
                  onClick={() => signIn('github')}
                  className="flex items-center justify-center gap-2 px-6 py-3 rounded-lg border border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white transition-all text-sm h-12 w-[180px]"
                >
                  <Github className="w-4 h-4" />
                  Connect GitHub
                </button>
              )}
              {session && (
                <div className="flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-[#00FF41]/10 border border-[#00FF41]/20 h-12 w-[180px]">
                  <Github className="w-4 h-4 text-[#00FF41]" />
                  <span className="text-sm text-[#00FF41]">{(session.user as { githubLogin?: string })?.githubLogin || 'Connected'}</span>
                </div>
              )}
              {!connected && (
                <div className="hero-wallet">
                  <WalletMultiButton>Connect Wallet</WalletMultiButton>
                </div>
              )}
              {connected && (
                <div className="flex items-center justify-center px-6 py-3 rounded-lg bg-[#00FF41]/10 border border-[#00FF41]/20 h-12 w-[180px]">
                  <span className="text-sm text-[#00FF41]">Wallet Connected</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Animated scroll down arrow */}
        <div className="absolute bottom-8 right-8 flex flex-col items-center gap-1 animate-bounce">
          <span className="text-[10px] text-white/30 uppercase tracking-wider">Scroll</span>
          <ChevronDown className="w-5 h-5 text-[#00FF41]/60" />
        </div>
      </section>

      {/* How It Works - Single clean section */}
      <section className="relative py-24 border-t border-white/5">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              How It Works
            </h2>
            <p className="text-white/40">Three simple steps</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="relative group h-full">
              <div className="absolute inset-0 bg-gradient-to-b from-[#00FF41]/10 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative p-8 rounded-2xl border border-white/5 bg-white/[0.02] hover:border-[#00FF41]/20 transition-colors h-full">
                <div className="w-12 h-12 rounded-xl bg-[#00FF41]/10 flex items-center justify-center mb-6">
                  <span className="text-[#00FF41] font-mono font-bold">01</span>
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">Find & Launch</h3>
                <p className="text-white/40 text-sm leading-relaxed">
                  Search any GitHub or GitLab repo. Launch a token on pump.fun in seconds — even if you&apos;re not the owner.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative group h-full">
              <div className="absolute inset-0 bg-gradient-to-b from-[#00FF41]/10 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative p-8 rounded-2xl border border-white/5 bg-white/[0.02] hover:border-[#00FF41]/20 transition-colors h-full">
                <div className="w-12 h-12 rounded-xl bg-[#00FF41]/10 flex items-center justify-center mb-6">
                  <span className="text-[#00FF41] font-mono font-bold">02</span>
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">Fees Escrow</h3>
                <p className="text-white/40 text-sm leading-relaxed">
                  Creator fees accumulate in a secure escrow wallet. They wait there until the real owner shows up.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative group h-full">
              <div className="absolute inset-0 bg-gradient-to-b from-[#00FF41]/10 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative p-8 rounded-2xl border border-white/5 bg-white/[0.02] hover:border-[#00FF41]/20 transition-colors h-full">
                <div className="w-12 h-12 rounded-xl bg-[#00FF41]/10 flex items-center justify-center mb-6">
                  <span className="text-[#00FF41] font-mono font-bold">03</span>
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">Verify & Claim</h3>
                <p className="text-white/40 text-sm leading-relaxed">
                  Repo owner? Verify via GitHub or GitLab OAuth. Claim all accumulated fees instantly.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Supported Platforms */}
      <section className="relative py-24 border-t border-white/5">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-white mb-2">Supported Platforms</h2>
            <p className="text-white/40 text-sm">Tokenize creators from these platforms</p>
          </div>

          <div className="grid grid-cols-2 gap-4 max-w-lg mx-auto">
            {/* GitHub */}
            <div className="group relative p-5 rounded-2xl border border-[#00FF41]/20 bg-[#00FF41]/5 transition-all">
              <div className="flex flex-col items-center text-center">
                <div className="w-14 h-14 rounded-xl bg-[#00FF41]/10 flex items-center justify-center mb-3">
                  <Github className="w-7 h-7 text-[#00FF41]" />
                </div>
                <h3 className="font-semibold text-white">GitHub</h3>
                <p className="text-xs text-white/40 mt-1">Public repositories</p>
                <div className="mt-3 flex items-center gap-1.5 text-[10px] text-[#00FF41]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00FF41]" />
                  Live Now
                </div>
              </div>
            </div>

            {/* GitLab */}
            <div className="group relative p-5 rounded-2xl border border-white/5 bg-white/[0.02] hover:border-[#FC6D26]/20 transition-all">
              <div className="flex flex-col items-center text-center opacity-60">
                <div className="w-14 h-14 rounded-xl bg-[#FC6D26]/10 flex items-center justify-center mb-3">
                  <GitLabIcon className="w-7 h-7 text-[#FC6D26]" />
                </div>
                <h3 className="font-semibold text-white">GitLab</h3>
                <p className="text-xs text-white/40 mt-1">Projects & repos</p>
                <div className="mt-3 flex items-center gap-1.5 text-[10px] text-white/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-white/30" />
                  Coming Soon
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <div className="relative p-12 rounded-3xl border border-[#00FF41]/10 bg-gradient-to-b from-[#00FF41]/5 to-transparent">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to launch?
            </h2>
            <p className="text-white/40 mb-8 max-w-md mx-auto">
              Be the first to tokenize your favorite repos and creators. Earn fees or claim what&apos;s yours.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/launch"
                className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-[#00FF41] text-black font-semibold rounded-xl hover:bg-[#00FF41]/90 transition-all hover:shadow-[0_0_30px_rgba(0,255,65,0.2)]"
              >
                <FileCode className="w-5 h-5" />
                Tokenize Repo
              </Link>
              <Link
                href="/claim"
                className="inline-flex items-center justify-center gap-2 px-8 py-3 border border-white/10 text-white/70 font-medium rounded-xl hover:bg-white/5 hover:text-white transition-all"
              >
                Claim Fees
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8">
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#00FF41] flex items-center justify-center">
                <FileCode className="w-4 h-4 text-black" />
              </div>
              <span className="font-bold text-white">GitUp</span>
              <span className="text-[#00FF41]">.fun</span>
            </div>
            <div className="flex gap-6 text-sm text-white/40">
              <a href="https://x.com/gitup_fun" target="_blank" rel="noopener noreferrer" className="hover:text-[#00FF41] transition-colors">
                Twitter
              </a>
              <a href="https://github.com/gitup-fun" target="_blank" rel="noopener noreferrer" className="hover:text-[#00FF41] transition-colors">
                GitHub
              </a>
            </div>
            <p className="text-sm text-white/30">
              © 2026 GitUp.fun
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
