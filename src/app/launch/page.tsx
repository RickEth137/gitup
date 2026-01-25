'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Github, Twitter, ArrowRight, ArrowLeft, Wallet, CheckCircle, AlertCircle, Search, Star, GitFork, ExternalLink, Send, Instagram, Facebook, ImageIcon, MapPin, Building2, Link as LinkIcon, Users, Calendar, Gift, GitBranch, Globe } from 'lucide-react';
import { calculateSolCostForSupply, createToken, CreateTokenResult } from '@/lib/pumpfun';
import { useSolPrice } from '@/lib/useSolPrice';

type LaunchMode = 'select' | 'own-repo' | 'other-repo' | 'own-gitlab' | 'other-gitlab' | 'twitter' | 'telegram' | 'instagram' | 'facebook';
type Step = 'mode' | 'connect' | 'search' | 'customize' | 'launch' | 'success';

// Star Particles Background Component
function StarParticles() {
  // Generate stable random values only once
  const stars = useMemo(() => 
    [...Array(60)].map((_, i) => ({
      id: i,
      left: (i * 17 + 7) % 100, // Pseudo-random but stable distribution
      top: (i * 23 + 13) % 100,
      size: 1 + (i % 3) * 0.5,
      opacity: 0.15 + (i % 5) * 0.1,
      duration: 3 + (i % 4),
      delay: (i % 6) * 0.5,
    }))
  , []);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {stars.map((star) => (
        <div
          key={star.id}
          className="absolute rounded-full bg-white star-twinkle"
          style={{
            left: `${star.left}%`,
            top: `${star.top}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            opacity: star.opacity,
            animationDuration: `${star.duration}s`,
            animationDelay: `${star.delay}s`,
          }}
        />
      ))}
    </div>
  );
}

// Character Video Component - LOCKED POSITION
function LaunchCharacterVideo({ videoRef }: { videoRef?: React.RefObject<HTMLVideoElement> }) {
  return (
    <div
      className="fixed z-50 pointer-events-none"
      style={{
        left: '80.3%',
        top: '59.5%',
        transform: 'translate(-50%, -50%)',
        width: '75vw',
      }}
    >
      <video
        ref={videoRef as React.RefObject<HTMLVideoElement>}
        autoPlay
        loop
        muted
        playsInline
        className="w-full h-auto"
        style={{
          maskImage: 'linear-gradient(to bottom, black 0%, black 85%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, black 0%, black 85%, transparent 100%)',
        }}
      >
        <source src="/Pointing.webm" type="video/webm" />
        <source src="/Pointing.mov" type="video/quicktime" />
      </video>
    </div>
  );
}

// GitLab icon component
const GitLabIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M22.65 14.39L12 22.13 1.35 14.39a.84.84 0 01-.3-.94l1.22-3.78 2.44-7.51A.42.42 0 014.82 2a.43.43 0 01.58 0 .42.42 0 01.11.18l2.44 7.49h8.1l2.44-7.51A.42.42 0 0118.6 2a.43.43 0 01.58 0 .42.42 0 01.11.18l2.44 7.51L23 13.45a.84.84 0 01-.35.94z"/>
  </svg>
);

// Meta icon component
const MetaIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M6.915 4.03c-1.968 0-3.683 1.28-4.871 3.113C.704 9.208 0 11.883 0 14.449c0 .706.07 1.369.21 1.973a6.624 6.624 0 0 0 .265.86 5.297 5.297 0 0 0 .371.761c.696 1.159 1.818 1.927 3.593 1.927 1.497 0 2.633-.671 3.965-2.452.76-1.017 1.459-2.21 2.085-3.32l.672-1.195c.326-.56.625-1.095.895-1.585l.44-.793c.18-.33.355-.651.527-.96.293-.52.563-.98.811-1.36.249-.382.484-.702.707-.948a3.017 3.017 0 0 1 .516-.463c.164-.116.328-.21.49-.28a1.69 1.69 0 0 1 .515-.127c.477 0 .893.17 1.222.517.328.347.58.81.756 1.313.178.503.268 1.043.268 1.6 0 .652-.089 1.293-.259 1.887-.17.594-.398 1.084-.674 1.456a2.2 2.2 0 0 1-.507.522c-.104.08-.215.149-.333.205a1.57 1.57 0 0 1-.406.138c-.192.033-.351.046-.473.046-.191 0-.383-.026-.576-.079a2.33 2.33 0 0 1-.542-.221c.033.124.077.267.127.422.051.155.118.339.197.535.08.196.174.4.28.593.107.193.228.37.361.519.133.148.28.27.44.357.16.088.334.138.527.138.258 0 .516-.05.774-.152.258-.103.522-.274.789-.498.268-.224.528-.502.78-.824.253-.323.506-.702.76-1.128.635-1.066 1.132-2.324 1.491-3.772.36-1.448.54-2.927.54-4.435 0-.719-.055-1.39-.165-2.013a8.59 8.59 0 0 0-.52-1.768 5.96 5.96 0 0 0-.873-1.49 4.387 4.387 0 0 0-1.281-1.072 3.487 3.487 0 0 0-1.692-.407c-.399 0-.768.075-1.108.224-.34.15-.658.36-.956.633a7.63 7.63 0 0 0-.857.873c-.263.32-.527.681-.793 1.08l-.478.73-.505.827c-.164.276-.332.566-.505.867l-.49.865-.476.863a53.8 53.8 0 0 1-.462.846c-.24.438-.501.894-.78 1.368-.28.475-.573.952-.88 1.429-.306.478-.613.926-.919 1.344-.306.42-.606.778-.9 1.074-.294.296-.563.506-.81.63a1.314 1.314 0 0 1-.587.188c-.213 0-.386-.065-.52-.195a1.156 1.156 0 0 1-.299-.505 2.543 2.543 0 0 1-.116-.674c-.015-.237-.014-.475.004-.712.018-.237.046-.46.083-.67.037-.21.08-.396.125-.557.167-.587.39-1.22.672-1.9.281-.68.593-1.348.935-2.006.343-.658.7-1.27 1.073-1.838.372-.568.74-1.046 1.102-1.432.362-.387.702-.663 1.02-.829.318-.166.607-.249.867-.249.177 0 .34.033.49.1.15.066.286.16.409.28.123.12.23.263.324.428.093.165.17.347.23.546.06.199.1.41.122.633.02.224.017.453-.012.69a7.3 7.3 0 0 1-.143.825c-.066.288-.151.577-.255.867l.67-.746c.267-.296.557-.614.869-.953.312-.339.635-.672.97-.998a12.89 12.89 0 0 1 1.051-.91c.367-.286.74-.52 1.12-.702.38-.183.763-.274 1.149-.274.62 0 1.157.135 1.612.407.455.271.838.648 1.148 1.13.31.48.544 1.043.7 1.688.157.646.235 1.344.235 2.096 0 .915-.082 1.81-.247 2.683a12.233 12.233 0 0 1-.727 2.459 10.419 10.419 0 0 1-1.18 2.164c-.47.66-1.01 1.224-1.618 1.69-.609.467-1.287.831-2.034 1.092-.748.261-1.56.392-2.437.392-.56 0-1.074-.067-1.54-.2a4.427 4.427 0 0 1-1.247-.566 4.51 4.51 0 0 1-.988-.864 6.46 6.46 0 0 1-.762-1.085 8.937 8.937 0 0 1-.57-1.212 12.99 12.99 0 0 1-.406-1.216 14.762 14.762 0 0 1-.278-1.128 12.442 12.442 0 0 1-.152-.948c-.056-.443-.082-.787-.082-1.034 0-.43.027-.881.082-1.354.055-.473.14-.946.255-1.42.116-.473.258-.937.428-1.39.17-.455.364-.88.584-1.277.22-.397.462-.752.727-1.066.265-.313.55-.567.857-.762.307-.195.634-.34.98-.433.347-.093.71-.14 1.091-.14.504 0 .967.092 1.39.275.422.184.798.436 1.126.758.328.322.603.701.824 1.138.222.437.384.905.488 1.403z"/>
  </svg>
);

interface RepoResult {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  stargazers_count: number;
  forks_count: number;
  language: string | null;
  owner: {
    login: string;
    avatar_url: string;
  };
}

interface GitHubUser {
  login: string;
  name: string | null;
  avatar_url: string;
  html_url: string;
  bio: string | null;
  company: string | null;
  location: string | null;
  blog: string | null;
  twitter_username: string | null;
  followers: number;
  following: number;
  public_repos: number;
  created_at: string;
}

export default function LaunchPage() {
  const { data: session, status } = useSession();
  const { connected, publicKey, signTransaction } = useWallet();
  const { connection } = useConnection();
  
  const [launchMode, setLaunchMode] = useState<LaunchMode>('select');
  const [step, setStep] = useState<Step>('mode');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<RepoResult[]>([]);
  const [selectedEntity, setSelectedEntity] = useState<RepoResult | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [tokenName, setTokenName] = useState('');
  const [tokenSymbol, setTokenSymbol] = useState('');
  const [tokenDescription, setTokenDescription] = useState('');
  const [tokenLogo, setTokenLogo] = useState<File | null>(null);
  const [tokenLogoPreview, setTokenLogoPreview] = useState<string>('');
  const [tokenBanner, setTokenBanner] = useState<File | null>(null);
  const [tokenBannerPreview, setTokenBannerPreview] = useState<string>('');
  
  // Social links
  const [tokenWebsite, setTokenWebsite] = useState('');
  const [tokenTwitter, setTokenTwitter] = useState('');
  const [tokenTelegram, setTokenTelegram] = useState('');
  const [autoGenerateWebsite, setAutoGenerateWebsite] = useState(true);
  
  const [isLaunching, setIsLaunching] = useState(false);
  const [launchError, setLaunchError] = useState<string | null>(null);
  const [launchResult, setLaunchResult] = useState<CreateTokenResult | null>(null);
  const [readmeContent, setReadmeContent] = useState<string>('');
  const [isLoadingReadme, setIsLoadingReadme] = useState(false);
  const [repoLanguages, setRepoLanguages] = useState<Record<string, number>>({});
  const [repoOwnerProfile, setRepoOwnerProfile] = useState<GitHubUser | null>(null);
  const [leftPanelHeight, setLeftPanelHeight] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);
  const leftPanelRef = useRef<HTMLDivElement>(null);
  
  // Animation timing - synced to video (hand hovers button twice per loop)
  const hover1Start = 21;
  const hover1End = 40;
  const hover2Start = 74;
  const hover2End = 91;
  const [isHovered, setIsHovered] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  
  // Fix hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Sync video playback with hover state - supports two hover periods
  useEffect(() => {
    if (!mounted) return;
    
    const video = videoRef.current;
    if (!video) return;
    
    const checkHoverTiming = () => {
      if (video.duration) {
        const progress = (video.currentTime / video.duration) * 100;
        const inHover1 = progress >= hover1Start && progress <= hover1End;
        const inHover2 = progress >= hover2Start && progress <= hover2End;
        setIsHovered(inHover1 || inHover2);
      }
    };
    
    video.addEventListener('timeupdate', checkHoverTiming);
    return () => video.removeEventListener('timeupdate', checkHoverTiming);
  }, [mounted]);
  
  // GitHub language colors (subset of most common)
  const languageColors: Record<string, string> = {
    JavaScript: '#f1e05a',
    TypeScript: '#3178c6',
    Python: '#3572A5',
    Java: '#b07219',
    'C++': '#f34b7d',
    C: '#555555',
    'C#': '#178600',
    Go: '#00ADD8',
    Rust: '#dea584',
    Ruby: '#701516',
    PHP: '#4F5D95',
    Swift: '#F05138',
    Kotlin: '#A97BFF',
    Dart: '#00B4AB',
    Shell: '#89e051',
    HTML: '#e34c26',
    CSS: '#563d7c',
    SCSS: '#c6538c',
    Vue: '#41b883',
    Svelte: '#ff3e00',
    Markdown: '#083fa1',
    JSON: '#292929',
    YAML: '#cb171e',
    Dockerfile: '#384d54',
    Makefile: '#427819',
    Lua: '#000080',
    Perl: '#0298c3',
    R: '#198CE7',
    Scala: '#c22d40',
    Haskell: '#5e5086',
    Elixir: '#6e4a7e',
    Clojure: '#db5855',
    Julia: '#a270ba',
    Jupyter: '#DA5B0B',
    Solidity: '#AA6746',
  };
  
  // Real-time SOL price
  const { price: solPrice, solToUsd, formatUsd, loading: priceLoading } = useSolPrice();

  // Sync right panel height with left panel
  useEffect(() => {
    if (leftPanelRef.current) {
      const updateHeight = () => {
        if (leftPanelRef.current) {
          setLeftPanelHeight(leftPanelRef.current.offsetHeight);
        }
      };
      updateHeight();
      const resizeObserver = new ResizeObserver(updateHeight);
      resizeObserver.observe(leftPanelRef.current);
      return () => resizeObserver.disconnect();
    }
  }, [step, selectedEntity, launchMode]);
  const [creatorAllocation, setCreatorAllocation] = useState<number>(5); // Default 5% for creator

  const isConnected = session && connected;
  const githubLogin = (session?.user as { githubLogin?: string })?.githubLogin;

  // Parse GitHub URL to extract owner/repo
  const parseGitHubUrl = (input: string): { owner: string; repo: string } | null => {
    // Handle full URLs like https://github.com/owner/repo
    const urlMatch = input.match(/github\.com\/([^\/]+)\/([^\/\s?#]+)/i);
    if (urlMatch) {
      return { owner: urlMatch[1], repo: urlMatch[2].replace(/\.git$/, '') };
    }
    // Handle owner/repo format
    const pathMatch = input.match(/^([^\/\s]+)\/([^\/\s]+)$/);
    if (pathMatch) {
      return { owner: pathMatch[1], repo: pathMatch[2] };
    }
    return null;
  };

  // Search GitHub repos
  const searchRepos = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    
    try {
      // Check if input is a direct repo URL/path
      const parsed = parseGitHubUrl(searchQuery.trim());
      
      if (parsed) {
        // Fetch specific repo directly
        const response = await fetch(`https://api.github.com/repos/${parsed.owner}/${parsed.repo}`);
        if (response.ok) {
          const repo = await response.json();
          setSearchResults([repo]);
        } else {
          // If not found, fall back to search
          const searchResponse = await fetch(`https://api.github.com/search/repositories?q=${encodeURIComponent(searchQuery)}&sort=stars&per_page=10`);
          const data = await searchResponse.json();
          setSearchResults(data.items || []);
        }
      } else {
        // Regular search query
        const response = await fetch(`https://api.github.com/search/repositories?q=${encodeURIComponent(searchQuery)}&sort=stars&per_page=10`);
        const data = await response.json();
        setSearchResults(data.items || []);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  // Fetch user's own repos
  const fetchMyRepos = async () => {
    if (!session) return;
    setIsSearching(true);
    
    try {
      const response = await fetch('/api/github/repos');
      const data = await response.json();
      setSearchResults(data.repos || []);
    } catch (error) {
      console.error('Fetch repos error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  // Check what's needed based on launch mode
  const needsAuth = launchMode === 'own-repo' || launchMode === 'own-gitlab';
  const isReadyToContinue = needsAuth ? (session && connected) : connected;

  const handleModeSelect = (mode: LaunchMode) => {
    setLaunchMode(mode);
    const modeNeedsAuth = mode === 'own-repo' || mode === 'own-gitlab';
    const modeIsReady = modeNeedsAuth ? (session && connected) : connected;
    
    if (!modeIsReady) {
      setStep('connect');
    } else if (mode === 'own-repo') {
      setStep('search');
      fetchMyRepos();
    } else if (mode === 'own-gitlab') {
      // TODO: Fetch user's GitLab repos
      setStep('search');
    } else {
      setStep('search');
    }
  };

  // Fetch README for a repo
  const fetchReadme = async (owner: string, repo: string) => {
    setIsLoadingReadme(true);
    setReadmeContent('');
    
    try {
      // Fetch README as rendered HTML
      const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/readme`, {
        headers: {
          'Accept': 'application/vnd.github.html+json'
        }
      });
      
      if (response.ok) {
        let html = await response.text();
        
        // Fix relative image paths - convert to raw GitHub URLs
        // Handle src="/path" or src="./path" or src="path" (relative paths)
        html = html.replace(
          /src="(?!https?:\/\/|data:)([^"]+)"/g,
          `src="https://raw.githubusercontent.com/${owner}/${repo}/HEAD/$1"`
        );
        
        // Also fix href for images that are links
        html = html.replace(
          /href="(?!https?:\/\/|#|mailto:)([^"]+\.(png|jpg|jpeg|gif|svg|webp))"/gi,
          `href="https://raw.githubusercontent.com/${owner}/${repo}/HEAD/$1"`
        );
        
        // Fix repository-relative URLs (starting with /)
        html = html.replace(
          /src="https:\/\/raw\.githubusercontent\.com\/[^/]+\/[^/]+\/HEAD\/\/+/g,
          `src="https://raw.githubusercontent.com/${owner}/${repo}/HEAD/`
        );
        
        setReadmeContent(html);
      }
    } catch (error) {
      console.error('Failed to fetch README:', error);
    } finally {
      setIsLoadingReadme(false);
    }
  };

  // Fetch languages for a repo
  const fetchLanguages = async (owner: string, repo: string) => {
    try {
      const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/languages`);
      if (response.ok) {
        const data = await response.json();
        setRepoLanguages(data);
      }
    } catch (error) {
      console.error('Failed to fetch languages:', error);
      setRepoLanguages({});
    }
  };

  // Fetch GitHub user profile
  const fetchUserProfile = async (username: string) => {
    try {
      const response = await fetch(`https://api.github.com/users/${username}`);
      if (response.ok) {
        const data = await response.json();
        setRepoOwnerProfile(data);
      }
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      setRepoOwnerProfile(null);
    }
  };

  // Handle logo upload
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setTokenLogo(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setTokenLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle banner upload
  const handleBannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setTokenBanner(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setTokenBannerPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEntitySelect = (entity: RepoResult) => {
    setSelectedEntity(entity);
    setTokenName(`${entity.name} Token`);
    setTokenSymbol(entity.name.slice(0, 5).toUpperCase());
    setTokenDescription(entity.description || `Token for ${entity.full_name} repository`);
    setTokenLogoPreview(entity.owner.avatar_url); // Default to owner avatar
    setReadmeContent('');
    setRepoLanguages({});
    setRepoOwnerProfile(null);
    fetchReadme(entity.owner.login, entity.name);
    fetchLanguages(entity.owner.login, entity.name);
    fetchUserProfile(entity.owner.login);
    setStep('customize');
  };

  const handleLaunch = async () => {
    if (!publicKey || !signTransaction) {
      setLaunchError('Wallet not connected');
      return;
    }

    setIsLaunching(true);
    setLaunchError(null);

    try {
      // Get the image as a blob
      let imageBlob: Blob;
      if (tokenLogo) {
        imageBlob = tokenLogo;
      } else if (tokenLogoPreview) {
        // Fetch the avatar URL and convert to blob
        const response = await fetch(tokenLogoPreview);
        imageBlob = await response.blob();
      } else {
        throw new Error('No token logo selected');
      }

      // Build website URL - either user's custom or auto-generated
      const websiteUrl = tokenWebsite || (autoGenerateWebsite ? `https://gitup.fun/site/MINT_PLACEHOLDER` : selectedEntity?.html_url);

      // Create the token on pump.fun
      const result = await createToken(
        {
          metadata: {
            name: tokenName,
            symbol: tokenSymbol,
            description: tokenDescription,
            image: imageBlob,
            website: websiteUrl,
            twitter: tokenTwitter || undefined,
            telegram: tokenTelegram || undefined,
          },
          initialBuyAmount: 0.001, // Small initial buy
          slippage: 10,
          wallet: {
            publicKey,
            signTransaction,
          },
        },
        connection
      );

      console.log('Token created:', result);
      
      // Save site data for auto-generated website
      if (autoGenerateWebsite && result.mint) {
        const siteData = {
          name: tokenName,
          symbol: tokenSymbol,
          description: tokenDescription,
          image: tokenLogoPreview || '',
          banner: tokenBannerPreview || '',
          website: tokenWebsite || '',
          twitter: tokenTwitter || '',
          telegram: tokenTelegram || '',
          github: selectedEntity?.html_url || '',
          readme: readmeContent || '',
          repoName: selectedEntity?.name || '',
          repoOwner: selectedEntity?.owner?.login || '',
          repoStars: selectedEntity?.stargazers_count || 0,
          repoForks: selectedEntity?.forks_count || 0,
        };
        
        // Save to localStorage for immediate access
        localStorage.setItem(`site_${result.mint}`, JSON.stringify(siteData));
        
        // Also try to save to API (for persistence)
        try {
          await fetch('/api/site', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ mint: result.mint, ...siteData }),
          });
        } catch (e) {
          console.log('Failed to save site data to API, using localStorage');
        }
      }
      
      setLaunchResult(result);
      setStep('success');
    } catch (error) {
      console.error('Launch error:', error);
      setLaunchError(error instanceof Error ? error.message : 'Failed to launch token');
    } finally {
      setIsLaunching(false);
    }
  };

  const goBack = () => {
    if (step === 'connect') setStep('mode');
    else if (step === 'search') {
      // For own repos, check if we came through connect step
      const needsAuth = launchMode === 'own-repo' || launchMode === 'own-gitlab';
      if (needsAuth && !isConnected) setStep('connect');
      else setStep('mode');
    }
    else if (step === 'customize') setStep('search');
    else if (step === 'launch') setStep('customize');
  };

  const resetLaunch = () => {
    setLaunchMode('select');
    setStep('mode');
    setSearchQuery('');
    setSearchResults([]);
    setSelectedEntity(null);
    setTokenName('');
    setTokenSymbol('');
    setTokenDescription('');
    setTokenWebsite('');
    setTokenTwitter('');
    setTokenTelegram('');
    setAutoGenerateWebsite(true);
    setLaunchError(null);
    setLaunchResult(null);
  };

  // Mode Selection Screen
  const renderModeSelection = () => (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-white mb-3">Tokenize Your Repo</h1>
        <p className="text-white/50">What would you like to tokenize?</p>
      </div>

      {/* 2x2 Grid - GitHub & GitLab only */}
      <div className="grid grid-cols-2 gap-4 max-w-xl mx-auto">
        {/* GitHub - My Repo */}
        <button
          onClick={() => handleModeSelect('own-repo')}
          className="p-8 rounded-2xl border border-white/10 bg-white/[0.02] hover:bg-[#00FF41]/10 hover:border-[#00FF41]/50 transition-all duration-300 ease-out text-center group hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(0,255,65,0.15)]"
        >
          <div className="w-16 h-16 mx-auto rounded-xl bg-white/5 group-hover:bg-[#00FF41]/10 flex items-center justify-center mb-4 transition-all duration-300 group-hover:-translate-y-1">
            <Github className="w-8 h-8 text-white/60 group-hover:text-[#00FF41] transition-all duration-300 group-hover:scale-110" />
          </div>
          <p className="font-semibold text-white">My GitHub</p>
          <p className="text-xs text-white/40 group-hover:text-[#00FF41] mt-1 transition-colors duration-300">Direct fees</p>
        </button>

        {/* GitHub - Other's Repo */}
        <button
          onClick={() => handleModeSelect('other-repo')}
          className="p-8 rounded-2xl border border-white/10 bg-white/[0.02] hover:bg-[#00FF41]/10 hover:border-[#00FF41]/50 transition-all duration-300 ease-out text-center group hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(0,255,65,0.15)]"
        >
          <div className="w-16 h-16 mx-auto rounded-xl bg-white/5 group-hover:bg-[#00FF41]/10 flex items-center justify-center mb-4 transition-all duration-300 group-hover:-translate-y-1">
            <Github className="w-8 h-8 text-white/60 group-hover:text-[#00FF41] transition-all duration-300 group-hover:scale-110" />
          </div>
          <p className="font-semibold text-white">Any GitHub</p>
          <p className="text-xs text-white/40 group-hover:text-[#00FF41] mt-1 transition-colors duration-300">Escrow</p>
        </button>

        {/* GitLab - My Repo */}
        <button
          onClick={() => handleModeSelect('own-gitlab')}
          className="p-8 rounded-2xl border border-white/10 bg-white/[0.02] hover:bg-[#FC6D26]/10 hover:border-[#FC6D26]/50 transition-all duration-300 ease-out text-center group hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(252,109,38,0.15)]"
        >
          <div className="w-16 h-16 mx-auto rounded-xl bg-white/5 group-hover:bg-[#FC6D26]/10 flex items-center justify-center mb-4 transition-all duration-300 group-hover:-translate-y-1">
            <GitLabIcon className="w-8 h-8 text-white/60 group-hover:text-[#FC6D26] transition-all duration-300 group-hover:scale-110" />
          </div>
          <p className="font-semibold text-white">My GitLab</p>
          <p className="text-xs text-white/40 group-hover:text-[#FC6D26] mt-1 transition-colors duration-300">Direct fees</p>
        </button>

        {/* GitLab - Other's Repo - Character "hovers" this one synced to video */}
        <button
          onClick={() => handleModeSelect('other-gitlab')}
          className={`p-8 rounded-2xl border transition-all duration-300 ease-out text-center group hover:bg-[#FC6D26]/10 hover:border-[#FC6D26]/50 hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(252,109,38,0.15)] ${
            isHovered 
              ? 'border-[#FC6D26]/50 bg-[#FC6D26]/10 scale-[1.02] shadow-[0_0_30px_rgba(252,109,38,0.15)]' 
              : 'border-white/10 bg-white/[0.02]'
          }`}
        >
          <div className={`w-16 h-16 mx-auto rounded-xl flex items-center justify-center mb-4 transition-all duration-300 group-hover:-translate-y-1 group-hover:bg-[#FC6D26]/10 ${isHovered ? '-translate-y-1 bg-[#FC6D26]/10' : 'bg-white/5'}`}>
            <GitLabIcon className={`w-8 h-8 transition-all duration-300 group-hover:scale-110 group-hover:text-[#FC6D26] ${isHovered ? 'text-[#FC6D26] scale-110' : 'text-white/60'}`} />
          </div>
          <p className="font-semibold text-white">Any GitLab</p>
          <p className={`text-xs mt-1 transition-colors duration-300 group-hover:text-[#FC6D26] ${isHovered ? 'text-[#FC6D26]' : 'text-white/40'}`}>Escrow</p>
        </button>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-8 mt-8 text-xs text-white/40">
        <div className="flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-[#00FF41] flex-shrink-0" />
          <span>Direct = fees go to you</span>
        </div>
        <div className="flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>Escrow = owner claims later</span>
        </div>
      </div>
    </div>
  );

  // Connect Screen
  const renderConnect = () => {
    const isOwnRepo = launchMode === 'own-repo' || launchMode === 'own-gitlab';
    const platformName = launchMode?.includes('gitlab') ? 'GitLab' : 'GitHub';
    
    return (
      <div className="max-w-md mx-auto">
        <button onClick={goBack} className="flex items-center gap-2 text-white/40 hover:text-white mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-white mb-2">
            {isOwnRepo ? 'Connect Your Accounts' : 'Connect Wallet'}
          </h2>
          <p className="text-white/50 text-sm">
            {isOwnRepo 
              ? `Verify ${platformName} ownership & pay for launch`
              : 'Required to pay for launch'}
          </p>
        </div>

        <div className="space-y-3">
          {/* GitHub/GitLab - Only show for own repo */}
          {isOwnRepo && (
            <div className={`p-4 rounded-xl border ${session ? 'border-[#00FF41]/30 bg-[#00FF41]/5' : 'border-white/10 bg-white/[0.02]'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {launchMode === 'own-gitlab' ? (
                    <GitLabIcon className={`w-5 h-5 ${session ? 'text-[#FC6D26]' : 'text-white/60'}`} />
                  ) : (
                    <Github className={`w-5 h-5 ${session ? 'text-[#00FF41]' : 'text-white/60'}`} />
                  )}
                  <div>
                    <p className="font-medium text-white text-sm">{platformName}</p>
                    {session ? (
                      <p className="text-xs text-[#00FF41]">{githubLogin}</p>
                    ) : (
                      <p className="text-xs text-white/40">Required to verify ownership</p>
                    )}
                  </div>
                </div>
                {session ? (
                  <CheckCircle className="w-5 h-5 text-[#00FF41]" />
                ) : (
                  <button
                    onClick={() => signIn(launchMode === 'own-gitlab' ? 'gitlab' : 'github')}
                    className="px-4 py-2 bg-[#00FF41] text-black text-sm font-semibold rounded-lg hover:bg-[#00FF41]/90 transition-all"
                  >
                    Connect
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Wallet - Always required */}
          <div className={`p-4 rounded-xl border ${connected ? 'border-[#00FF41]/30 bg-[#00FF41]/5' : 'border-white/10 bg-white/[0.02]'}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Wallet className={`w-5 h-5 ${connected ? 'text-[#00FF41]' : 'text-white/60'}`} />
                <div>
                  <p className="font-medium text-white text-sm">Solana Wallet</p>
                  {connected && publicKey ? (
                    <p className="text-xs text-[#00FF41] font-mono">{publicKey.toBase58().slice(0, 4)}...{publicKey.toBase58().slice(-4)}</p>
                  ) : (
                    <p className="text-xs text-white/40">Required for transactions</p>
                  )}
                </div>
              </div>
              {connected ? (
                <CheckCircle className="w-5 h-5 text-[#00FF41]" />
              ) : mounted ? (
                <WalletMultiButton />
              ) : (
                <div className="w-[160px] h-[40px] bg-white/10 rounded-lg animate-pulse" />
              )}
            </div>
          </div>
        </div>

        {/* Continue button - shows when requirements are met */}
        {isReadyToContinue && (
          <button
            onClick={() => {
              if (launchMode === 'own-repo') {
                setStep('search');
                fetchMyRepos();
              } else if (launchMode === 'own-gitlab') {
                // TODO: Fetch user's GitLab repos
                setStep('search');
              } else {
                setStep('search');
              }
            }}
            className="w-full mt-8 py-3 bg-[#00FF41] text-black font-semibold rounded-xl hover:bg-[#00FF41]/90 transition-all flex items-center justify-center gap-2"
          >
            Continue
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>
    );
  };

  // Search Screen
  const renderSearch = () => (
    <div className="max-w-2xl mx-auto">
      <button onClick={goBack} className="flex items-center gap-2 text-white/40 hover:text-white mb-8 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">
          {launchMode === 'own-repo' ? 'Select Your Repository' : 'Search Any Repository'}
        </h2>
        <p className="text-white/50 text-sm">
          {launchMode === 'own-repo' 
            ? 'Choose from your GitHub repositories' 
            : 'Search for any public GitHub repository to tokenize'}
        </p>
      </div>

      {/* Search bar for other repos */}
      {launchMode === 'other-repo' && (
        <div className="flex gap-3 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && searchRepos()}
              placeholder="Search GitHub repositories..."
              className="w-full pl-12 pr-4 py-3 bg-white/[0.03] border border-white/10 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-[#00FF41]/50"
            />
          </div>
          <button
            onClick={searchRepos}
            disabled={isSearching}
            className="px-6 py-3 bg-[#00FF41] text-black font-semibold rounded-xl hover:bg-[#00FF41]/90 transition-all disabled:opacity-50"
          >
            {isSearching ? 'Searching...' : 'Search'}
          </button>
        </div>
      )}

      {/* Results */}
      <div className="space-y-3">
        {isSearching ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-2 border-white/10 border-t-[#00FF41] rounded-full animate-spin mx-auto" />
            <p className="text-white/40 text-sm mt-4">Loading...</p>
          </div>
        ) : searchResults.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-white/40 text-sm">
              {launchMode === 'own-repo' 
                ? 'No repositories found' 
                : 'Search for a repository to get started'}
            </p>
          </div>
        ) : (
          searchResults.map((repo) => (
            <button
              key={repo.id}
              onClick={() => handleEntitySelect(repo)}
              className="w-full p-4 rounded-xl border border-white/5 bg-white/[0.02] hover:border-[#00FF41]/30 hover:bg-[#00FF41]/5 transition-all text-left group"
            >
              <div className="flex items-center gap-4">
                <img
                  src={repo.owner.avatar_url}
                  alt={repo.owner.login}
                  className="w-10 h-10 rounded-full"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-white truncate group-hover:text-[#00FF41] transition-colors">
                    {repo.full_name}
                  </h3>
                  <p className="text-xs text-white/40 truncate">{repo.description || 'No description'}</p>
                </div>
                <div className="flex items-center gap-4 text-xs text-white/40">
                  <span className="flex items-center gap-1">
                    <Star className="w-3 h-3" />
                    {repo.stargazers_count.toLocaleString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <GitFork className="w-3 h-3" />
                    {repo.forks_count.toLocaleString()}
                  </span>
                </div>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );

  // Customize Screen
  const renderCustomize = () => (
    <div className="max-w-6xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Panel - Form */}
        <div ref={leftPanelRef}>
          {/* Title */}
          <div className="mb-6">
            <h2 className="text-4xl font-bold text-white mb-2">Tokenize Repository</h2>
            {launchMode === 'other-repo' ? (
              <p className="text-white/50 text-sm">
                <span className="text-yellow-500">Escrow Mode</span> — Since you don&apos;t own this repo, creator fees will be held in escrow until the real owner {selectedEntity && <a href={`https://github.com/${selectedEntity.owner.login}`} target="_blank" rel="noopener noreferrer" className="text-[#00FF41] hover:underline">@{selectedEntity.owner.login}</a>} verifies and claims them.
              </p>
            ) : (
              <p className="text-white/50 text-sm">Set your token name and symbol</p>
            )}
          </div>

          {/* Selected Entity */}
          {selectedEntity && repoOwnerProfile && (
            <div className="p-4 rounded-xl border border-white/10 bg-white/[0.02] mb-6">
              <div className="flex items-start gap-3">
                <a href={repoOwnerProfile.html_url} target="_blank" rel="noopener noreferrer">
                  <img
                    src={repoOwnerProfile.avatar_url}
                    alt={repoOwnerProfile.login}
                    className="w-12 h-12 rounded-full hover:ring-2 hover:ring-[#00FF41]/50 transition-all"
                  />
                </a>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <a 
                      href={repoOwnerProfile.html_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="font-semibold text-white hover:text-[#00FF41] transition-colors"
                    >
                      {repoOwnerProfile.name || repoOwnerProfile.login}
                    </a>
                    <span className="text-white/30">/</span>
                    <a 
                      href={selectedEntity.html_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-[#00FF41] hover:text-[#00FF41]/80 transition-colors truncate"
                    >
                      {selectedEntity.name}
                    </a>
                  </div>
                  <p className="text-xs text-white/40">@{repoOwnerProfile.login} · {selectedEntity.stargazers_count.toLocaleString()} ⭐</p>
                  
                  {repoOwnerProfile.bio && (
                    <p className="text-xs text-white/50 mt-1.5 line-clamp-2">{repoOwnerProfile.bio}</p>
                  )}
                  
                  {/* Profile Details */}
                  <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2 text-[11px] text-white/40">
                    {repoOwnerProfile.company && (
                      <span className="flex items-center gap-1">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 16 16"><path fillRule="evenodd" d="M1.5 14.25c0 .138.112.25.25.25H4v-1.25a.75.75 0 01.75-.75h2.5a.75.75 0 01.75.75v1.25h2.25a.25.25 0 00.25-.25V1.75a.25.25 0 00-.25-.25h-8.5a.25.25 0 00-.25.25v12.5zM1.75 16A1.75 1.75 0 010 14.25V1.75C0 .784.784 0 1.75 0h8.5C11.216 0 12 .784 12 1.75v12.5c0 .085-.006.168-.018.25h2.268a.25.25 0 00.25-.25V8.285a.25.25 0 00-.111-.208l-1.055-.703a.75.75 0 11.832-1.248l1.055.703c.487.325.779.871.779 1.456v5.965A1.75 1.75 0 0114.25 16h-3.5a.75.75 0 01-.197-.026c-.099.017-.2.026-.303.026h-3a.75.75 0 01-.75-.75V14h-1v1.25a.75.75 0 01-.75.75h-3zM3 3.75A.75.75 0 013.75 3h.5a.75.75 0 010 1.5h-.5A.75.75 0 013 3.75zM3.75 6a.75.75 0 000 1.5h.5a.75.75 0 000-1.5h-.5zM3 9.75A.75.75 0 013.75 9h.5a.75.75 0 010 1.5h-.5A.75.75 0 013 9.75zM7.75 9a.75.75 0 000 1.5h.5a.75.75 0 000-1.5h-.5zM7 6.75A.75.75 0 017.75 6h.5a.75.75 0 010 1.5h-.5A.75.75 0 017 6.75zM7.75 3a.75.75 0 000 1.5h.5a.75.75 0 000-1.5h-.5z"/></svg>
                        {repoOwnerProfile.company}
                      </span>
                    )}
                    {repoOwnerProfile.location && (
                      <span className="flex items-center gap-1">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 16 16"><path fillRule="evenodd" d="M11.536 3.464a5 5 0 010 7.072L8 14.07l-3.536-3.535a5 5 0 117.072-7.072v.001zm1.06 8.132a6.5 6.5 0 10-9.192 0l3.535 3.536a1.5 1.5 0 002.122 0l3.535-3.536zM8 9a2 2 0 100-4 2 2 0 000 4z"/></svg>
                        {repoOwnerProfile.location}
                      </span>
                    )}
                    {repoOwnerProfile.blog && (
                      <a 
                        href={repoOwnerProfile.blog.startsWith('http') ? repoOwnerProfile.blog : `https://${repoOwnerProfile.blog}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 hover:text-[#00FF41] transition-colors"
                      >
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 16 16"><path fillRule="evenodd" d="M7.775 3.275a.75.75 0 001.06 1.06l1.25-1.25a2 2 0 112.83 2.83l-2.5 2.5a2 2 0 01-2.83 0 .75.75 0 00-1.06 1.06 3.5 3.5 0 004.95 0l2.5-2.5a3.5 3.5 0 00-4.95-4.95l-1.25 1.25zm-4.69 9.64a2 2 0 010-2.83l2.5-2.5a2 2 0 012.83 0 .75.75 0 001.06-1.06 3.5 3.5 0 00-4.95 0l-2.5 2.5a3.5 3.5 0 004.95 4.95l1.25-1.25a.75.75 0 00-1.06-1.06l-1.25 1.25a2 2 0 01-2.83 0z"/></svg>
                        {repoOwnerProfile.blog.replace(/^https?:\/\//, '')}
                      </a>
                    )}
                    {repoOwnerProfile.twitter_username && (
                      <a 
                        href={`https://twitter.com/${repoOwnerProfile.twitter_username}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 hover:text-[#00FF41] transition-colors"
                      >
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                        @{repoOwnerProfile.twitter_username}
                      </a>
                    )}
                  </div>
                  
                  {/* Followers/Repos */}
                  <div className="flex gap-3 mt-2 text-[11px]">
                    <span className="text-white/40">
                      <span className="text-white/60 font-medium">{repoOwnerProfile.followers.toLocaleString()}</span> followers
                    </span>
                    <span className="text-white/40">
                      <span className="text-white/60 font-medium">{repoOwnerProfile.public_repos.toLocaleString()}</span> repos
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Developer Allocation - Only for other's repo */}
          {launchMode === 'other-repo' && (
            <div className="p-4 rounded-xl border border-white/10 bg-white/[0.02] mb-6">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-sm font-medium text-white">Developer Supply</p>
                  <p className="text-xs text-white/40 mt-0.5">Buy and reserve tokens for the repo owner to claim</p>
                </div>
                <div className="text-right">
                  <span className="text-xl font-semibold text-white">{creatorAllocation}%</span>
                  {creatorAllocation > 0 && (
                    <>
                      <p className="text-xs text-[#00FF41] mt-0.5">
                        ~{calculateSolCostForSupply(creatorAllocation).toFixed(4)} SOL
                      </p>
                      <p className="text-[10px] text-white/40">
                        ≈ {formatUsd(solToUsd(calculateSolCostForSupply(creatorAllocation)))}
                      </p>
                    </>
                  )}
                </div>
              </div>
              
              {/* Slider */}
              <div className="relative mt-4">
                <input
                  type="range"
                  min="0"
                  max="10"
                  step="1"
                  value={creatorAllocation}
                  onChange={(e) => setCreatorAllocation(Number(e.target.value))}
                  className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer
                    [&::-webkit-slider-thumb]:appearance-none
                    [&::-webkit-slider-thumb]:w-4
                    [&::-webkit-slider-thumb]:h-4
                    [&::-webkit-slider-thumb]:rounded-full
                    [&::-webkit-slider-thumb]:bg-white
                    [&::-webkit-slider-thumb]:cursor-pointer
                    [&::-webkit-slider-thumb]:transition-all
                    [&::-webkit-slider-thumb]:hover:scale-110
                    [&::-moz-range-thumb]:w-4
                    [&::-moz-range-thumb]:h-4
                    [&::-moz-range-thumb]:rounded-full
                    [&::-moz-range-thumb]:bg-white
                    [&::-moz-range-thumb]:border-0
                    [&::-moz-range-thumb]:cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0.5) ${creatorAllocation * 10}%, rgba(255,255,255,0.1) ${creatorAllocation * 10}%, rgba(255,255,255,0.1) 100%)`
                  }}
                />
                <div className="flex justify-between text-xs text-white/30 mt-2">
                  <span>0%</span>
                  <span>5%</span>
                  <span>10%</span>
                </div>
              </div>

              {/* Quick select buttons */}
              <div className="flex gap-2 mt-3">
                {[0, 2, 5, 8, 10].map((pct) => (
                  <button
                    key={pct}
                    onClick={() => setCreatorAllocation(pct)}
                    className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${
                      creatorAllocation === pct
                        ? 'bg-white/20 text-white'
                        : 'bg-white/5 text-white/40 hover:bg-white/10'
                    }`}
                  >
                    {pct}%
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Form */}
          <div className="space-y-4">
            {/* Logo & Banner Row */}
            {/* Logo & Banner Combined */}
            <div>
              <label className="block text-sm text-white/60 mb-2">Token Logo & Banner</label>
              <div className="flex gap-0 rounded-xl overflow-hidden border border-white/10">
                {/* Logo Upload - Square */}
                <div className="relative flex-shrink-0">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                    id="logo-upload"
                  />
                  <label
                    htmlFor="logo-upload"
                    className="flex flex-col items-center justify-center w-20 h-20 bg-white/[0.05] cursor-pointer hover:bg-white/[0.08] transition-all overflow-hidden"
                  >
                    {tokenLogoPreview ? (
                      <img src={tokenLogoPreview} alt="Logo preview" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xs text-white/40 font-medium">LOGO</span>
                    )}
                  </label>
                </div>

                {/* Banner Upload - Flexible width */}
                <div className="relative flex-1">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleBannerUpload}
                    className="hidden"
                    id="banner-upload"
                  />
                  <label
                    htmlFor="banner-upload"
                    className="flex items-center justify-center w-full h-20 bg-white/[0.03] cursor-pointer hover:bg-white/[0.05] transition-all overflow-hidden"
                  >
                    {tokenBannerPreview ? (
                      <img src={tokenBannerPreview} alt="Banner preview" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-sm text-white/40 font-medium">Banner</span>
                    )}
                  </label>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm text-white/60 mb-2">Token Name</label>
              <input
                type="text"
                value={tokenName}
                onChange={(e) => setTokenName(e.target.value)}
                placeholder="e.g. React Token"
                className="w-full px-4 py-3 bg-white/[0.03] border border-white/10 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-[#00FF41]/50"
              />
            </div>
            <div>
              <label className="block text-sm text-white/60 mb-2">Token Symbol</label>
              <input
                type="text"
                value={tokenSymbol}
                onChange={(e) => setTokenSymbol(e.target.value.toUpperCase().slice(0, 6))}
                placeholder="e.g. REACT"
                maxLength={6}
                className="w-full px-4 py-3 bg-white/[0.03] border border-white/10 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-[#00FF41]/50 font-mono"
              />
            </div>
            <div>
              <label className="block text-sm text-white/60 mb-2">Description</label>
              <textarea
                value={tokenDescription}
                onChange={(e) => setTokenDescription(e.target.value)}
                placeholder="Describe your token..."
                rows={3}
                maxLength={200}
                className="w-full px-4 py-3 bg-white/[0.03] border border-white/10 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-[#00FF41]/50 resize-none"
              />
              <p className="text-xs text-white/30 mt-1 text-right">{tokenDescription.length}/200</p>
            </div>
            
            {/* Social Links Section */}
            <div className="pt-4 border-t border-white/10">
              <label className="block text-sm text-white/60 mb-3">Social Links (Optional)</label>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Globe className="w-4 h-4 text-white/40" />
                  </div>
                  <input
                    type="url"
                    value={tokenWebsite}
                    onChange={(e) => setTokenWebsite(e.target.value)}
                    placeholder="Website URL"
                    className="flex-1 px-3 py-2.5 bg-white/[0.03] border border-white/10 rounded-lg text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-[#00FF41]/50"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Twitter className="w-4 h-4 text-white/40" />
                  </div>
                  <input
                    type="text"
                    value={tokenTwitter}
                    onChange={(e) => setTokenTwitter(e.target.value)}
                    placeholder="@twitter or URL"
                    className="flex-1 px-3 py-2.5 bg-white/[0.03] border border-white/10 rounded-lg text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-[#00FF41]/50"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Send className="w-4 h-4 text-white/40" />
                  </div>
                  <input
                    type="text"
                    value={tokenTelegram}
                    onChange={(e) => setTokenTelegram(e.target.value)}
                    placeholder="@telegram or t.me/..."
                    className="flex-1 px-3 py-2.5 bg-white/[0.03] border border-white/10 rounded-lg text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-[#00FF41]/50"
                  />
                </div>
              </div>
            </div>
            
            {/* Auto-Generate Website Toggle */}
            <div className="pt-4 border-t border-white/10">
              <div 
                onClick={() => setAutoGenerateWebsite(!autoGenerateWebsite)}
                className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${
                  autoGenerateWebsite 
                    ? 'bg-[#00FF41]/10 border-[#00FF41]/30' 
                    : 'bg-white/[0.02] border-white/10 hover:border-white/20'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    autoGenerateWebsite ? 'bg-[#00FF41]/20' : 'bg-white/5'
                  }`}>
                    <Globe className={`w-5 h-5 ${autoGenerateWebsite ? 'text-[#00FF41]' : 'text-white/40'}`} />
                  </div>
                  <div>
                    <p className={`font-semibold ${autoGenerateWebsite ? 'text-[#00FF41]' : 'text-white'}`}>
                      Auto-Generate Website
                    </p>
                    <p className="text-xs text-white/40">Create a landing page with your README</p>
                  </div>
                </div>
                <div className={`w-12 h-7 rounded-full p-1 transition-colors ${
                  autoGenerateWebsite ? 'bg-[#00FF41]' : 'bg-white/20'
                }`}>
                  <div className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                    autoGenerateWebsite ? 'translate-x-5' : 'translate-x-0'
                  }`} />
                </div>
              </div>
              {autoGenerateWebsite && (
                <p className="mt-2 text-xs text-white/40 px-1">
                  🔗 Your site: gitup.fun/site/[token-address]
                </p>
              )}
            </div>
          </div>

          <button
            onClick={() => setStep('launch')}
            disabled={!tokenName || !tokenSymbol || !tokenDescription}
            className="w-full mt-6 py-3 bg-[#00FF41] text-black font-semibold rounded-xl hover:bg-[#00FF41]/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            Continue to Launch
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Right Panel - Repo Info */}
        <div className="hidden lg:block">
          {selectedEntity && (
            <div 
              className="rounded-2xl border border-white/10 bg-white/[0.02] overflow-hidden relative flex flex-col"
              style={{ height: '945px' }}
            >
              {/* External Link Button */}
              <a
                href={selectedEntity.html_url}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute top-4 right-4 p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-all z-10"
                title="View on GitHub"
              >
                <ExternalLink className="w-4 h-4" />
              </a>

              {/* Repo Header */}
              <div className="p-6 border-b border-white/10 flex-shrink-0">
                <div className="flex items-center gap-4">
                  <img
                    src={selectedEntity.owner.avatar_url}
                    alt={selectedEntity.owner.login}
                    className="w-12 h-12 rounded-full"
                  />
                  <div className="flex-1 pr-8">
                    <h3 className="text-lg font-bold text-white">{selectedEntity.name}</h3>
                    <p className="text-sm text-white/40">by {selectedEntity.owner.login}</p>
                  </div>
                </div>

                {/* Stats Row */}
                <div className="flex flex-wrap gap-4 text-sm mt-4">
                  <div className="flex items-center gap-1.5 text-white/50">
                    <Star className="w-4 h-4 text-yellow-500" />
                    <span>{selectedEntity.stargazers_count.toLocaleString()} stars</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-white/50">
                    <GitFork className="w-4 h-4" />
                    <span>{selectedEntity.forks_count.toLocaleString()} forks</span>
                  </div>
                </div>

                {/* Languages Bar */}
                {Object.keys(repoLanguages).length > 0 && (
                  <div className="mt-4">
                    {/* Color bar */}
                    <div className="h-2 rounded-full overflow-hidden flex">
                      {(() => {
                        const total = Object.values(repoLanguages).reduce((a, b) => a + b, 0);
                        return Object.entries(repoLanguages).map(([lang, bytes]) => (
                          <div
                            key={lang}
                            style={{
                              width: `${(bytes / total) * 100}%`,
                              backgroundColor: languageColors[lang] || '#8b8b8b',
                            }}
                            title={`${lang}: ${((bytes / total) * 100).toFixed(1)}%`}
                          />
                        ));
                      })()}
                    </div>
                    {/* Language labels */}
                    <div className="flex flex-wrap gap-3 mt-2">
                      {(() => {
                        const total = Object.values(repoLanguages).reduce((a, b) => a + b, 0);
                        return Object.entries(repoLanguages)
                          .sort(([, a], [, b]) => b - a)
                          .slice(0, 5) // Show top 5 languages
                          .map(([lang, bytes]) => (
                            <div key={lang} className="flex items-center gap-1.5 text-xs text-white/50">
                              <span
                                className="w-2.5 h-2.5 rounded-full"
                                style={{ backgroundColor: languageColors[lang] || '#8b8b8b' }}
                              />
                              <span>{lang}</span>
                              <span className="text-white/30">{((bytes / total) * 100).toFixed(1)}%</span>
                            </div>
                          ));
                      })()}
                    </div>
                  </div>
                )}

                {/* Description */}
                {selectedEntity.description && (
                  <p className="text-sm text-white/60 mt-4 leading-relaxed">{selectedEntity.description}</p>
                )}
              </div>

              {/* README */}
              <div className="p-6 flex-1 overflow-hidden flex flex-col min-h-0">
                <h4 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-4 flex-shrink-0">
                  README
                </h4>
                
                {isLoadingReadme ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="w-6 h-6 border-2 border-white/10 border-t-[#00FF41] rounded-full animate-spin" />
                  </div>
                ) : readmeContent ? (
                  <div 
                    className="readme-content prose prose-invert prose-sm max-w-none overflow-y-auto pr-2 
                      prose-headings:text-white prose-headings:font-semibold prose-headings:border-b prose-headings:border-white/10 prose-headings:pb-2
                      prose-p:text-white/60 prose-a:text-[#00FF41] prose-strong:text-white
                      prose-code:text-[#00FF41] prose-code:bg-white/5 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded
                      prose-pre:bg-white/5 prose-pre:border prose-pre:border-white/10
                      prose-img:rounded-lg prose-img:max-w-full
                      prose-ul:text-white/60 prose-ol:text-white/60 prose-li:text-white/60"
                    dangerouslySetInnerHTML={{ __html: readmeContent }}
                  />
                ) : (
                  <p className="text-white/30 text-sm text-center py-12">No README available</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Launch Confirmation Screen
  const renderLaunchConfirmation = () => (
    <div className="max-w-lg mx-auto">
      <button onClick={goBack} className="flex items-center gap-2 text-white/40 hover:text-white mb-8 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">Confirm Launch</h2>
        <p className="text-white/50 text-sm">Review and launch your token on pump.fun</p>
      </div>

      {/* Token Preview Card */}
      <div className="rounded-xl border border-white/10 bg-white/[0.02] overflow-hidden mb-6">
        {/* Banner */}
        {tokenBannerPreview && (
          <div className="h-24 overflow-hidden">
            <img src={tokenBannerPreview} alt="Banner" className="w-full h-full object-cover" />
          </div>
        )}
        
        {/* Token Info */}
        <div className="p-4">
          <div className="flex items-center gap-3">
            {tokenLogoPreview ? (
              <img src={tokenLogoPreview} alt="Logo" className="w-12 h-12 rounded-full object-cover border-2 border-[#0a0a0a]" />
            ) : (
              <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                <ImageIcon className="w-6 h-6 text-white/30" />
              </div>
            )}
            <div>
              <h3 className="font-bold text-white">{tokenName}</h3>
              <p className="text-sm text-[#00FF41] font-mono">${tokenSymbol}</p>
            </div>
          </div>
          {tokenDescription && (
            <p className="text-sm text-white/50 mt-3">{tokenDescription}</p>
          )}
        </div>
      </div>

      {/* Summary */}
      <div className="p-5 rounded-xl border border-white/10 bg-white/[0.02] mb-6">
        <h3 className="text-xs text-white/40 uppercase tracking-wider mb-4">Details</h3>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-white/50">Repository</span>
            <span className="text-white font-mono text-xs">{selectedEntity?.full_name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/50">Fee Mode</span>
            <span className={launchMode === 'own-repo' ? 'text-[#00FF41]' : 'text-yellow-500'}>
              {launchMode === 'own-repo' ? 'Direct to Wallet' : 'Escrow (Claimable)'}
            </span>
          </div>
          {launchMode === 'other-repo' && creatorAllocation > 0 && (
            <div className="flex justify-between pt-2 border-t border-white/5">
              <span className="text-white/50">Developer Supply</span>
              <span className="text-white font-medium">{creatorAllocation}% reserved</span>
            </div>
          )}
        </div>
      </div>

      {/* Developer allocation highlight for escrow mode */}
      {launchMode === 'other-repo' && creatorAllocation > 0 && (
        <div className="p-4 rounded-xl border border-white/10 bg-white/[0.02] mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#00FF41]/10 flex items-center justify-center">
              <Gift className="w-5 h-5 text-[#00FF41]" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-white">{creatorAllocation}% Developer Supply</p>
              <p className="text-xs text-white/40">Reserved for the repo owner to claim after verification</p>
            </div>
          </div>
        </div>
      )}

      {launchError && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 mb-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-400">Launch Failed</p>
              <p className="text-xs text-red-400/70 mt-1">{launchError}</p>
            </div>
          </div>
        </div>
      )}

      <button
        onClick={handleLaunch}
        disabled={isLaunching}
        className="w-full py-4 bg-[#00FF41] text-black font-semibold rounded-xl hover:bg-[#00FF41]/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {isLaunching ? (
          <>
            <span className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
            Launching...
          </>
        ) : (
          <>
            <GitBranch className="w-5 h-5" />
            Tokenize on pump.fun
          </>
        )}
      </button>
    </div>
  );

  // Success Screen
  const renderSuccess = () => (
    <div className="max-w-lg mx-auto text-center">
      <div className="w-20 h-20 rounded-full bg-[#00FF41]/10 flex items-center justify-center mx-auto mb-6">
        <CheckCircle className="w-10 h-10 text-[#00FF41]" />
      </div>
      <h2 className="text-3xl font-bold text-white mb-3">Token Launched! 🎉</h2>
      <p className="text-white/50 mb-8">
        Your token has been successfully launched on pump.fun
      </p>

      <div className="p-5 rounded-xl border border-white/10 bg-white/[0.02] mb-8 text-left">
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-white/50">Token</span>
            <span className="text-white">{tokenName} (${tokenSymbol})</span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/50">Repository</span>
            <span className="text-white font-mono">{selectedEntity?.full_name}</span>
          </div>
          {launchResult && (
            <>
              <div className="flex justify-between items-center">
                <span className="text-white/50">Mint Address</span>
                <span className="text-white font-mono text-xs truncate max-w-[200px]">{launchResult.mint}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/50">Transaction</span>
                <a 
                  href={`https://solscan.io/tx/${launchResult.signature}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#00FF41] font-mono text-xs hover:underline flex items-center gap-1"
                >
                  {launchResult.signature.slice(0, 8)}...{launchResult.signature.slice(-8)}
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={resetLaunch}
          className="flex-1 py-3 border border-white/10 text-white/70 font-medium rounded-xl hover:bg-white/5 transition-all"
        >
          Launch Another
        </button>
        <a
          href={launchResult ? `https://pump.fun/coin/${launchResult.mint}` : 'https://pump.fun'}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 py-3 bg-[#00FF41] text-black font-semibold rounded-xl hover:bg-[#00FF41]/90 transition-all flex items-center justify-center gap-2"
        >
          View on pump.fun
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>
    </div>
  );

  // Render current step
  const renderCurrentStep = () => {
    switch (step) {
      case 'mode': return renderModeSelection();
      case 'connect': return renderConnect();
      case 'search': return renderSearch();
      case 'customize': return renderCustomize();
      case 'launch': return renderLaunchConfirmation();
      case 'success': return renderSuccess();
      default: return renderModeSelection();
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
        <div className="w-8 h-8 border-2 border-white/10 border-t-[#00FF41] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] pt-12 pb-12 px-6">
      {/* Star Particles */}
      <StarParticles />
      
      {/* Character Video - Only show on mode selection step */}
      {step === 'mode' && <LaunchCharacterVideo videoRef={videoRef} />}
      
      {/* Ambient glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-[400px] h-[400px] bg-[#00FF41]/5 rounded-full blur-[100px]" />
      </div>
      
      <div className="relative z-10">
        {renderCurrentStep()}
      </div>
    </div>
  );
}
