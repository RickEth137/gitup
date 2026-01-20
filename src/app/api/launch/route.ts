import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

interface LaunchRequestBody {
  repoId: string;
  repoName: string;
  repoFullName: string;
  repoDescription?: string;
  repoUrl: string;
  repoStars: number;
  repoForks: number;
  tokenName: string;
  tokenSymbol: string;
  tokenMint: string;
  metadataUri: string;
  logoUri?: string;
  bannerUri?: string;
  bondingCurve?: string;
  transactionSig: string;
}

// Record a successful token launch
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !(session as any).user?.githubId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: LaunchRequestBody = await request.json();

    // Validate required fields
    const requiredFields = [
      'repoId',
      'repoName',
      'repoFullName',
      'repoUrl',
      'tokenName',
      'tokenSymbol',
      'tokenMint',
      'metadataUri',
      'transactionSig',
    ];

    for (const field of requiredFields) {
      if (!body[field as keyof LaunchRequestBody]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { githubId: String((session as any).user.githubId) },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if repo is already tokenized
    const existingToken = await prisma.tokenizedRepo.findUnique({
      where: { repoId: body.repoId },
    });

    if (existingToken) {
      return NextResponse.json(
        { error: 'This repository has already been tokenized' },
        { status: 409 }
      );
    }

    // Record the launch
    const tokenizedRepo = await prisma.tokenizedRepo.create({
      data: {
        repoId: body.repoId,
        repoName: body.repoName,
        repoFullName: body.repoFullName,
        repoDescription: body.repoDescription,
        repoUrl: body.repoUrl,
        repoStars: body.repoStars,
        repoForks: body.repoForks,
        tokenName: body.tokenName,
        tokenSymbol: body.tokenSymbol,
        tokenMint: body.tokenMint,
        metadataUri: body.metadataUri,
        logoUri: body.logoUri,
        bannerUri: body.bannerUri,
        bondingCurve: body.bondingCurve,
        transactionSig: body.transactionSig,
        userId: user.id,
      },
    });

    return NextResponse.json({
      success: true,
      tokenizedRepo: {
        id: tokenizedRepo.id,
        tokenMint: tokenizedRepo.tokenMint,
        transactionSig: tokenizedRepo.transactionSig,
      },
    });
  } catch (error) {
    console.error('Error recording launch:', error);
    return NextResponse.json(
      { error: 'Failed to record launch' },
      { status: 500 }
    );
  }
}

// Get all launches (for explore page)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    const launches = await prisma.tokenizedRepo.findMany({
      take: limit,
      skip: offset,
      orderBy: { launchedAt: 'desc' },
      include: {
        user: {
          select: {
            githubLogin: true,
            avatarUrl: true,
          },
        },
      },
    });

    const total = await prisma.tokenizedRepo.count();

    return NextResponse.json({
      launches,
      total,
      hasMore: offset + limit < total,
    });
  } catch (error) {
    console.error('Error fetching launches:', error);
    return NextResponse.json(
      { error: 'Failed to fetch launches' },
      { status: 500 }
    );
  }
}
