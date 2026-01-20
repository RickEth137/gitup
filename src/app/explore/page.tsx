'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Star, GitFork, ExternalLink, Search } from 'lucide-react';

interface TokenizedRepo {
  id: string;
  repoName: string;
  repoFullName: string;
  repoDescription: string | null;
  repoUrl: string;
  repoStars: number;
  repoForks: number;
  tokenName: string;
  tokenSymbol: string;
  tokenMint: string;
  logoUri: string | null;
  launchedAt: string;
  user: {
    githubLogin: string;
    avatarUrl: string | null;
  };
}

export default function ExplorePage() {
  const [launches, setLaunches] = useState<TokenizedRepo[]>([]);
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

  const filteredLaunches = launches.filter(
    (launch) =>
      launch.repoName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      launch.tokenName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      launch.tokenSymbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      launch.user.githubLogin.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen py-16 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <p className="text-xs text-muted uppercase tracking-wider mb-3">Browse</p>
          <h1 className="text-3xl font-light mb-3">Tokenized Repositories</h1>
          <p className="text-secondary text-sm max-w-lg">
            Discover repositories tokenized by developers on Solana.
          </p>
        </div>

        {/* Search */}
        <div className="mb-10">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted w-4 h-4" />
            <input
              type="text"
              placeholder="Search repos, tokens, developers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input pl-10 text-sm"
            />
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="card animate-pulse">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-surface-light" />
                  <div className="flex-1">
                    <div className="h-4 bg-surface-light rounded w-3/4 mb-2" />
                    <div className="h-3 bg-surface-light rounded w-1/2" />
                  </div>
                </div>
                <div className="h-3 bg-surface-light rounded w-full mb-2" />
                <div className="h-3 bg-surface-light rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : filteredLaunches.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted text-sm mb-6">
              {searchQuery
                ? 'No repositories match your search'
                : 'No tokenized repositories yet'}
            </p>
            {!searchQuery && (
              <Link href="/launch" className="btn-primary text-sm">
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
                className="card group cursor-pointer hover:border-border-light transition-colors"
              >
                <div className="flex items-center gap-3 mb-3">
                  {launch.logoUri ? (
                    <img
                      src={launch.logoUri}
                      alt={launch.tokenName}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-surface-light flex items-center justify-center">
                      <span className="text-sm">◈</span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm truncate group-hover:text-primary transition-colors">
                      {launch.tokenName}
                    </h3>
                    <p className="text-xs text-secondary font-mono">
                      ${launch.tokenSymbol}
                    </p>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>

                <p className="text-xs text-muted mb-4 line-clamp-2">
                  {launch.repoDescription || launch.repoFullName}
                </p>

                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3 text-muted">
                    <span className="flex items-center gap-1">
                      <Star className="w-3 h-3" />
                      {launch.repoStars.toLocaleString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <GitFork className="w-3 h-3" />
                      {launch.repoForks.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {launch.user.avatarUrl && (
                      <img
                        src={launch.user.avatarUrl}
                        alt={launch.user.githubLogin}
                        className="w-4 h-4 rounded-full"
                      />
                    )}
                    <span className="text-muted">
                      {launch.user.githubLogin}
                    </span>
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
