/**
 * POST /api/claim/confirm
 * 
 * Called after user signs and submits the claim transaction.
 * Verifies the transaction and updates the database.
 * 
 * Flow:
 * 1. User calls /api/claim/execute → gets partially signed tx
 * 2. User signs with their wallet and submits to network
 * 3. User calls /api/claim/confirm with the signature
 * 4. We verify and update database
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { Connection } from '@solana/web3.js';
import { calculateTokenFees, verifyClaimTransaction } from '@/lib/masterDeployer';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.githubId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await request.json();
    const { tokenMint, transactionSig, claimerWallet, amountClaimed } = body;

    if (!tokenMint || !transactionSig || !claimerWallet) {
      return NextResponse.json({ error: 'tokenMint, transactionSig, and claimerWallet required' }, { status: 400 });
    }

    // Get the tokenized repo
    const tokenizedRepo = await prisma.tokenizedRepo.findUnique({
      where: { tokenMint },
    });

    if (!tokenizedRepo) {
      return NextResponse.json({ error: 'Token not found' }, { status: 404 });
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { githubId: String(session.user.githubId) },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Verify the transaction on-chain
    const rpcUrl = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com';
    const connection = new Connection(rpcUrl, 'confirmed');
    
    const isConfirmed = await verifyClaimTransaction(connection, transactionSig);
    
    if (!isConfirmed) {
      return NextResponse.json({ error: 'Transaction not confirmed. Please try again.' }, { status: 400 });
    }

    // Get current fee data
    const { feesEarned } = await calculateTokenFees(tokenMint);
    const previouslyClaimed = tokenizedRepo.totalFeesClaimed || 0;
    const claimedAmount = amountClaimed || (feesEarned - previouslyClaimed);

    // Update database
    await prisma.tokenizedRepo.update({
      where: { tokenMint },
      data: {
        totalFeesEarned: feesEarned,
        totalFeesClaimed: previouslyClaimed + claimedAmount,
        lastFeeUpdate: new Date(),
        isClaimed: true,
        claimedAt: new Date(),
        claimedByUserId: user.id,
        claimedByWallet: claimerWallet,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Successfully claimed ${claimedAmount.toFixed(4)} SOL!`,
      transactionSig,
      amountClaimed: claimedAmount,
      totalFeesClaimed: previouslyClaimed + claimedAmount,
    });

  } catch (error) {
    console.error('Error confirming claim:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to confirm claim' },
      { status: 500 }
    );
  }
}
