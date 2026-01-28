/**
 * GET /api/tokens/check-claim
 * 
 * Check if the authenticated user can claim fees for a specific token.
 * Returns eligibility status and claimable amount.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { calculateTokenFees } from '@/lib/masterDeployer';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tokenMint = searchParams.get('tokenMint');

    if (!tokenMint) {
      return NextResponse.json({ error: 'tokenMint is required' }, { status: 400 });
    }

    // Get the tokenized repo
    const tokenizedRepo = await prisma.tokenizedRepo.findUnique({
      where: { tokenMint },
      include: { User: true },
    });

    if (!tokenizedRepo) {
      return NextResponse.json({ error: 'Token not found' }, { status: 404 });
    }

    // Basic info for non-authenticated users
    const baseInfo = {
      tokenMint: tokenizedRepo.tokenMint,
      repoFullName: tokenizedRepo.repoFullName,
      repoUrl: tokenizedRepo.repoUrl,
      tokenName: tokenizedRepo.tokenName,
      tokenSymbol: tokenizedRepo.tokenSymbol,
      isEscrow: tokenizedRepo.isEscrow,
      isClaimed: tokenizedRepo.isClaimed,
      claimedAt: tokenizedRepo.claimedAt,
      launchedBy: tokenizedRepo.User.githubLogin,
    };

    // If not an escrow token (owner launched it), can't claim
    if (!tokenizedRepo.isEscrow) {
      return NextResponse.json({
        ...baseInfo,
        canClaim: false,
        claimableAmount: 0,
        reason: 'Token was launched by the repo owner - no fees to claim',
      });
    }

    // Calculate fees from trading volume
    const { feesEarned, totalVolumeSol, lastTrade } = await calculateTokenFees(tokenMint);
    const alreadyClaimed = tokenizedRepo.totalFeesClaimed || 0;
    const claimableAmount = Math.max(0, feesEarned - alreadyClaimed);

    // Check if user is authenticated
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.githubId) {
      return NextResponse.json({
        ...baseInfo,
        claimableAmount,
        totalFeesEarned: feesEarned,
        totalFeesClaimed: alreadyClaimed,
        tradingVolume: totalVolumeSol,
        lastTrade,
        canClaim: null, // Unknown - need auth
        reason: 'Sign in with GitHub to check if you can claim',
      });
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { githubId: String(session.user.githubId) },
    });

    if (!user?.accessToken || !user?.githubLogin) {
      return NextResponse.json({
        ...baseInfo,
        claimableAmount,
        totalFeesEarned: feesEarned,
        totalFeesClaimed: alreadyClaimed,
        tradingVolume: totalVolumeSol,
        lastTrade,
        canClaim: false,
        reason: 'GitHub authentication required to verify ownership',
      });
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
      return NextResponse.json({
        ...baseInfo,
        claimableAmount,
        totalFeesEarned: feesEarned,
        totalFeesClaimed: alreadyClaimed,
        tradingVolume: totalVolumeSol,
        lastTrade,
        canClaim: false,
        reason: 'Failed to verify repo ownership',
      });
    }

    const repoData = await repoResponse.json();
    const isOwner = repoData.owner.login.toLowerCase() === user.githubLogin.toLowerCase();
    const hasPermission = repoData.permissions?.admin === true;
    const canClaim = (isOwner || hasPermission) && claimableAmount > 0;

    return NextResponse.json({
      ...baseInfo,
      claimableAmount,
      totalFeesEarned: feesEarned,
      totalFeesClaimed: alreadyClaimed,
      tradingVolume: totalVolumeSol,
      lastTrade,
      canClaim,
      isRepoOwner: isOwner,
      hasAdminPermission: hasPermission,
      reason: canClaim 
        ? `You can claim ${claimableAmount.toFixed(4)} SOL in creator fees!`
        : isOwner || hasPermission
          ? 'No fees to claim yet - check back after more trading'
          : 'You are not the owner or admin of this repository',
    });

  } catch (error) {
    console.error('Check claim error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to check claim eligibility' },
      { status: 500 }
    );
  }
}
