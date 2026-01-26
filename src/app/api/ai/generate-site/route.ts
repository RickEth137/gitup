import { NextRequest, NextResponse } from 'next/server';

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

interface GenerateSiteRequest {
  readme: string;
  repoName: string;
  repoDescription: string;
  tokenName: string;
  tokenSymbol: string;
  repoOwner: string;
}

interface ImageAnalysis {
  url: string;
  type: 'hero' | 'screenshot' | 'diagram' | 'logo' | 'badge' | 'other';
  description: string;
  suggestedPlacement: 'hero-banner' | 'feature-image' | 'screenshot-gallery' | 'skip';
}

interface GeneratedSiteContent {
  tagline: string;
  heroDescription: string;
  features: Array<{
    title: string;
    description: string;
    icon: string;
  }>;
  useCases: string[];
  callToAction: string;
  images: {
    heroBanner?: string;
    screenshots: string[];
    featureImages: string[];
  };
}

// Extract image URLs from markdown content
function extractImagesFromMarkdown(markdown: string, repoOwner: string, repoName: string): string[] {
  const images: string[] = [];
  
  // Match markdown image syntax: ![alt](url)
  const mdImageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
  let match;
  while ((match = mdImageRegex.exec(markdown)) !== null) {
    let url = match[2];
    // Convert relative URLs to absolute GitHub URLs
    if (!url.startsWith('http')) {
      url = `https://raw.githubusercontent.com/${repoOwner}/${repoName}/main/${url.replace(/^\.?\//, '')}`;
    }
    images.push(url);
  }
  
  // Match HTML img tags: <img src="url">
  const htmlImageRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi;
  while ((match = htmlImageRegex.exec(markdown)) !== null) {
    let url = match[1];
    if (!url.startsWith('http')) {
      url = `https://raw.githubusercontent.com/${repoOwner}/${repoName}/main/${url.replace(/^\.?\//, '')}`;
    }
    images.push(url);
  }
  
  // Filter out badges and small icons (usually contain shields.io, badge, etc.)
  const filteredImages = images.filter(url => {
    const lowerUrl = url.toLowerCase();
    return !lowerUrl.includes('shields.io') && 
           !lowerUrl.includes('badge') && 
           !lowerUrl.includes('travis-ci') &&
           !lowerUrl.includes('codecov') &&
           !lowerUrl.includes('github.com/') && // Skip GitHub-specific badges
           !lowerUrl.includes('.svg'); // Usually badges
  });
  
  // Return unique images
  return [...new Set(filteredImages)];
}

// Convert image URL to base64 for Claude vision API
async function fetchImageAsBase64(url: string): Promise<{ base64: string; mediaType: string } | null> {
  try {
    const response = await fetch(url, { 
      headers: { 'User-Agent': 'GitUp-Bot/1.0' },
      signal: AbortSignal.timeout(5000) // 5 second timeout
    });
    
    if (!response.ok) return null;
    
    const contentType = response.headers.get('content-type') || 'image/png';
    const arrayBuffer = await response.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');
    
    // Validate it's actually an image
    if (!contentType.startsWith('image/')) return null;
    
    // Map content type to Claude's expected format
    let mediaType = contentType.split(';')[0].trim();
    if (mediaType === 'image/jpg') mediaType = 'image/jpeg';
    
    return { base64, mediaType };
  } catch (error) {
    console.error('Failed to fetch image:', url, error);
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: 'Anthropic API key not configured' },
        { status: 500 }
      );
    }

    const body: GenerateSiteRequest = await request.json();
    const { readme, repoName, repoDescription, tokenName, tokenSymbol, repoOwner } = body;

    if (!readme || !tokenName) {
      return NextResponse.json(
        { error: 'README and token name are required' },
        { status: 400 }
      );
    }

    // Extract images from README
    const imageUrls = extractImagesFromMarkdown(readme, repoOwner || '', repoName || '');
    console.log('Found images in README:', imageUrls);

    // Fetch images and convert to base64 (limit to first 5 images for API limits)
    const imagePromises = imageUrls.slice(0, 5).map(async (url) => {
      const imageData = await fetchImageAsBase64(url);
      return imageData ? { url, ...imageData } : null;
    });
    
    const fetchedImages = (await Promise.all(imagePromises)).filter(Boolean) as Array<{
      url: string;
      base64: string;
      mediaType: string;
    }>;
    
    console.log(`Successfully fetched ${fetchedImages.length} images for vision analysis`);

    // Build the message content with images for Claude vision
    const messageContent: any[] = [];
    
    // Add images first for vision analysis
    if (fetchedImages.length > 0) {
      messageContent.push({
        type: 'text',
        text: `I'm analyzing a GitHub repository to create a professional landing page. Here are ${fetchedImages.length} images from the README that I need you to analyze:`
      });
      
      fetchedImages.forEach((img, index) => {
        messageContent.push({
          type: 'image',
          source: {
            type: 'base64',
            media_type: img.mediaType,
            data: img.base64,
          }
        });
        messageContent.push({
          type: 'text',
          text: `Image ${index + 1} URL: ${img.url}`
        });
      });
    }
    
    // Add the main prompt
    messageContent.push({
      type: 'text',
      text: `You are a professional marketing copywriter and web designer for open source projects. Analyze this GitHub repository README${fetchedImages.length > 0 ? ' and the images above' : ''} to generate compelling website content.

Repository: ${repoName}
Description: ${repoDescription || 'No description provided'}
Token Name: ${tokenName}
Token Symbol: ${tokenSymbol}

README Content:
${readme.slice(0, 6000)}

Generate a JSON response with the following structure (respond ONLY with valid JSON, no markdown):
{
  "tagline": "A catchy one-line tagline (max 10 words) about the PROJECT (not the token)",
  "heroDescription": "A compelling 2-3 sentence description for the hero section that explains what this PROJECT does and why it matters (focus on the software, not the token)",
  "features": [
    {
      "title": "Feature title (2-4 words)",
      "description": "Brief description (1-2 sentences) about the PROJECT's features",
      "icon": "one of: code, shield, zap, globe, users, lock, rocket, star, heart, cpu, terminal, box, layers, database, cloud, git"
    }
  ],
  "useCases": ["Use case 1", "Use case 2", "Use case 3", "Use case 4"],
  "callToAction": "Support Development",
  "imageAnalysis": [
    ${fetchedImages.map((img, i) => `{
      "imageIndex": ${i + 1},
      "url": "${img.url}",
      "type": "hero|screenshot|diagram|logo|architecture|demo|other",
      "description": "Brief description of what this image shows",
      "suggestedPlacement": "hero-banner|screenshot-gallery|feature-section|skip",
      "quality": "high|medium|low"
    }`).join(',\n    ')}
  ]
}

IMPORTANT RULES:
- Generate EXACTLY 4 features (for balanced 2x2 grid layout)
- Focus ONLY on the actual software/project functionality from the README
- Do NOT invent token utility or tokenomics - the token exists solely to support development
- Make it professional and informative about what the PROJECT does
${fetchedImages.length > 0 ? `
IMAGE ANALYSIS RULES:
- Analyze each image carefully - what does it show?
- "hero" type: High quality images showing the product UI, main interface, or impressive visuals
- "screenshot" type: Product screenshots, demo images, terminal outputs
- "diagram" type: Architecture diagrams, flowcharts, system diagrams
- "logo" type: Project logos, brand images
- "architecture" type: Technical architecture or system design images
- "demo" type: GIFs or images showing the product in action
- For suggestedPlacement:
  - "hero-banner": Best quality, most impressive image that represents the project (only 1)
  - "screenshot-gallery": Good screenshots showing the product
  - "feature-section": Images that could illustrate specific features
  - "skip": Low quality, irrelevant, or badge-like images
- Be selective - only suggest hero-banner for truly impressive images` : ''}`
    });

    // Call Claude API with vision
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 3000,
        messages: [
          {
            role: 'user',
            content: messageContent,
          }
        ],
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Anthropic API error:', error);
      return NextResponse.json(
        { error: 'Failed to generate content' },
        { status: 500 }
      );
    }

    const data = await response.json();
    const content = data.content[0]?.text;

    if (!content) {
      return NextResponse.json(
        { error: 'No content generated' },
        { status: 500 }
      );
    }

    // Parse the JSON response from Claude
    try {
      // Clean up the response in case there's any markdown formatting
      const cleanedContent = content
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      
      const generatedContent = JSON.parse(cleanedContent);
      
      // Process image analysis results
      const images = {
        heroBanner: undefined as string | undefined,
        screenshots: [] as string[],
        featureImages: [] as string[],
      };
      
      if (generatedContent.imageAnalysis && Array.isArray(generatedContent.imageAnalysis)) {
        for (const analysis of generatedContent.imageAnalysis) {
          if (analysis.suggestedPlacement === 'hero-banner' && analysis.quality !== 'low') {
            images.heroBanner = analysis.url;
          } else if (analysis.suggestedPlacement === 'screenshot-gallery') {
            images.screenshots.push(analysis.url);
          } else if (analysis.suggestedPlacement === 'feature-section') {
            images.featureImages.push(analysis.url);
          }
        }
      }
      
      return NextResponse.json({
        success: true,
        content: {
          tagline: generatedContent.tagline,
          heroDescription: generatedContent.heroDescription,
          features: generatedContent.features,
          useCases: generatedContent.useCases,
          callToAction: generatedContent.callToAction,
          images,
          imageAnalysis: generatedContent.imageAnalysis, // Include full analysis for debugging
        },
      });
    } catch (parseError) {
      console.error('Failed to parse Claude response:', content);
      // Return a fallback response
      return NextResponse.json({
        success: true,
        content: {
          tagline: `Support ${tokenName} Development`,
          heroDescription: repoDescription || `${tokenName} is an open source project. By supporting this token, you're directly contributing to the developers behind this repository.`,
          features: [
            { title: 'Open Source', description: 'Built on transparent, community-driven development', icon: 'code' },
            { title: 'Support Developers', description: 'Creator fees go directly to verified repo owners', icon: 'heart' },
            { title: 'Verified Ownership', description: 'Only real developers can claim fees via OAuth', icon: 'shield' },
            { title: 'Community Backed', description: 'Join others supporting open source innovation', icon: 'users' },
          ],
          useCases: ['Support development', 'Fund open source', 'Back your favorite devs', 'Join the community'],
          callToAction: 'Support Development',
          images: {
            heroBanner: undefined,
            screenshots: [],
            featureImages: [],
          },
        },
      });
    }
  } catch (error) {
    console.error('Generate site error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
