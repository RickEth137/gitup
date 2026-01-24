'use client';

import { useSession } from 'next-auth/react';
import { signIn } from 'next-auth/react';
import { useState } from 'react';
import { Github, Twitter, Search, ExternalLink, CheckCircle, Wallet, Send, Instagram, Facebook } from 'lucide-react';

// GitLab icon component
const GitLabIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M22.65 14.39L12 22.13 1.35 14.39a.84.84 0 01-.3-.94l1.22-3.78 2.44-7.51A.42.42 0 014.82 2a.43.43 0 01.58 0 .42.42 0 01.11.18l2.44 7.49h8.1l2.44-7.51A.42.42 0 0118.6 2a.43.43 0 01.58 0 .42.42 0 01.11.18l2.44 7.51L23 13.45a.84.84 0 01-.35.94z"/>
  </svg>
);

// Meta icon component
const MetaIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M6.915 4.03c-1.968 0-3.683 1.28-4.871 3.113C.704 9.208 0 11.883 0 14.449c0 .706.07 1.369.21 1.973a6.624 6.624 0 0 0 .265.86 5.297 5.297 0 0 0 .371.761c.696 1.159 1.818 1.927 3.593 1.927 1.497 0 2.633-.671 3.965-2.452.76-1.017 1.459-2.21 2.085-3.32l.672-1.195c.326-.56.625-1.095.895-1.585l.44-.793c.18-.33.355-.651.527-.96.293-.52.563-.98.811-1.36.249-.382.484-.702.707-.948a3.017 3.017 0 0 1 .516-.463c.164-.116.328-.21.49-.28a1.69 1.69 0 0 1 .515-.127c.477 0 .893.17 1.222.517.328.347.58.81.756 1.313.178.503.268 1.043.268 1.6 0 .652-.089 1.293-.259 1.887-.17.594-.398 1.084-.674 1.456a2.2 2.2 0 0 1-.507.522c-.104.08-.215.149-.333.205a1.57 1.57 0 0 1-.406.138c-.192.033-.351.046-.473.046-.191 0-.383-.026-.576-.079a2.33 2.33 0 0 1-.542-.221c.033.124.077.267.127.422.051.155.118.339.197.535.08.196.174.4.28.593.107.193.228.37.361.519.133.148.28.27.44.357.16.088.334.138.527.138.258 0 .516-.05.774-.152.258-.103.522-.274.789-.498.268-.224.528-.502.78-.824.253-.323.506-.702.76-1.128.635-1.066 1.132-2.324 1.491-3.772.36-1.448.54-2.927.54-4.435 0-.719-.055-1.39-.165-2.013a8.59 8.59 0 0 0-.52-1.768 5.96 5.96 0 0 0-.873-1.49 4.387 4.387 0 0 0-1.281-1.072 3.487 3.487 0 0 0-1.692-.407c-.399 0-.768.075-1.108.224-.34.15-.658.36-.956.633a7.63 7.63 0 0 0-.857.873c-.263.32-.527.681-.793 1.08l-.478.73-.505.827c-.164.276-.332.566-.505.867l-.49.865-.476.863a53.8 53.8 0 0 1-.462.846c-.24.438-.501.894-.78 1.368-.28.475-.573.952-.88 1.429-.306.478-.613.926-.919 1.344-.306.42-.606.778-.9 1.074-.294.296-.563.506-.81.63a1.314 1.314 0 0 1-.587.188c-.213 0-.386-.065-.52-.195a1.156 1.156 0 0 1-.299-.505 2.543 2.543 0 0 1-.116-.674c-.015-.237-.014-.475.004-.712.018-.237.046-.46.083-.67.037-.21.08-.396.125-.557.167-.587.39-1.22.672-1.9.281-.68.593-1.348.935-2.006.343-.658.7-1.27 1.073-1.838.372-.568.74-1.046 1.102-1.432.362-.387.702-.663 1.02-.829.318-.166.607-.249.867-.249.177 0 .34.033.49.1.15.066.286.16.409.28.123.12.23.263.324.428.093.165.17.347.23.546.06.199.1.41.122.633.02.224.017.453-.012.69a7.3 7.3 0 0 1-.143.825c-.066.288-.151.577-.255.867l.67-.746c.267-.296.557-.614.869-.953.312-.339.635-.672.97-.998a12.89 12.89 0 0 1 1.051-.91c.367-.286.74-.52 1.12-.702.38-.183.763-.274 1.149-.274.62 0 1.157.135 1.612.407.455.271.838.648 1.148 1.13.31.48.544 1.043.7 1.688.157.646.235 1.344.235 2.096 0 .915-.082 1.81-.247 2.683a12.233 12.233 0 0 1-.727 2.459 10.419 10.419 0 0 1-1.18 2.164c-.47.66-1.01 1.224-1.618 1.69-.609.467-1.287.831-2.034 1.092-.748.261-1.56.392-2.437.392-.56 0-1.074-.067-1.54-.2a4.427 4.427 0 0 1-1.247-.566 4.51 4.51 0 0 1-.988-.864 6.46 6.46 0 0 1-.762-1.085 8.937 8.937 0 0 1-.57-1.212 12.99 12.99 0 0 1-.406-1.216 14.762 14.762 0 0 1-.278-1.128 12.442 12.442 0 0 1-.152-.948c-.056-.443-.082-.787-.082-1.034 0-.43.027-.881.082-1.354.055-.473.14-.946.255-1.42.116-.473.258-.937.428-1.39.17-.455.364-.88.584-1.277.22-.397.462-.752.727-1.066.265-.313.55-.567.857-.762.307-.195.634-.34.98-.433.347-.093.71-.14 1.091-.14.504 0 .967.092 1.39.275.422.184.798.436 1.126.758.328.322.603.701.824 1.138.222.437.384.905.488 1.403z"/>
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
    <div className="min-h-screen bg-[#0a0a0a] pt-24">
      {/* Ambient glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/3 w-[500px] h-[500px] bg-[#00FF41]/5 rounded-full blur-[100px]" />
      </div>

      <div className="max-w-3xl mx-auto px-6 py-12 relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            Claim Your Token
          </h1>
          <p className="text-white/50 max-w-md mx-auto">
            Own a GitHub repo, GitLab project, X account, or Telegram channel? Verify ownership and claim accumulated creator fees.
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

          {/* Twitter */}
          <div className="p-4 rounded-xl border border-white/5 bg-white/[0.02] opacity-60">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
                  <Twitter className="w-5 h-5 text-white/40" />
                </div>
                <div>
                  <p className="font-medium text-white text-sm">X / Twitter</p>
                  <p className="text-xs text-white/40">For X accounts</p>
                </div>
              </div>
              <span className="px-3 py-1.5 bg-white/5 rounded text-xs text-white/40">Coming Soon</span>
            </div>
          </div>

          {/* Telegram */}
          <div className="p-4 rounded-xl border border-white/5 bg-white/[0.02] opacity-60">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#0088cc]/10 flex items-center justify-center">
                  <Send className="w-5 h-5 text-[#0088cc]" />
                </div>
                <div>
                  <p className="font-medium text-white text-sm">Telegram</p>
                  <p className="text-xs text-white/40">For Telegram accounts</p>
                </div>
              </div>
              <span className="px-3 py-1.5 bg-white/5 rounded text-xs text-white/40">Coming Soon</span>
            </div>
          </div>

          {/* Meta (Instagram + Facebook) */}
          <div className="p-4 rounded-xl border border-white/5 bg-white/[0.02] opacity-60">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#0082FB]/10 flex items-center justify-center">
                  <MetaIcon className="w-5 h-5 text-[#0082FB]" />
                </div>
                <div>
                  <p className="font-medium text-white text-sm">Meta</p>
                  <p className="text-xs text-white/40">For Instagram & Facebook</p>
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
                <p className="text-sm text-white/40">Find tokens created from your GitHub repos, GitLab projects, X account, or Telegram channel</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-lg bg-[#00FF41]/10 flex items-center justify-center flex-shrink-0">
                <span className="text-[#00FF41] font-mono text-sm">2</span>
              </div>
              <div>
                <p className="font-medium text-white">Verify ownership</p>
                <p className="text-sm text-white/40">Connect with the relevant platform (GitHub, GitLab, X, or Telegram) to prove ownership</p>
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
