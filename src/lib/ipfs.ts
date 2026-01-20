const PINATA_JWT = process.env.NEXT_PUBLIC_PINATA_JWT;
const PINATA_GATEWAY = 'https://gateway.pinata.cloud/ipfs';

export interface TokenMetadataJSON {
  name: string;
  symbol: string;
  description: string;
  image: string;
  external_url?: string;
  attributes?: Array<{
    trait_type: string;
    value: string | number;
  }>;
  properties?: {
    files?: Array<{
      uri: string;
      type: string;
    }>;
    category?: string;
  };
}

/**
 * Upload a file to IPFS via Pinata
 */
export async function uploadFileToIPFS(file: File): Promise<string> {
  if (!PINATA_JWT) {
    throw new Error('PINATA_JWT is not configured');
  }

  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${PINATA_JWT}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to upload to Pinata: ${error}`);
  }

  const data = await response.json();
  return `${PINATA_GATEWAY}/${data.IpfsHash}`;
}

/**
 * Upload token metadata JSON to IPFS via Pinata
 */
export async function uploadMetadataToIPFS(
  metadata: TokenMetadataJSON
): Promise<string> {
  if (!PINATA_JWT) {
    throw new Error('PINATA_JWT is not configured');
  }

  const response = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${PINATA_JWT}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      pinataContent: metadata,
      pinataMetadata: {
        name: `${metadata.symbol}-metadata.json`,
      },
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to upload metadata to Pinata: ${error}`);
  }

  const data = await response.json();
  return `${PINATA_GATEWAY}/${data.IpfsHash}`;
}

/**
 * Upload logo and create full token metadata
 */
export async function prepareTokenMetadata(params: {
  name: string;
  symbol: string;
  description: string;
  logo: File;
  banner?: File | null;
  repoUrl: string;
  repoStars: number;
  repoForks: number;
  language?: string | null;
}): Promise<{
  metadataUri: string;
  logoUri: string;
  bannerUri?: string;
}> {
  const { name, symbol, description, logo, banner, repoUrl, repoStars, repoForks, language } =
    params;

  // Upload logo to IPFS
  console.log('Uploading logo to IPFS...');
  const logoUri = await uploadFileToIPFS(logo);
  console.log('Logo uploaded:', logoUri);

  // Upload banner if provided
  let bannerUri: string | undefined;
  if (banner) {
    console.log('Uploading banner to IPFS...');
    bannerUri = await uploadFileToIPFS(banner);
    console.log('Banner uploaded:', bannerUri);
  }

  // Create metadata JSON
  const metadata: TokenMetadataJSON = {
    name,
    symbol,
    description,
    image: logoUri,
    external_url: repoUrl,
    attributes: [
      { trait_type: 'Repository', value: repoUrl },
      { trait_type: 'Stars', value: repoStars },
      { trait_type: 'Forks', value: repoForks },
      ...(language ? [{ trait_type: 'Language', value: language }] : []),
    ],
    properties: {
      files: [
        { uri: logoUri, type: 'image/png' },
        ...(bannerUri ? [{ uri: bannerUri, type: 'image/png' }] : []),
      ],
      category: 'token',
    },
  };

  // Upload metadata to IPFS
  console.log('Uploading metadata to IPFS...');
  const metadataUri = await uploadMetadataToIPFS(metadata);
  console.log('Metadata uploaded:', metadataUri);

  return {
    metadataUri,
    logoUri,
    bannerUri,
  };
}

/**
 * Check if IPFS client is configured
 */
export function isIPFSConfigured(): boolean {
  return !!process.env.NEXT_PUBLIC_PINATA_JWT;
}
