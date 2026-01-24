'use client';

import { useSession } from 'next-auth/react';
import { signIn } from 'next-auth/react';
import { useState } from 'react';
import { Github, Search, ExternalLink, CheckCircle, Wallet } from 'lucide-react';

// GitLab icon component
const GitLabIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M22.65 14.39L12 22.13 1.35 14.39a.84.84 0 01-.3-.94l1.22-3.78 2.44-7.51A.42.42 0 014.82 2a.43.43 0 01.58 0 .42.42 0 01.11.18l2.44 7.49h8.1l2.44-7.51A.42.42 0 0118.6 2a.43.43 0 01.58 0 .42.42 0 01.11.18l2.44 7.51L23 13.45a.84.84 0 01-.35.94z"/>
  </svg>
);

interface ClaimableToken {
  id: string;
  entityType: 'github' | 'twitter' | 'gitlab' | 'telegram' | 'instagram' | 'facebook';
  entityHandle: string;
  entityName: string;
  tokenName: string;
  tokenSymbol: string;
  tokenMint: string;
  escrowBalance: number;
  launchedAt: string;
}

export default function ClaimPage() {
  const { data: session } = useSession();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<ClaimableToken[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [claimableTokens, setClaimableTokens] = useState<ClaimableToken[]>([]);
  const [claimingId, setClaimingId] = useState<string | null>(null);

  // Mock search - replace with actual API call
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    // TODO: Replace with actual API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock results
    setSearchResults([
      {
        id: '1',
        entityType: 'github',
        entityHandle: searchQuery.includes('/') ? searchQuery : `user/${searchQuery}`,
        entityName: searchQuery,
        tokenName: `${searchQuery.split('/').pop()} Token`,
        tokenSymbol: searchQuery.split('/').pop()?.slice(0, 4).toUpperCase() || 'TKN',
        tokenMint: 'So111...xyz',
        escrowBalance: 1.234,
        launchedAt: new Date().toISOString(),
      },
    ]);
    setIsSearching(false);
  };

  const handleClaim = async (token: ClaimableToken) => {
    if (!session) {
      signIn('github');
      return;
    }
    
    setClaimingId(token.id);
    // TODO: Implement actual claim logic
    await new Promise(resolve => setTimeout(resolve, 2000));
    setClaimingId(null);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] pt-8">
      {/* Ambient glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/3 w-[500px] h-[500px] bg-[#00FF41]/5 rounded-full blur-[100px]" />
      </div>

      <div className="max-w-3xl mx-auto px-6 py-12 relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            Claim Your Fees
          </h1>
          <p className="text-white/50 max-w-md mx-auto">
            Own a GitHub repo or GitLab project that was tokenized? Verify ownership and claim your accumulated creator fees.
          </p>
        </div>

        {/* Auth Status - Multiple Platforms */}
        <div className="mb-8 space-y-3">
          <p className="text-sm text-white/40 mb-3">Connect to verify ownership:</p>
          
          {/* GitHub */}
          <div className="p-4 rounded-xl border border-white/5 bg-white/[0.02]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full ${session ? 'bg-[#00FF41]/10' : 'bg-white/5'} flex items-center justify-center`}>
                  <Github className={`w-5 h-5 ${session ? 'text-[#00FF41]' : 'text-white/40'}`} />
                </div>
                <div>
                  <p className="font-medium text-white text-sm">GitHub</p>
                  {session ? (
                    <p className="text-xs text-[#00FF41]">
                      {(session.user as { githubLogin?: string })?.githubLogin || 'Connected'}
                    </p>
                  ) : (
                    <p className="text-xs text-white/40">For GitHub repos</p>
                  )}
                </div>
              </div>
              {session ? (
                <CheckCircle className="w-5 h-5 text-[#00FF41]" />
              ) : (
                <button
                  onClick={() => signIn('github')}
                  className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white/70 hover:bg-white/10 hover:text-white transition-all text-sm"
                >
                  Connect
                </button>
              )}
            </div>
          </div>

          {/* GitLab */}
          <div className="p-4 rounded-xl border border-white/5 bg-white/[0.02] opacity-60">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#FC6D26]/10 flex items-center justify-center">
                  <GitLabIcon className="w-5 h-5 text-[#FC6D26]" />
                </div>
                <div>
                  <p className="font-medium text-white text-sm">GitLab</p>
                  <p className="text-xs text-white/40">For GitLab repos</p>
                </div>
              </div>
              <span className="px-3 py-1.5 bg-white/5 rounded text-xs text-white/40">Coming Soon</span>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="mb-8">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Search by repo (owner/repo), @handle, or username..."
                className="w-full pl-12 pr-4 py-3 bg-white/[0.03] border border-white/10 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-[#00FF41]/50"
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={isSearching}
              className="px-6 py-3 bg-[#00FF41] text-black font-semibold rounded-xl hover:bg-[#00FF41]/90 transition-all disabled:opacity-50"
            >
              {isSearching ? 'Searching...' : 'Search'}
            </button>
          </div>
        </div>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-white mb-4">Search Results</h2>
            <div className="space-y-3">
              {searchResults.map((token) => (
                <TokenCard
                  key={token.id}
                  token={token}
                  onClaim={() => handleClaim(token)}
                  isClaiming={claimingId === token.id}
                  canClaim={!!session}
                />
              ))}
            </div>
          </div>
        )}

        {/* How Claiming Works */}
        <div className="mt-12 p-6 rounded-2xl border border-white/5 bg-white/[0.02]">
          <h3 className="text-lg font-semibold text-white mb-4">How Claiming Works</h3>
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-lg bg-[#00FF41]/10 flex items-center justify-center flex-shrink-0">
                <span className="text-[#00FF41] font-mono text-sm">1</span>
              </div>
              <div>
                <p className="font-medium text-white">Search for your token</p>
                <p className="text-sm text-white/40">Find tokens created from your GitHub repos or GitLab projects</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-lg bg-[#00FF41]/10 flex items-center justify-center flex-shrink-0">
                <span className="text-[#00FF41] font-mono text-sm">2</span>
              </div>
              <div>
                <p className="font-medium text-white">Verify ownership</p>
                <p className="text-sm text-white/40">Connect with GitHub or GitLab to prove ownership</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-lg bg-[#00FF41]/10 flex items-center justify-center flex-shrink-0">
                <span className="text-[#00FF41] font-mono text-sm">3</span>
              </div>
              <div>
                <p className="font-medium text-white">Claim accumulated fees</p>
                <p className="text-sm text-white/40">All creator fees in escrow are transferred to your wallet</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TokenCard({
  token,
  onClaim,
  isClaiming,
  canClaim,
}: {
  token: ClaimableToken;
  onClaim: () => void;
  isClaiming: boolean;
  canClaim: boolean;
}) {
  const getIcon = () => {
    switch (token.entityType) {
      case 'github':
        return <Github className="w-6 h-6 text-white/60" />;
      case 'twitter':
        return <Twitter className="w-6 h-6 text-white/60" />;
      case 'gitlab':
        return <GitLabIcon className="w-6 h-6 text-[#FC6D26]" />;
      case 'telegram':
        return <Send className="w-6 h-6 text-[#0088cc]" />;
      case 'instagram':
        return <Instagram className="w-6 h-6 text-[#E4405F]" />;
      case 'facebook':
        return <Facebook className="w-6 h-6 text-[#1877F2]" />;
      default:
        return <Github className="w-6 h-6 text-white/60" />;
    }
  };

  const getEntityUrl = () => {
    switch (token.entityType) {
      case 'github':
        return `https://github.com/${token.entityHandle}`;
      case 'twitter':
        return `https://x.com/${token.entityHandle.replace('@', '')}`;
      case 'gitlab':
        return `https://gitlab.com/${token.entityHandle}`;
      case 'telegram':
        return `https://t.me/${token.entityHandle.replace('@', '')}`;
      case 'instagram':
        return `https://instagram.com/${token.entityHandle.replace('@', '')}`;
      case 'facebook':
        return `https://facebook.com/${token.entityHandle}`;
      default:
        return '#';
    }
  };

  return (
    <div className="p-4 rounded-xl border border-white/5 bg-white/[0.02] hover:border-white/10 transition-all">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center">
            {getIcon()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-white">{token.entityHandle}</h3>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-white/30 uppercase">
                {token.entityType}
              </span>
              <a
                href={getEntityUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/30 hover:text-[#00FF41] transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
            <p className="text-sm text-white/40">
              ${token.tokenSymbol} · <span className="text-[#00FF41]">{token.escrowBalance.toFixed(3)} SOL</span> in escrow
            </p>
          </div>
        </div>
        <button
          onClick={onClaim}
          disabled={isClaiming}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#00FF41] text-black font-semibold rounded-lg hover:bg-[#00FF41]/90 transition-all disabled:opacity-50"
        >
          {isClaiming ? (
            <>
              <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
              Claiming...
            </>
          ) : canClaim ? (
            <>
              <Wallet className="w-4 h-4" />
              Claim
            </>
          ) : (
            <>
              <CheckCircle className="w-4 h-4" />
              Verify to Claim
            </>
          )}
        </button>
      </div>
    </div>
  );
}
