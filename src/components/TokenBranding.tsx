'use client';

import { useLaunchStore } from '@/store/launchStore';
import { ImageUpload } from './ImageUpload';

export function TokenBranding() {
  const { selectedRepo, tokenMetadata, setTokenMetadata } = useLaunchStore();

  const handleLogoChange = (file: File | null, preview: string | null) => {
    setTokenMetadata({ logo: file, logoPreview: preview });
  };

  const handleBannerChange = (file: File | null, preview: string | null) => {
    setTokenMetadata({ banner: file, bannerPreview: preview });
  };

  // Auto-suggest token name and symbol based on repo
  const suggestFromRepo = () => {
    if (selectedRepo) {
      const name = selectedRepo.name
        .split('-')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

      // Create symbol from first letters or abbreviation
      let symbol = selectedRepo.name
        .split('-')
        .map((word) => word.charAt(0).toUpperCase())
        .join('')
        .slice(0, 6);

      if (symbol.length < 3) {
        symbol = selectedRepo.name.toUpperCase().slice(0, 4);
      }

      setTokenMetadata({
        name: name,
        symbol: symbol,
        description: selectedRepo.description || `Token for ${selectedRepo.fullName}`,
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Brand Your Token</h3>
        <button
          onClick={suggestFromRepo}
          className="text-sm text-muted hover:text-primary transition-colors"
        >
          Auto-fill from repo
        </button>
      </div>

      {/* Token Name */}
      <div>
        <label className="block text-sm text-secondary mb-2">
          Token Name *
        </label>
        <input
          type="text"
          value={tokenMetadata.name}
          onChange={(e) => setTokenMetadata({ name: e.target.value })}
          placeholder="e.g., My Awesome Project"
          maxLength={32}
          className="input"
        />
        <p className="text-xs text-muted mt-1.5">
          {tokenMetadata.name.length}/32 characters
        </p>
      </div>

      {/* Token Symbol */}
      <div>
        <label className="block text-sm text-secondary mb-2">
          Token Symbol *
        </label>
        <input
          type="text"
          value={tokenMetadata.symbol}
          onChange={(e) =>
            setTokenMetadata({ symbol: e.target.value.toUpperCase() })
          }
          placeholder="e.g., MAP"
          maxLength={10}
          className="input uppercase"
        />
        <p className="text-xs text-muted mt-1.5">
          {tokenMetadata.symbol.length}/10 characters
        </p>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm text-secondary mb-2">
          Description
        </label>
        <textarea
          value={tokenMetadata.description}
          onChange={(e) => setTokenMetadata({ description: e.target.value })}
          placeholder="Describe your project and token..."
          maxLength={500}
          rows={3}
          className="input resize-none"
        />
        <p className="text-xs text-muted mt-1.5">
          {tokenMetadata.description.length}/500 characters
        </p>
      </div>

      {/* Images */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ImageUpload
          label="Token Logo *"
          description="Square image, recommended 512x512px"
          value={tokenMetadata.logoPreview}
          onChange={handleLogoChange}
          aspectRatio="square"
        />

        <ImageUpload
          label="Banner (Optional)"
          description="Wide image, recommended 1500x500px"
          value={tokenMetadata.bannerPreview}
          onChange={handleBannerChange}
          aspectRatio="banner"
        />
      </div>

      {/* Preview */}
      {selectedRepo && (
        <div className="card bg-dark border-border">
          <h4 className="text-xs text-muted uppercase tracking-wider mb-4">Preview</h4>
          <div className="flex items-center gap-4">
            {tokenMetadata.logoPreview ? (
              <img
                src={tokenMetadata.logoPreview}
                alt="Logo preview"
                className="w-14 h-14 rounded-full object-cover"
              />
            ) : (
              <div className="w-14 h-14 rounded-full bg-surface flex items-center justify-center border border-border">
                <span className="text-xl">◎</span>
              </div>
            )}
            <div>
              <h3 className="font-medium">
                {tokenMetadata.name || 'Token Name'}
              </h3>
              <p className="text-secondary font-mono text-sm">
                ${tokenMetadata.symbol || 'SYMBOL'}
              </p>
              <p className="text-xs text-muted mt-1">
                {selectedRepo.fullName}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TokenBranding;
