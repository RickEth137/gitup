import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { mint: string } }
) {
  try {
    const { mint } = params;

    if (!mint) {
      return NextResponse.json({ error: 'Mint address required' }, { status: 400 });
    }

    // Try to find the tokenized repo with this mint
    const tokenizedRepo = await prisma.tokenizedRepo.findUnique({
      where: { tokenMint: mint },
      select: {
        tokenName: true,
        tokenSymbol: true,
        repoName: true,
        repoFullName: true,
        repoDescription: true,
        repoUrl: true,
        repoStars: true,
        repoForks: true,
        logoUri: true,
        bannerUri: true,
        metadataUri: true,
      },
    });

    if (!tokenizedRepo) {
      return NextResponse.json({ error: 'Site not found' }, { status: 404 });
    }

    // Return in the expected format
    return NextResponse.json({
      mint,
      name: tokenizedRepo.tokenName,
      symbol: tokenizedRepo.tokenSymbol,
      description: tokenizedRepo.repoDescription || '',
      image: tokenizedRepo.logoUri,
      banner: tokenizedRepo.bannerUri,
      github: tokenizedRepo.repoUrl,
      repoName: tokenizedRepo.repoName,
      repoOwner: tokenizedRepo.repoFullName?.split('/')[0] || '',
      repoStars: tokenizedRepo.repoStars,
      repoForks: tokenizedRepo.repoForks,
    });
  } catch (error) {
    console.error('Error fetching site data:', error);
    return NextResponse.json({ error: 'Failed to fetch site data' }, { status: 500 });
  }
}
