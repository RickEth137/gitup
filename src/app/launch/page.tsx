'use client';

import { useEffect } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useRouter } from 'next/navigation';
import { Github, Wallet, ArrowRight, CheckCircle } from 'lucide-react';
import {
  StepIndicator,
  RepoSelector,
  TokenBranding,
  LaunchButton,
  LaunchSuccess,
} from '@/components';
import { useLaunchStore, GitHubRepo } from '@/store/launchStore';

export default function LaunchPage() {
  const { data: session, status } = useSession();
  const { connected, publicKey } = useWallet();
  const router = useRouter();

  const {
    currentStep,
    setCurrentStep,
    selectedRepo,
    setSelectedRepo,
    tokenMetadata,
    reset,
  } = useLaunchStore();

  // Determine current step based on auth state
  useEffect(() => {
    if (status === 'loading') return;

    if (!session || !connected) {
      setCurrentStep('connect');
    } else if (currentStep === 'connect') {
      setCurrentStep('select');
    }
  }, [session, connected, status, currentStep, setCurrentStep]);

  const handleRepoSelect = (repo: GitHubRepo) => {
    setSelectedRepo(repo);
  };

  const handleContinueFromSelect = () => {
    if (selectedRepo) {
      setCurrentStep('brand');
    }
  };

  const handleContinueFromBrand = () => {
    if (tokenMetadata.name && tokenMetadata.symbol && tokenMetadata.logo) {
      setCurrentStep('launch');
    }
  };

  const handleLaunchSuccess = () => {
    setCurrentStep('complete');
  };

  const handleStartOver = () => {
    reset();
    setCurrentStep('select');
  };

  const renderStep = () => {
    switch (currentStep) {
      case 'connect':
        return (
          <div className="max-w-md mx-auto">
            <h2 className="text-xl font-medium text-center mb-8">
              Connect Your Accounts
            </h2>

            <div className="space-y-3">
              {/* GitHub Connection */}
              <div
                className={`card flex items-center justify-between ${session ? 'border-border-light' : ''}`}
              >
                <div className="flex items-center gap-3">
                  <Github className="w-5 h-5" />
                  <div>
                    <p className="font-medium text-sm">GitHub</p>
                    {session ? (
                      <p className="text-xs text-secondary">
                        Connected as {(session as any).user?.githubLogin}
                      </p>
                    ) : (
                      <p className="text-xs text-muted">
                        Required for verification
                      </p>
                    )}
                  </div>
                </div>
                {session ? (
                  <CheckCircle className="w-5 h-5 text-primary" />
                ) : (
                  <button
                    onClick={() => signIn('github')}
                    className="btn-primary py-2 px-4 text-sm"
                  >
                    Connect
                  </button>
                )}
              </div>

              {/* Wallet Connection */}
              <div
                className={`card flex items-center justify-between ${connected ? 'border-border-light' : ''}`}
              >
                <div className="flex items-center gap-3">
                  <Wallet className="w-5 h-5" />
                  <div>
                    <p className="font-medium text-sm">Solana Wallet</p>
                    {connected && publicKey ? (
                      <p className="text-xs text-secondary font-mono">
                        {publicKey.toBase58().slice(0, 4)}...{publicKey.toBase58().slice(-4)}
                      </p>
                    ) : (
                      <p className="text-xs text-muted">
                        Required for transactions
                      </p>
                    )}
                  </div>
                </div>
                {connected ? (
                  <CheckCircle className="w-5 h-5 text-primary" />
                ) : (
                  <WalletMultiButton />
                )}
              </div>
            </div>

            {session && connected && (
              <button
                onClick={() => setCurrentStep('select')}
                className="btn-primary w-full mt-8 flex items-center justify-center gap-2"
              >
                Continue
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        );

      case 'select':
        return (
          <div className="max-w-2xl mx-auto">
            <h2 className="text-xl font-medium text-center mb-2">
              Select Repository
            </h2>
            <p className="text-muted text-sm text-center mb-8">
              Choose a public repository you own to tokenize
            </p>

            <RepoSelector onSelect={handleRepoSelect} />

            {selectedRepo && (
              <div className="mt-8">
                <button
                  onClick={handleContinueFromSelect}
                  className="btn-primary w-full flex items-center justify-center gap-2"
                >
                  Continue with {selectedRepo.name}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        );

      case 'brand':
        return (
          <div className="max-w-2xl mx-auto">
            <TokenBranding />

            <div className="mt-8 flex gap-3">
              <button
                onClick={() => setCurrentStep('select')}
                className="btn-secondary flex-1"
              >
                Back
              </button>
              <button
                onClick={handleContinueFromBrand}
                disabled={
                  !tokenMetadata.name ||
                  !tokenMetadata.symbol ||
                  !tokenMetadata.logo
                }
                className="btn-primary flex-1 flex items-center justify-center gap-2"
              >
                Continue
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        );

      case 'launch':
        return (
          <div className="max-w-lg mx-auto">
            <h2 className="text-xl font-medium text-center mb-2">
              Launch Your Token
            </h2>
            <p className="text-muted text-sm text-center mb-8">
              Review and confirm your token launch
            </p>

            {/* Summary */}
            <div className="card mb-6">
              <h3 className="text-xs text-muted uppercase tracking-wider mb-4">Summary</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted">Repository</span>
                  <span className="font-mono text-secondary">{selectedRepo?.fullName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Token Name</span>
                  <span>{tokenMetadata.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Symbol</span>
                  <span className="font-mono">${tokenMetadata.symbol}</span>
                </div>
              </div>
            </div>

            <LaunchButton onSuccess={handleLaunchSuccess} />

            <button
              onClick={() => setCurrentStep('brand')}
              className="btn-secondary w-full mt-3"
            >
              Back
            </button>
          </div>
        );

      case 'complete':
        return (
          <div className="max-w-lg mx-auto">
            <LaunchSuccess />

            <div className="mt-8 flex justify-center">
              <button onClick={handleStartOver} className="btn-secondary">
                Launch Another
              </button>
            </div>
          </div>
        );
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-border border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <StepIndicator currentStep={currentStep} />
        {renderStep()}
      </div>
    </div>
  );
}
