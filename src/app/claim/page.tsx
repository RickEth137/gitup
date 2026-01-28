'use client';

import { useSession } from 'next-auth/react';
import { signIn } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { Github, Search, ExternalLink, CheckCircle, Wallet, AlertCircle, Loader2, Gift, Star, GitFork } from 'lucide-react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Transaction } from '@solana/web3.js';

// GitLab icon component
const GitLabIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M22.65 14.39L12 22.13 1.35 14.39a.84.84 0 01-.3-.94l1.22-3.78 2.44-7.51A.42.42 0 014.82 2a.43.43 0 01.58 0 .42.42 0 01.11.18l2.44 7.49h8.1l2.44-7.51A.42.42 0 0118.6 2a.43.43 0 01.58 0 .42.42 0 01.11.18l2.44 7.51L23 13.45a.84.84 0 01-.35.94z"/>
  </svg>
);

interface ClaimableToken {
  id: string;
  entityType: 'github' | 'gitlab';
  entityHandle: string;
  entityName: string;
  tokenName: string;
  tokenSymbol: string;
  tokenMint: string;
  tokenLogo?: string;
  isClaimed: boolean;
  isEscrow: boolean;
  escrowPublicKey?: string;
  escrowBalance?: number;
  launchedAt: string;
  repoStars?: number;
  repoForks?: number;
}

export default function ClaimPage() {
  const { data: session } = useSession();
  const { publicKey, signTransaction } = useWallet();
  const { connection } = useConnection();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<ClaimableToken[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [claimingId, setClaimingId] = useState<string | null>(null);
  const [claimError, setClaimError] = useState<string | null>(null);
  const [claimSuccess, setClaimSuccess] = useState<string | null>(null);
  
  // Auto-detected tokens for user's repos
  const [myTokens, setMyTokens] = useState<ClaimableToken[]>([]);
  const [isLoadingMyTokens, setIsLoadingMyTokens] = useState(false);

  const githubLogin = (session?.user as { githubLogin?: string })?.githubLogin;

  // Auto-fetch tokens for user's repos when GitHub is connected
  useEffect(() => {
    async function fetchMyTokens() {
      if (!githubLogin) {
        setMyTokens([]);
        return;
      }

      setIsLoadingMyTokens(true);
      try {
        // Fetch tokens that match user's GitHub repos
        const response = await fetch(`/api/tokens/my-claimable?githubLogin=${encodeURIComponent(githubLogin)}`);
        if (response.ok) {
          const data = await response.json();
          setMyTokens(data.tokens || []);
        }
      } catch (error) {
        console.error('Error fetching claimable tokens:', error);
      } finally {
        setIsLoadingMyTokens(false);
      }
    }

    fetchMyTokens();
  }, [githubLogin]);

  // Real search using API
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    setClaimError(null);
    setClaimSuccess(null);
    
    try {
      const response = await fetch(`/api/tokens/search?q=${encodeURIComponent(searchQuery)}`);
      if (response.ok) {
        const data = await response.json();
        // Fetch escrow balances for unclaimed tokens
        const tokens = data.tokens || [];
        const tokensWithBalances = await Promise.all(
          tokens.map(async (token: ClaimableToken) => {
            if (token.isEscrow && !token.isClaimed) {
              try {
                const balanceRes = await fetch(`/api/claim/execute?tokenMint=${token.tokenMint}`);
                const balanceData = await balanceRes.json();
                return { ...token, escrowBalance: balanceData.escrowBalance || 0 };
              } catch {
                return token;
              }
            }
            return token;
          })
        );
        setSearchResults(tokensWithBalances);
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleClaim = async (token: ClaimableToken) => {
    if (!session) {
      signIn('github');
      return;
    }

    if (!publicKey || !signTransaction) {
      setClaimError('Please connect your Solana wallet to receive funds');
      return;
    }
    
    setClaimingId(token.id);
    setClaimError(null);
    setClaimSuccess(null);
    
    try {
      // Step 1: Request claim transaction from server
      const executeRes = await fetch('/api/claim/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          tokenMint: token.tokenMint,
          claimerWallet: publicKey.toBase58(),
        }),
      });
      
      const executeData = await executeRes.json();
      
      if (!executeRes.ok) {
        setClaimError(executeData.error || 'Failed to create claim transaction');
        return;
      }

      // Step 2: Sign the transaction (user pays the fee)
      const transactionBuffer = Buffer.from(executeData.transaction, 'base64');
      const transaction = Transaction.from(transactionBuffer);
      
      // Sign with user's wallet
      const signedTx = await signTransaction(transaction);
      
      // Step 3: Send to network
      const signature = await connection.sendRawTransaction(signedTx.serialize());
      await connection.confirmTransaction(signature, 'confirmed');
      
      // Step 4: Confirm with backend
      const confirmRes = await fetch('/api/claim/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tokenMint: token.tokenMint,
          transactionSig: signature,
          claimerWallet: publicKey.toBase58(),
          amountClaimed: executeData.escrowBalance,
        }),
      });
      
      if (!confirmRes.ok) {
        const confirmData = await confirmRes.json();
        setClaimError(confirmData.error || 'Failed to confirm claim');
        return;
      }

      setClaimSuccess(`Successfully claimed ${executeData.escrowBalance.toFixed(4)} SOL! TX: ${signature.slice(0, 8)}...`);
      
      // Update the token in search results
      setSearchResults(prev => 
        prev.map(t => t.id === token.id ? { ...t, isClaimed: true, escrowBalance: 0 } : t)
      );
      
      // Also update in myTokens
      setMyTokens(prev => 
        prev.map(t => t.id === token.id ? { ...t, isClaimed: true, escrowBalance: 0 } : t)
      );
      
    } catch (error) {
      console.error('Claim error:', error);
      setClaimError(error instanceof Error ? error.message : 'Failed to process claim');
    } finally {
      setClaimingId(null);
    }
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

          {/* Wallet Connection */}
          <div className="p-4 rounded-xl border border-white/5 bg-white/[0.02]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full ${publicKey ? 'bg-[#00FF41]/10' : 'bg-white/5'} flex items-center justify-center`}>
                  <Wallet className={`w-5 h-5 ${publicKey ? 'text-[#00FF41]' : 'text-white/40'}`} />
                </div>
                <div>
                  <p className="font-medium text-white text-sm">Solana Wallet</p>
                  {publicKey ? (
                    <p className="text-xs text-[#00FF41]">
                      {publicKey.toBase58().slice(0, 8)}...{publicKey.toBase58().slice(-8)}
                    </p>
                  ) : (
                    <p className="text-xs text-white/40">To receive claimed fees</p>
                  )}
                </div>
              </div>
              {publicKey ? (
                <CheckCircle className="w-5 h-5 text-[#00FF41]" />
              ) : (
                <WalletMultiButton className="!bg-white/5 !border !border-white/10 !rounded-lg !text-white/70 hover:!bg-white/10 !text-sm !h-auto !py-2" />
              )}
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

        {/* Auto-detected tokens for user's repos */}
        {session && (
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Gift className="w-5 h-5 text-[#00FF41]" />
              <h2 className="text-lg font-semibold text-white">Your Claimable Tokens</h2>
            </div>
            
            {isLoadingMyTokens ? (
              <div className="p-8 rounded-xl border border-white/5 bg-white/[0.02] text-center">
                <Loader2 className="w-6 h-6 text-[#00FF41] animate-spin mx-auto mb-3" />
                <p className="text-white/40 text-sm">Scanning for tokens launched with your repos...</p>
              </div>
            ) : myTokens.length > 0 ? (
              <div className="space-y-3">
                {claimError && (
                  <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    {claimError}
                  </div>
                )}
                {claimSuccess && (
                  <div className="p-3 rounded-lg bg-[#00FF41]/10 border border-[#00FF41]/20 text-[#00FF41] text-sm flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    {claimSuccess}
                  </div>
                )}
                {myTokens.map((token) => (
                  <TokenCard
                    key={token.id}
                    token={token}
                    onClaim={() => handleClaim(token)}
                    isClaiming={claimingId === token.id}
                    canClaim={!!session && !!publicKey}
                    walletConnected={!!publicKey}
                    isOwner={true}
                  />
                ))}
              </div>
            ) : (
              <div className="p-6 rounded-xl border border-white/5 bg-white/[0.02] text-center">
                <Github className="w-10 h-10 text-white/10 mx-auto mb-3" />
                <p className="text-white/50 text-sm mb-1">No claimable tokens found</p>
                <p className="text-white/30 text-xs">
                  When someone tokenizes one of your repos, it will appear here automatically
                </p>
              </div>
            )}
          </div>
        )}

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-white mb-4">Search Results</h2>
            {claimError && (
              <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {claimError}
              </div>
            )}
            {claimSuccess && (
              <div className="mb-4 p-3 rounded-lg bg-[#00FF41]/10 border border-[#00FF41]/20 text-[#00FF41] text-sm flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                {claimSuccess}
              </div>
            )}
            <div className="space-y-3">
              {searchResults.map((token) => (
                <TokenCard
                  key={token.id}
                  token={token}
                  onClaim={() => handleClaim(token)}
                  isClaiming={claimingId === token.id}
                  canClaim={!!session && !!publicKey}
                  walletConnected={!!publicKey}
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
  walletConnected,
  isOwner = false,
}: {
  token: ClaimableToken;
  onClaim: () => void;
  isClaiming: boolean;
  canClaim: boolean;
  walletConnected: boolean;
  isOwner?: boolean;
}) {
  const getIcon = () => {
    switch (token.entityType) {
      case 'github':
        return <Github className="w-6 h-6 text-white/60" />;
      case 'gitlab':
        return <GitLabIcon className="w-6 h-6 text-[#FC6D26]" />;
      default:
        return <Github className="w-6 h-6 text-white/60" />;
    }
  };

  const getEntityUrl = () => {
    switch (token.entityType) {
      case 'github':
        return `https://github.com/${token.entityHandle}`;
      case 'gitlab':
        return `https://gitlab.com/${token.entityHandle}`;
      default:
        return '#';
    }
  };

  // Determine button state
  const getButtonContent = () => {
    if (isClaiming) {
      return (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          Claiming...
        </>
      );
    }
    
    if (!canClaim) {
      return (
        <>
          <CheckCircle className="w-4 h-4" />
          Connect to Claim
        </>
      );
    }

    if (token.escrowBalance && token.escrowBalance > 0) {
      return (
        <>
          <Wallet className="w-4 h-4" />
          Claim {token.escrowBalance.toFixed(4)} SOL
        </>
      );
    }

    return (
      <>
        <Wallet className="w-4 h-4" />
        Verify & Claim
      </>
    );
  };

  return (
    <div className={`p-4 rounded-xl border ${isOwner ? 'border-[#00FF41]/20 bg-[#00FF41]/[0.02]' : 'border-white/5 bg-white/[0.02]'} hover:border-white/10 transition-all`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center overflow-hidden">
            {token.tokenLogo ? (
              <img src={token.tokenLogo} alt="" className="w-full h-full object-cover" />
            ) : (
              getIcon()
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-white">{token.entityHandle}</h3>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-white/30 uppercase">
                {token.entityType}
              </span>
              {isOwner && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#00FF41]/10 text-[#00FF41] flex items-center gap-1">
                  <CheckCircle className="w-2.5 h-2.5" /> Owner
                </span>
              )}
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
              ${token.tokenSymbol} · {token.tokenName}
            </p>
            {(token.repoStars !== undefined || token.repoForks !== undefined) && (
              <div className="flex items-center gap-3 mt-1 text-xs text-white/30">
                {token.repoStars !== undefined && (
                  <span className="flex items-center gap-1">
                    <Star className="w-3 h-3" /> {token.repoStars.toLocaleString()}
                  </span>
                )}
                {token.repoForks !== undefined && (
                  <span className="flex items-center gap-1">
                    <GitFork className="w-3 h-3" /> {token.repoForks.toLocaleString()}
                  </span>
                )}
              </div>
            )}
            {token.isClaimed && (
              <p className="text-xs text-[#00FF41] flex items-center gap-1 mt-1">
                <CheckCircle className="w-3 h-3" /> Claimed
              </p>
            )}
            {!token.isClaimed && token.isEscrow && token.escrowBalance !== undefined && (
              <p className="text-xs text-yellow-400/80 mt-1">
                Escrow: {token.escrowBalance.toFixed(4)} SOL available
              </p>
            )}
            {!token.isClaimed && !token.isEscrow && (
              <p className="text-xs text-white/30 mt-1">
                Launched by owner - no escrow fees
              </p>
            )}
          </div>
        </div>
        {!token.isClaimed && token.isEscrow && (
          <button
            onClick={onClaim}
            disabled={isClaiming || (token.escrowBalance !== undefined && token.escrowBalance === 0)}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#00FF41] text-black font-semibold rounded-lg hover:bg-[#00FF41]/90 transition-all disabled:opacity-50"
          >
            {getButtonContent()}
          </button>
        )}
      </div>
    </div>
  );
}
