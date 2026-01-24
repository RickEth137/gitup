/**
 * pump.fun Integration via PumpPortal API
 *
 * This module provides the interface to interact with pump.fun through
 * the PumpPortal Local Transaction API for token creation, trading,
 * and creator fee collection.
 *
 * API Docs: https://pumpportal.fun
 */

import {
  Connection,
  PublicKey,
  Transaction,
  VersionedTransaction,
  Keypair,
  LAMPORTS_PER_SOL,
} from '@solana/web3.js';

// PumpPortal API endpoints
const PUMPPORTAL_API = 'https://pumpportal.fun/api';
const PUMP_FUN_IPFS = 'https://pump.fun/api/ipfs';
const PUMP_FUN_API = 'https://frontend-api.pump.fun';

// pump.fun Program ID (for reference)
export const PUMP_FUN_PROGRAM_ID = new PublicKey(
  '6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P'
);

// Bonding curve graduation threshold (~$69k market cap = ~85 SOL in curve)
export const BONDING_CURVE_GRADUATION_SOL = 85;

// ============================================================================
// Types
// ============================================================================

export interface TokenMetadata {
  name: string;
  symbol: string;
  description: string;
  image: File | Blob;
  twitter?: string;
  telegram?: string;
  website?: string;
}

export interface CreateTokenParams {
  metadata: TokenMetadata;
  initialBuyAmount: number; // in SOL
  slippage: number; // percentage (e.g., 10 for 10%)
  wallet: {
    publicKey: PublicKey;
    signTransaction: <T extends Transaction | VersionedTransaction>(tx: T) => Promise<T>;
  };
}

export interface CreateTokenResult {
  mint: string;
  signature: string;
  metadataUri: string;
}

export interface TradeParams {
  mint: string;
  action: 'buy' | 'sell';
  amount: number;
  denominatedInSol: boolean;
  slippage: number;
  wallet: {
    publicKey: PublicKey;
    signTransaction: <T extends Transaction | VersionedTransaction>(tx: T) => Promise<T>;
  };
}

export interface BondingCurveData {
  mint: string;
  virtualSolReserves: number;
  virtualTokenReserves: number;
  realSolReserves: number;
  realTokenReserves: number;
  tokenTotalSupply: number;
  complete: boolean;
  progress: number; // 0-100 percentage
  marketCapSol: number;
}

export interface CreatorFeeData {
  totalFeesEarned: number; // in SOL
  unclaimedFees: number; // in SOL
  claimedFees: number; // in SOL
}

export interface TokenInfo {
  mint: string;
  name: string;
  symbol: string;
  description: string;
  image: string;
  creator: string;
  createdTimestamp: number;
  bondingCurve: BondingCurveData | null;
  usdMarketCap?: number;
  replyCount?: number;
}

// ============================================================================
// IPFS Metadata Upload
// ============================================================================

/**
 * Upload token metadata and image to pump.fun's IPFS
 */
export async function uploadMetadataToIPFS(
  metadata: TokenMetadata
): Promise<string> {
  const formData = new FormData();
  formData.append('name', metadata.name);
  formData.append('symbol', metadata.symbol);
  formData.append('description', metadata.description);
  formData.append('showName', 'true');
  
  if (metadata.twitter) formData.append('twitter', metadata.twitter);
  if (metadata.telegram) formData.append('telegram', metadata.telegram);
  if (metadata.website) formData.append('website', metadata.website);
  
  formData.append('file', metadata.image);

  const response = await fetch(PUMP_FUN_IPFS, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Failed to upload metadata: ${response.statusText}`);
  }

  const data = await response.json();
  return data.metadataUri;
}

// ============================================================================
// Token Creation
// ============================================================================

/**
 * Create a new token on pump.fun via PumpPortal
 */
export async function createToken(
  params: CreateTokenParams,
  connection: Connection
): Promise<CreateTokenResult> {
  const { metadata, initialBuyAmount, slippage, wallet } = params;

  // 1. Upload metadata to IPFS
  console.log('Uploading metadata to IPFS...');
  const metadataUri = await uploadMetadataToIPFS(metadata);
  console.log('Metadata URI:', metadataUri);

  // 2. Generate mint keypair
  const mintKeypair = Keypair.generate();
  console.log('Generated mint:', mintKeypair.publicKey.toBase58());

  // 3. Request create transaction from PumpPortal
  const response = await fetch(`${PUMPPORTAL_API}/trade-local`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      publicKey: wallet.publicKey.toBase58(),
      action: 'create',
      tokenMetadata: {
        name: metadata.name,
        symbol: metadata.symbol,
        uri: metadataUri,
      },
      mint: mintKeypair.publicKey.toBase58(),
      denominatedInSol: 'true',
      amount: initialBuyAmount,
      slippage: slippage,
      priorityFee: 0.0005,
      pool: 'pump',
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`PumpPortal API error: ${errorText}`);
  }

  // 4. Deserialize and sign transaction
  const txData = await response.arrayBuffer();
  const tx = VersionedTransaction.deserialize(new Uint8Array(txData));
  
  // Sign with mint keypair first
  tx.sign([mintKeypair]);
  
  // Then sign with wallet
  const signedTx = await wallet.signTransaction(tx);

  // 5. Send transaction
  const signature = await connection.sendRawTransaction(signedTx.serialize(), {
    skipPreflight: false,
    preflightCommitment: 'confirmed',
  });

  console.log('Transaction sent:', signature);

  // 6. Confirm transaction
  const latestBlockhash = await connection.getLatestBlockhash();
  await connection.confirmTransaction({
    signature,
    ...latestBlockhash,
  }, 'confirmed');

  console.log('Token created successfully!');

  return {
    mint: mintKeypair.publicKey.toBase58(),
    signature,
    metadataUri,
  };
}

// ============================================================================
// Trading (Buy/Sell)
// ============================================================================

/**
 * Buy or sell tokens on pump.fun via PumpPortal
 */
export async function trade(
  params: TradeParams,
  connection: Connection
): Promise<string> {
  const { mint, action, amount, denominatedInSol, slippage, wallet } = params;

  const response = await fetch(`${PUMPPORTAL_API}/trade-local`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      publicKey: wallet.publicKey.toBase58(),
      action: action,
      mint: mint,
      amount: amount,
      denominatedInSol: denominatedInSol ? 'true' : 'false',
      slippage: slippage,
      priorityFee: 0.0005,
      pool: 'pump',
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Trade failed: ${errorText}`);
  }

  const txData = await response.arrayBuffer();
  const tx = VersionedTransaction.deserialize(new Uint8Array(txData));
  
  const signedTx = await wallet.signTransaction(tx);

  const signature = await connection.sendRawTransaction(signedTx.serialize(), {
    skipPreflight: false,
    preflightCommitment: 'confirmed',
  });

  const latestBlockhash = await connection.getLatestBlockhash();
  await connection.confirmTransaction({
    signature,
    ...latestBlockhash,
  }, 'confirmed');

  return signature;
}

// ============================================================================
// Creator Fee Collection
// ============================================================================

/**
 * Claim all creator fees from pump.fun
 * Note: pump.fun claims all fees at once, no need to specify token
 */
export async function claimCreatorFees(
  wallet: {
    publicKey: PublicKey;
    signTransaction: <T extends Transaction | VersionedTransaction>(tx: T) => Promise<T>;
  },
  connection: Connection
): Promise<string> {
  const response = await fetch(`${PUMPPORTAL_API}/trade-local`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      publicKey: wallet.publicKey.toBase58(),
      action: 'collectCreatorFee',
      priorityFee: 0.000001,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to claim fees: ${errorText}`);
  }

  const txData = await response.arrayBuffer();
  const tx = VersionedTransaction.deserialize(new Uint8Array(txData));
  
  const signedTx = await wallet.signTransaction(tx);

  const signature = await connection.sendRawTransaction(signedTx.serialize(), {
    skipPreflight: false,
    preflightCommitment: 'confirmed',
  });

  const latestBlockhash = await connection.getLatestBlockhash();
  await connection.confirmTransaction({
    signature,
    ...latestBlockhash,
  }, 'confirmed');

  return signature;
}

// ============================================================================
// Bonding Curve Data Fetching
// ============================================================================

/**
 * Fetch bonding curve data for a token from pump.fun
 */
export async function getBondingCurveData(mint: string): Promise<BondingCurveData | null> {
  try {
    const response = await fetch(`${PUMP_FUN_API}/coins/${mint}`);
    
    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    
    const virtualSolReserves = (data.virtual_sol_reserves || 0) / LAMPORTS_PER_SOL;
    const realSolReserves = (data.real_sol_reserves || 0) / LAMPORTS_PER_SOL;
    
    // Calculate progress (0-100%)
    const progress = Math.min((realSolReserves / BONDING_CURVE_GRADUATION_SOL) * 100, 100);
    
    return {
      mint,
      virtualSolReserves,
      virtualTokenReserves: data.virtual_token_reserves || 0,
      realSolReserves,
      realTokenReserves: data.real_token_reserves || 0,
      tokenTotalSupply: data.total_supply || 0,
      complete: data.complete || progress >= 100,
      progress,
      marketCapSol: virtualSolReserves,
    };
  } catch (error) {
    console.error('Error fetching bonding curve:', error);
    return null;
  }
}

/**
 * Fetch token info including metadata from pump.fun
 */
export async function getTokenInfo(mint: string): Promise<TokenInfo | null> {
  try {
    const response = await fetch(`${PUMP_FUN_API}/coins/${mint}`);
    
    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    const bondingCurve = await getBondingCurveData(mint);
    
    return {
      mint: data.mint,
      name: data.name,
      symbol: data.symbol,
      description: data.description,
      image: data.image_uri,
      creator: data.creator,
      createdTimestamp: data.created_timestamp,
      bondingCurve,
      usdMarketCap: data.usd_market_cap,
      replyCount: data.reply_count,
    };
  } catch (error) {
    console.error('Error fetching token info:', error);
    return null;
  }
}

/**
 * Fetch all tokens created by a wallet
 */
export async function getCreatedTokens(walletAddress: string): Promise<TokenInfo[]> {
  try {
    const response = await fetch(
      `${PUMP_FUN_API}/coins/user-created-coins/${walletAddress}?limit=50&offset=0`
    );
    
    if (!response.ok) {
      return [];
    }

    const coins = await response.json();
    
    // Fetch bonding curve data for each
    const tokensWithCurve = await Promise.all(
      coins.map(async (coin: any) => {
        const bondingCurve = await getBondingCurveData(coin.mint);
        return {
          mint: coin.mint,
          name: coin.name,
          symbol: coin.symbol,
          description: coin.description || '',
          image: coin.image_uri,
          creator: coin.creator,
          createdTimestamp: coin.created_timestamp,
          bondingCurve,
          usdMarketCap: coin.usd_market_cap,
          replyCount: coin.reply_count,
        };
      })
    );
    
    return tokensWithCurve;
  } catch (error) {
    console.error('Error fetching created tokens:', error);
    return [];
  }
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Get the pump.fun URL for a token
 */
export function getPumpFunUrl(mint: string): string {
  return `https://pump.fun/${mint}`;
}

/**
 * Check if pump.fun is available (mainnet only)
 */
export function isPumpFunAvailable(network: string): boolean {
  return network === 'mainnet-beta';
}

// ============================================================================
// Bonding Curve Price Calculations
// ============================================================================

/**
 * pump.fun bonding curve constants
 * - Total supply: 1 billion tokens
 * - Initial virtual SOL reserves: 30 SOL
 * - Initial virtual token reserves: ~1,073,000,191 tokens
 * - Available for bonding curve: ~800 million tokens (80% of supply)
 * - Uses constant product formula: x * y = k
 */
const TOTAL_SUPPLY = 1_000_000_000; // 1 billion tokens
const INITIAL_VIRTUAL_SOL = 30; // 30 SOL
const INITIAL_VIRTUAL_TOKENS = 1_073_000_191; // Initial virtual token reserves
const BONDING_CURVE_SUPPLY = 800_000_000; // 800M tokens available on curve

/**
 * Calculate SOL cost to buy a percentage of token supply at launch
 * Uses the constant product AMM formula: (x + Δx)(y - Δy) = xy
 * Where x = SOL reserves, y = token reserves
 * 
 * @param percentageOfSupply - Percentage of total supply to buy (0-100)
 * @returns SOL amount needed to purchase that percentage
 */
export function calculateSolCostForSupply(percentageOfSupply: number): number {
  if (percentageOfSupply <= 0) return 0;
  if (percentageOfSupply > 10) percentageOfSupply = 10; // Cap at 10% max
  
  // Calculate tokens to buy (percentage of total supply)
  const tokensToBuy = (percentageOfSupply / 100) * TOTAL_SUPPLY;
  
  // Initial state (at token launch)
  const x = INITIAL_VIRTUAL_SOL; // Initial SOL reserves
  const y = INITIAL_VIRTUAL_TOKENS; // Initial token reserves
  const k = x * y; // Constant product
  
  // After buying tokens: (x + solIn) * (y - tokensToBuy) = k
  // Solving for solIn: solIn = k / (y - tokensToBuy) - x
  const newTokenReserves = y - tokensToBuy;
  
  if (newTokenReserves <= 0) {
    // Can't buy more than available
    return BONDING_CURVE_GRADUATION_SOL; // Return max (~85 SOL)
  }
  
  const solCost = (k / newTokenReserves) - x;
  
  return Math.max(0, solCost);
}

/**
 * Calculate what percentage of supply you get for a given SOL amount
 * 
 * @param solAmount - Amount of SOL to spend
 * @returns Percentage of total supply received
 */
export function calculateSupplyForSol(solAmount: number): number {
  if (solAmount <= 0) return 0;
  
  const x = INITIAL_VIRTUAL_SOL;
  const y = INITIAL_VIRTUAL_TOKENS;
  const k = x * y;
  
  // After buying: (x + solAmount) * newY = k
  // newY = k / (x + solAmount)
  // tokensBought = y - newY
  const newTokenReserves = k / (x + solAmount);
  const tokensBought = y - newTokenReserves;
  
  // Convert to percentage of total supply
  const percentage = (tokensBought / TOTAL_SUPPLY) * 100;
  
  return Math.min(percentage, 80); // Cap at 80% (bonding curve max)
}

/**
 * Estimate the cost of creating a token
 */
export function estimateCreateCost(initialBuyAmount: number = 0): {
  rent: number;
  fee: number;
  devBuy: number;
  total: number;
} {
  const rent = 0.02;
  const fee = 0.01;
  const devBuy = initialBuyAmount;
  return { rent, fee, devBuy, total: rent + fee + devBuy };
}

/**
 * Format SOL amount for display
 */
export function formatSol(amount: number): string {
  if (amount >= 1000) {
    return `${(amount / 1000).toFixed(2)}K`;
  }
  if (amount >= 1) {
    return amount.toFixed(2);
  }
  return amount.toFixed(4);
}

/**
 * Calculate token price from bonding curve
 */
export function calculatePrice(bondingCurve: BondingCurveData): number {
  if (bondingCurve.virtualTokenReserves === 0) return 0;
  return bondingCurve.virtualSolReserves / bondingCurve.virtualTokenReserves;
}

