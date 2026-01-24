'use client';

import { useState, useEffect, useCallback } from 'react';
import { getSolPrice } from './solPrice';

/**
 * React hook for real-time SOL price
 * Automatically refreshes every 30 seconds
 */
export function useSolPrice(refreshInterval = 30000) {
  const [price, setPrice] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPrice = useCallback(async () => {
    try {
      setError(null);
      const newPrice = await getSolPrice();
      setPrice(newPrice);
    } catch (err) {
      setError('Failed to fetch SOL price');
      console.error('Price fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Initial fetch
    fetchPrice();

    // Set up interval for auto-refresh
    const interval = setInterval(fetchPrice, refreshInterval);

    return () => clearInterval(interval);
  }, [fetchPrice, refreshInterval]);

  const solToUsd = useCallback((solAmount: number): number => {
    if (!price) return 0;
    return solAmount * price;
  }, [price]);

  const usdToSol = useCallback((usdAmount: number): number => {
    if (!price) return 0;
    return usdAmount / price;
  }, [price]);

  const formatUsd = useCallback((amount: number): string => {
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
  }, []);

  return {
    price,
    loading,
    error,
    refetch: fetchPrice,
    solToUsd,
    usdToSol,
    formatUsd,
  };
}
