import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Search for tokens by repo name, handle, or token mint
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    
    if (!query || query.length < 2) {
      return NextResponse.json({ tokens: [] });
    }

    const tokens = await prisma.tokenizedRepo.findMany({
      where: {
        OR: [
          { repoFullName: { contains: query, mode: 'insensitive' } },
          { repoName: { contains: query, mode: 'insensitive' } },
          { tokenName: { contains: query, mode: 'insensitive' } },
          { tokenSymbol: { contains: query, mode: 'insensitive' } },
          { tokenMint: { contains: query, mode: 'insensitive' } },
        ],
      },
      take: 20,
      orderBy: { launchedAt: 'desc' },
      select: {
        id: true,
        repoId: true,
        repoName: true,
        repoFullName: true,
        repoUrl: true,
        tokenName: true,
        tokenSymbol: true,
        tokenMint: true,
        logoUri: true,
        isClaimed: true,
        isEscrow: true,
        totalFeesEarned: true,
        totalFeesClaimed: true,
        claimedAt: true,
        launchedAt: true,
        User: {
          select: {
            githubLogin: true,
            avatarUrl: true,
          },
        },
      },
    });

    // Map to expected format for claim page
    const formattedTokens = tokens.map(t => ({
      id: t.id,
      entityType: 'github' as const,
      entityHandle: t.repoFullName,
      entityName: t.repoName,
      tokenName: t.tokenName,
      tokenSymbol: t.tokenSymbol,
      tokenMint: t.tokenMint,
      tokenLogo: t.logoUri,
      isClaimed: t.isClaimed,
      isEscrow: t.isEscrow,
      // Fee info (calculated from trading volume)
      totalFeesEarned: t.totalFeesEarned || 0,
      totalFeesClaimed: t.totalFeesClaimed || 0,
      claimableAmount: Math.max(0, (t.totalFeesEarned || 0) - (t.totalFeesClaimed || 0)),
      launchedAt: t.launchedAt.toISOString(),
      launcher: t.User,
    }));

    return NextResponse.json({ tokens: formattedTokens });
  } catch (error) {
    console.error('Token search error:', error);
    return NextResponse.json({ error: 'Failed to search tokens' }, { status: 500 });
  }
}
