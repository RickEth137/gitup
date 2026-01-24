'use client';

import Link from 'next/link';
import { GitBranch, ExternalLink, ChevronRight, ChevronDown, Check, AlertCircle, Info, Zap } from 'lucide-react';
import { useState, useMemo } from 'react';

// Star particles background
function StarParticles() {
  const stars = useMemo(() => 
    [...Array(60)].map((_, i) => ({
      id: i,
      left: (i * 17 + 7) % 100,
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

// Sidebar navigation items with sub-sections
const navigation = [
  { 
    id: 'overview', 
    label: 'Overview',
    subsections: [
      { id: 'overview', label: 'What is GitUp.fun' },
      { id: 'key-features', label: 'Key Features' },
    ]
  },
  { 
    id: 'getting-started', 
    label: 'Getting Started',
    subsections: [
      { id: 'prerequisites', label: 'Prerequisites' },
      { id: 'quick-start', label: 'Quick Start' },
    ]
  },
  { 
    id: 'how-it-works', 
    label: 'How It Works',
    subsections: [
      { id: 'token-creation', label: 'Token Creation' },
      { id: 'one-repo-one-token', label: 'One Repo, One Token' },
    ]
  },
  { 
    id: 'escrow', 
    label: 'Escrow System',
    subsections: [
      { id: 'escrow-overview', label: 'Overview' },
      { id: 'escrow-flow', label: 'How It Works' },
    ]
  },
  { 
    id: 'verification', 
    label: 'Owner Verification',
    subsections: [
      { id: 'verification-process', label: 'Verification Process' },
      { id: 'claiming-fees', label: 'Claiming Fees' },
    ]
  },
  { 
    id: 'fees', 
    label: 'Fees & Economics',
    subsections: [
      { id: 'fee-structure', label: 'Fee Structure' },
    ]
  },
  { id: 'faq', label: 'FAQ' },
];

// Sidebar Nav Item component
function NavItem({ item, expanded, onToggle }: { 
  item: typeof navigation[0]; 
  expanded: boolean; 
  onToggle: () => void;
}) {
  const hasSubsections = 'subsections' in item && item.subsections;
  
  return (
    <div>
      <button
        onClick={hasSubsections ? onToggle : undefined}
        className="w-full flex items-center justify-between px-3 py-2 text-sm text-white/60 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
      >
        <a href={`#${item.id}`} className="flex items-center gap-2 flex-1">
          {hasSubsections ? (
            <ChevronDown className={`w-3 h-3 text-white/30 transition-transform ${expanded ? '' : '-rotate-90'}`} />
          ) : (
            <ChevronRight className="w-3 h-3 text-white/30" />
          )}
          {item.label}
        </a>
      </button>
      
      {hasSubsections && expanded && (
        <div className="ml-4 mt-1 space-y-1 border-l border-white/10 pl-2">
          {item.subsections.map((sub) => (
            <a
              key={sub.id}
              href={`#${sub.id}`}
              className="block px-3 py-1.5 text-xs text-white/40 hover:text-white/70 transition-colors"
            >
              {sub.label}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

// Callout component
function Callout({ 
  type = 'info', 
  children 
}: { 
  type?: 'info' | 'warning' | 'success'; 
  children: React.ReactNode 
}) {
  const styles = {
    info: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
    warning: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400',
    success: 'bg-[#00FF41]/10 border-[#00FF41]/30 text-[#00FF41]',
  };
  
  const icons = {
    info: Info,
    warning: AlertCircle,
    success: Check,
  };
  
  const Icon = icons[type];

  return (
    <div className={`flex gap-3 p-4 rounded-lg border ${styles[type]} my-6`}>
      <Icon className="w-5 h-5 shrink-0 mt-0.5" />
      <div className="text-sm leading-relaxed">{children}</div>
    </div>
  );
}

// Code block
function CodeBlock({ children }: { children: string }) {
  return (
    <pre className="bg-black rounded-lg p-4 overflow-x-auto my-4 border border-white/10">
      <code className="text-sm text-[#00FF41] font-mono">{children}</code>
    </pre>
  );
}

export default function DocsPage() {
  const [expandedSections, setExpandedSections] = useState<string[]>(['overview']);

  const toggleSection = (id: string) => {
    setExpandedSections(prev => 
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] relative">
      <StarParticles />
      <div className="max-w-7xl mx-auto flex relative z-10">
        
        {/* Sidebar - Fixed */}
        <aside className="hidden lg:block w-64 shrink-0 fixed top-16 left-0 bottom-0 border-r border-white/10 overflow-y-auto pt-4 pb-8 bg-[#0a0a0a]">
          <nav className="px-4 space-y-1">
            <p className="text-white/40 text-xs font-medium uppercase tracking-wider px-3 mb-4">
              Documentation
            </p>
            {navigation.map((item) => (
              <NavItem
                key={item.id}
                item={item}
                expanded={expandedSections.includes(item.id)}
                onToggle={() => toggleSection(item.id)}
              />
            ))}
            
            <div className="pt-6 mt-6 border-t border-white/10">
              <Link
                href="/launch"
                className="flex items-center gap-2 px-3 py-2 text-sm text-[#00FF41] hover:bg-[#00FF41]/10 rounded-lg transition-colors"
              >
                <GitBranch className="w-4 h-4" />
                Tokenize Your Repo
              </Link>
            </div>
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 pt-16 pb-20 px-6 lg:px-12 max-w-4xl lg:ml-64">
          
          {/* Header */}
          <div className="mb-12">
            <div className="flex items-center gap-2 text-sm text-white/40 mb-4">
              <span>Docs</span>
              <ChevronRight className="w-3 h-3" />
              <span className="text-white/60">GitUp.fun</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Documentation
            </h1>
            <p className="text-white/60 text-lg leading-relaxed max-w-2xl">
              Everything you need to know about tokenizing GitHub and GitLab repositories on Solana.
            </p>
          </div>

          {/* Overview */}
          <section id="overview" className="mb-16 scroll-mt-24">
            <h2 className="text-2xl font-semibold text-white mb-4 pb-2 border-b border-white/10">
              Overview
            </h2>
            <p className="text-white/70 leading-relaxed mb-4">
              GitUp.fun is a platform that allows anyone to create a Solana token representing a GitHub or GitLab repository. 
              Tokens are launched through <a href="https://pump.fun" target="_blank" rel="noopener noreferrer" className="text-[#00FF41] hover:underline inline-flex items-center gap-1">pump.fun<ExternalLink className="w-3 h-3" /></a>&apos;s 
              bonding curve, enabling instant liquidity and trading.
            </p>
            <p className="text-white/70 leading-relaxed mb-4">
              The platform implements an escrow system that holds creator fees until the verified repository owner claims them, 
              ensuring that the original developers can benefit even if someone else tokenizes their project first.
            </p>
            
            <div id="key-features" className="scroll-mt-24">
              <Callout type="success">
                <strong>Key feature:</strong> You don&apos;t need to own a repository to launch its token. 
                Creator fees are protected and can only be claimed by verified owners.
              </Callout>
            </div>
          </section>

          {/* Getting Started */}
          <section id="getting-started" className="mb-16 scroll-mt-24">
            <h2 className="text-2xl font-semibold text-white mb-4 pb-2 border-b border-white/10">
              Getting Started
            </h2>
            
            <h3 id="prerequisites" className="text-lg font-medium text-white mt-6 mb-3 scroll-mt-24">Prerequisites</h3>
            <ul className="space-y-2 text-white/70">
              <li className="flex items-start gap-3">
                <Check className="w-4 h-4 text-[#00FF41] mt-1 shrink-0" />
                <span>A Solana wallet (Phantom, Solflare, or any Solana-compatible wallet)</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-4 h-4 text-[#00FF41] mt-1 shrink-0" />
                <span>SOL for transaction fees (~0.02 SOL)</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-4 h-4 text-[#00FF41] mt-1 shrink-0" />
                <span>A public GitHub or GitLab repository URL to tokenize (or connect your account to select from your repos)</span>
              </li>
            </ul>

            <h3 id="quick-start" className="text-lg font-medium text-white mt-8 mb-3 scroll-mt-24">Quick Start</h3>
            <div className="space-y-4">
              {[
                { step: 1, title: 'Connect Wallet', desc: 'Click "Connect Wallet" and approve the connection request' },
                { step: 2, title: 'Select Repository', desc: 'Search any public repo by URL, or connect your GitHub/GitLab account to select from your own repositories' },
                { step: 3, title: 'Configure Token', desc: 'Set your token name, symbol, and upload artwork' },
                { step: 4, title: 'Launch', desc: 'Review details and sign the transaction to deploy' },
              ].map((item) => (
                <div key={item.step} className="flex gap-4 p-4 bg-white/[0.02] rounded-lg border border-white/5">
                  <div className="w-8 h-8 rounded-full bg-[#00FF41]/10 border border-[#00FF41]/30 flex items-center justify-center shrink-0">
                    <span className="text-[#00FF41] text-sm font-medium">{item.step}</span>
                  </div>
                  <div>
                    <h4 className="text-white font-medium mb-1">{item.title}</h4>
                    <p className="text-white/50 text-sm">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* How It Works */}
          <section id="how-it-works" className="mb-16 scroll-mt-24">
            <h2 className="text-2xl font-semibold text-white mb-4 pb-2 border-b border-white/10">
              How It Works
            </h2>
            
            <h3 id="token-creation" className="text-lg font-medium text-white mt-6 mb-3 scroll-mt-24">Token Creation</h3>
            <p className="text-white/70 leading-relaxed mb-4">
              When you tokenize a repo, GitUp.fun creates a new SPL token on Solana and initializes a 
              bonding curve through pump.fun. The token metadata (name, symbol, image, description) is 
              stored permanently on IPFS.
            </p>

            <h3 id="one-repo-one-token" className="text-lg font-medium text-white mt-8 mb-3 scroll-mt-24">One Repo, One Token</h3>
            <p className="text-white/70 leading-relaxed mb-4">
              Each GitHub or GitLab repository can only be tokenized once. The repository URL serves as a unique 
              identifier. Once a token is created for a repository, no other tokens can be launched for 
              the same repo.
            </p>

            <CodeBlock>{`Repository: github.com/facebook/react
Token Mint: 7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU
Status: TOKENIZED`}</CodeBlock>

            <Callout type="info">
              Token metadata is immutable after launch. Double-check all details before signing the transaction.
            </Callout>
          </section>

          {/* Escrow System */}
          <section id="escrow" className="mb-16 scroll-mt-24">
            <h2 className="text-2xl font-semibold text-white mb-4 pb-2 border-b border-white/10">
              Escrow System
            </h2>
            <p id="escrow-overview" className="text-white/70 leading-relaxed mb-4 scroll-mt-24">
              GitUp.fun implements an escrow mechanism to protect repository owners. When a token is 
              launched, the creator fee percentage is directed to an escrow account tied to the 
              repository, not to the token launcher.
            </p>

            <h3 id="escrow-flow" className="text-lg font-medium text-white mt-8 mb-3 scroll-mt-24">How Escrow Works</h3>
            <ol className="space-y-3 text-white/70">
              <li className="flex gap-3">
                <span className="text-[#00FF41] font-mono text-sm">1.</span>
                <span>Token is launched with creator fee set to escrow address</span>
              </li>
              <li className="flex gap-3">
                <span className="text-[#00FF41] font-mono text-sm">2.</span>
                <span>Trading fees accumulate in the escrow account</span>
              </li>
              <li className="flex gap-3">
                <span className="text-[#00FF41] font-mono text-sm">3.</span>
                <span>Repository owner verifies ownership via GitHub or GitLab OAuth</span>
              </li>
              <li className="flex gap-3">
                <span className="text-[#00FF41] font-mono text-sm">4.</span>
                <span>Verified owner can claim all accumulated fees</span>
              </li>
            </ol>

            <Callout type="warning">
              Escrow funds can only be claimed by the verified repository owner. There is no way to 
              retrieve funds without completing GitHub or GitLab authentication.
            </Callout>
          </section>

          {/* Owner Verification */}
          <section id="verification" className="mb-16 scroll-mt-24">
            <h2 className="text-2xl font-semibold text-white mb-4 pb-2 border-b border-white/10">
              Owner Verification
            </h2>
            <p className="text-white/70 leading-relaxed mb-4">
              To claim escrow fees, repository owners must verify their identity through GitHub or GitLab OAuth. 
              This process confirms that the claimant has admin or owner access to the repository.
            </p>

            <h3 id="verification-process" className="text-lg font-medium text-white mt-8 mb-3 scroll-mt-24">Verification Process</h3>
            <div className="bg-white/[0.02] rounded-lg border border-white/5 p-6 space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-6 h-6 rounded-full bg-[#00FF41]/20 flex items-center justify-center shrink-0">
                  <Zap className="w-3 h-3 text-[#00FF41]" />
                </div>
                <div>
                  <p className="text-white font-medium">Sign in with GitHub or GitLab</p>
                  <p className="text-white/50 text-sm">Authenticate using your account</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-6 h-6 rounded-full bg-[#00FF41]/20 flex items-center justify-center shrink-0">
                  <Zap className="w-3 h-3 text-[#00FF41]" />
                </div>
                <div>
                  <p className="text-white font-medium">Repository Check</p>
                  <p className="text-white/50 text-sm">System verifies your admin/owner access</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-6 h-6 rounded-full bg-[#00FF41]/20 flex items-center justify-center shrink-0">
                  <Zap className="w-3 h-3 text-[#00FF41]" />
                </div>
                <div>
                  <p className="text-white font-medium">Connect Wallet</p>
                  <p className="text-white/50 text-sm">Link your Solana wallet to receive funds</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-6 h-6 rounded-full bg-[#00FF41]/20 flex items-center justify-center shrink-0">
                  <Zap className="w-3 h-3 text-[#00FF41]" />
                </div>
                <div>
                  <p className="text-white font-medium">Claim Fees</p>
                  <p id="claiming-fees" className="text-white/50 text-sm scroll-mt-24">Withdraw accumulated escrow balance</p>
                </div>
              </div>
            </div>
          </section>

          {/* Fees */}
          <section id="fees" className="mb-16 scroll-mt-24">
            <h2 className="text-2xl font-semibold text-white mb-4 pb-2 border-b border-white/10">
              Fees & Economics
            </h2>
            
            <div id="fee-structure" className="overflow-x-auto scroll-mt-24">
              <table className="w-full text-sm my-6">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-3 px-4 text-white/60 font-medium">Fee Type</th>
                    <th className="text-left py-3 px-4 text-white/60 font-medium">Amount</th>
                    <th className="text-left py-3 px-4 text-white/60 font-medium">Recipient</th>
                  </tr>
                </thead>
                <tbody className="text-white/70">
                  <tr className="border-b border-white/5">
                    <td className="py-3 px-4">Token Launch</td>
                    <td className="py-3 px-4 font-mono text-[#00FF41]">~0.02 SOL</td>
                    <td className="py-3 px-4">Network (gas)</td>
                  </tr>
                  <tr className="border-b border-white/5">
                    <td className="py-3 px-4">Creator Fee</td>
                    <td className="py-3 px-4 font-mono text-[#00FF41]">1%</td>
                    <td className="py-3 px-4">Escrow → Verified Owner</td>
                  </tr>
                  <tr className="border-b border-white/5">
                    <td className="py-3 px-4">Trading Fee</td>
                    <td className="py-3 px-4 font-mono text-[#00FF41]">1%</td>
                    <td className="py-3 px-4">pump.fun</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* FAQ */}
          <section id="faq" className="mb-16 scroll-mt-24">
            <h2 className="text-2xl font-semibold text-white mb-4 pb-2 border-b border-white/10">
              FAQ
            </h2>
            
            <div className="space-y-6">
              {[
                {
                  q: 'Can I tokenize a repository I don\'t own?',
                  a: 'Yes. Anyone can tokenize any public repository. However, creator fees will be held in escrow until the verified owner claims them.'
                },
                {
                  q: 'What happens if the owner never claims?',
                  a: 'Escrow funds remain locked indefinitely. There is no expiration. The owner can claim at any time by verifying through GitHub or GitLab OAuth.'
                },
                {
                  q: 'Can I tokenize a private repository?',
                  a: 'No. Only public repositories can be tokenized. The repository must be accessible without authentication.'
                },
                {
                  q: 'What if someone already tokenized my repo?',
                  a: 'You can verify your ownership and claim all accumulated escrow fees. The token already exists, but the fees belong to you as the verified owner.'
                },
                {
                  q: 'Can I change the token metadata after launch?',
                  a: 'No. Token metadata is immutable and stored permanently on IPFS. Review all details carefully before launching.'
                },
              ].map((item, i) => (
                <div key={i} className="pb-6 border-b border-white/5 last:border-0">
                  <h3 className="text-white font-medium mb-2">{item.q}</h3>
                  <p className="text-white/60 text-sm leading-relaxed">{item.a}</p>
                </div>
              ))}
            </div>
          </section>

          {/* CTA */}
          <div className="mt-16 p-8 bg-gradient-to-r from-[#00FF41]/10 to-transparent rounded-xl border border-[#00FF41]/20">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">Ready to get started?</h3>
                <p className="text-white/60">Tokenize your first repo in under a minute.</p>
              </div>
              <Link
                href="/launch"
                className="inline-flex items-center gap-2 bg-[#00FF41] text-black font-semibold px-6 py-3 rounded-lg hover:bg-[#00FF41]/90 transition-colors shrink-0"
              >
                <GitBranch className="w-4 h-4" />
                Tokenize Your Repo
              </Link>
            </div>
          </div>

        </main>
      </div>
    </div>
  );
}
