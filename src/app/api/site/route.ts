import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { mint, ...siteData } = data;

    if (!mint) {
      return NextResponse.json({ error: 'Mint address required' }, { status: 400 });
    }

    // Store site data in database
    const site = await prisma.tokenSite.upsert({
      where: { mint },
      update: {
        name: siteData.name,
        symbol: siteData.symbol,
        description: siteData.description,
        image: siteData.image,
        banner: siteData.banner,
        website: siteData.website,
        twitter: siteData.twitter,
        telegram: siteData.telegram,
        github: siteData.github,
        readme: siteData.readme,
        repoName: siteData.repoName,
        repoOwner: siteData.repoOwner,
        repoStars: siteData.repoStars,
        repoForks: siteData.repoForks,
      },
      create: {
        mint,
        name: siteData.name,
        symbol: siteData.symbol,
        description: siteData.description,
        image: siteData.image,
        banner: siteData.banner,
        website: siteData.website,
        twitter: siteData.twitter,
        telegram: siteData.telegram,
        github: siteData.github,
        readme: siteData.readme,
        repoName: siteData.repoName,
        repoOwner: siteData.repoOwner,
        repoStars: siteData.repoStars,
        repoForks: siteData.repoForks,
      },
    });

    return NextResponse.json({ success: true, site });
  } catch (error) {
    console.error('Error saving site data:', error);
    return NextResponse.json({ error: 'Failed to save site data' }, { status: 500 });
  }
}
