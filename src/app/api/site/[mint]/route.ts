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

    const site = await prisma.tokenSite.findUnique({
      where: { mint },
    });

    if (!site) {
      return NextResponse.json({ error: 'Site not found' }, { status: 404 });
    }

    return NextResponse.json(site);
  } catch (error) {
    console.error('Error fetching site data:', error);
    return NextResponse.json({ error: 'Failed to fetch site data' }, { status: 500 });
  }
}
