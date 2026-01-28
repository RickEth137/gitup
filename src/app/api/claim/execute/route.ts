/**
 * POST /api/claim/execute
 * 
 * Executes a claim for verified repo owners.
 * Calculates fees from trading volume and transfers from master wallet.
 * 
 * NEW SYSTEM: Uses master deployer wallet + per-token fee tracking
 * - Master wallet deploys all non-owner tokens
 * - Fees are calculated from pump.fun trading volume (0.5%)
 * - Each token's fees are tracked separately
 * - Owner can claim multiple times as fees accumulate
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { Connection } from '@solana/web3.js';
import { calculateTokenFees, createClaimTransaction } from '@/lib/masterDeployer';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.githubId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await request.json();
    const { tokenMint, claimerWallet } = body;

    if (!tokenMint || !claimerWallet) {
      return NextResponse.json({ error: 'tokenMint and claimerWallet required' }, { status: 400 });
    }

    // Get the tokenized repo
    const tokenizedRepo = await prisma.tokenizedRepo.findUnique({
      where: { tokenMint },
    });

    if (!tokenizedRepo) {
      return NextResponse.json({ error: 'Token not found' }, { status: 404 });
    }

    if (!tokenizedRepo.isEscrow) {
      return NextResponse.json(
        { error: 'This token was launched by the owner - no fees to claim' },
        { status: 400 }
      );
    }

    // Get claimer from database
    const user = await prisma.user.findUnique({
      where: { githubId: String(session.user.githubId) },
    });

    if (!user?.accessToken || !user?.githubLogin) {
      return NextResponse.json(
        { error: 'GitHub authentication required to verify ownership' },
        { status: 403 }
      );
    }

    // Verify ownership via GitHub API
    const repoResponse = await fetch(
      `https://api.github.com/repos/${tokenizedRepo.repoFullName}`,
      {
        headers: {
          Authorization: `Bearer ${user.accessToken}`,
          Accept: 'application/vnd.github.v3+json',
        },
      }
    );

    if (!repoResponse.ok) {
      return NextResponse.json({ error: 'Failed to verify repo ownership' }, { status: 403 });
    }

    const repoData = await repoResponse.json();
    const isOwner = repoData.owner.login.toLowerCase() === user.githubLogin.toLowerCase();
    const hasPermission = repoData.permissions?.admin === true;

    if (!isOwner && !hasPermission) {
      return NextResponse.json(
        { error: 'You must be the repo owner or admin to claim' },
        { status: 403 }
      );
    }

    // Calculate fees from trading volume
    const { feesEarned, totalVolumeSol } = await calculateTokenFees(tokenMint);
    
    // Calculate claimable amount (earned - already claimed)
    const alreadyClaimed = tokenizedRepo.totalFeesClaimed || 0;
    const claimableAmount = feesEarned - alreadyClaimed;

    if (claimableAmount <= 0.0001) { // Minimum 0.0001 SOL to claim
      return NextResponse.json({
        error: 'No fees available to claim yet',
        totalFeesEarned: feesEarned,
        totalFeesClaimed: alreadyClaimed,
        tradingVolume: totalVolumeSol,
      }, { status: 400 });
    }

    // Connect to Solana
    const rpcUrl = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com';
    const connection = new Connection(rpcUrl, 'confirmed');

    // Create claim transaction (partially signed by master wallet)
    // User will sign and submit - USER PAYS THE TX FEE
    const { transaction, amountSol } = await createClaimTransaction(
      connection,
      claimerWallet,
      claimableAmount
    );

    // Store pending claim info for confirmation
    // Database will be updated when user confirms the transaction
    return NextResponse.json({
      success: true,
      transaction, // Base64 encoded, partially signed
      claimableAmount: amountSol,
      totalFeesEarned: feesEarned,
      totalFeesClaimed: alreadyClaimed,
      tradingVolume: totalVolumeSol,
      message: `Sign the transaction to claim ${amountSol.toFixed(4)} SOL. You pay the ~0.000005 SOL tx fee.`,
    });

  } catch (error) {
    console.error('Claim error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Claim failed' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/claim/execute?tokenMint=xxx
 * Check claimable fees for a token
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tokenMint = searchParams.get('tokenMint');

    if (!tokenMint) {
      return NextResponse.json({ error: 'tokenMint required' }, { status: 400 });
    }

    const tokenizedRepo = await prisma.tokenizedRepo.findUnique({
      where: { tokenMint },
    });

    if (!tokenizedRepo) {
      return NextResponse.json({ error: 'Token not found' }, { status: 404 });
    }

    if (!tokenizedRepo.isEscrow) {
      return NextResponse.json({
        isEscrow: false,
        isClaimed: true,
        claimableAmount: 0,
        escrowBalance: 0, // backwards compatibility
        message: 'Token launched by owner - no fees to claim',
      });
    }

    // Calculate current fees from trading volume
    const { feesEarned, totalVolumeSol, lastTrade } = await calculateTokenFees(tokenMint);
    const alreadyClaimed = tokenizedRepo.totalFeesClaimed || 0;
    const claimableAmount = Math.max(0, feesEarned - alreadyClaimed);

    return NextResponse.json({
      isEscrow: true,
      isClaimed: tokenizedRepo.isClaimed,
      claimedAt: tokenizedRepo.claimedAt,
      claimedByWallet: tokenizedRepo.claimedByWallet,
      totalFeesEarned: feesEarned,
      totalFeesClaimed: alreadyClaimed,
      claimableAmount,
      escrowBalance: claimableAmount, // backwards compatibility
      tradingVolume: totalVolumeSol,
      lastTrade,
      message: claimableAmount > 0 
        ? `${claimableAmount.toFixed(4)} SOL available to claim`
        : 'No fees to claim yet',
    });

  } catch (error) {
    console.error('Check claim error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to check fees' },
      { status: 500 }
    );
  }
}
