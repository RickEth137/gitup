'use client';

import { ExternalLink, Copy, CheckCircle, Rocket, Twitter, Share2 } from 'lucide-react';
import { useLaunchStore } from '@/store/launchStore';
import { getPumpFunUrl } from '@/lib/pumpfun';
import { useState } from 'react';

export function LaunchSuccess() {
  const { selectedRepo, tokenMetadata, tokenMint, transactionSig } = useLaunchStore();
  const [copied, setCopied] = useState<string | null>(null);

  const pumpFunUrl = tokenMint ? getPumpFunUrl(tokenMint) : '';
  const solscanUrl = transactionSig
    ? `https://solscan.io/tx/${transactionSig}`
    : '';

  const handleCopy = async (text: string, label: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  const shareText = `🚀 I just tokenized my GitHub repo "${selectedRepo?.fullName}" on @gitfun_!\n\n💰 $${tokenMetadata.symbol}\n⭐ ${selectedRepo?.stars} stars\n\nTrade now on pump.fun:\n${pumpFunUrl}`;

  const handleTweet = () => {
    const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
    window.open(tweetUrl, '_blank');
  };

  return (
    <div className="text-center space-y-8">
      {/* Success animation */}
      <div className="relative">
        <div className="w-20 h-20 mx-auto bg-surface rounded-full flex items-center justify-center border border-border">
          <CheckCircle className="w-10 h-10 text-primary" />
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-medium mb-2">
          GitUp Launched!
        </h2>
        <p className="text-muted text-sm">
          Your repository is now live on pump.fun
        </p>
      </div>

      {/* Token info */}
      <div className="card max-w-sm mx-auto">
        <div className="flex items-center gap-4 mb-6">
          {tokenMetadata.logoPreview ? (
            <img
              src={tokenMetadata.logoPreview}
              alt="Token logo"
              className="w-14 h-14 rounded-full object-cover"
            />
          ) : (
            <div className="w-14 h-14 rounded-full bg-surface flex items-center justify-center border border-border">
              <Rocket className="w-6 h-6 text-secondary" />
            </div>
          )}
          <div className="text-left">
            <h3 className="font-medium">{tokenMetadata.name}</h3>
            <p className="text-secondary font-mono text-sm">
              ${tokenMetadata.symbol}
            </p>
          </div>
        </div>

        {/* Addresses */}
        <div className="space-y-2">
          {/* Mint address */}
          <div className="flex items-center justify-between p-3 bg-dark rounded-md">
            <div className="text-left">
              <p className="text-xs text-muted">Token Mint</p>
              <p className="text-xs font-mono truncate max-w-[180px] text-secondary">
                {tokenMint}
              </p>
            </div>
            <button
              onClick={() => handleCopy(tokenMint!, 'mint')}
              className="p-2 hover:bg-surface rounded-md transition-colors"
            >
              {copied === 'mint' ? (
                <CheckCircle className="w-4 h-4 text-primary" />
              ) : (
                <Copy className="w-4 h-4 text-muted" />
              )}
            </button>
          </div>

          {/* Transaction */}
          <div className="flex items-center justify-between p-3 bg-dark rounded-md">
            <div className="text-left">
              <p className="text-xs text-muted">Transaction</p>
              <p className="text-xs font-mono truncate max-w-[180px] text-secondary">
                {transactionSig}
              </p>
            </div>
            <a
              href={solscanUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 hover:bg-surface rounded-md transition-colors"
            >
              <ExternalLink className="w-4 h-4 text-muted" />
            </a>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-sm mx-auto">
        <a
          href={pumpFunUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary flex items-center justify-center gap-2 flex-1"
        >
          <Rocket className="w-4 h-4" />
          Trade on pump.fun
        </a>

        <button
          onClick={handleTweet}
          className="btn-secondary flex items-center justify-center gap-2 flex-1"
        >
          <Twitter className="w-4 h-4" />
          Share
        </button>
      </div>

      {/* Additional links */}
      <div className="flex justify-center gap-6 text-xs">
        <a
          href={selectedRepo?.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-muted hover:text-primary transition-colors flex items-center gap-1"
        >
          Repository
          <ExternalLink className="w-3 h-3" />
        </a>
        <a
          href={solscanUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-muted hover:text-primary transition-colors flex items-center gap-1"
        >
          Solscan
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
}

export default LaunchSuccess;
