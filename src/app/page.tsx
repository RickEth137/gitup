'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { signIn } from 'next-auth/react';
import {
  Github,
  ArrowRight,
  Code,
  Star,
  GitFork,
} from 'lucide-react';

export default function HomePage() {
  const { data: session } = useSession();
  const { connected } = useWallet();

  const isFullyConnected = session && connected;

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-32 md:py-40">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-medium tracking-tight mb-6">
              Tokenize your code
            </h1>
            <p className="text-lg md:text-xl text-muted max-w-2xl mx-auto mb-10">
              Turn GitHub repositories into tradable assets on Solana.
              <br className="hidden md:block" />
              Launch in under 60 seconds via pump.fun.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center mb-16">
              {isFullyConnected ? (
                <Link
                  href="/launch"
                  className="btn-primary flex items-center gap-2 px-6 py-3"
                >
                  Launch Token
                  <ArrowRight className="w-4 h-4" />
                </Link>
              ) : (
                <>
                  {!session && (
                    <button
                      onClick={() => signIn('github')}
                      className="btn-secondary flex items-center gap-2 px-6 py-3"
                    >
                      <Github className="w-4 h-4" />
                      Connect GitHub
                    </button>
                  )}
                  {!connected && <WalletMultiButton />}
                </>
              )}
            </div>

            {/* Stats - minimal */}
            <div className="flex justify-center gap-16 text-center">
              <div>
                <div className="text-2xl font-medium">500+</div>
                <div className="text-xs text-muted mt-1">Repos Tokenized</div>
              </div>
              <div>
                <div className="text-2xl font-medium">$2M+</div>
                <div className="text-xs text-muted mt-1">Volume</div>
              </div>
              <div>
                <div className="text-2xl font-medium">60s</div>
                <div className="text-xs text-muted mt-1">Avg Launch</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works - minimal */}
      <section className="py-24 border-t border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xs uppercase tracking-widest text-muted text-center mb-16">
            How it works
          </h2>

          <div className="grid md:grid-cols-4 gap-12">
            {[
              { step: '01', title: 'Connect', desc: 'Link GitHub & wallet' },
              { step: '02', title: 'Select', desc: 'Choose a repository' },
              { step: '03', title: 'Brand', desc: 'Name, symbol & logo' },
              { step: '04', title: 'Launch', desc: 'Deploy on pump.fun' },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="text-xs text-muted mb-3">{item.step}</div>
                <h3 className="font-medium mb-1">{item.title}</h3>
                <p className="text-sm text-muted">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features - minimal */}
      <section className="py-24 border-t border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6">
              <div className="w-10 h-10 rounded-full bg-surface border border-border flex items-center justify-center mb-4">
                <span className="text-sm">✓</span>
              </div>
              <h3 className="font-medium mb-2">Proof of Ownership</h3>
              <p className="text-sm text-muted">
                GitHub OAuth verifies you own the repo. No fake projects.
              </p>
            </div>

            <div className="p-6">
              <div className="w-10 h-10 rounded-full bg-surface border border-border flex items-center justify-center mb-4">
                <span className="text-sm">⚡</span>
              </div>
              <h3 className="font-medium mb-2">Instant Launch</h3>
              <p className="text-sm text-muted">
                No liquidity management. pump.fun handles the bonding curve.
              </p>
            </div>

            <div className="p-6">
              <div className="w-10 h-10 rounded-full bg-surface border border-border flex items-center justify-center mb-4">
                <span className="text-sm">◈</span>
              </div>
              <h3 className="font-medium mb-2">Real Utility</h3>
              <p className="text-sm text-muted">
                Your token is backed by real code. Stars and forks = value.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Launches - minimal */}
      <section className="py-24 border-t border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-xs uppercase tracking-widest text-muted">
              Recent launches
            </h2>
            <Link
              href="/explore"
              className="text-xs text-muted hover:text-primary transition-colors flex items-center gap-1"
            >
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex items-center justify-between p-4 rounded-lg border border-border hover:border-border-light hover:bg-surface transition-all cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-surface border border-border flex items-center justify-center">
                    <Code className="w-4 h-4 text-muted" />
                  </div>
                  <div>
                    <h3 className="font-medium text-sm">awesome-project-{i}</h3>
                    <p className="text-xs text-muted font-mono">$AWE{i}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6 text-xs text-muted">
                  <span className="flex items-center gap-1">
                    <Star className="w-3 h-3" /> {(1000 * i).toLocaleString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <GitFork className="w-3 h-3" /> {100 * i}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA - minimal */}
      <section className="py-32 border-t border-border">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-medium mb-4">
            Ready to launch?
          </h2>
          <p className="text-muted mb-8">
            Join developers who have tokenized their repositories.
          </p>
          <Link
            href="/launch"
            className="btn-primary inline-flex items-center gap-2 px-6 py-3"
          >
            Get Started
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Footer - minimal */}
      <footer className="border-t border-border py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm font-medium">git.fun</div>
            <div className="flex gap-6 text-xs text-muted">
              <Link href="/docs" className="hover:text-primary transition-colors">
                Docs
              </Link>
              <a
                href="https://github.com/gitfun"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary transition-colors"
              >
                GitHub
              </a>
              <a
                href="https://twitter.com/gitfun_"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary transition-colors"
              >
                Twitter
              </a>
            </div>
            <p className="text-xs text-muted">
              © 2026
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
