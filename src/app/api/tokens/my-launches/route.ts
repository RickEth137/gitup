import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// Get tokens launched by the current user
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.githubId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { githubId: String(session.user.githubId) },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const tokens = await prisma.tokenizedRepo.findMany({
      where: { userId: user.id },
      orderBy: { launchedAt: 'desc' },
      select: {
        id: true,
        repoName: true,
        repoFullName: true,
        repoStars: true,
        repoForks: true,
        tokenName: true,
        tokenSymbol: true,
        tokenMint: true,
        logoUri: true,
        launchedAt: true,
        isEscrow: true,
        isClaimed: true,
      },
    });

    return NextResponse.json({ tokens });
  } catch (error) {
    console.error('Error fetching user launches:', error);
    return NextResponse.json({ error: 'Failed to fetch launches' }, { status: 500 });
  }
}
