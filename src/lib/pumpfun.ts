/**
 * pump.fun Integration Module
 *
 * This module provides the interface to interact with pump.fun's bonding curve program
 * on Solana for token creation.
 *
 * pump.fun Program ID: 6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P
 */

import {
  Connection,
  PublicKey,
  Transaction,
  TransactionInstruction,
  SystemProgram,
  LAMPORTS_PER_SOL,
  Keypair,
  ComputeBudgetProgram,
} from '@solana/web3.js';
import {
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress,
} from '@solana/spl-token';
import * as bs58 from 'bs58';

// pump.fun Program Constants
export const PUMP_FUN_PROGRAM_ID = new PublicKey(
  '6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P'
);

export const PUMP_FUN_GLOBAL = new PublicKey(
  '4wTV1YmiEkRvAtNtsSGPtUrqRYQMe5SKy2uB4Jjaxnjf'
);

export const PUMP_FUN_FEE_RECIPIENT = new PublicKey(
  'CebN5WGQ4jvEPvsVU4EoHEpgzq1VV7AbicfhtW4xC9iM'
);

export const PUMP_FUN_EVENT_AUTHORITY = new PublicKey(
  'Ce6TQqeHC9p8KetsN6JsjHK7UTZk7nasjjnr7XxXp9F1'
);

export const MPL_TOKEN_METADATA_PROGRAM_ID = new PublicKey(
  'metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s'
);

// Discriminator for the "create" instruction
const CREATE_DISCRIMINATOR = Buffer.from([24, 30, 200, 40, 5, 28, 7, 119]);

export interface CreateTokenParams {
  name: string;
  symbol: string;
  metadataUri: string;
  connection: Connection;
  wallet: {
    publicKey: PublicKey;
    signTransaction: (tx: Transaction) => Promise<Transaction>;
  };
}

export interface CreateTokenResult {
  mint: PublicKey;
  signature: string;
  bondingCurve: PublicKey;
}

/**
 * Derive the bonding curve PDA for a given mint
 */
export function deriveBondingCurvePDA(mint: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('bonding-curve'), mint.toBuffer()],
    PUMP_FUN_PROGRAM_ID
  );
}

/**
 * Derive the metadata PDA for a given mint
 */
export function deriveMetadataPDA(mint: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [
      Buffer.from('metadata'),
      MPL_TOKEN_METADATA_PROGRAM_ID.toBuffer(),
      mint.toBuffer(),
    ],
    MPL_TOKEN_METADATA_PROGRAM_ID
  );
}

/**
 * Create the instruction data for pump.fun token creation
 */
function createInstructionData(
  name: string,
  symbol: string,
  uri: string
): Buffer {
  // Encode strings with length prefix (u32 LE)
  const nameBytes = Buffer.from(name);
  const symbolBytes = Buffer.from(symbol);
  const uriBytes = Buffer.from(uri);

  // Calculate total size
  const totalSize =
    8 + // discriminator
    4 + nameBytes.length + // name with length prefix
    4 + symbolBytes.length + // symbol with length prefix
    4 + uriBytes.length; // uri with length prefix

  const buffer = Buffer.alloc(totalSize);
  let offset = 0;

  // Write discriminator
  CREATE_DISCRIMINATOR.copy(buffer, offset);
  offset += 8;

  // Write name
  buffer.writeUInt32LE(nameBytes.length, offset);
  offset += 4;
  nameBytes.copy(buffer, offset);
  offset += nameBytes.length;

  // Write symbol
  buffer.writeUInt32LE(symbolBytes.length, offset);
  offset += 4;
  symbolBytes.copy(buffer, offset);
  offset += symbolBytes.length;

  // Write uri
  buffer.writeUInt32LE(uriBytes.length, offset);
  offset += 4;
  uriBytes.copy(buffer, offset);

  return buffer;
}

/**
 * Create a new token on pump.fun
 *
 * This function:
 * 1. Generates a new mint keypair
 * 2. Derives all necessary PDAs
 * 3. Creates the transaction with the create instruction
 * 4. Returns the transaction for signing
 */
export async function createPumpFunToken(
  params: CreateTokenParams
): Promise<CreateTokenResult> {
  const { name, symbol, metadataUri, connection, wallet } = params;

  // Generate new mint keypair
  const mintKeypair = Keypair.generate();
  const mint = mintKeypair.publicKey;

  console.log('Creating token with mint:', mint.toBase58());

  // Derive PDAs
  const [bondingCurve] = deriveBondingCurvePDA(mint);
  const [metadata] = deriveMetadataPDA(mint);

  // Get associated token accounts
  const associatedBondingCurve = await getAssociatedTokenAddress(
    mint,
    bondingCurve,
    true
  );

  // Create instruction data
  const instructionData = createInstructionData(name, symbol, metadataUri);

  // Build the create instruction
  const createInstruction = new TransactionInstruction({
    programId: PUMP_FUN_PROGRAM_ID,
    keys: [
      { pubkey: mint, isSigner: true, isWritable: true },
      { pubkey: wallet.publicKey, isSigner: true, isWritable: true },
      { pubkey: bondingCurve, isSigner: false, isWritable: true },
      { pubkey: associatedBondingCurve, isSigner: false, isWritable: true },
      { pubkey: PUMP_FUN_GLOBAL, isSigner: false, isWritable: false },
      { pubkey: MPL_TOKEN_METADATA_PROGRAM_ID, isSigner: false, isWritable: false },
      { pubkey: metadata, isSigner: false, isWritable: true },
      { pubkey: wallet.publicKey, isSigner: true, isWritable: true },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
      { pubkey: ASSOCIATED_TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
      { pubkey: new PublicKey('SysvarRent111111111111111111111111111111111'), isSigner: false, isWritable: false },
      { pubkey: PUMP_FUN_EVENT_AUTHORITY, isSigner: false, isWritable: false },
      { pubkey: PUMP_FUN_PROGRAM_ID, isSigner: false, isWritable: false },
    ],
    data: instructionData,
  });

  // Get recent blockhash
  const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();

  // Create transaction
  const transaction = new Transaction();

  // Add compute budget instructions for priority
  transaction.add(
    ComputeBudgetProgram.setComputeUnitLimit({ units: 250_000 }),
    ComputeBudgetProgram.setComputeUnitPrice({ microLamports: 50_000 })
  );

  // Add create instruction
  transaction.add(createInstruction);

  transaction.recentBlockhash = blockhash;
  transaction.feePayer = wallet.publicKey;

  // Partially sign with mint keypair
  transaction.partialSign(mintKeypair);

  // Get user signature
  const signedTransaction = await wallet.signTransaction(transaction);

  // Send transaction
  const signature = await connection.sendRawTransaction(
    signedTransaction.serialize(),
    {
      skipPreflight: false,
      preflightCommitment: 'confirmed',
    }
  );

  console.log('Transaction sent:', signature);

  // Confirm transaction
  const confirmation = await connection.confirmTransaction(
    {
      signature,
      blockhash,
      lastValidBlockHeight,
    },
    'confirmed'
  );

  if (confirmation.value.err) {
    throw new Error(`Transaction failed: ${JSON.stringify(confirmation.value.err)}`);
  }

  console.log('Token created successfully!');
  console.log('Mint:', mint.toBase58());
  console.log('Signature:', signature);

  return {
    mint,
    signature,
    bondingCurve,
  };
}

/**
 * Get the pump.fun trade URL for a token
 */
export function getPumpFunUrl(mint: PublicKey | string): string {
  const mintAddress = typeof mint === 'string' ? mint : mint.toBase58();
  return `https://pump.fun/${mintAddress}`;
}

/**
 * Check if pump.fun is available (mainnet check)
 */
export function isPumpFunAvailable(network: string): boolean {
  // pump.fun only works on mainnet-beta
  return network === 'mainnet-beta';
}

/**
 * Estimate the cost of creating a token on pump.fun
 * Approximate costs in SOL
 */
export function estimateCreateCost(): {
  rent: number;
  fee: number;
  total: number;
} {
  const rent = 0.02; // Approximate rent for accounts
  const fee = 0.01; // Transaction + priority fees
  const total = rent + fee;

  return { rent, fee, total };
}
