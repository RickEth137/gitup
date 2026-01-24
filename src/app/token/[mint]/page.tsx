'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { 
  TokenInfo, 
  getPumpFunUrl, 
  formatSol,
  BONDING_CURVE_GRADUATION_SOL 
} from '@/lib/pumpfun';

export default function TokenPage() {
  const params = useParams();
  const mint = params.mint as string;
  
  const [token, setToken] = useState<TokenInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchToken() {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/tokens?mint=${mint}`);
        
        if (!response.ok) {
          throw new Error('Token not found');
        }
        
        const data = await response.json();
        setToken(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load token');
      } finally {
        setIsLoading(false);
      }
    }

    if (mint) {
      fetchToken();
    }
  }, [mint]);

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <main className="max-w-4xl mx-auto px-4 py-20">
          <div className="flex items-center justify-center">
            <div className="animate-spin h-8 w-8 border-2 border-white border-t-transparent rounded-full" />
          </div>
        </main>
      </div>
    );
  }

  if (error || !token) {
    return (
      <div className="min-h-screen">
        <main className="max-w-4xl mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl text-white mb-4">GitUp Not Found</h1>
          <p className="text-zinc-500 mb-8">{error || 'This GitUp does not exist'}</p>
          <Link href="/explore" className="text-white underline hover:no-underline">
            Explore GitUps
          </Link>
        </main>
      </div>
    );
  }

  const progress = token.bondingCurve?.progress ?? 0;
  const isGraduated = token.bondingCurve?.complete ?? false;
  const marketCapSol = token.bondingCurve?.marketCapSol ?? 0;

  return (
    <div className="min-h-screen">
      <main className="max-w-4xl mx-auto px-4 py-12">
        {/* Back Link */}
        <Link 
          href="/explore" 
          className="inline-flex items-center gap-2 text-zinc-500 hover:text-white mb-8 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Explore
        </Link>

        {/* Token Header */}
        <div className="border border-zinc-800 bg-zinc-950 p-8 mb-6">
          <div className="flex items-start gap-6">
            {/* Token Image */}
            <div className="w-24 h-24 bg-zinc-900 border border-zinc-800 flex-shrink-0 overflow-hidden">
              {token.image ? (
                <img 
                  src={token.image} 
                  alt={token.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-zinc-600 text-3xl font-bold">
                  {token.symbol.charAt(0)}
                </div>
              )}
            </div>

            {/* Token Info */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-white">{token.name}</h1>
                <span className="text-zinc-500 text-xl">${token.symbol}</span>
              </div>
              
              <p className="text-zinc-400 mb-4 max-w-2xl">{token.description}</p>

              {/* Creator */}
              <Link 
                href={`/profile/${token.creator}`}
                className="inline-flex items-center gap-2 text-zinc-500 hover:text-white transition-colors text-sm"
              >
                <span>Created by</span>
                <span className="font-mono">{token.creator.slice(0, 4)}...{token.creator.slice(-4)}</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="border border-zinc-800 bg-zinc-950 p-4">
            <p className="text-zinc-500 text-xs mb-1">Market Cap</p>
            <p className="text-white font-mono text-xl">
              {token.usdMarketCap ? `$${(token.usdMarketCap / 1000).toFixed(1)}K` : `${formatSol(marketCapSol)} SOL`}
            </p>
          </div>
          <div className="border border-zinc-800 bg-zinc-950 p-4">
            <p className="text-zinc-500 text-xs mb-1">Bonding Curve</p>
            <p className={`font-mono text-xl ${isGraduated ? 'text-green-500' : 'text-white'}`}>
              {isGraduated ? 'Graduated' : `${progress.toFixed(1)}%`}
            </p>
          </div>
          <div className="border border-zinc-800 bg-zinc-950 p-4">
            <p className="text-zinc-500 text-xs mb-1">Status</p>
            <p className={`font-mono text-xl ${isGraduated ? 'text-green-500' : 'text-yellow-500'}`}>
              {isGraduated ? 'On Raydium' : 'Active'}
            </p>
          </div>
          <div className="border border-zinc-800 bg-zinc-950 p-4">
            <p className="text-zinc-500 text-xs mb-1">Replies</p>
            <p className="text-white font-mono text-xl">{token.replyCount ?? 0}</p>
          </div>
        </div>

        {/* Bonding Curve Progress */}
        <div className="border border-zinc-800 bg-zinc-950 p-6 mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-white font-bold">Bonding Curve Progress</h2>
            <span className="text-zinc-400 text-sm">
              {formatSol(marketCapSol)} / {BONDING_CURVE_GRADUATION_SOL} SOL
            </span>
          </div>
          
          <div className="h-6 bg-zinc-900 border border-zinc-800 overflow-hidden mb-3">
            <div 
              className="h-full transition-all duration-500 ease-out relative"
              style={{ width: `${Math.min(progress, 100)}%` }}
            >
              <div 
                className={`absolute inset-0 ${isGraduated ? 'bg-green-500' : 'bg-white'}`}
                style={{
                  backgroundImage: isGraduated 
                    ? 'none'
                    : 'repeating-linear-gradient(90deg, transparent, transparent 6px, rgba(0,0,0,0.3) 6px, rgba(0,0,0,0.3) 12px)',
                }}
              />
            </div>
          </div>

          <p className="text-zinc-500 text-sm">
            {isGraduated 
              ? '✓ This token has graduated to Raydium and is now tradeable on DEXs'
              : `When the bonding curve reaches ${BONDING_CURVE_GRADUATION_SOL} SOL, liquidity will be deposited to Raydium`
            }
          </p>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <a
            href={getPumpFunUrl(token.mint)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 py-4 bg-white text-black font-bold hover:bg-zinc-200 transition-colors"
          >
            Trade on pump.fun
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>

          <a
            href={`https://solscan.io/token/${token.mint}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 py-4 border border-zinc-800 text-white font-bold hover:border-zinc-600 transition-colors"
          >
            View on Solscan
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>

          <button
            onClick={() => {
              navigator.clipboard.writeText(token.mint);
            }}
            className="flex items-center justify-center gap-2 py-4 border border-zinc-800 text-white font-bold hover:border-zinc-600 transition-colors"
          >
            Copy Address
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </button>
        </div>

        {/* Contract Address */}
        <div className="border border-zinc-800 bg-zinc-950 p-6">
          <h2 className="text-white font-bold mb-3">Contract Address</h2>
          <p className="font-mono text-zinc-400 text-sm break-all select-all">{token.mint}</p>
        </div>
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
