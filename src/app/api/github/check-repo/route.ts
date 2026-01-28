import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// Check if a repo has already been tokenized
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const repoId = searchParams.get('repoId');

    if (!repoId) {
      return NextResponse.json({ error: 'Missing repoId' }, { status: 400 });
    }

    const existingToken = await prisma.tokenizedRepo.findFirst({
      where: { 
        repoId: repoId 
      },
      select: {
        tokenName: true,
        tokenSymbol: true,
        tokenMint: true,
        launchedAt: true,
        User: {
          select: {
            githubLogin: true,
          },
        },
      },
    });

    if (existingToken) {
      return NextResponse.json({
        isTokenized: true,
        token: existingToken,
      });
    }

    return NextResponse.json({ isTokenized: false });
  } catch (error) {
    console.error('Error checking repo status:', error);
    return NextResponse.json(
      { error: 'Failed to check repo status' },
      { status: 500 }
    );
  }
}
