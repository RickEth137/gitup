'use client';

import { useState } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { useLaunchStore } from '@/store/launchStore';
import {
  createToken,
  getPumpFunUrl,
  estimateCreateCost,
  isPumpFunAvailable,
} from '@/lib/pumpfun';

interface LaunchButtonProps {
  onSuccess: () => void;
}

type LaunchStage =
  | 'idle'
  | 'uploading-ipfs'
  | 'creating-token'
  | 'confirming'
  | 'recording'
  | 'complete'
  | 'error';

export function LaunchButton({ onSuccess }: LaunchButtonProps) {
  const { connection } = useConnection();
  const wallet = useWallet();
  const {
    selectedRepo,
    tokenMetadata,
    setTokenMint,
    setTransactionSig,
    setMetadataUri,
    setLaunchError,
  } = useLaunchStore();

  const [stage, setStage] = useState<LaunchStage>('idle');
  const [stageMessage, setStageMessage] = useState('');
  const [error, setError] = useState<string | null>(null);

  const network = process.env.NEXT_PUBLIC_SOLANA_NETWORK || 'devnet';
  const isMainnet = network === 'mainnet-beta';
  const pumpFunAvailable = isPumpFunAvailable(network);
  const costs = estimateCreateCost();

  // Validation
  const isValid =
    selectedRepo &&
    tokenMetadata.name.length >= 1 &&
    tokenMetadata.symbol.length >= 1 &&
    tokenMetadata.logo;

  const handleLaunch = async () => {
    if (!isValid || !wallet.publicKey || !wallet.signTransaction) {
      return;
    }

    setError(null);
    setLaunchError(null);

    try {
      // Stage 1: Creating token (includes IPFS upload via PumpPortal)
      setStage('uploading-ipfs');
      setStageMessage('Preparing token metadata...');

      // Create the logo blob from the file
      const logoFile = tokenMetadata.logo!;

      // Stage 2: Create token on pump.fun via PumpPortal
      setStage('creating-token');
      setStageMessage('Creating token on pump.fun... Please approve the transaction.');

      const result = await createToken(
        {
          metadata: {
            name: tokenMetadata.name,
            symbol: tokenMetadata.symbol,
            description: tokenMetadata.description || `${selectedRepo!.name} - Tokenized on gitup.fun`,
            image: logoFile,
            website: selectedRepo!.url,
          },
          initialBuyAmount: 0.001, // Small dev buy
          slippage: 10,
          wallet: {
            publicKey: wallet.publicKey,
            signTransaction: wallet.signTransaction,
          },
        },
        connection
      );

      setTokenMint(result.mint);
      setTransactionSig(result.signature);
      setMetadataUri(result.metadataUri);

      // Stage 3: Confirming
      setStage('confirming');
      setStageMessage('Confirming transaction...');

      // Stage 4: Record launch in our database
      setStage('recording');
      setStageMessage('Recording your launch...');

      const recordResponse = await fetch('/api/launch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          repoId: selectedRepo!.id,
          repoName: selectedRepo!.name,
          repoFullName: selectedRepo!.fullName,
          repoDescription: selectedRepo!.description,
          repoUrl: selectedRepo!.url,
          repoStars: selectedRepo!.stars,
          repoForks: selectedRepo!.forks,
          tokenName: tokenMetadata.name,
          tokenSymbol: tokenMetadata.symbol,
          tokenMint: result.mint,
          metadataUri: result.metadataUri,
          transactionSig: result.signature,
        }),
      });

      if (!recordResponse.ok) {
        console.warn('Failed to record launch, but token was created');
      }

      // Complete!
      setStage('complete');
      setStageMessage('🎉 Token launched successfully!');
      onSuccess();
    } catch (err: any) {
      console.error('Launch error:', err);
      setStage('error');
      const errorMessage = err.message || 'An unexpected error occurred';
      setError(errorMessage);
      setLaunchError(errorMessage);
    }
  };

  const getButtonContent = () => {
    switch (stage) {
      case 'idle':
        return (
          <>
            <span>Launch Token</span>
            <span>→</span>
          </>
        );
      case 'uploading-ipfs':
      case 'creating-token':
      case 'confirming':
      case 'recording':
        return (
          <>
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span className="text-sm">{stageMessage}</span>
          </>
        );
      case 'complete':
        return (
          <>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>Launched</span>
          </>
        );
      case 'error':
        return (
          <>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>Try Again</span>
          </>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Cost estimate */}
      <div className="card">
        <h4 className="text-xs text-muted uppercase tracking-wider mb-3">
          Estimated Cost
        </h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted">Account Rent</span>
            <span className="font-mono text-secondary">~{costs.rent} SOL</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted">Transaction Fee</span>
            <span className="font-mono text-secondary">~{costs.fee} SOL</span>
          </div>
          <div className="border-t border-border my-2" />
          <div className="flex justify-between font-medium">
            <span>Total</span>
            <span className="font-mono">~{costs.total} SOL</span>
          </div>
        </div>
      </div>

      {/* Network warning */}
      {!isMainnet && (
        <div className="card border-border-light">
          <p className="text-xs text-muted">
            <span className="text-secondary">Devnet Mode</span> — pump.fun is only available on mainnet. Switch networks for real launches.
          </p>
        </div>
      )}

      {/* Validation errors */}
      {!isValid && (
        <div className="text-xs text-muted">
          <p className="mb-2">Please complete:</p>
          <ul className="space-y-1">
            {!selectedRepo && <li className="flex items-center gap-2"><span className="text-secondary">○</span> Select a repository</li>}
            {tokenMetadata.name.length < 1 && <li className="flex items-center gap-2"><span className="text-secondary">○</span> Enter a token name</li>}
            {tokenMetadata.symbol.length < 1 && <li className="flex items-center gap-2"><span className="text-secondary">○</span> Enter a token symbol</li>}
            {!tokenMetadata.logo && <li className="flex items-center gap-2"><span className="text-secondary">○</span> Upload a token logo</li>}
          </ul>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="card border-border-light">
          <p className="text-xs text-secondary">{error}</p>
        </div>
      )}

      {/* Launch button */}
      <button
        onClick={handleLaunch}
        disabled={!isValid || stage === 'uploading-ipfs' || stage === 'creating-token' || stage === 'confirming' || stage === 'recording'}
        className={`
          w-full flex items-center justify-center gap-2 py-3 px-6 rounded-md
          font-medium text-sm transition-all duration-200
          ${stage === 'complete'
            ? 'bg-primary text-dark'
            : stage === 'error'
            ? 'bg-surface-light text-primary border border-border hover:border-border-light'
            : 'bg-primary text-dark hover:bg-secondary disabled:opacity-40 disabled:cursor-not-allowed'
          }
        `}
      >
        {getButtonContent()}
      </button>

      {/* Stage progress */}
      {stage !== 'idle' && stage !== 'complete' && stage !== 'error' && (
        <div className="text-center text-xs text-muted">
          {stageMessage}
        </div>
      )}
    </div>
  );
}

export default LaunchButton;
