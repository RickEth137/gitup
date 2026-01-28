import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

/**
 * IMPORTANT: This endpoint is for OWNER launches only (client-side deployment)
 * 
 * For NON-OWNER launches, use /api/deploy which deploys via master wallet
 * so creator fees go to our wallet and can be tracked per-token.
 */

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
  bondingCurve?: string;
  transactionSig: string;
  // Social links
  twitter?: string;
  telegram?: string;
  website?: string;
}

/**
 * Check if the authenticated user is the owner of the repo
 */
async function checkRepoOwnership(
  repoFullName: string, 
  accessToken: string,
  githubLogin: string
): Promise<{ isOwner: boolean; hasAdminAccess: boolean }> {
  try {
    const response = await fetch(
      `https://api.github.com/repos/${repoFullName}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/vnd.github.v3+json',
        },
      }
    );

    if (!response.ok) {
      return { isOwner: false, hasAdminAccess: false };
    }

    const repo = await response.json();
    const isOwner = repo.owner.login.toLowerCase() === githubLogin.toLowerCase();
    const hasAdminAccess = repo.permissions?.admin === true;

    return { isOwner, hasAdminAccess };
  } catch (error) {
    console.error('Error checking repo ownership:', error);
    return { isOwner: false, hasAdminAccess: false };
  }
}

// Record a successful token launch
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.githubId) {
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
      where: { githubId: String(session.user.githubId) },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if repo is already tokenized
    const existingToken = await prisma.tokenizedRepo.findFirst({
      where: { repoId: body.repoId },
    });

    if (existingToken) {
      return NextResponse.json(
        { error: 'This repository has already been tokenized' },
        { status: 409 }
      );
    }

    // Check if launcher is the repo owner
    let isOwner = false;

    if (user.accessToken && user.githubLogin) {
      const ownership = await checkRepoOwnership(
        body.repoFullName,
        user.accessToken,
        user.githubLogin
      );
      isOwner = ownership.isOwner || ownership.hasAdminAccess;
    }

    // NOTE: Non-owner launches should use /api/deploy (master wallet deployment)
    // This endpoint records launches where user's wallet deployed (owner launches)
    // For backwards compatibility, we still record non-owner launches but warn
    if (!isOwner) {
      console.warn(`Non-owner launch via /api/launch - fees will go to user's wallet, not claimable by owner!`);
      console.warn(`Use /api/deploy for non-owner launches to enable fee claiming.`);
    }

    // Record the launch
    const tokenizedRepo = await prisma.tokenizedRepo.create({
      data: {
        id: `${body.repoId}-${Date.now()}`,
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
        bondingCurve: body.bondingCurve,
        transactionSig: body.transactionSig,
        userId: user.id,
        // Social links
        twitter: body.twitter,
        telegram: body.telegram,
        website: body.website,
        // Fee tracking fields
        isEscrow: !isOwner,  // Non-owner launches need claiming
        isClaimed: isOwner,  // Owner launches are "claimed" immediately
        claimedByUserId: isOwner ? user.id : null,
        claimedAt: isOwner ? new Date() : null,
        totalFeesEarned: 0,
        totalFeesClaimed: 0,
      },
    });

    return NextResponse.json({
      success: true,
      tokenizedRepo: {
        id: tokenizedRepo.id,
        tokenMint: tokenizedRepo.tokenMint,
        transactionSig: tokenizedRepo.transactionSig,
        isEscrow: tokenizedRepo.isEscrow,
        isOwner,
      },
      // Warn if non-owner used wrong endpoint
      warning: !isOwner 
        ? 'For non-owner launches, use /api/deploy to enable fee claiming by repo owner'
        : undefined,
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
        User: {
          select: {
            githubLogin: true,
            avatarUrl: true,
          },
        },
      },
    });

    const total = await prisma.tokenizedRepo.count();

    // Map to the format expected by the explore page
    const formattedLaunches = launches.map((launch) => ({
      id: launch.id,
      entityType: 'github' as const,
      entityHandle: launch.repoFullName || '',
      entityName: launch.repoName || '',
      entityUrl: launch.repoUrl || '',
      repoStars: launch.repoStars,
      repoForks: launch.repoForks,
      repoDescription: launch.repoDescription,
      twitterFollowers: null,
      tokenName: launch.tokenName || '',
      tokenSymbol: launch.tokenSymbol || '',
      tokenMint: launch.tokenMint || '',
      tokenLogo: launch.logoUri,
      launchedAt: launch.launchedAt?.toISOString() || new Date().toISOString(),
      isClaimed: launch.isClaimed,
      // Social links
      twitter: (launch as any).twitter || null,
      telegram: (launch as any).telegram || null,
      website: (launch as any).website || null,
      launcher: {
        githubLogin: launch.User?.githubLogin || null,
        githubAvatar: launch.User?.avatarUrl || null,
      },
    }));

    return NextResponse.json({
      launches: formattedLaunches,
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
