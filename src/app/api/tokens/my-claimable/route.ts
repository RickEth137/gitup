import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

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

    // Format tokens for the claim page
    const formattedTokens = tokens.map((token) => ({
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
      escrowBalance: token.totalFeesEarned - token.totalFeesClaimed,
      launchedAt: token.launchedAt?.toISOString(),
      repoStars: token.repoStars,
      repoForks: token.repoForks,
    }));

    return NextResponse.json({ tokens: formattedTokens });
  } catch (error) {
    console.error('Error fetching claimable tokens:', error);
    return NextResponse.json(
      { error: 'Failed to fetch claimable tokens' },
      { status: 500 }
    );
  }
}
