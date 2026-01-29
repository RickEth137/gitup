'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { 
  Github, 
  Star, 
  GitFork, 
  ExternalLink, 
  Copy, 
  Check, 
  Twitter, 
  Send, 
  Globe,
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Clock,
  Users
} from 'lucide-react';

interface TokenData {
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
  twitter?: string;
  telegram?: string;
  website?: string;
  launchedAt: string;
  isClaimed: boolean;
  readme?: string;
}

interface MarketData {
  priceUsd: string;
  priceNative: string;
  marketCap: number;
  fdv: number;
  priceChange24h: number;
  volume24h: number;
  liquidity: number;
  pairAddress: string;
}

// Format market cap
function formatNumber(value: number): string {
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(2)}B`;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
  return `$${value.toFixed(2)}`;
}

// Format time ago
function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  if (diffHours > 0) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffMins > 0) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
  return 'Just now';
}

export default function TokenPage() {
  const params = useParams();
  const mint = params.mint as string;
  
  const [token, setToken] = useState<TokenData | null>(null);
  const [marketData, setMarketData] = useState<MarketData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'readme' | 'info'>('readme');

  // Fetch token data from our API
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
        
        // Fetch README from GitHub
        if (data.repoFullName) {
          try {
            const readmeRes = await fetch(
              `https://api.github.com/repos/${data.repoFullName}/readme`,
              { headers: { Accept: 'application/vnd.github.v3.raw' } }
            );
            if (readmeRes.ok) {
              const readmeText = await readmeRes.text();
              setToken(prev => prev ? { ...prev, readme: readmeText } : null);
            }
          } catch (e) {
            console.log('Could not fetch README');
          }
        }
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

  // Fetch market data from DexScreener
  useEffect(() => {
    async function fetchMarketData() {
      try {
        const response = await fetch(
          `https://api.dexscreener.com/latest/dex/tokens/${mint}`
        );
        
        if (response.ok) {
          const data = await response.json();
          if (data.pairs && data.pairs.length > 0) {
            const pair = data.pairs[0];
            setMarketData({
              priceUsd: pair.priceUsd || '0',
              priceNative: pair.priceNative || '0',
              marketCap: pair.marketCap || pair.fdv || 0,
              fdv: pair.fdv || 0,
              priceChange24h: pair.priceChange?.h24 || 0,
              volume24h: pair.volume?.h24 || 0,
              liquidity: pair.liquidity?.usd || 0,
              pairAddress: pair.pairAddress || '',
            });
          }
        }
      } catch (e) {
        console.log('Could not fetch market data');
      }
    }

    if (mint) {
      fetchMarketData();
      // Refresh every 30 seconds
      const interval = setInterval(fetchMarketData, 30000);
      return () => clearInterval(interval);
    }
  }, [mint]);

  const handleCopy = () => {
    navigator.clipboard.writeText(mint);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] pt-20">
        <div className="flex items-center justify-center h-[60vh]">
          <div className="animate-spin h-8 w-8 border-2 border-[#00FF41] border-t-transparent rounded-full" />
        </div>
      </div>
    );
  }

  if (error || !token) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] pt-20">
        <div className="max-w-4xl mx-auto px-6 py-20 text-center">
          <Image src="/logo3.png" alt="" width={64} height={64} className="mx-auto mb-4 opacity-20" />
          <h1 className="text-2xl text-white mb-4">Token Not Found</h1>
          <p className="text-white/50 mb-8">{error || 'This token does not exist'}</p>
          <Link href="/explore" className="inline-flex items-center gap-2 text-[#00FF41] hover:underline">
            <ArrowLeft className="w-4 h-4" />
            Back to Explore
          </Link>
        </div>
      </div>
    );
  }

  const priceChange = marketData?.priceChange24h || 0;

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Token Header Bar */}
      <div className="sticky top-16 z-40 bg-[#0a0a0a]/95 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-[1800px] mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Left: Token Info */}
            <div className="flex items-center gap-4">
              <Link href="/explore" className="p-2 hover:bg-white/5 rounded-lg transition-colors">
                <ArrowLeft className="w-5 h-5 text-white/60" />
              </Link>
              
              {token.logoUri ? (
                <img src={token.logoUri} alt={token.tokenName} className="w-10 h-10 rounded-xl" />
              ) : (
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00FF41]/20 to-[#00FF41]/5 flex items-center justify-center">
                  <Github className="w-5 h-5 text-[#00FF41]" />
                </div>
              )}
              
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-white font-bold">{token.tokenName}</h1>
                  <span className="text-[#00FF41] font-mono text-sm">${token.tokenSymbol}</span>
                </div>
                <a 
                  href={token.repoUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-white/40 text-sm hover:text-[#00FF41] transition-colors flex items-center gap-1"
                >
                  <Github className="w-3 h-3" />
                  {token.repoFullName}
                </a>
              </div>
            </div>

            {/* Center: Price & Stats */}
            {marketData && (
              <div className="hidden md:flex items-center gap-6">
                <div>
                  <p className="text-white font-bold text-lg">${parseFloat(marketData.priceUsd).toFixed(8)}</p>
                  <div className={`flex items-center gap-1 text-sm ${priceChange >= 0 ? 'text-[#00FF41]' : 'text-red-400'}`}>
                    {priceChange >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)}% (24h)
                  </div>
                </div>
                <div className="h-8 w-px bg-white/10" />
                <div className="text-center">
                  <p className="text-white/40 text-xs">Market Cap</p>
                  <p className="text-white font-semibold">{formatNumber(marketData.marketCap)}</p>
                </div>
                <div className="text-center">
                  <p className="text-white/40 text-xs">24h Volume</p>
                  <p className="text-white font-semibold">{formatNumber(marketData.volume24h)}</p>
                </div>
                <div className="text-center">
                  <p className="text-white/40 text-xs">Liquidity</p>
                  <p className="text-white font-semibold">{formatNumber(marketData.liquidity)}</p>
                </div>
              </div>
            )}

            {/* Right: Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
                title="Copy address"
              >
                {copied ? <Check className="w-4 h-4 text-[#00FF41]" /> : <Copy className="w-4 h-4 text-white/60" />}
              </button>
              
              {token.twitter && (
                <a
                  href={token.twitter.startsWith('http') ? token.twitter : `https://twitter.com/${token.twitter}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-white/5 hover:bg-[#1DA1F2]/20 rounded-lg transition-colors"
                >
                  <Twitter className="w-4 h-4 text-white/60 hover:text-[#1DA1F2]" />
                </a>
              )}
              
              {token.telegram && (
                <a
                  href={token.telegram.startsWith('http') ? token.telegram : `https://t.me/${token.telegram}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-white/5 hover:bg-[#0088cc]/20 rounded-lg transition-colors"
                >
                  <Send className="w-4 h-4 text-white/60 hover:text-[#0088cc]" />
                </a>
              )}
              
              {token.website && (
                <a
                  href={token.website.startsWith('http') ? token.website : `https://${token.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <Globe className="w-4 h-4 text-white/60" />
                </a>
              )}
              
              <a
                href={`https://pump.fun/${mint}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-[#00FF41] text-black font-semibold text-sm rounded-lg hover:bg-[#00FF41]/90 transition-colors flex items-center gap-2"
              >
                Trade
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content: Chart + README */}
      <div className="max-w-[1800px] mx-auto px-4 py-4">
        <div className="grid lg:grid-cols-[1fr,400px] gap-4 h-[calc(100vh-180px)]">
          
          {/* Left: DexScreener Chart */}
          <div className="rounded-xl border border-white/10 bg-[#0d0d0d] overflow-hidden">
            <iframe
              src={`https://dexscreener.com/solana/${mint}?embed=1&theme=dark&trades=0&info=0`}
              className="w-full h-full min-h-[500px]"
              style={{ border: 'none' }}
              title="DexScreener Chart"
            />
          </div>

          {/* Right: Info Panel */}
          <div className="rounded-xl border border-white/10 bg-[#0d0d0d] overflow-hidden flex flex-col">
            {/* Tabs */}
            <div className="flex border-b border-white/10">
              <button
                onClick={() => setActiveTab('readme')}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === 'readme' 
                    ? 'text-[#00FF41] border-b-2 border-[#00FF41]' 
                    : 'text-white/50 hover:text-white'
                }`}
              >
                README
              </button>
              <button
                onClick={() => setActiveTab('info')}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === 'info' 
                    ? 'text-[#00FF41] border-b-2 border-[#00FF41]' 
                    : 'text-white/50 hover:text-white'
                }`}
              >
                Token Info
              </button>
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto">
              {activeTab === 'readme' ? (
                <div className="p-5">
                  {token.readme ? (
                    <article className="github-markdown">
                      <ReactMarkdown 
                        remarkPlugins={[remarkGfm]}
                        components={{
                          h1: ({children}) => (
                            <h1 className="text-2xl font-bold text-white pb-3 mb-4 border-b border-white/10">
                              {children}
                            </h1>
                          ),
                          h2: ({children}) => (
                            <h2 className="text-xl font-semibold text-white mt-8 mb-4 pb-2 border-b border-white/10">
                              {children}
                            </h2>
                          ),
                          h3: ({children}) => (
                            <h3 className="text-lg font-semibold text-white mt-6 mb-3">
                              {children}
                            </h3>
                          ),
                          h4: ({children}) => (
                            <h4 className="text-base font-semibold text-white mt-4 mb-2">
                              {children}
                            </h4>
                          ),
                          p: ({children}) => (
                            <p className="text-white/80 leading-7 mb-4">
                              {children}
                            </p>
                          ),
                          a: ({href, children}) => (
                            <a 
                              href={href} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-[#58a6ff] hover:underline"
                            >
                              {children}
                            </a>
                          ),
                          strong: ({children}) => (
                            <strong className="font-semibold text-white">{children}</strong>
                          ),
                          em: ({children}) => (
                            <em className="italic text-white/90">{children}</em>
                          ),
                          code: ({className, children, ...props}) => {
                            const isInline = !className;
                            if (isInline) {
                              return (
                                <code className="px-1.5 py-0.5 bg-[#1f1f1f] text-[#e6edf3] text-[13px] font-mono rounded-md border border-white/10">
                                  {children}
                                </code>
                              );
                            }
                            return (
                              <code className={className} {...props}>
                                {children}
                              </code>
                            );
                          },
                          pre: ({children}) => (
                            <pre className="bg-[#161b22] border border-white/10 rounded-lg p-4 overflow-x-auto mb-4 text-[13px] font-mono text-[#e6edf3]">
                              {children}
                            </pre>
                          ),
                          ul: ({children}) => (
                            <ul className="list-disc list-inside mb-4 space-y-2 text-white/80">
                              {children}
                            </ul>
                          ),
                          ol: ({children}) => (
                            <ol className="list-decimal list-inside mb-4 space-y-2 text-white/80">
                              {children}
                            </ol>
                          ),
                          li: ({children}) => (
                            <li className="text-white/80 leading-7">
                              <span className="text-white/80">{children}</span>
                            </li>
                          ),
                          blockquote: ({children}) => (
                            <blockquote className="border-l-4 border-[#00FF41]/50 pl-4 py-1 my-4 text-white/60 italic">
                              {children}
                            </blockquote>
                          ),
                          hr: () => (
                            <hr className="border-white/10 my-6" />
                          ),
                          img: ({src, alt}) => (
                            <img 
                              src={src} 
                              alt={alt || ''} 
                              className="max-w-full rounded-lg border border-white/10 my-4"
                            />
                          ),
                          table: ({children}) => (
                            <div className="overflow-x-auto mb-4">
                              <table className="w-full border-collapse border border-white/10 rounded-lg">
                                {children}
                              </table>
                            </div>
                          ),
                          th: ({children}) => (
                            <th className="border border-white/10 bg-white/5 px-4 py-2 text-left text-white font-semibold">
                              {children}
                            </th>
                          ),
                          td: ({children}) => (
                            <td className="border border-white/10 px-4 py-2 text-white/70">
                              {children}
                            </td>
                          ),
                        }}
                      >
                        {token.readme}
                      </ReactMarkdown>
                    </article>
                  ) : (
                    <div className="text-center py-12">
                      <Github className="w-12 h-12 text-white/10 mx-auto mb-3" />
                      <p className="text-white/40 text-sm">No README available</p>
                      <a
                        href={token.repoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#00FF41] text-sm hover:underline mt-2 inline-block"
                      >
                        View on GitHub →
                      </a>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-4 space-y-4">
                  {/* Token Description */}
                  {token.repoDescription && (
                    <div className="p-4 bg-white/[0.02] rounded-lg">
                      <p className="text-white/70 text-sm">{token.repoDescription}</p>
                    </div>
                  )}

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-white/[0.02] rounded-lg">
                      <div className="flex items-center gap-2 text-white/40 text-xs mb-1">
                        <Star className="w-3 h-3" />
                        Stars
                      </div>
                      <p className="text-white font-semibold">{token.repoStars.toLocaleString()}</p>
                    </div>
                    <div className="p-3 bg-white/[0.02] rounded-lg">
                      <div className="flex items-center gap-2 text-white/40 text-xs mb-1">
                        <GitFork className="w-3 h-3" />
                        Forks
                      </div>
                      <p className="text-white font-semibold">{token.repoForks.toLocaleString()}</p>
                    </div>
                    <div className="p-3 bg-white/[0.02] rounded-lg">
                      <div className="flex items-center gap-2 text-white/40 text-xs mb-1">
                        <Clock className="w-3 h-3" />
                        Launched
                      </div>
                      <p className="text-white font-semibold text-sm">{formatTimeAgo(token.launchedAt)}</p>
                    </div>
                    <div className="p-3 bg-white/[0.02] rounded-lg">
                      <div className="flex items-center gap-2 text-white/40 text-xs mb-1">
                        <Users className="w-3 h-3" />
                        Status
                      </div>
                      <p className={`font-semibold text-sm ${token.isClaimed ? 'text-[#00FF41]' : 'text-yellow-500'}`}>
                        {token.isClaimed ? 'Claimed' : 'Unclaimed'}
                      </p>
                    </div>
                  </div>

                  {/* Contract Address */}
                  <div className="p-4 bg-white/[0.02] rounded-lg">
                    <p className="text-white/40 text-xs mb-2">Contract Address</p>
                    <div className="flex items-center gap-2">
                      <p className="text-white/70 font-mono text-xs break-all flex-1">{mint}</p>
                      <button
                        onClick={handleCopy}
                        className="p-1.5 hover:bg-white/10 rounded transition-colors"
                      >
                        {copied ? <Check className="w-3.5 h-3.5 text-[#00FF41]" /> : <Copy className="w-3.5 h-3.5 text-white/40" />}
                      </button>
                    </div>
                  </div>

                  {/* Links */}
                  <div className="space-y-2">
                    <a
                      href={token.repoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-3 bg-white/[0.02] rounded-lg hover:bg-white/[0.05] transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <Github className="w-4 h-4 text-white/60" />
                        <span className="text-white text-sm">GitHub Repository</span>
                      </div>
                      <ExternalLink className="w-4 h-4 text-white/40" />
                    </a>
                    
                    <a
                      href={`https://pump.fun/${mint}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-3 bg-white/[0.02] rounded-lg hover:bg-white/[0.05] transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <Image src="/Pumpfun.webp" alt="pump.fun" width={16} height={16} className="rounded" />
                        <span className="text-white text-sm">pump.fun</span>
                      </div>
                      <ExternalLink className="w-4 h-4 text-white/40" />
                    </a>
                    
                    <a
                      href={`https://solscan.io/token/${mint}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-3 bg-white/[0.02] rounded-lg hover:bg-white/[0.05] transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4 text-white/60" />
                        <span className="text-white text-sm">Solscan</span>
                      </div>
                      <ExternalLink className="w-4 h-4 text-white/40" />
                    </a>
                    
                    <a
                      href={`https://dexscreener.com/solana/${mint}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-3 bg-white/[0.02] rounded-lg hover:bg-white/[0.05] transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-white/60" />
                        <span className="text-white text-sm">DexScreener</span>
                      </div>
                      <ExternalLink className="w-4 h-4 text-white/40" />
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
