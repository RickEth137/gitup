import Link from 'next/link';
import { ExternalLink } from 'lucide-react';

export default function DocsPage() {
  return (
    <div className="min-h-screen py-16 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-16">
          <p className="text-xs text-muted uppercase tracking-wider mb-3">Guide</p>
          <h1 className="text-3xl font-light mb-3">Documentation</h1>
          <p className="text-secondary text-sm">
            Everything you need to know about tokenizing repositories.
          </p>
        </div>

        {/* Quick Start */}
        <section className="mb-16">
          <h2 className="text-xs text-muted uppercase tracking-wider mb-6">Quick Start</h2>
          <div className="card">
            <ol className="space-y-6">
              <li className="flex gap-4">
                <span className="text-xs text-muted font-mono">01</span>
                <div>
                  <h3 className="font-medium text-sm mb-1">Connect Accounts</h3>
                  <p className="text-muted text-xs">
                    Link your GitHub account for verification and Solana wallet for transactions.
                  </p>
                </div>
              </li>
              <li className="flex gap-4">
                <span className="text-xs text-muted font-mono">02</span>
                <div>
                  <h3 className="font-medium text-sm mb-1">Select Repository</h3>
                  <p className="text-muted text-xs">
                    Choose a public repository you own with admin access.
                  </p>
                </div>
              </li>
              <li className="flex gap-4">
                <span className="text-xs text-muted font-mono">03</span>
                <div>
                  <h3 className="font-medium text-sm mb-1">Brand Token</h3>
                  <p className="text-muted text-xs">
                    Add name, symbol, description, and logo. Stored permanently on IPFS.
                  </p>
                </div>
              </li>
              <li className="flex gap-4">
                <span className="text-xs text-muted font-mono">04</span>
                <div>
                  <h3 className="font-medium text-sm mb-1">Launch</h3>
                  <p className="text-muted text-xs">
                    Sign the transaction. Your token goes live on pump.fun instantly.
                  </p>
                </div>
              </li>
            </ol>
          </div>
        </section>

        {/* How It Works */}
        <section className="mb-16">
          <h2 className="text-xs text-muted uppercase tracking-wider mb-6">How It Works</h2>
          <div className="space-y-3">
            <div className="card">
              <h3 className="font-medium text-sm mb-2">Proof of Ownership</h3>
              <p className="text-muted text-xs">
                GitHub OAuth verifies admin access to the repository. Only owners can tokenize.
              </p>
            </div>
            <div className="card">
              <h3 className="font-medium text-sm mb-2">IPFS Storage</h3>
              <p className="text-muted text-xs">
                Metadata is uploaded to IPFS via NFT.Storage for permanent, decentralized storage.
              </p>
            </div>
            <div className="card">
              <h3 className="font-medium text-sm mb-2">pump.fun Integration</h3>
              <p className="text-muted text-xs">
                Direct interaction with pump.fun's bonding curve program. Automatic liquidity.
              </p>
            </div>
            <div className="card">
              <h3 className="font-medium text-sm mb-2">One Repo = One Token</h3>
              <p className="text-muted text-xs">
                Each repository can only be tokenized once. No duplicates.
              </p>
            </div>
          </div>
        </section>

        {/* Security */}
        <section className="mb-16">
          <h2 className="text-xs text-muted uppercase tracking-wider mb-6">Security</h2>
          <div className="card">
            <ul className="space-y-4 text-xs">
              <li className="flex gap-3">
                <span className="text-muted">✓</span>
                <span className="text-muted">
                  <span className="text-primary">Account age verification</span> — GitHub accounts must be 30+ days old
                </span>
              </li>
              <li className="flex gap-3">
                <span className="text-muted">✓</span>
                <span className="text-muted">
                  <span className="text-primary">No private keys</span> — Transactions signed locally in your wallet
                </span>
              </li>
              <li className="flex gap-3">
                <span className="text-muted">✓</span>
                <span className="text-muted">
                  <span className="text-primary">Open source</span> — Audit the code yourself
                </span>
              </li>
              <li className="flex gap-3">
                <span className="text-muted">✓</span>
                <span className="text-muted">
                  <span className="text-primary">Direct program interaction</span> — No fund custody
                </span>
              </li>
            </ul>
          </div>
        </section>

        {/* FAQ */}
        <section className="mb-16">
          <h2 className="text-xs text-muted uppercase tracking-wider mb-6">FAQ</h2>
          <div className="space-y-3">
            {[
              {
                q: 'How much does it cost?',
                a: '~0.03 SOL for account rent and transaction fees.',
              },
              {
                q: 'Can I tokenize private repos?',
                a: 'No, only public repositories for transparency.',
              },
              {
                q: 'What happens after launch?',
                a: 'Token is live on pump.fun. Anyone can trade via bonding curve.',
              },
              {
                q: 'Can I update metadata later?',
                a: 'No, token metadata is immutable. Verify before launching.',
              },
              {
                q: 'What if someone tries to tokenize my repo?',
                a: 'Only users with admin access can tokenize a repository.',
              },
              {
                q: 'Mainnet or devnet?',
                a: 'Both supported. Use mainnet for real launches, devnet for testing.',
              },
            ].map((item, i) => (
              <div key={i} className="card">
                <h3 className="font-medium text-sm mb-1">{item.q}</h3>
                <p className="text-muted text-xs">{item.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Resources */}
        <section className="mb-16">
          <h2 className="text-xs text-muted uppercase tracking-wider mb-6">Resources</h2>
          <div className="grid md:grid-cols-2 gap-3">
            {[
              { name: 'pump.fun', url: 'https://pump.fun' },
              { name: 'Solana', url: 'https://solana.com' },
              { name: 'NFT.Storage', url: 'https://nft.storage' },
              { name: 'GitHub', url: 'https://github.com/gitfun' },
            ].map((link) => (
              <a
                key={link.name}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="card hover:border-border-light transition-colors flex items-center justify-between text-sm"
              >
                <span>{link.name}</span>
                <ExternalLink className="w-3.5 h-3.5 text-muted" />
              </a>
            ))}
          </div>
        </section>

        {/* CTA */}
        <div className="text-center">
          <Link href="/launch" className="btn-primary text-sm">
            Launch Your Token →
          </Link>
        </div>
      </div>
    </div>
  );
}
