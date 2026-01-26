'use client';

import { useMemo } from 'react';
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

// Star Particles Background Component
function StarParticles() {
  // Generate stable random values only once
  const stars = useMemo(() => 
    [...Array(60)].map((_, i) => ({
      id: i,
      left: (i * 17 + 7) % 100, // Pseudo-random but stable distribution
      top: (i * 23 + 13) % 100,
      size: 1 + (i % 3) * 0.5,
      opacity: 0.15 + (i % 5) * 0.1,
      duration: 3 + (i % 4),
      delay: (i % 6) * 0.5,
    }))
  , []);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {stars.map((star) => (
        <div
          key={star.id}
          className="absolute rounded-full bg-white star-twinkle"
          style={{
            left: `${star.left}%`,
            top: `${star.top}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            opacity: star.opacity,
            animationDuration: `${star.duration}s`,
            animationDelay: `${star.delay}s`,
          }}
        />
      ))}
    </div>
  );
}

// Character Video Component - LOCKED POSITION (only in hero section)
function CharacterVideo() {
  return (
    <div
      className="absolute z-40 pointer-events-none"
      style={{
        left: '15.9%',
        top: '61.4%',
        transform: 'translate(-50%, -50%)',
        width: '82vw',
      }}
    >
      <video
        autoPlay
        loop
        muted
        playsInline
        className="w-full h-auto"
        style={{
          maskImage: 'linear-gradient(to bottom, black 50%, transparent 95%)',
          WebkitMaskImage: 'linear-gradient(to bottom, black 50%, transparent 95%)',
        }}
      >
        <source src="/Hi Alpha.webm" type="video/webm" />
        <source src="/Hi Alpha.mov" type="video/quicktime" />
      </video>
    </div>
  );
}

export default function HomePage() {
  const { data: session } = useSession();
  const { connected } = useWallet();

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Star Particles Background */}
      <StarParticles />
      
      {/* Ambient glow effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-[#00FF41]/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-[#00FF41]/3 rounded-full blur-[100px]" />
      </div>

      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Character Video - inside hero so it scrolls away */}
        <CharacterVideo />
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

          <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto mb-4 font-light">
            Fund your development by tokenizing your repo, or support your favorite dev by tokenizing theirs.
          </p>
          
          <p className="text-sm text-white/70 max-w-xl mx-auto mb-12">
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
        <div className="absolute bottom-8 right-8 flex flex-col items-center gap-2 animate-bounce">
          <span className="text-sm text-white/40 uppercase tracking-wider font-medium">Scroll</span>
          <ChevronDown className="w-7 h-7 text-[#00FF41]/70" />
        </div>
      </section>

      {/* How It Works - Interactive Comic Walkthrough */}
      <section className="relative py-24 border-t border-white/5">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              How It Works
            </h2>
            <p className="text-white/70">Four simple steps to tokenize any repo</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Step 1 - Connect Wallet */}
            <div className="relative h-full">
              <div className="relative h-full flex flex-col rounded-2xl border border-white/5 bg-white/[0.02] overflow-hidden">
                {/* Comic Image */}
                <div className="relative aspect-square overflow-hidden">
                  <img 
                    src="/Comic/One.png" 
                    alt="Connect Wallet" 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent" />
                  {/* Step Number Badge */}
                  <div className="absolute top-4 left-4 w-10 h-10 rounded-xl bg-[#00FF41] flex items-center justify-center shadow-lg shadow-[#00FF41]/30">
                    <span className="text-black font-mono font-bold text-lg">1</span>
                  </div>
                </div>
                {/* Content */}
                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="text-lg font-semibold text-white mb-2">Connect Wallet</h3>
                  <p className="text-white/60 text-sm leading-relaxed">
                    Click &quot;Connect Wallet&quot; and approve the connection request
                  </p>
                </div>
              </div>
            </div>

            {/* Step 2 - Select Repository */}
            <div className="relative h-full">
              <div className="relative h-full flex flex-col rounded-2xl border border-white/5 bg-white/[0.02] overflow-hidden">
                {/* Comic Image */}
                <div className="relative aspect-square overflow-hidden">
                  <img 
                    src="/Comic/Two.png" 
                    alt="Select Repository" 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent" />
                  {/* Step Number Badge */}
                  <div className="absolute top-4 left-4 w-10 h-10 rounded-xl bg-[#00FF41] flex items-center justify-center shadow-lg shadow-[#00FF41]/30">
                    <span className="text-black font-mono font-bold text-lg">2</span>
                  </div>
                </div>
                {/* Content */}
                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="text-lg font-semibold text-white mb-2">Select Repository</h3>
                  <p className="text-white/60 text-sm leading-relaxed">
                    Search any public repo by URL or connect GitHub/GitLab to pick your own
                  </p>
                </div>
              </div>
            </div>

            {/* Step 3 - Configure Token */}
            <div className="relative h-full">
              <div className="relative h-full flex flex-col rounded-2xl border border-white/5 bg-white/[0.02] overflow-hidden">
                {/* Comic Image */}
                <div className="relative aspect-square overflow-hidden">
                  <img 
                    src="/Comic/Three.png" 
                    alt="Configure Token" 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent" />
                  {/* Step Number Badge */}
                  <div className="absolute top-4 left-4 w-10 h-10 rounded-xl bg-[#00FF41] flex items-center justify-center shadow-lg shadow-[#00FF41]/30">
                    <span className="text-black font-mono font-bold text-lg">3</span>
                  </div>
                </div>
                {/* Content */}
                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="text-lg font-semibold text-white mb-2">Configure Token</h3>
                  <p className="text-white/60 text-sm leading-relaxed">
                    Set your token name, symbol, and upload custom artwork
                  </p>
                </div>
              </div>
            </div>

            {/* Step 4 - Launch */}
            <div className="relative h-full">
              <div className="relative h-full flex flex-col rounded-2xl border border-white/5 bg-white/[0.02] overflow-hidden">
                {/* Comic Image */}
                <div className="relative aspect-square overflow-hidden">
                  <img 
                    src="/Comic/Four.png" 
                    alt="Launch" 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent" />
                  {/* Step Number Badge */}
                  <div className="absolute top-4 left-4 w-10 h-10 rounded-xl bg-[#00FF41] flex items-center justify-center shadow-lg shadow-[#00FF41]/30">
                    <span className="text-black font-mono font-bold text-lg">4</span>
                  </div>
                </div>
                {/* Content */}
                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="text-lg font-semibold text-white mb-2">Launch</h3>
                  <p className="text-white/60 text-sm leading-relaxed">
                    Review details and sign the transaction to deploy on pump.fun
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Escrow & Claim - Combined Card with Image */}
          <div className="mt-12">
            <div className="relative max-w-2xl mx-auto">
              <div className="relative rounded-2xl border border-white/5 bg-white/[0.02] overflow-hidden">
                <div className="flex flex-col md:flex-row">
                  {/* Comic Image */}
                  <div className="relative md:w-1/2 aspect-square md:aspect-auto overflow-hidden">
                    <img 
                      src="/Comic/Five.png" 
                      alt="Escrow & Claim" 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#0a0a0a]/80 hidden md:block" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] to-transparent md:hidden" />
                  </div>
                  {/* Content */}
                  <div className="md:w-1/2 p-8 flex flex-col justify-center">
                    <h3 className="text-2xl font-bold text-white mb-4">Escrow & Claim</h3>
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-[#00FF41] font-semibold mb-1">Fees Escrow</h4>
                        <p className="text-white/60 text-sm leading-relaxed">
                          Creator fees accumulate in a secure escrow wallet. They wait there until the real repo owner verifies and claims them.
                        </p>
                      </div>
                      <div>
                        <h4 className="text-[#00FF41] font-semibold mb-1">Verify & Claim</h4>
                        <p className="text-white/60 text-sm leading-relaxed">
                          Repo owner? Connect via GitHub or GitLab OAuth to verify ownership and instantly claim all accumulated creator fees.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Supported Platforms */}
      <section className="relative py-24 border-t border-white/5">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Supported Platforms</h2>
            <p className="text-white/70">Tokenize creators from these platforms</p>
          </div>

          {/* Video with hand-drawn annotations */}
          <div className="flex justify-center">
            <div className="relative w-full max-w-5xl">
              <video
                autoPlay
                loop
                muted
                playsInline
                className="w-full rounded-2xl"
                style={{
                  maskImage: 'linear-gradient(to bottom, black 50%, transparent 95%)',
                  WebkitMaskImage: 'linear-gradient(to bottom, black 50%, transparent 95%)',
                }}
              >
                <source src="/Supported Platforms.webm" type="video/webm" />
              </video>
              
              {/* GitHub annotation - left side */}
              <div className="absolute left-[12%] top-[35%] pointer-events-none hidden md:block">
                <p 
                  className="text-white text-2xl lg:text-3xl mb-1"
                  style={{ fontFamily: "'Caveat', cursive" }}
                >
                  Github
                </p>
                <svg width="50" height="40" viewBox="0 0 50 40" className="text-white ml-6">
                  <path 
                    d="M 5 5 Q 20 15, 30 25 Q 35 30, 40 35" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round"
                  />
                  <path 
                    d="M 32 28 L 42 36 L 38 26" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              
              {/* GitLab annotation - right side */}
              <div className="absolute right-[12%] top-[25%] pointer-events-none hidden md:block">
                <p 
                  className="text-white text-2xl lg:text-3xl mb-1"
                  style={{ fontFamily: "'Caveat', cursive" }}
                >
                  GitLab
                </p>
                <svg width="50" height="50" viewBox="0 0 50 50" className="text-white -ml-2">
                  <path 
                    d="M 45 5 Q 30 15, 20 30 Q 15 38, 10 45" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round"
                  />
                  <path 
                    d="M 18 38 L 8 47 L 20 45" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative pb-24">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <div className="relative p-12 rounded-3xl border border-[#00FF41]/10 bg-gradient-to-b from-[#00FF41]/5 to-transparent">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to launch?
            </h2>
            <p className="text-white/70 mb-8 max-w-md mx-auto">
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
