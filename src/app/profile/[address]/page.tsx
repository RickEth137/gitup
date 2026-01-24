'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { 
  TokenInfo, 
  getCreatedTokens,
  getPumpFunUrl, 
  formatSol,
  BONDING_CURVE_GRADUATION_SOL 
} from '@/lib/pumpfun';

interface TokenCardProps {
  token: TokenInfo;
}

function TokenCard({ token }: TokenCardProps) {
  const progress = token.bondingCurve?.progress ?? 0;
  const isGraduated = token.bondingCurve?.complete ?? false;
  
  return (
    <Link 
      href={`/token/${token.mint}`}
      className="block border border-zinc-800 bg-zinc-950 p-5 hover:border-zinc-600 transition-colors group"
    >
      <div className="flex items-start gap-4">
        {/* Token Image */}
        <div className="w-14 h-14 bg-zinc-900 border border-zinc-800 flex-shrink-0 overflow-hidden">
          {token.image ? (
            <img 
              src={token.image} 
              alt={token.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-zinc-600 text-xl font-bold">
              {token.symbol.charAt(0)}
            </div>
          )}
        </div>

        {/* Token Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-white font-bold truncate group-hover:text-zinc-300 transition-colors">
              {token.name}
            </h3>
            <span className="text-zinc-500 text-sm">${token.symbol}</span>
          </div>
          
          <p className="text-zinc-500 text-sm line-clamp-1 mb-3">{token.description}</p>

          {/* Progress Bar */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-2 bg-zinc-900 border border-zinc-800 overflow-hidden">
              <div 
                className={`h-full ${isGraduated ? 'bg-green-500' : 'bg-white'}`}
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
            <span className={`text-xs font-mono ${isGraduated ? 'text-green-500' : 'text-zinc-400'}`}>
              {isGraduated ? '✓' : `${progress.toFixed(0)}%`}
            </span>
          </div>
        </div>

        {/* Market Cap */}
        <div className="text-right flex-shrink-0">
          <p className="text-white font-mono">
            {token.usdMarketCap ? `$${(token.usdMarketCap / 1000).toFixed(1)}K` : '-'}
          </p>
          <p className="text-zinc-500 text-xs">mcap</p>
        </div>
      </div>
    </Link>
  );
}

export default function ProfilePage() {
  const params = useParams();
  const address = params.address as string;
  
  const [tokens, setTokens] = useState<TokenInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTokens() {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/tokens?wallet=${address}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch tokens');
        }
        
        const data = await response.json();
        setTokens(data.tokens || []);
      } catch (err: any) {
        setError(err.message || 'Failed to load profile');
      } finally {
        setIsLoading(false);
      }
    }

    if (address) {
      fetchTokens();
    }
  }, [address]);

  const shortenAddress = (addr: string) => `${addr.slice(0, 4)}...${addr.slice(-4)}`;

  // Calculate stats
  const totalTokens = tokens.length;
  const graduatedTokens = tokens.filter(t => t.bondingCurve?.complete).length;

  return (
    <div className="min-h-screen">
      <main className="max-w-4xl mx-auto px-4 py-12">
        {/* Profile Header */}
        <div className="border border-zinc-800 bg-zinc-950 p-8 mb-8">
          <div className="flex items-center gap-6">
            {/* Avatar Placeholder */}
            <div className="w-20 h-20 bg-zinc-900 border border-zinc-800 flex items-center justify-center">
              <svg className="w-10 h-10 text-zinc-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>

            <div className="flex-1">
              <h1 className="text-2xl font-bold text-white mb-2 font-mono">
                {shortenAddress(address)}
              </h1>
              
              <div className="flex items-center gap-4">
                <a
                  href={`https://solscan.io/account/${address}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-zinc-500 hover:text-white text-sm transition-colors"
                >
                  View on Solscan ↗
                </a>
                <button
                  onClick={() => navigator.clipboard.writeText(address)}
                  className="text-zinc-500 hover:text-white text-sm transition-colors"
                >
                  Copy Address
                </button>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-zinc-800">
            <div>
              <p className="text-zinc-500 text-xs mb-1">GitUps Launched</p>
              <p className="text-white font-mono text-2xl">{totalTokens}</p>
            </div>
            <div>
              <p className="text-zinc-500 text-xs mb-1">Graduated</p>
              <p className="text-green-500 font-mono text-2xl">{graduatedTokens}</p>
            </div>
          </div>
        </div>

        {/* Tokens Section */}
        <div className="mb-6">
          <h2 className="text-white text-xl font-bold mb-4">Launched GitUps</h2>
        </div>

        {isLoading ? (
          <div className="border border-zinc-800 bg-zinc-950 p-12 text-center">
            <div className="inline-block animate-spin h-8 w-8 border-2 border-white border-t-transparent rounded-full" />
            <p className="text-zinc-500 mt-4">Loading tokens...</p>
          </div>
        ) : error ? (
          <div className="border border-zinc-800 bg-zinc-950 p-12 text-center">
            <p className="text-red-500">{error}</p>
          </div>
        ) : tokens.length === 0 ? (
          <div className="border border-zinc-800 bg-zinc-950 p-12 text-center">
            <p className="text-zinc-500 mb-4">This wallet hasn't launched any GitUps yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {tokens.map((token) => (
              <TokenCard key={token.mint} token={token} />
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-900 py-8 mt-12">
        <div className="max-w-4xl mx-auto px-4 text-center text-zinc-600 text-sm">
          <p>gitup.fun — Tokenize GitHub repos on Solana</p>
        </div>
      </footer>
    </div>
  );
}
