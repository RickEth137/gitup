/**
 * POST /api/deploy
 * 
 * Server-side token deployment for non-owner launches.
 * User pays deployment cost → Master wallet deploys → Fees tracked per token
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { Connection } from '@solana/web3.js';
import {
  deployWithMasterWallet,
  getDeploymentCost,
  getMasterDeployerPublicKey,
} from '@/lib/masterDeployer';
import { uploadMetadataToIPFS, TokenMetadata } from '@/lib/pumpfun';

interface DeployRequestBody {
  repoId: string;
  repoName: string;
  repoFullName: string;
  repoDescription?: string;
  repoUrl: string;
  repoStars: number;
  repoForks: number;
  tokenName: string;
  tokenSymbol: string;
  tokenDescription: string;
  tokenImage: string; // base64 or URL
  tokenWebsite?: string;
  tokenTwitter?: string;
  tokenTelegram?: string;
  paymentSignature: string; // Proof user paid deployment cost
  devBuyAmount?: number; // SOL amount for dev allocation buy
}

/**
 * Check if user is the repo owner
 */
async function checkRepoOwnership(
  repoFullName: string,
  accessToken: string,
  githubLogin: string
): Promise<boolean> {
  try {
    const response = await fetch(`https://api.github.com/repos/${repoFullName}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });

    if (!response.ok) return false;

    const repo = await response.json();
    const isOwner = repo.owner.login.toLowerCase() === githubLogin.toLowerCase();
    const hasAdmin = repo.permissions?.admin === true;

    return isOwner || hasAdmin;
  } catch {
    return false;
  }
}

/**
 * Verify the payment transaction
 */
async function verifyPayment(
  connection: Connection,
  signature: string,
  expectedAmount: number,
  payerWallet: string
): Promise<boolean> {
  try {
    const tx = await connection.getParsedTransaction(signature, {
      maxSupportedTransactionVersion: 0,
    });

    if (!tx || tx.meta?.err) {
      return false;
    }

    // Check it's a transfer to master wallet
    const masterWallet = getMasterDeployerPublicKey();
    const instructions = tx.transaction.message.instructions;

    for (const ix of instructions) {
      if ('parsed' in ix && ix.parsed?.type === 'transfer') {
        const info = ix.parsed.info;
        if (
          info.destination === masterWallet &&
          info.source === payerWallet &&
          info.lamports >= expectedAmount * 1e9 * 0.95 // Allow 5% slippage
        ) {
          return true;
        }
      }
    }

    return false;
  } catch (error) {
    console.error('Payment verification error:', error);
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.githubId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: DeployRequestBody = await request.json();

    // Validate required fields
    const requiredFields = [
      'repoId', 'repoName', 'repoFullName', 'repoUrl',
      'tokenName', 'tokenSymbol', 'tokenDescription', 'tokenImage',
      'paymentSignature'
    ];

    for (const field of requiredFields) {
      if (!body[field as keyof DeployRequestBody]) {
        return NextResponse.json({ error: `Missing: ${field}` }, { status: 400 });
      }
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { githubId: String(session.user.githubId) },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if repo already tokenized
    const existingToken = await prisma.tokenizedRepo.findFirst({
      where: { repoId: body.repoId },
    });

    if (existingToken) {
      return NextResponse.json(
        { error: 'This repository has already been tokenized' },
        { status: 409 }
      );
    }

    // Check ownership
    let isOwner = false;
    if (user.accessToken && user.githubLogin) {
      isOwner = await checkRepoOwnership(
        body.repoFullName,
        user.accessToken,
        user.githubLogin
      );
    }

    // Connect to Solana
    const rpcUrl = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com';
    const connection = new Connection(rpcUrl, 'confirmed');

    // If NOT owner, verify they paid deployment cost
    // (Owner launches still go through normal client-side flow)
    if (!isOwner) {
      // We need the user's wallet to verify payment
      // This should be passed in the request
      const userWallet = request.headers.get('x-wallet-address');
      
      if (!userWallet) {
        return NextResponse.json(
          { error: 'Wallet address required for non-owner deployment' },
          { status: 400 }
        );
      }

      const deploymentCost = getDeploymentCost();
      const paymentValid = await verifyPayment(
        connection,
        body.paymentSignature,
        deploymentCost,
        userWallet
      );

      if (!paymentValid) {
        return NextResponse.json(
          { error: 'Payment not verified. Please pay deployment cost first.' },
          { status: 402 }
        );
      }
    }

    // Upload metadata to IPFS
    console.log('[Deploy] Uploading metadata...');
    
    // Convert base64 image to Blob
    let imageBlob: Blob;
    if (body.tokenImage.startsWith('data:')) {
      const base64Data = body.tokenImage.split(',')[1];
      const mimeType = body.tokenImage.split(':')[1].split(';')[0];
      const buffer = Buffer.from(base64Data, 'base64');
      imageBlob = new Blob([buffer], { type: mimeType });
    } else {
      // Fetch from URL
      const imgResponse = await fetch(body.tokenImage);
      imageBlob = await imgResponse.blob();
    }

    const metadata: TokenMetadata = {
      name: body.tokenName,
      symbol: body.tokenSymbol,
      description: body.tokenDescription,
      image: imageBlob as unknown as File,
      website: body.tokenWebsite,
      twitter: body.tokenTwitter,
      telegram: body.tokenTelegram,
    };

    const metadataUri = await uploadMetadataToIPFS(metadata);
    console.log('[Deploy] Metadata URI:', metadataUri);

    // Deploy using master wallet (for non-owners)
    // Owners should use the client-side deployment
    if (!isOwner) {
      console.log('[Deploy] Deploying with master wallet...');
      
      // Use devBuyAmount if provided, otherwise 0
      const initialBuyAmount = body.devBuyAmount || 0;
      console.log('[Deploy] Dev buy amount:', initialBuyAmount, 'SOL');
      
      const { mint, signature } = await deployWithMasterWallet(
        connection,
        metadataUri,
        body.tokenName,
        body.tokenSymbol,
        initialBuyAmount, // Buy tokens for dev allocation
        10
      );

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
          tokenMint: mint,
          metadataUri: metadataUri,
          logoUri: body.tokenImage.startsWith('data:') ? undefined : body.tokenImage,
          transactionSig: signature,
          userId: user.id,
          // Non-owner = escrow mode
          isEscrow: true,
          isClaimed: false,
          totalFeesEarned: 0,
          totalFeesClaimed: 0,
        },
      });

      return NextResponse.json({
        success: true,
        isEscrow: true,
        tokenizedRepo: {
          id: tokenizedRepo.id,
          tokenMint: mint,
          transactionSig: signature,
          metadataUri,
        },
        message: 'Token deployed! Fees will be tracked for the repo owner to claim.',
      });
    }

    // Owner deployment - return metadata URI so client can deploy
    return NextResponse.json({
      success: true,
      isOwner: true,
      metadataUri,
      message: 'Metadata uploaded. Complete deployment from your wallet.',
    });

  } catch (error) {
    console.error('Deployment error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Deployment failed' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/deploy
 * Get deployment info (cost, master wallet address)
 */
export async function GET() {
  try {
    const masterWallet = getMasterDeployerPublicKey();
    const deploymentCost = getDeploymentCost();

    return NextResponse.json({
      masterWallet,
      deploymentCost,
      message: `Send ${deploymentCost} SOL to ${masterWallet} to deploy`,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Master deployer not configured' },
      { status: 500 }
    );
  }
}
