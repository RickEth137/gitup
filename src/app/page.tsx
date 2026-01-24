'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { signIn } from 'next-auth/react';
import { Github, ArrowRight, FileCode, Twitter, Send } from 'lucide-react';

// GitLab icon component
const GitLabIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M22.65 14.39L12 22.13 1.35 14.39a.84.84 0 01-.3-.94l1.22-3.78 2.44-7.51A.42.42 0 014.82 2a.43.43 0 01.58 0 .42.42 0 01.11.18l2.44 7.49h8.1l2.44-7.51A.42.42 0 0118.6 2a.43.43 0 01.58 0 .42.42 0 01.11.18l2.44 7.51L23 13.45a.84.84 0 01-.35.94z"/>
  </svg>
);

// Meta icon component
const MetaIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M6.915 4.03c-1.968 0-3.683 1.28-4.871 3.113C.704 9.208 0 11.883 0 14.449c0 .706.07 1.369.21 1.973a6.624 6.624 0 0 0 .265.86 5.297 5.297 0 0 0 .371.761c.696 1.159 1.818 1.927 3.593 1.927 1.497 0 2.633-.671 3.965-2.452.76-1.017 1.459-2.21 2.085-3.32l.672-1.195c.326-.56.625-1.095.895-1.585l.44-.793c.18-.33.355-.651.527-.96.293-.52.563-.98.811-1.36.249-.382.484-.702.707-.948a3.017 3.017 0 0 1 .516-.463c.164-.116.328-.21.49-.28a1.69 1.69 0 0 1 .515-.127c.477 0 .893.17 1.222.517.328.347.58.81.756 1.313.178.503.268 1.043.268 1.6 0 .652-.089 1.293-.259 1.887-.17.594-.398 1.084-.674 1.456a2.2 2.2 0 0 1-.507.522c-.104.08-.215.149-.333.205a1.57 1.57 0 0 1-.406.138c-.192.033-.351.046-.473.046-.191 0-.383-.026-.576-.079a2.33 2.33 0 0 1-.542-.221c.033.124.077.267.127.422.051.155.118.339.197.535.08.196.174.4.28.593.107.193.228.37.361.519.133.148.28.27.44.357.16.088.334.138.527.138.258 0 .516-.05.774-.152.258-.103.522-.274.789-.498.268-.224.528-.502.78-.824.253-.323.506-.702.76-1.128.635-1.066 1.132-2.324 1.491-3.772.36-1.448.54-2.927.54-4.435 0-.719-.055-1.39-.165-2.013a8.59 8.59 0 0 0-.52-1.768 5.96 5.96 0 0 0-.873-1.49 4.387 4.387 0 0 0-1.281-1.072 3.487 3.487 0 0 0-1.692-.407c-.399 0-.768.075-1.108.224-.34.15-.658.36-.956.633a7.63 7.63 0 0 0-.857.873c-.263.32-.527.681-.793 1.08l-.478.73-.505.827c-.164.276-.332.566-.505.867l-.49.865-.476.863a53.8 53.8 0 0 1-.462.846c-.24.438-.501.894-.78 1.368-.28.475-.573.952-.88 1.429-.306.478-.613.926-.919 1.344-.306.42-.606.778-.9 1.074-.294.296-.563.506-.81.63a1.314 1.314 0 0 1-.587.188c-.213 0-.386-.065-.52-.195a1.156 1.156 0 0 1-.299-.505 2.543 2.543 0 0 1-.116-.674c-.015-.237-.014-.475.004-.712.018-.237.046-.46.083-.67.037-.21.08-.396.125-.557.167-.587.39-1.22.672-1.9.281-.68.593-1.348.935-2.006.343-.658.7-1.27 1.073-1.838.372-.568.74-1.046 1.102-1.432.362-.387.702-.663 1.02-.829.318-.166.607-.249.867-.249.177 0 .34.033.49.1.15.066.286.16.409.28.123.12.23.263.324.428.093.165.17.347.23.546.06.199.1.41.122.633.02.224.017.453-.012.69a7.3 7.3 0 0 1-.143.825c-.066.288-.151.577-.255.867l.67-.746c.267-.296.557-.614.869-.953.312-.339.635-.672.97-.998a12.89 12.89 0 0 1 1.051-.91c.367-.286.74-.52 1.12-.702.38-.183.763-.274 1.149-.274.62 0 1.157.135 1.612.407.455.271.838.648 1.148 1.13.31.48.544 1.043.7 1.688.157.646.235 1.344.235 2.096 0 .915-.082 1.81-.247 2.683a12.233 12.233 0 0 1-.727 2.459 10.419 10.419 0 0 1-1.18 2.164c-.47.66-1.01 1.224-1.618 1.69-.609.467-1.287.831-2.034 1.092-.748.261-1.56.392-2.437.392-.56 0-1.074-.067-1.54-.2a4.427 4.427 0 0 1-1.247-.566 4.51 4.51 0 0 1-.988-.864 6.46 6.46 0 0 1-.762-1.085 8.937 8.937 0 0 1-.57-1.212 12.99 12.99 0 0 1-.406-1.216 14.762 14.762 0 0 1-.278-1.128 12.442 12.442 0 0 1-.152-.948c-.056-.443-.082-.787-.082-1.034 0-.43.027-.881.082-1.354.055-.473.14-.946.255-1.42.116-.473.258-.937.428-1.39.17-.455.364-.88.584-1.277.22-.397.462-.752.727-1.066.265-.313.55-.567.857-.762.307-.195.634-.34.98-.433.347-.093.71-.14 1.091-.14.504 0 .967.092 1.39.275.422.184.798.436 1.126.758.328.322.603.701.824 1.138.222.437.384.905.488 1.403z"/>
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
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#00FF41]/20 bg-[#00FF41]/5 mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00FF41] animate-pulse" />
            <span className="text-xs text-[#00FF41]/80 font-medium tracking-wide uppercase">
              Powered by pump.fun
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
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-b from-[#00FF41]/10 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative p-8 rounded-2xl border border-white/5 bg-white/[0.02] hover:border-[#00FF41]/20 transition-colors">
                <div className="w-12 h-12 rounded-xl bg-[#00FF41]/10 flex items-center justify-center mb-6">
                  <span className="text-[#00FF41] font-mono font-bold">01</span>
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">Find & Launch</h3>
                <p className="text-white/40 text-sm leading-relaxed">
                  Search any GitHub repo or X account. Launch a token on pump.fun in seconds — even if you&apos;re not the owner.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-b from-[#00FF41]/10 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative p-8 rounded-2xl border border-white/5 bg-white/[0.02] hover:border-[#00FF41]/20 transition-colors">
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
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-b from-[#00FF41]/10 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative p-8 rounded-2xl border border-white/5 bg-white/[0.02] hover:border-[#00FF41]/20 transition-colors">
                <div className="w-12 h-12 rounded-xl bg-[#00FF41]/10 flex items-center justify-center mb-6">
                  <span className="text-[#00FF41] font-mono font-bold">03</span>
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">Verify & Claim</h3>
                <p className="text-white/40 text-sm leading-relaxed">
                  Repo owner? Verify via GitHub OAuth. X creator? Verify via Twitter. Claim all accumulated fees instantly.
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

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
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

            {/* Twitter/X */}
            <div className="group relative p-5 rounded-2xl border border-white/5 bg-white/[0.02] hover:border-white/10 transition-all">
              <div className="flex flex-col items-center text-center opacity-60">
                <div className="w-14 h-14 rounded-xl bg-white/5 flex items-center justify-center mb-3">
                  <Twitter className="w-7 h-7 text-white/70" />
                </div>
                <h3 className="font-semibold text-white">X / Twitter</h3>
                <p className="text-xs text-white/40 mt-1">Creator accounts</p>
                <div className="mt-3 flex items-center gap-1.5 text-[10px] text-white/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-white/30" />
                  Coming Soon
                </div>
              </div>
            </div>

            {/* Telegram */}
            <div className="group relative p-5 rounded-2xl border border-white/5 bg-white/[0.02] hover:border-[#0088cc]/20 transition-all">
              <div className="flex flex-col items-center text-center opacity-60">
                <div className="w-14 h-14 rounded-xl bg-[#0088cc]/10 flex items-center justify-center mb-3">
                  <Send className="w-7 h-7 text-[#0088cc]" />
                </div>
                <h3 className="font-semibold text-white">Telegram</h3>
                <p className="text-xs text-white/40 mt-1">Users & channels</p>
                <div className="mt-3 flex items-center gap-1.5 text-[10px] text-white/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-white/30" />
                  Coming Soon
                </div>
              </div>
            </div>

            {/* Meta */}
            <div className="group relative p-5 rounded-2xl border border-white/5 bg-white/[0.02] hover:border-[#0082FB]/20 transition-all">
              <div className="flex flex-col items-center text-center opacity-60">
                <div className="w-14 h-14 rounded-xl bg-[#0082FB]/10 flex items-center justify-center mb-3">
                  <MetaIcon className="w-7 h-7 text-[#0082FB]" />
                </div>
                <h3 className="font-semibold text-white">Meta</h3>
                <p className="text-xs text-white/40 mt-1">Instagram & Facebook</p>
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
