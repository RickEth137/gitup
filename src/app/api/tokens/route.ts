import { NextRequest, NextResponse } from 'next/server';
import { getCreatedTokens, getTokenInfo } from '@/lib/pumpfun';
import prisma from '@/lib/prisma';

/**
 * GET /api/tokens?wallet=<address>&mint=<address>
 * Fetch tokens by wallet or single token by mint
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const wallet = searchParams.get('wallet');
  const mint = searchParams.get('mint');

  try {
    // If specific mint is requested - get from database
    if (mint) {
      // First check our database for the token
      const dbToken = await prisma.tokenizedRepo.findFirst({
        where: { tokenMint: mint },
      });

      if (dbToken) {
        // Return our rich token data
        return NextResponse.json({
          id: dbToken.id,
          repoName: dbToken.repoName,
          repoFullName: dbToken.repoFullName,
          repoDescription: dbToken.repoDescription,
          repoUrl: dbToken.repoUrl,
          repoStars: dbToken.repoStars,
          repoForks: dbToken.repoForks,
          tokenName: dbToken.tokenName,
          tokenSymbol: dbToken.tokenSymbol,
          tokenMint: dbToken.tokenMint,
          logoUri: dbToken.logoUri,
          twitter: dbToken.twitter || null,
          telegram: dbToken.telegram || null,
          website: dbToken.website || null,
          launchedAt: dbToken.launchedAt.toISOString(),
          isClaimed: dbToken.isClaimed,
        });
      }

      // Fallback to pump.fun API if not in our database
      const tokenInfo = await getTokenInfo(mint);
      if (!tokenInfo) {
        return NextResponse.json({ error: 'Token not found' }, { status: 404 });
      }
      return NextResponse.json(tokenInfo);
    }

    // If wallet is provided, get all created tokens
    if (wallet) {
      const tokens = await getCreatedTokens(wallet);
      return NextResponse.json({ tokens });
    }

    return NextResponse.json(
      { error: 'Missing wallet or mint parameter' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error fetching tokens:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tokens' },
      { status: 500 }
    );
  }
}
