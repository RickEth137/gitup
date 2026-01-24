'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Copy, ExternalLink, Check, Twitter, GitBranch } from 'lucide-react';
import { 
  TokenInfo, 
  getCreatedTokens,
  getPumpFunUrl, 
  formatSol,
  BONDING_CURVE_GRADUATION_SOL 
} from '@/lib/pumpfun';

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

interface TokenCardProps {
  token: TokenInfo;
}

function TokenCard({ token }: TokenCardProps) {
  const progress = token.bondingCurve?.progress ?? 0;
  const isGraduated = token.bondingCurve?.complete ?? false;
  
  return (
    <Link 
      href={`/token/${token.mint}`}
      className="block border border-white/10 bg-white/[0.02] rounded-xl p-5 hover:border-[#00FF41]/50 hover:bg-white/[0.04] transition-all group"
    >
      <div className="flex items-start gap-4">
        {/* Token Image */}
        <div className="w-14 h-14 bg-black/50 border border-white/10 rounded-lg flex-shrink-0 overflow-hidden">
          {token.image ? (
            <img 
              src={token.image} 
              alt={token.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white/30 text-xl font-bold">
              {token.symbol.charAt(0)}
            </div>
          )}
        </div>

        {/* Token Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-white font-semibold truncate group-hover:text-[#00FF41] transition-colors">
              {token.name}
            </h3>
            <span className="text-white/40 text-sm">${token.symbol}</span>
          </div>
          
          <p className="text-white/40 text-sm line-clamp-1 mb-3">{token.description}</p>

          {/* Progress Bar */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-2 bg-black/50 border border-white/10 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full ${isGraduated ? 'bg-[#00FF41]' : 'bg-[#00FF41]/60'}`}
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
            <span className={`text-xs font-mono ${isGraduated ? 'text-[#00FF41]' : 'text-white/50'}`}>
              {isGraduated ? '✓ Graduated' : `${progress.toFixed(0)}%`}
            </span>
          </div>
        </div>

        {/* Market Cap */}
        <div className="text-right flex-shrink-0">
          <p className="text-white font-mono">
            {token.usdMarketCap ? `$${(token.usdMarketCap / 1000).toFixed(1)}K` : '-'}
          </p>
          <p className="text-white/40 text-xs">mcap</p>
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
  const [copied, setCopied] = useState(false);

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
  
  const handleCopy = () => {
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareTwitter = () => {
    const text = `Check out my GitUp.fun profile! 🚀\n\nI've tokenized ${tokens.length} repositories on Solana.\n\nhttps://gitup.fun/profile/${address}`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank');
  };

  // Calculate stats
  const totalTokens = tokens.length;
  const graduatedTokens = tokens.filter(t => t.bondingCurve?.complete).length;

  return (
    <div className="min-h-screen bg-[#0a0a0a] relative">
      <StarParticles />
      
      <main className="max-w-5xl mx-auto px-4 pt-20 pb-12 relative z-10">
        
        {/* Profile Cards Container */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
          
          {/* Left Card - Profile Display */}
          <div className="border border-[#00FF41]/20 bg-[#0d0d0d] rounded-2xl p-6 relative overflow-hidden">
            {/* GitUp.fun badge */}
            <div className="flex items-center gap-2 mb-6">
              <div className="w-7 h-7 bg-[#00FF41] rounded-lg flex items-center justify-center">
                <GitBranch className="w-4 h-4 text-black" />
              </div>
              <span className="text-white font-bold text-lg tracking-wide">GITUP.FUN</span>
            </div>
            
            {/* Avatar */}
            <div className="w-full aspect-square max-w-[280px] mx-auto mb-6 rounded-xl overflow-hidden border border-[#00FF41]/30 relative" style={{ background: 'linear-gradient(135deg, #00FF41 0%, #003d10 25%, #001a08 50%, #003d10 75%, #00FF41 100%)' }}>
              {/* Inner dark area */}
              <div className="absolute inset-3 rounded-lg bg-[#0a0a0a]/90 flex items-center justify-center">
                <div className="w-28 h-28 rounded-full border border-white/10 flex items-center justify-center">
                  <svg className="w-14 h-14 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              </div>
              {/* Decorative corner dot */}
              <div className="absolute top-3 right-3 w-2.5 h-2.5 bg-[#00FF41] rounded-full" />
            </div>
            
            {/* Username/Address Button */}
            <button 
              onClick={handleCopy}
              className="w-full max-w-[280px] mx-auto flex items-center justify-center gap-2 bg-[#00FF41] text-black font-bold py-3.5 px-6 rounded-full hover:bg-[#00FF41]/90 transition-colors text-base"
            >
              <span className="font-mono">@{shortenAddress(address)}</span>
            </button>
            
            {/* Stats row */}
            <div className="flex justify-center items-center gap-12 mt-8 max-w-[280px] mx-auto">
              <div className="text-center">
                <p className="text-white/50 text-sm mb-1">GitUps</p>
                <p className="text-white font-bold text-lg">{totalTokens}</p>
              </div>
              <div className="w-px h-10 bg-white/10" />
              <div className="text-center">
                <p className="text-white/50 text-sm mb-1">Graduated</p>
                <p className="text-[#00FF41] font-bold text-lg">{graduatedTokens}</p>
              </div>
            </div>
            
            {/* Social Icons */}
            <div className="flex justify-center gap-4 mt-8">
              <button 
                onClick={handleShareTwitter}
                className="w-11 h-11 rounded-full border border-white/20 bg-transparent flex items-center justify-center hover:border-[#00FF41] hover:bg-[#00FF41]/10 transition-all"
              >
                <Twitter className="w-5 h-5 text-white/70" />
              </button>
              <button 
                onClick={handleCopy}
                className="w-11 h-11 rounded-full border border-white/20 bg-transparent flex items-center justify-center hover:border-[#00FF41] hover:bg-[#00FF41]/10 transition-all"
              >
                <Copy className="w-5 h-5 text-white/70" />
              </button>
              <a
                href={`https://solscan.io/account/${address}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-11 h-11 rounded-full border border-white/20 bg-transparent flex items-center justify-center hover:border-[#00FF41] hover:bg-[#00FF41]/10 transition-all"
              >
                <ExternalLink className="w-5 h-5 text-white/70" />
              </a>
            </div>
          </div>
          
          {/* Right Card - Stats & Actions */}
          <div className="space-y-4">
            {/* Stats Card */}
            <div className="border border-[#00FF41]/20 bg-[#0d0d0d] rounded-2xl p-5">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-[#00FF41]/10 border border-[#00FF41]/40 flex items-center justify-center">
                    <GitBranch className="w-5 h-5 text-[#00FF41]" />
                  </div>
                  <div>
                    <p className="text-white font-semibold">{shortenAddress(address)}</p>
                    <p className="text-white/50 text-sm">{totalTokens} repositories tokenized</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[#00FF41] text-2xl font-bold">#-</p>
                  <p className="text-white/50 text-xs">Ranking</p>
                </div>
              </div>
              
              {/* Progress bar for graduated */}
              <div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-white/50">Graduation rate</span>
                  <span className="text-[#00FF41] font-medium">{totalTokens > 0 ? Math.round((graduatedTokens / totalTokens) * 100) : 0}%</span>
                </div>
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-[#00FF41] rounded-full transition-all"
                    style={{ width: `${totalTokens > 0 ? (graduatedTokens / totalTokens) * 100 : 0}%` }}
                  />
                </div>
              </div>
            </div>
            
            {/* Wallet Address Card */}
            <div className="border border-[#00FF41]/20 bg-[#0d0d0d] rounded-2xl p-5">
              <p className="text-white/60 text-sm mb-4">Wallet Address</p>
              
              <div className="flex items-center gap-2 bg-black/50 rounded-xl p-3 border border-white/10">
                <code className="flex-1 text-white/70 text-sm font-mono truncate">{address}</code>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 transition-colors flex-shrink-0"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 text-[#00FF41]" />
                      <span className="text-[#00FF41] text-xs font-medium">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-white/60" />
                      <span className="text-white/60 text-xs">Copy</span>
                    </>
                  )}
                </button>
              </div>
              
              {/* Share button */}
              <button
                onClick={handleShareTwitter}
                className="w-full mt-4 flex items-center justify-center gap-2 bg-[#00FF41] text-black font-bold py-3.5 rounded-xl hover:bg-[#00FF41]/90 transition-colors text-base"
              >
                Share on
                <Twitter className="w-5 h-5" />
              </button>
            </div>
            
            {/* Quick Actions */}
            <div className="border border-[#00FF41]/20 bg-[#0d0d0d] rounded-2xl p-5">
              <p className="text-white/60 text-sm mb-4">Quick Actions</p>
              <div className="grid grid-cols-2 gap-3">
                <Link
                  href="/launch"
                  className="flex items-center justify-center gap-2 bg-[#00FF41] text-black font-bold py-3.5 rounded-xl hover:bg-[#00FF41]/90 transition-colors"
                >
                  <GitBranch className="w-5 h-5" />
                  Tokenize
                </Link>
                <Link
                  href="/explore"
                  className="flex items-center justify-center gap-2 bg-white/5 border border-white/20 text-white/80 font-semibold py-3.5 rounded-xl hover:bg-white/10 transition-colors"
                >
                  Explore
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Tokens Section */}
        <div className="mb-6">
          <h2 className="text-white text-xl font-bold mb-4">Launched GitUps</h2>
        </div>

        {isLoading ? (
          <div className="border border-white/10 bg-white/[0.02] rounded-2xl p-12 text-center">
            <div className="inline-block animate-spin h-8 w-8 border-2 border-[#00FF41] border-t-transparent rounded-full" />
            <p className="text-white/40 mt-4">Loading tokens...</p>
          </div>
        ) : error ? (
          <div className="border border-white/10 bg-white/[0.02] rounded-2xl p-12 text-center">
            <p className="text-red-400">{error}</p>
          </div>
        ) : tokens.length === 0 ? (
          <div className="border border-white/10 bg-white/[0.02] rounded-2xl p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
              <GitBranch className="w-8 h-8 text-white/20" />
            </div>
            <p className="text-white/40 mb-4">No GitUps launched yet</p>
            <Link
              href="/launch"
              className="inline-flex items-center gap-2 bg-[#00FF41] text-black font-semibold px-6 py-2.5 rounded-lg hover:bg-[#00FF41]/90 transition-colors"
            >
              <GitBranch className="w-4 h-4" />
              Tokenize Your First Repo
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {tokens.map((token) => (
              <TokenCard key={token.mint} token={token} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
