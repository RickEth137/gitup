/**
 * Master Deployer System for GitFun
 * 
 * When a user launches a token for a repo they DON'T own:
 * - The MASTER DEPLOYER WALLET deploys the token (so it receives creator fees)
 * - User pays for deployment cost (sent to master wallet)
 * - Fees are tracked PER TOKEN via pump.fun trading volume
 * - Real repo owner can claim their token's specific fees
 * 
 * This prevents fee mixing - each token's fees are calculated independently!
 */

import {
  Keypair,
  PublicKey,
  Connection,
  VersionedTransaction,
  LAMPORTS_PER_SOL,
  SystemProgram,
  Transaction,
} from '@solana/web3.js';
import bs58 from 'bs58';

// PumpPortal API
const PUMPPORTAL_API = 'https://pumpportal.fun/api';
const PUMP_FUN_API = 'https://frontend-api.pump.fun';

// Creator fee rate on pump.fun (0.5% of trading volume)
export const CREATOR_FEE_RATE = 0.005;

/**
 * Get the master deployer keypair from environment
 * This wallet is funded by you and deploys all non-owner tokens
 */
export function getMasterDeployerKeypair(): Keypair {
  const privateKey = process.env.MASTER_DEPLOYER_PRIVATE_KEY;
  
  if (!privateKey) {
    throw new Error('MASTER_DEPLOYER_PRIVATE_KEY not configured');
  }
  
  try {
    // Try base58 format first
    const decoded = bs58.decode(privateKey);
    return Keypair.fromSecretKey(decoded);
  } catch {
    // Try JSON array format
    try {
      const keyArray = JSON.parse(privateKey);
      return Keypair.fromSecretKey(new Uint8Array(keyArray));
    } catch {
      throw new Error('Invalid MASTER_DEPLOYER_PRIVATE_KEY format. Use base58 or JSON array.');
    }
  }
}

/**
 * Get master deployer public key (for display/verification)
 */
export function getMasterDeployerPublicKey(): string {
  const keypair = getMasterDeployerKeypair();
  return keypair.publicKey.toBase58();
}

/**
 * Check master deployer balance
 */
export async function getMasterDeployerBalance(connection: Connection): Promise<number> {
  const keypair = getMasterDeployerKeypair();
  const balance = await connection.getBalance(keypair.publicKey);
  return balance / LAMPORTS_PER_SOL;
}

/**
 * Deployment cost estimate (rent + pump.fun fee + priority fee)
 */
export function getDeploymentCost(): number {
  return 0.025; // ~0.02 rent + ~0.005 fees
}

/**
 * Deploy a token using the master deployer wallet
 * Called server-side only!
 */
export async function deployWithMasterWallet(
  connection: Connection,
  metadataUri: string,
  tokenName: string,
  tokenSymbol: string,
  initialBuyAmount: number = 0,
  slippage: number = 10
): Promise<{
  mint: string;
  signature: string;
}> {
  const masterKeypair = getMasterDeployerKeypair();
  
  // Generate mint keypair
  const mintKeypair = Keypair.generate();
  console.log('[MasterDeployer] Deploying token:', tokenName, tokenSymbol);
  console.log('[MasterDeployer] Mint:', mintKeypair.publicKey.toBase58());
  console.log('[MasterDeployer] Deployer:', masterKeypair.publicKey.toBase58());
  
  // Request transaction from PumpPortal
  const response = await fetch(`${PUMPPORTAL_API}/trade-local`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      publicKey: masterKeypair.publicKey.toBase58(), // MASTER wallet deploys!
      action: 'create',
      tokenMetadata: {
        name: tokenName,
        symbol: tokenSymbol,
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

  // Deserialize transaction
  const txData = await response.arrayBuffer();
  const tx = VersionedTransaction.deserialize(new Uint8Array(txData));
  
  // Sign with mint keypair
  tx.sign([mintKeypair]);
  
  // Sign with master deployer keypair (this makes master the creator!)
  tx.sign([masterKeypair]);

  // Send transaction
  const signature = await connection.sendRawTransaction(tx.serialize(), {
    skipPreflight: false,
    preflightCommitment: 'confirmed',
  });

  console.log('[MasterDeployer] Transaction sent:', signature);

  // Confirm
  const latestBlockhash = await connection.getLatestBlockhash();
  await connection.confirmTransaction({
    signature,
    ...latestBlockhash,
  }, 'confirmed');

  console.log('[MasterDeployer] Token deployed successfully!');

  return {
    mint: mintKeypair.publicKey.toBase58(),
    signature,
  };
}

/**
 * Calculate fees earned for a specific token
 * Based on pump.fun trading volume (creator gets 0.5%)
 */
export async function calculateTokenFees(mint: string): Promise<{
  totalVolumeSol: number;
  feesEarned: number;
  lastTrade: Date | null;
}> {
  try {
    // Get token data from pump.fun API
    const response = await fetch(`${PUMP_FUN_API}/coins/${mint}`);
    
    if (!response.ok) {
      console.error('Failed to fetch token data:', mint);
      return { totalVolumeSol: 0, feesEarned: 0, lastTrade: null };
    }
    
    const data = await response.json();
    
    // pump.fun returns total_volume or we calculate from trade history
    // Volume is typically in the response, but let's also fetch trades
    let totalVolumeSol = 0;
    
    // Try to get from coin data first
    if (data.total_volume) {
      totalVolumeSol = data.total_volume / LAMPORTS_PER_SOL;
    } else {
      // Fetch trade history to calculate volume
      const tradesResponse = await fetch(`${PUMP_FUN_API}/trades/all/${mint}?limit=1000`);
      if (tradesResponse.ok) {
        const trades = await tradesResponse.json();
        totalVolumeSol = trades.reduce((sum: number, trade: any) => {
          return sum + (trade.sol_amount || 0) / LAMPORTS_PER_SOL;
        }, 0);
      }
    }
    
    // Creator fee = 0.5% of volume
    const feesEarned = totalVolumeSol * CREATOR_FEE_RATE;
    
    // Get last trade timestamp
    const lastTradeTimestamp = data.last_trade_timestamp 
      ? new Date(data.last_trade_timestamp * 1000) 
      : null;
    
    return {
      totalVolumeSol,
      feesEarned,
      lastTrade: lastTradeTimestamp,
    };
  } catch (error) {
    console.error('Error calculating token fees:', error);
    return { totalVolumeSol: 0, feesEarned: 0, lastTrade: null };
  }
}

/**
 * Create a claim transaction where:
 * - CLAIMER pays the transaction fee
 * - MASTER WALLET sends the funds
 * - Returns partially signed transaction (signed by master)
 * - Claimer must sign and submit
 */
export async function createClaimTransaction(
  connection: Connection,
  recipientWallet: string,
  amountSol: number
): Promise<{
  transaction: string; // Base64 encoded, partially signed
  amountSol: number;
}> {
  if (amountSol <= 0) {
    throw new Error('No fees to claim');
  }
  
  const masterKeypair = getMasterDeployerKeypair();
  const recipientPubkey = new PublicKey(recipientWallet);
  
  // Check master wallet has enough balance
  const balance = await connection.getBalance(masterKeypair.publicKey);
  const amountLamports = Math.floor(amountSol * LAMPORTS_PER_SOL);
  
  // Leave some SOL for future deployments (at least 1 SOL buffer)
  const minBuffer = 1 * LAMPORTS_PER_SOL;
  if (balance - amountLamports < minBuffer) {
    throw new Error(`Insufficient funds in master wallet. Available: ${(balance - minBuffer) / LAMPORTS_PER_SOL} SOL`);
  }
  
  // Create transfer transaction
  const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
  
  const transaction = new Transaction({
    feePayer: recipientPubkey, // CLAIMER pays the fee!
    blockhash,
    lastValidBlockHeight,
  });
  
  transaction.add(
    SystemProgram.transfer({
      fromPubkey: masterKeypair.publicKey,
      toPubkey: recipientPubkey,
      lamports: amountLamports,
    })
  );
  
  // Partially sign with master wallet (authorizes the transfer)
  transaction.partialSign(masterKeypair);
  
  // Serialize for client to sign
  const serialized = transaction.serialize({
    requireAllSignatures: false,
  });
  
  console.log(`[MasterDeployer] Created claim tx for ${amountSol} SOL to ${recipientWallet}`);
  
  return {
    transaction: serialized.toString('base64'),
    amountSol,
  };
}

/**
 * Verify a claim transaction was successful
 */
export async function verifyClaimTransaction(
  connection: Connection,
  signature: string
): Promise<boolean> {
  try {
    const tx = await connection.getTransaction(signature, {
      maxSupportedTransactionVersion: 0,
    });
    return tx !== null && !tx.meta?.err;
  } catch {
    return false;
  }
}

/**
 * Create a transaction for user to pay deployment cost to master wallet
 * Returns a partially constructed transaction that user needs to sign
 */
export async function createPaymentTransaction(
  connection: Connection,
  payerWallet: string,
  amountSol: number
): Promise<{
  transaction: string; // base64 encoded
  masterWallet: string;
}> {
  const masterKeypair = getMasterDeployerKeypair();
  const payerPubkey = new PublicKey(payerWallet);
  
  const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
  
  const transaction = new Transaction({
    feePayer: payerPubkey, // User pays tx fee
    blockhash,
    lastValidBlockHeight,
  });
  
  transaction.add(
    SystemProgram.transfer({
      fromPubkey: payerPubkey,
      toPubkey: masterKeypair.publicKey,
      lamports: Math.floor(amountSol * LAMPORTS_PER_SOL),
    })
  );
  
  // Serialize (user needs to sign)
  const serialized = transaction.serialize({
    requireAllSignatures: false,
    verifySignatures: false,
  });
  
  return {
    transaction: serialized.toString('base64'),
    masterWallet: masterKeypair.publicKey.toBase58(),
  };
}
