'use client';

import { useState } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { ExternalLink, Rocket, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';
import { useLaunchStore } from '@/store/launchStore';
import { prepareTokenMetadata } from '@/lib/ipfs';
import {
  createPumpFunToken,
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
      // Stage 1: Upload to IPFS
      setStage('uploading-ipfs');
      setStageMessage('Uploading images to IPFS...');

      const { metadataUri, logoUri, bannerUri } = await prepareTokenMetadata({
        name: tokenMetadata.name,
        symbol: tokenMetadata.symbol,
        description: tokenMetadata.description,
        logo: tokenMetadata.logo!,
        banner: tokenMetadata.banner,
        repoUrl: selectedRepo!.url,
        repoStars: selectedRepo!.stars,
        repoForks: selectedRepo!.forks,
        language: selectedRepo!.language,
      });

      setMetadataUri(metadataUri);
      console.log('Metadata URI:', metadataUri);

      // Stage 2: Create token on pump.fun
      setStage('creating-token');
      setStageMessage('Creating token on pump.fun... Please approve the transaction.');

      const result = await createPumpFunToken({
        name: tokenMetadata.name,
        symbol: tokenMetadata.symbol,
        metadataUri,
        connection,
        wallet: {
          publicKey: wallet.publicKey,
          signTransaction: wallet.signTransaction,
        },
      });

      setTokenMint(result.mint.toBase58());
      setTransactionSig(result.signature);

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
          tokenMint: result.mint.toBase58(),
          metadataUri,
          logoUri,
          bannerUri,
          bondingCurve: result.bondingCurve.toBase58(),
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
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm">{stageMessage}</span>
          </>
        );
      case 'complete':
        return (
          <>
            <CheckCircle className="w-4 h-4" />
            <span>Launched</span>
          </>
        );
      case 'error':
        return (
          <>
            <AlertTriangle className="w-4 h-4" />
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
