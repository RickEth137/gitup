import { NextRequest, NextResponse } from 'next/server';

const PUMP_FUN_IPFS = 'https://pump.fun/api/ipfs';

/**
 * Proxy endpoint for uploading metadata to pump.fun's IPFS
 * This avoids CORS issues when calling pump.fun directly from the browser
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    // Forward the request to pump.fun's IPFS endpoint
    const response = await fetch(PUMP_FUN_IPFS, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('IPFS upload failed:', errorText);
      return NextResponse.json(
        { error: `Failed to upload metadata: ${response.statusText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('IPFS proxy error:', error);
    return NextResponse.json(
      { error: 'Failed to upload to IPFS' },
      { status: 500 }
    );
  }
}
