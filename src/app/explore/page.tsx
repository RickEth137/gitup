'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Star, GitFork, ExternalLink, Search, Github, Twitter, Send, Globe, TrendingUp, TrendingDown } from 'lucide-react';

interface TokenLaunch {
  id: string;
  entityType: 'github' | 'twitter';
  entityHandle: string;
  entityName: string;
  entityUrl: string;
  repoStars: number | null;
  repoForks: number | null;
  repoDescription: string | null;
  twitterFollowers: number | null;
  tokenName: string;
  tokenSymbol: string;
  tokenMint: string;
  tokenLogo: string | null;
  launchedAt: string;
  isClaimed: boolean;
  twitter?: string;
  telegram?: string;
  website?: string;
  launcher: {
    githubLogin: string | null;
    githubAvatar: string | null;
  };
}

interface MarketData {
  [mint: string]: {
    priceUsd: string;
    marketCap: number;
    priceChange24h: number;
    volume24h: number;
  };
}

// Format market cap
function formatMarketCap(value: number): string {
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(2)}B`;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
  return `$${value.toFixed(0)}`;
}

// Format time ago
function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 0) return `${diffDays}d ago`;
  if (diffHours > 0) return `${diffHours}h ago`;
  if (diffMins > 0) return `${diffMins}m ago`;
  return 'Just now';
}

export default function ExplorePage() {
  const [launches, setLaunches] = useState<TokenLaunch[]>([]);
  const [marketData, setMarketData] = useState<MarketData>({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'recent' | 'marketcap' | 'stars'>('recent');

  // Fetch market data from DexScreener
  const fetchMarketData = useCallback(async (mints: string[]) => {
    if (mints.length === 0) return;

    try {
      // DexScreener allows up to 30 addresses per request
      const chunks = [];
      for (let i = 0; i < mints.length; i += 30) {
        chunks.push(mints.slice(i, i + 30));
      }

      const allData: MarketData = {};

      for (const chunk of chunks) {
        const response = await fetch(
          `https://api.dexscreener.com/latest/dex/tokens/${chunk.join(',')}`
        );
        
        if (response.ok) {
          const data = await response.json();
          
          // Process pairs and get the main pair for each token
          if (data.pairs) {
            for (const pair of data.pairs) {
              const mint = pair.baseToken?.address;
              if (mint && !allData[mint]) {
                allData[mint] = {
                  priceUsd: pair.priceUsd || '0',
                  marketCap: pair.marketCap || pair.fdv || 0,
                  priceChange24h: pair.priceChange?.h24 || 0,
                  volume24h: pair.volume?.h24 || 0,
                };
              }
            }
          }
        }
      }

      setMarketData(allData);
    } catch (error) {
      console.error('Error fetching market data:', error);
    }
  }, []);

  // Fetch launches
  useEffect(() => {
    async function fetchLaunches() {
      try {
        const response = await fetch('/api/launch?limit=50');
        const data = await response.json();
        setLaunches(data.launches || []);
      } catch (error) {
        console.error('Error fetching launches:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchLaunches();
  }, []);

  // Fetch market data when launches change
  useEffect(() => {
    if (launches.length > 0) {
      const mints = launches.map((l) => l.tokenMint).filter(Boolean);
      fetchMarketData(mints);
    }
  }, [launches, fetchMarketData]);

  // Refresh market data every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      if (launches.length > 0) {
        const mints = launches.map((l) => l.tokenMint).filter(Boolean);
        fetchMarketData(mints);
      }
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [launches, fetchMarketData]);

  // Filter and sort launches
  const filteredLaunches = launches
    .filter((launch) => {
      const query = searchQuery.toLowerCase();
      return (
        (launch.entityName?.toLowerCase() || '').includes(query) ||
        (launch.tokenName?.toLowerCase() || '').includes(query) ||
        (launch.tokenSymbol?.toLowerCase() || '').includes(query) ||
        (launch.entityHandle?.toLowerCase() || '').includes(query)
      );
    })
    .sort((a, b) => {
      if (sortBy === 'marketcap') {
        const mcA = marketData[a.tokenMint]?.marketCap || 0;
        const mcB = marketData[b.tokenMint]?.marketCap || 0;
        return mcB - mcA;
      }
      if (sortBy === 'stars') {
        return (b.repoStars || 0) - (a.repoStars || 0);
      }
      // Default: recent
      return new Date(b.launchedAt).getTime() - new Date(a.launchedAt).getTime();
    });

  return (
    <div className="min-h-screen bg-[#0a0a0a] pt-24 pb-16 px-6">
      {/* Ambient glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 right-1/3 w-[500px] h-[500px] bg-[#00FF41]/5 rounded-full blur-[100px]" />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Explore</h1>
          <p className="text-white/50 text-sm">
            Discover tokenized GitHub repos and X accounts.
          </p>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 w-5 h-5" />
            <input
              type="text"
              placeholder="Search tokens, repos, handles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white/[0.03] border border-white/10 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-[#00FF41]/50"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setSortBy('recent')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                sortBy === 'recent'
                  ? 'bg-[#00FF41] text-black'
                  : 'bg-white/5 text-white/60 hover:bg-white/10'
              }`}
            >
              Recent
            </button>
            <button
              onClick={() => setSortBy('marketcap')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                sortBy === 'marketcap'
                  ? 'bg-[#00FF41] text-black'
                  : 'bg-white/5 text-white/60 hover:bg-white/10'
              }`}
            >
              Market Cap
            </button>
            <button
              onClick={() => setSortBy('stars')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                sortBy === 'stars'
                  ? 'bg-[#00FF41] text-black'
                  : 'bg-white/5 text-white/60 hover:bg-white/10'
              }`}
            >
              Stars
            </button>
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="grid md:grid-cols-2 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="p-5 rounded-xl border border-white/10 bg-[#0d0d0d] animate-pulse">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-lg bg-white/5" />
                  <div className="flex-1">
                    <div className="h-5 bg-white/5 rounded w-1/2 mb-2" />
                    <div className="h-4 bg-white/5 rounded w-3/4" />
                  </div>
                </div>
                <div className="h-4 bg-white/5 rounded w-full mb-2" />
                <div className="h-4 bg-white/5 rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : filteredLaunches.length === 0 ? (
          <div className="text-center py-20">
            <Image src="/logo3.png" alt="" width={64} height={64} className="mx-auto mb-4 opacity-20" />
            <p className="text-white/40 text-sm mb-6">
              {searchQuery ? 'No tokens match your search' : 'No tokens launched yet'}
            </p>
            {!searchQuery && (
              <Link
                href="/launch"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#00FF41] text-black font-semibold rounded-xl hover:bg-[#00FF41]/90 transition-all"
              >
                Be the first to launch
              </Link>
            )}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {filteredLaunches.map((launch) => {
              const market = marketData[launch.tokenMint];
              const priceChange = market?.priceChange24h || 0;

              return (
                <Link
                  href={`/token/${launch.tokenMint}`}
                  key={launch.id}
                  className="rounded-xl border border-white/10 bg-[#0d0d0d] hover:border-[#00FF41]/30 transition-all overflow-hidden block"
                >
                  {/* Card Header - Repository Style */}
                  <div className="p-5">
                    <div className="flex items-start gap-4">
                      {/* Token Logo */}
                      <div className="relative shrink-0">
                        {launch.tokenLogo ? (
                          <img
                            src={launch.tokenLogo}
                            alt={launch.tokenName}
                            className="w-14 h-14 rounded-xl object-cover border border-white/10"
                          />
                        ) : (
                          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#00FF41]/20 to-[#00FF41]/5 border border-white/10 flex items-center justify-center">
                            <Github className="w-7 h-7 text-[#00FF41]/60" />
                          </div>
                        )}
                      </div>

                      {/* Title & Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="font-bold text-white text-lg leading-tight">
                              {launch.tokenName}
                            </h3>
                            <p className="text-[#00FF41] font-mono text-sm">
                              ${launch.tokenSymbol}
                            </p>
                          </div>
                          
                          {/* Market Cap Badge */}
                          {market?.marketCap ? (
                            <div className="text-right shrink-0">
                              <p className="text-white font-semibold">
                                {formatMarketCap(market.marketCap)}
                              </p>
                              <div className={`flex items-center gap-1 text-xs ${
                                priceChange >= 0 ? 'text-[#00FF41]' : 'text-red-400'
                              }`}>
                                {priceChange >= 0 ? (
                                  <TrendingUp className="w-3 h-3" />
                                ) : (
                                  <TrendingDown className="w-3 h-3" />
                                )}
                                {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(1)}%
                              </div>
                            </div>
                          ) : (
                            <div className="px-2 py-1 bg-white/5 rounded text-xs text-white/40">
                              New
                            </div>
                          )}
                        </div>

                        {/* Repo Handle */}
                        <a
                          href={launch.entityUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-white/40 hover:text-[#00FF41] text-sm mt-1 transition-colors"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Github className="w-3.5 h-3.5" />
                          {launch.entityHandle}
                        </a>
                      </div>
                    </div>

                    {/* Description */}
                    {launch.repoDescription && (
                      <p className="text-white/50 text-sm mt-4 line-clamp-2">
                        {launch.repoDescription}
                      </p>
                    )}

                    {/* Stats Row */}
                    <div className="flex items-center gap-4 mt-4 text-sm text-white/40">
                      {launch.entityType === 'github' && (
                        <>
                          <span className="flex items-center gap-1.5">
                            <Star className="w-4 h-4" />
                            {(launch.repoStars || 0).toLocaleString()}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <GitFork className="w-4 h-4" />
                            {(launch.repoForks || 0).toLocaleString()}
                          </span>
                        </>
                      )}
                      <span className="text-white/30">•</span>
                      <span>{formatTimeAgo(launch.launchedAt)}</span>
                      {!launch.isClaimed && (
                        <>
                          <span className="text-white/30">•</span>
                          <span className="text-yellow-500/80">Unclaimed</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Card Footer - Actions */}
                  <div className="px-5 py-3 border-t border-white/5 bg-white/[0.02] flex items-center justify-between">
                    {/* Social Buttons */}
                    <div className="flex items-center gap-2">
                      {launch.twitter && (
                        <a
                          href={launch.twitter.startsWith('http') ? launch.twitter : `https://twitter.com/${launch.twitter}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-lg bg-white/5 hover:bg-[#1DA1F2]/20 text-white/40 hover:text-[#1DA1F2] transition-all"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Twitter className="w-4 h-4" />
                        </a>
                      )}
                      {launch.telegram && (
                        <a
                          href={launch.telegram.startsWith('http') ? launch.telegram : `https://t.me/${launch.telegram}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-lg bg-white/5 hover:bg-[#0088cc]/20 text-white/40 hover:text-[#0088cc] transition-all"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Send className="w-4 h-4" />
                        </a>
                      )}
                      {launch.website && (
                        <a
                          href={launch.website.startsWith('http') ? launch.website : `https://${launch.website}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-all"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Globe className="w-4 h-4" />
                        </a>
                      )}
                      <a
                        href={launch.entityUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-all"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Github className="w-4 h-4" />
                      </a>
                    </div>

                    {/* Trade Button */}
                    <a
                      href={`https://pump.fun/${launch.tokenMint}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-[#00FF41] text-black font-semibold text-sm rounded-lg hover:bg-[#00FF41]/90 transition-all"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Trade
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
