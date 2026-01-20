import { create } from 'zustand';

export interface GitHubRepo {
  id: string;
  name: string;
  fullName: string;
  description: string | null;
  url: string;
  stars: number;
  forks: number;
  language: string | null;
  owner: {
    login: string;
    avatarUrl: string;
  };
}

export interface TokenMetadata {
  name: string;
  symbol: string;
  description: string;
  logo: File | null;
  logoPreview: string | null;
  banner: File | null;
  bannerPreview: string | null;
}

export type LaunchStep = 'connect' | 'select' | 'brand' | 'launch' | 'complete';

interface LaunchState {
  // Current step
  currentStep: LaunchStep;
  setCurrentStep: (step: LaunchStep) => void;

  // Selected repo
  selectedRepo: GitHubRepo | null;
  setSelectedRepo: (repo: GitHubRepo | null) => void;

  // Token metadata
  tokenMetadata: TokenMetadata;
  setTokenMetadata: (metadata: Partial<TokenMetadata>) => void;
  resetTokenMetadata: () => void;

  // Launch state
  isLaunching: boolean;
  setIsLaunching: (launching: boolean) => void;
  launchError: string | null;
  setLaunchError: (error: string | null) => void;

  // Results
  tokenMint: string | null;
  setTokenMint: (mint: string | null) => void;
  transactionSig: string | null;
  setTransactionSig: (sig: string | null) => void;
  metadataUri: string | null;
  setMetadataUri: (uri: string | null) => void;

  // Reset all state
  reset: () => void;
}

const initialTokenMetadata: TokenMetadata = {
  name: '',
  symbol: '',
  description: '',
  logo: null,
  logoPreview: null,
  banner: null,
  bannerPreview: null,
};

export const useLaunchStore = create<LaunchState>((set) => ({
  // Current step
  currentStep: 'connect',
  setCurrentStep: (step) => set({ currentStep: step }),

  // Selected repo
  selectedRepo: null,
  setSelectedRepo: (repo) => set({ selectedRepo: repo }),

  // Token metadata
  tokenMetadata: initialTokenMetadata,
  setTokenMetadata: (metadata) =>
    set((state) => ({
      tokenMetadata: { ...state.tokenMetadata, ...metadata },
    })),
  resetTokenMetadata: () => set({ tokenMetadata: initialTokenMetadata }),

  // Launch state
  isLaunching: false,
  setIsLaunching: (launching) => set({ isLaunching: launching }),
  launchError: null,
  setLaunchError: (error) => set({ launchError: error }),

  // Results
  tokenMint: null,
  setTokenMint: (mint) => set({ tokenMint: mint }),
  transactionSig: null,
  setTransactionSig: (sig) => set({ transactionSig: sig }),
  metadataUri: null,
  setMetadataUri: (uri) => set({ metadataUri: uri }),

  // Reset
  reset: () =>
    set({
      currentStep: 'connect',
      selectedRepo: null,
      tokenMetadata: initialTokenMetadata,
      isLaunching: false,
      launchError: null,
      tokenMint: null,
      transactionSig: null,
      metadataUri: null,
    }),
}));
