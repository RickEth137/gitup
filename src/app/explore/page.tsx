'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Star, GitFork, ExternalLink, Search, Github, Twitter } from 'lucide-react';

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
  launcher: {
    githubLogin: string | null;
    githubAvatar: string | null;
  };
}

export default function ExplorePage() {
  const [launches, setLaunches] = useState<TokenLaunch[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

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

  const filteredLaunches = launches.filter((launch) => {
    const query = searchQuery.toLowerCase();
    return (
      (launch.entityName?.toLowerCase() || '').includes(query) ||
      (launch.tokenName?.toLowerCase() || '').includes(query) ||
      (launch.tokenSymbol?.toLowerCase() || '').includes(query) ||
      (launch.entityHandle?.toLowerCase() || '').includes(query)
    );
  });

  return (
    <div className="min-h-screen bg-[#0a0a0a] pt-24 pb-16 px-6">
      {/* Ambient glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 right-1/3 w-[500px] h-[500px] bg-[#00FF41]/5 rounded-full blur-[100px]" />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-3xl font-bold text-white mb-3">Explore</h1>
          <p className="text-white/50 text-sm max-w-lg">
            Discover tokenized GitHub repos and X accounts.
          </p>
        </div>

        {/* Search */}
        <div className="mb-10">
          <div className="relative max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 w-5 h-5" />
            <input
              type="text"
              placeholder="Search tokens, repos, handles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white/[0.03] border border-white/10 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-[#00FF41]/50"
            />
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="p-5 rounded-xl border border-white/5 bg-white/[0.02] animate-pulse">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-white/5" />
                  <div className="flex-1">
                    <div className="h-4 bg-white/5 rounded w-3/4 mb-2" />
                    <div className="h-3 bg-white/5 rounded w-1/2" />
                  </div>
                </div>
                <div className="h-3 bg-white/5 rounded w-full mb-2" />
                <div className="h-3 bg-white/5 rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : filteredLaunches.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-white/40 text-sm mb-6">
              {searchQuery
                ? 'No tokens match your search'
                : 'No tokens launched yet'}
            </p>
            {!searchQuery && (
              <Link href="/launch" className="inline-flex items-center gap-2 px-6 py-3 bg-[#00FF41] text-black font-semibold rounded-xl hover:bg-[#00FF41]/90 transition-all">
                Be the first to launch
              </Link>
            )}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredLaunches.map((launch) => (
              <a
                key={launch.id}
                href={`https://pump.fun/${launch.tokenMint}`}
                target="_blank"
                rel="noopener noreferrer"
                className="group p-5 rounded-xl border border-white/5 bg-white/[0.02] hover:border-[#00FF41]/20 transition-all"
              >
                <div className="flex items-center gap-3 mb-3">
                  {launch.tokenLogo ? (
                    <img
                      src={launch.tokenLogo}
                      alt={launch.tokenName}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
                      {launch.entityType === 'github' ? (
                        <Github className="w-5 h-5 text-white/40" />
                      ) : (
                        <Twitter className="w-5 h-5 text-white/40" />
                      )}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-white truncate group-hover:text-[#00FF41] transition-colors">
                      {launch.tokenName}
                    </h3>
                    <p className="text-xs text-white/40 font-mono">
                      ${launch.tokenSymbol}
                    </p>
                  </div>
                  <ExternalLink className="w-4 h-4 text-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>

                <p className="text-xs text-white/40 mb-4 line-clamp-2">
                  {launch.repoDescription || launch.entityHandle}
                </p>

                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3 text-white/30">
                    {launch.entityType === 'github' && (
                      <>
                        <span className="flex items-center gap-1">
                          <Star className="w-3 h-3" />
                          {(launch.repoStars || 0).toLocaleString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <GitFork className="w-3 h-3" />
                          {(launch.repoForks || 0).toLocaleString()}
                        </span>
                      </>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {!launch.isClaimed && (
                      <span className="px-2 py-0.5 text-[10px] rounded bg-white/5 text-white/40">
                        Unclaimed
                      </span>
                    )}
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
