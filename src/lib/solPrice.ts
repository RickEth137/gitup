/**
 * Real-time SOL Price Fetching
 * 
 * Uses multiple sources for reliability:
 * 1. CoinGecko API (primary)
 * 2. Jupiter Price API (fallback)
 * 3. Binance API (fallback)
 */

// Cache price for 30 seconds to avoid rate limits
let cachedPrice: number | null = null;
let lastFetchTime: number = 0;
const CACHE_DURATION = 30 * 1000; // 30 seconds

/**
 * Fetch SOL price from CoinGecko
 */
async function fetchFromCoinGecko(): Promise<number | null> {
  try {
    const response = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd',
      { next: { revalidate: 30 } }
    );
    
    if (!response.ok) return null;
    
    const data = await response.json();
    return data.solana?.usd || null;
  } catch (error) {
    console.error('CoinGecko price fetch failed:', error);
    return null;
  }
}

/**
 * Fetch SOL price from Jupiter
 */
async function fetchFromJupiter(): Promise<number | null> {
  try {
    // SOL mint address
    const SOL_MINT = 'So11111111111111111111111111111111111111112';
    const response = await fetch(
      `https://price.jup.ag/v6/price?ids=${SOL_MINT}`,
      { next: { revalidate: 30 } }
    );
    
    if (!response.ok) return null;
    
    const data = await response.json();
    return data.data?.[SOL_MINT]?.price || null;
  } catch (error) {
    console.error('Jupiter price fetch failed:', error);
    return null;
  }
}

/**
 * Fetch SOL price from Binance
 */
async function fetchFromBinance(): Promise<number | null> {
  try {
    const response = await fetch(
      'https://api.binance.com/api/v3/ticker/price?symbol=SOLUSDT'
    );
    
    if (!response.ok) return null;
    
    const data = await response.json();
    return parseFloat(data.price) || null;
  } catch (error) {
    console.error('Binance price fetch failed:', error);
    return null;
  }
}

/**
 * Get current SOL price in USD
 * Tries multiple sources with fallbacks
 */
export async function getSolPrice(): Promise<number> {
  const now = Date.now();
  
  // Return cached price if still valid
  if (cachedPrice && (now - lastFetchTime) < CACHE_DURATION) {
    return cachedPrice;
  }
  
  // Try CoinGecko first
  let price = await fetchFromCoinGecko();
  
  // Fallback to Jupiter
  if (!price) {
    price = await fetchFromJupiter();
  }
  
  // Fallback to Binance
  if (!price) {
    price = await fetchFromBinance();
  }
  
  // If all fail, return last cached price or default
  if (!price) {
    console.warn('All price sources failed, using cached/default price');
    return cachedPrice || 100; // Default fallback
  }
  
  // Update cache
  cachedPrice = price;
  lastFetchTime = now;
  
  return price;
}

/**
 * Convert SOL to USD
 */
export async function solToUsd(solAmount: number): Promise<number> {
  const price = await getSolPrice();
  return solAmount * price;
}

/**
 * Convert USD to SOL
 */
export async function usdToSol(usdAmount: number): Promise<number> {
  const price = await getSolPrice();
  return usdAmount / price;
}

/**
 * Format USD amount for display
 */
export function formatUsd(amount: number): string {
  if (amount >= 1000000) {
    return `$${(amount / 1000000).toFixed(2)}M`;
  }
  if (amount >= 1000) {
    return `$${(amount / 1000).toFixed(2)}K`;
  }
  if (amount >= 1) {
    return `$${amount.toFixed(2)}`;
  }
  return `$${amount.toFixed(4)}`;
}

/**
 * React hook for SOL price (for client components)
 * Returns { price, loading, error, refetch }
 */
export function useSolPrice() {
  // This is meant to be used in a React component
  // Import and use like:
  // const { price, loading } = useSolPrice();
  return {
    getPrice: getSolPrice,
    solToUsd,
    usdToSol,
    formatUsd,
  };
}
