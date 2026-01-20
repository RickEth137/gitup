'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Star, GitFork, Code, Search, AlertCircle, CheckCircle } from 'lucide-react';
import { GitHubRepo, useLaunchStore } from '@/store/launchStore';

interface RepoSelectorProps {
  onSelect: (repo: GitHubRepo) => void;
}

export function RepoSelector({ onSelect }: RepoSelectorProps) {
  const { data: session } = useSession();
  const { selectedRepo, setSelectedRepo } = useLaunchStore();
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [filteredRepos, setFilteredRepos] = useState<GitHubRepo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [checkingRepo, setCheckingRepo] = useState<string | null>(null);
  const [repoStatus, setRepoStatus] = useState<{
    [key: string]: { isTokenized: boolean; token?: any };
  }>({});

  // Fetch repos
  useEffect(() => {
    async function fetchRepos() {
      if (!session) return;

      try {
        setLoading(true);
        const response = await fetch('/api/github/repos');
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch repositories');
        }

        setRepos(data.repos);
        setFilteredRepos(data.repos);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    }

    fetchRepos();
  }, [session]);

  // Filter repos based on search
  useEffect(() => {
    const filtered = repos.filter(
      (repo) =>
        repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        repo.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        repo.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredRepos(filtered);
  }, [searchQuery, repos]);

  // Check if a repo is already tokenized
  const checkRepoStatus = async (repoId: string) => {
    if (repoStatus[repoId]) return;

    setCheckingRepo(repoId);
    try {
      const response = await fetch(`/api/github/check-repo?repoId=${repoId}`);
      const data = await response.json();
      setRepoStatus((prev) => ({ ...prev, [repoId]: data }));
    } catch (err) {
      console.error('Error checking repo status:', err);
    } finally {
      setCheckingRepo(null);
    }
  };

  const handleSelectRepo = async (repo: GitHubRepo) => {
    await checkRepoStatus(repo.id);

    if (repoStatus[repo.id]?.isTokenized) {
      return; // Don't allow selection of already tokenized repos
    }

    setSelectedRepo(repo);
    onSelect(repo);
  };

  if (loading) {
    return (
      <div className="space-y-3">
        <div className="h-11 bg-surface rounded-md animate-pulse" />
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-20 bg-surface rounded-lg animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="card text-center">
        <AlertCircle className="w-10 h-10 text-secondary mx-auto mb-4" />
        <h3 className="text-base font-medium mb-2">Error Loading Repositories</h3>
        <p className="text-muted text-sm">{error}</p>
      </div>
    );
  }

  if (repos.length === 0) {
    return (
      <div className="card text-center">
        <Code className="w-10 h-10 text-muted mx-auto mb-4" />
        <h3 className="text-base font-medium mb-2">No Repositories Found</h3>
        <p className="text-muted text-sm">
          You need to have admin access to at least one public repository to
          create a token.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted w-4 h-4" />
        <input
          type="text"
          placeholder="Search repositories..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="input pl-11"
        />
      </div>

      {/* Repos list */}
      <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
        {filteredRepos.map((repo) => {
          const status = repoStatus[repo.id];
          const isTokenized = status?.isTokenized;
          const isSelected = selectedRepo?.id === repo.id;
          const isChecking = checkingRepo === repo.id;

          return (
            <button
              key={repo.id}
              onClick={() => handleSelectRepo(repo)}
              onMouseEnter={() => checkRepoStatus(repo.id)}
              disabled={isTokenized}
              className={`
                w-full text-left p-4 rounded-lg border transition-all duration-150
                ${isSelected
                  ? 'bg-surface-light border-primary'
                  : isTokenized
                  ? 'bg-surface/50 border-border cursor-not-allowed opacity-40'
                  : 'bg-surface border-border hover:border-border-light hover:bg-surface-light'
                }
              `}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-sm truncate">{repo.name}</h4>
                    {isTokenized && (
                      <span className="px-2 py-0.5 bg-surface-light text-muted text-xs rounded">
                        Tokenized
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted truncate mt-0.5">
                    {repo.fullName}
                  </p>
                  {repo.description && (
                    <p className="text-xs text-muted truncate mt-2">
                      {repo.description}
                    </p>
                  )}
                  <div className="flex items-center gap-4 mt-2">
                    <span className="flex items-center gap-1 text-xs text-muted">
                      <Star size={12} />
                      {repo.stars.toLocaleString()}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-muted">
                      <GitFork size={12} />
                      {repo.forks.toLocaleString()}
                    </span>
                    {repo.language && (
                      <span className="text-xs text-muted">
                        {repo.language}
                      </span>
                    )}
                  </div>
                </div>
                <div className="ml-4">
                  {isChecking ? (
                    <div className="w-5 h-5 border-2 border-border border-t-primary rounded-full animate-spin" />
                  ) : isSelected ? (
                    <CheckCircle className="w-5 h-5 text-primary" />
                  ) : null}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {filteredRepos.length === 0 && (
        <div className="text-center py-8 text-muted text-sm">
          No repositories match your search
        </div>
      )}
    </div>
  );
}

export default RepoSelector;
