import { NextRequest, NextResponse } from 'next/server';
import { getCreatedTokens, getTokenInfo } from '@/lib/pumpfun';

/**
 * GET /api/tokens?wallet=<address>
 * Fetch all tokens created by a wallet with bonding curve data
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const wallet = searchParams.get('wallet');
  const mint = searchParams.get('mint');

  try {
    // If specific mint is requested
    if (mint) {
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
