'use client';

import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useConnection } from '@solana/wallet-adapter-react';
import Link from 'next/link';
import { 
  TokenInfo, 
  claimCreatorFees, 
  getPumpFunUrl,
  formatSol,
  BONDING_CURVE_GRADUATION_SOL
} from '@/lib/pumpfun';

interface ProjectCardProps {
  token: TokenInfo;
  onClaimFees?: () => void;
}

function ProjectCard({ token, onClaimFees }: ProjectCardProps) {
  const progress = token.bondingCurve?.progress ?? 0;
  const isGraduated = token.bondingCurve?.complete ?? false;
  const marketCapSol = token.bondingCurve?.marketCapSol ?? 0;
  
  return (
    <div className="border border-zinc-800 bg-zinc-950 hover:border-zinc-700 transition-colors">
      {/* Clickable Header */}
      <Link href={`/token/${token.mint}`} className="block p-6">
        <div className="flex items-start gap-4 mb-6">
          {/* Token Image */}
          <div className="w-16 h-16 bg-zinc-900 border border-zinc-800 flex-shrink-0 overflow-hidden">
            {token.image ? (
              <img 
                src={token.image} 
                alt={token.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-zinc-600 text-2xl font-bold">
                {token.symbol.charAt(0)}
              </div>
            )}
          </div>
          
          {/* Token Info */}
          <div className="flex-1 min-w-0">
            <h3 className="text-white font-bold text-lg truncate hover:text-zinc-300 transition-colors">{token.name}</h3>
            <p className="text-zinc-500 text-sm">${token.symbol}</p>
            <p className="text-zinc-600 text-xs mt-1 line-clamp-2">{token.description}</p>
          </div>
        </div>

        {/* Bonding Curve Progress */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-zinc-400 text-sm">Bonding Curve</span>
            <span className="text-white text-sm font-mono">
              {isGraduated ? (
                <span className="text-green-500">✓ Graduated</span>
              ) : (
                `${progress.toFixed(1)}%`
              )}
            </span>
          </div>
          
          {/* Progress Bar */}
          <div className="h-4 bg-zinc-900 border border-zinc-800 overflow-hidden">
            <div 
              className="h-full transition-all duration-500 ease-out relative"
              style={{ width: `${Math.min(progress, 100)}%` }}
            >
              {/* Striped pattern */}
              <div 
                className={`absolute inset-0 ${isGraduated ? 'bg-green-500' : 'bg-white'}`}
                style={{
                  backgroundImage: isGraduated 
                    ? 'none'
                    : 'repeating-linear-gradient(90deg, transparent, transparent 4px, rgba(0,0,0,0.3) 4px, rgba(0,0,0,0.3) 8px)',
                }}
              />
            </div>
          </div>
        
        {/* Progress Details */}
        <div className="flex items-center justify-between mt-2 text-xs text-zinc-600">
          <span>{formatSol(marketCapSol)} SOL</span>
          <span>{formatSol(BONDING_CURVE_GRADUATION_SOL)} SOL to graduate</span>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-4 pt-4 mt-4 border-t border-zinc-800">
          <div>
            <p className="text-zinc-500 text-xs mb-1">Market Cap</p>
            <p className="text-white font-mono text-sm">
              {token.usdMarketCap ? `$${(token.usdMarketCap / 1000).toFixed(1)}K` : '-'}
            </p>
          </div>
          <div>
            <p className="text-zinc-500 text-xs mb-1">Replies</p>
            <p className="text-white font-mono text-sm">{token.replyCount ?? 0}</p>
          </div>
          <div>
            <p className="text-zinc-500 text-xs mb-1">Status</p>
            <p className={`font-mono text-sm ${isGraduated ? 'text-green-500' : 'text-yellow-500'}`}>
              {isGraduated ? 'Raydium' : 'Active'}
            </p>
          </div>
        </div>
      </Link>

      {/* Quick Actions (outside the link) */}
      <div className="flex gap-2 px-6 pb-6">
        <a
          href={getPumpFunUrl(token.mint)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 text-center text-xs text-zinc-500 hover:text-white border border-zinc-800 px-3 py-2 hover:border-zinc-600 transition-colors"
        >
          Trade on pump.fun ↗
        </a>
        <a
          href={`https://solscan.io/token/${token.mint}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 text-center text-xs text-zinc-500 hover:text-white border border-zinc-800 px-3 py-2 hover:border-zinc-600 transition-colors"
        >
          Solscan ↗
        </a>
      </div>
    </div>
  );
}

interface CreatorFeesBoxProps {
  onClaim: () => Promise<void>;
  isLoading: boolean;
}

function CreatorFeesBox({ onClaim, isLoading }: CreatorFeesBoxProps) {
  return (
    <div className="border border-zinc-800 bg-zinc-950 p-6">
      <h3 className="text-white font-bold text-lg mb-4">Creator Fees</h3>
      
      <div className="space-y-4">
        <div className="p-4 bg-zinc-900 border border-zinc-800">
          <p className="text-zinc-500 text-xs mb-1">Available to Claim</p>
          <p className="text-white font-mono text-2xl">
            — SOL
          </p>
          <p className="text-zinc-600 text-xs mt-1">
            Fees are calculated from trading volume on your tokens
          </p>
        </div>

        <button
          onClick={onClaim}
          disabled={isLoading}
          className="w-full py-3 bg-white text-black font-bold hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Claiming...
            </span>
          ) : (
            'Claim All Fees'
          )}
        </button>

        <p className="text-zinc-600 text-xs text-center">
          pump.fun claims all creator fees at once
        </p>
      </div>
    </div>
  );
}

export function ProjectTracker() {
  const { publicKey, signTransaction } = useWallet();
  const { connection } = useConnection();
  const [tokens, setTokens] = useState<TokenInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isClaiming, setIsClaiming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTokens() {
      if (!publicKey) {
        setTokens([]);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetch(`/api/tokens?wallet=${publicKey.toBase58()}`);
        const data = await response.json();
        
        if (data.tokens) {
          setTokens(data.tokens);
        }
      } catch (err) {
        console.error('Error fetching tokens:', err);
        setError('Failed to load your tokens');
      } finally {
        setIsLoading(false);
      }
    }

    fetchTokens();
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchTokens, 30000);
    return () => clearInterval(interval);
  }, [publicKey]);

  const handleClaimFees = async () => {
    if (!publicKey || !signTransaction) return;

    try {
      setIsClaiming(true);
      const signature = await claimCreatorFees(
        { publicKey, signTransaction },
        connection
      );
      console.log('Fees claimed:', signature);
      // Could show a success toast here
    } catch (err: any) {
      console.error('Error claiming fees:', err);
      setError(err.message || 'Failed to claim fees');
    } finally {
      setIsClaiming(false);
    }
  };

  if (!publicKey) {
    return (
      <div className="border border-zinc-800 bg-zinc-950 p-12 text-center">
        <p className="text-zinc-500 mb-4">Connect your wallet to view your launched tokens</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="border border-zinc-800 bg-zinc-950 p-12 text-center">
        <div className="inline-block animate-spin h-8 w-8 border-2 border-white border-t-transparent rounded-full" />
        <p className="text-zinc-500 mt-4">Loading your tokens...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="border border-zinc-800 bg-zinc-950 p-12 text-center">
        <p className="text-red-500 mb-4">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="text-white underline hover:no-underline"
        >
          Retry
        </button>
      </div>
    );
  }

  if (tokens.length === 0) {
    return (
      <div className="border border-zinc-800 bg-zinc-950 p-12 text-center">
        <p className="text-zinc-500 mb-4">You haven't launched any tokens yet</p>
        <a 
          href="/launch" 
          className="inline-block bg-white text-black px-6 py-3 font-bold hover:bg-zinc-200 transition-colors"
        >
          Launch Your First Token
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Creator Fees */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <h2 className="text-white text-2xl font-bold mb-2">Your Launched Tokens</h2>
          <p className="text-zinc-500">Track bonding curve progress and market performance</p>
        </div>
        <div>
          <CreatorFeesBox onClaim={handleClaimFees} isLoading={isClaiming} />
        </div>
      </div>

      {/* Token Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {tokens.map((token) => (
          <ProjectCard key={token.mint} token={token} />
        ))}
      </div>
    </div>
  );
}

export default ProjectTracker;
