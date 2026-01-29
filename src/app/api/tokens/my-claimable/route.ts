import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { calculateTokenFees } from '@/lib/masterDeployer';

/**
 * GET /api/tokens/my-claimable?githubLogin=<username>
 * 
 * Find all tokens launched for repos owned by the connected GitHub user.
 * This allows repo owners to see tokens created for their repos automatically.
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(request.url);
    const githubLogin = searchParams.get('githubLogin');

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!githubLogin) {
      return NextResponse.json({ error: 'GitHub login required' }, { status: 400 });
    }

    // Find tokens where the repoFullName starts with the user's GitHub login
    // e.g., "RickEth137/some-repo" would match for user "RickEth137"
    const tokens = await prisma.tokenizedRepo.findMany({
      where: {
        OR: [
          // Match repos owned by user (owner/repo format)
          { repoFullName: { startsWith: `${githubLogin}/` } },
          // Also match case-insensitive
          { repoFullName: { startsWith: `${githubLogin.toLowerCase()}/` } },
        ],
      },
      orderBy: { launchedAt: 'desc' },
    });

    // Format tokens and fetch real-time fee data for escrow tokens
    const formattedTokens = await Promise.all(
      tokens.map(async (token) => {
        let claimableAmount = 0;
        let totalFeesEarned = token.totalFeesEarned || 0;
        let tradingVolume = 0;

        // For escrow tokens, get real-time fee data from pump.fun
        if (token.isEscrow && !token.isClaimed) {
          try {
            const feeData = await calculateTokenFees(token.tokenMint);
            totalFeesEarned = feeData.feesEarned;
            tradingVolume = feeData.totalVolumeSol;
            claimableAmount = Math.max(0, feeData.feesEarned - (token.totalFeesClaimed || 0));
          } catch (error) {
            console.error(`Error fetching fees for ${token.tokenMint}:`, error);
            claimableAmount = totalFeesEarned - (token.totalFeesClaimed || 0);
          }
        }

        return {
          id: token.id,
          entityType: 'github' as const,
          entityHandle: token.repoFullName,
          entityName: token.repoName,
          tokenName: token.tokenName,
          tokenSymbol: token.tokenSymbol,
          tokenMint: token.tokenMint,
          tokenLogo: token.logoUri,
          isClaimed: token.isClaimed,
          isEscrow: token.isEscrow,
          escrowBalance: claimableAmount,
          totalFeesEarned,
          totalFeesClaimed: token.totalFeesClaimed || 0,
          tradingVolume,
          launchedAt: token.launchedAt?.toISOString(),
          repoStars: token.repoStars,
          repoForks: token.repoForks,
        };
      })
    );

    return NextResponse.json({ tokens: formattedTokens });
  } catch (error) {
    console.error('Error fetching claimable tokens:', error);
    return NextResponse.json(
      { error: 'Failed to fetch claimable tokens' },
      { status: 500 }
    );
  }
}
