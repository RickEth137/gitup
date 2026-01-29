'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { ExternalLink, Twitter, Send, Globe, Github, Star, GitFork, ArrowRight } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Image from 'next/image';

// Star particles background
function StarParticles() {
  const stars = useMemo(() => 
    [...Array(80)].map((_, i) => ({
      id: i,
      left: (i * 17 + 7) % 100,
      top: (i * 23 + 13) % 100,
      size: 1 + (i % 3) * 0.5,
      opacity: 0.1 + (i % 5) * 0.08,
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

interface TokenSiteData {
  name: string;
  symbol: string;
  description: string;
  image?: string;
  banner?: string;
  website?: string;
  twitter?: string;
  telegram?: string;
  github?: string;
  readme?: string;
  repoName?: string;
  repoOwner?: string;
  repoStars?: number;
  repoForks?: number;
  // AI-generated content (for project description only)
  aiContent?: {
    tagline: string;
    heroDescription: string;
    features: Array<{ title: string; description: string; icon: string }>;
    useCases: string[];
    callToAction: string;
    images?: {
      heroBanner?: string;
      screenshots: string[];
      featureImages: string[];
    };
  };
}

export default function TokenSitePage() {
  const params = useParams();
  const mint = params.mint as string;
  
  const [siteData, setSiteData] = useState<TokenSiteData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSiteData() {
      try {
        setIsLoading(true);
        
        // First try to get from localStorage (for preview before launch)
        const savedData = localStorage.getItem(`site_${mint}`);
        if (savedData) {
          setSiteData(JSON.parse(savedData));
          setIsLoading(false);
          return;
        }
        
        // Then try to fetch from API
        const response = await fetch(`/api/site/${mint}`);
        if (response.ok) {
          const data = await response.json();
          setSiteData(data);
        } else {
          setError('Site not found');
        }
      } catch (err) {
        setError('Failed to load site');
      } finally {
        setIsLoading(false);
      }
    }

    if (mint) {
      fetchSiteData();
    }
  }, [mint]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-2 border-[#00FF41] border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error || !siteData) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center">
          <Image src="/logo3.png" alt="GitUp.fun" width={64} height={64} className="mx-auto mb-4 opacity-20" />
          <h1 className="text-white text-xl font-bold mb-2">Site Not Found</h1>
          <p className="text-white/50">This project site doesn't exist yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] relative">
      <StarParticles />
      
      {/* Top Navigation Bar */}
      <nav className="sticky top-0 z-50 bg-[#0a0a0a]/90 backdrop-blur-md border-b border-white/5">
        <div className="max-w-4xl mx-auto px-6 py-3 flex items-center justify-between">
          {/* Logo & Name */}
          <div className="flex items-center gap-3">
            {siteData.image ? (
              <img src={siteData.image} alt="" className="w-8 h-8 rounded-lg" />
            ) : (
              <div className="w-8 h-8 rounded-lg bg-[#00FF41]/20 flex items-center justify-center">
                <span className="text-sm font-bold text-[#00FF41]">{siteData.symbol?.charAt(0)}</span>
              </div>
            )}
            <span className="font-semibold text-white">{siteData.name}</span>
            <span className="text-[#00FF41] font-mono text-sm">${siteData.symbol}</span>
          </div>
          
          {/* Social Links */}
          <div className="flex items-center gap-2">
            {siteData.twitter && (
              <a
                href={siteData.twitter.startsWith('http') ? siteData.twitter : `https://twitter.com/${siteData.twitter.replace('@', '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-white/5 text-white/60 hover:text-white hover:bg-white/10 transition-colors"
              >
                <Twitter className="w-4 h-4" />
              </a>
            )}
            {siteData.telegram && (
              <a
                href={siteData.telegram.startsWith('http') ? siteData.telegram : `https://t.me/${siteData.telegram.replace('@', '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-white/5 text-white/60 hover:text-white hover:bg-white/10 transition-colors"
              >
                <Send className="w-4 h-4" />
              </a>
            )}
            {siteData.website && (
              <a
                href={siteData.website}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-white/5 text-white/60 hover:text-white hover:bg-white/10 transition-colors"
              >
                <Globe className="w-4 h-4" />
              </a>
            )}
            {siteData.github && (
              <a
                href={siteData.github}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-white/5 text-white/60 hover:text-white hover:bg-white/10 transition-colors"
              >
                <Github className="w-4 h-4" />
              </a>
            )}
            {/* Chart Button */}
            <a
              href={`https://pump.fun/coin/${mint}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-lg bg-[#00FF41]/10 text-[#00FF41] text-sm font-medium flex items-center gap-1.5 hover:bg-[#00FF41]/20 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
              </svg>
              Chart
            </a>
          </div>
        </div>
      </nav>
      
      {/* Hero Section */}
      <div className="relative">
        {/* Banner - Use AI hero banner if available, otherwise manual banner */}
        {siteData.aiContent?.images?.heroBanner || siteData.banner ? (
          <div className="h-64 md:h-80 w-full overflow-hidden">
            <img 
              src={siteData.aiContent?.images?.heroBanner || siteData.banner} 
              alt="Banner" 
              className="w-full h-full object-cover opacity-60"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0a0a0a]/50 to-[#0a0a0a]" />
          </div>
        ) : (
          <div className="h-48 md:h-64 w-full bg-gradient-to-b from-[#00FF41]/10 to-transparent" />
        )}
        
        {/* Logo & Title Overlay */}
        <div className="absolute bottom-0 left-0 right-0 transform translate-y-1/2">
          <div className="max-w-4xl mx-auto px-6 flex items-end gap-6">
            {/* Logo */}
            <div className="w-28 h-28 md:w-36 md:h-36 rounded-2xl border-4 border-[#0a0a0a] bg-[#0d0d0d] overflow-hidden flex-shrink-0 shadow-2xl">
              {siteData.image ? (
                <img src={siteData.image} alt={siteData.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#00FF41]/20 to-transparent">
                  <span className="text-4xl font-bold text-white/30">{siteData.symbol?.charAt(0)}</span>
                </div>
              )}
            </div>
            
            {/* Title & Symbol */}
            <div className="pb-2">
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-1">{siteData.name}</h1>
              <p className="text-[#00FF41] font-mono text-lg">${siteData.symbol}</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Content */}
      <main className="max-w-4xl mx-auto px-6 pt-24 pb-16 relative z-10">
        
        {/* Description */}
        <p className="text-white/70 text-lg mb-8 leading-relaxed">
          {siteData.description}
        </p>
        
        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 mb-12">
          <a
            href={`https://pump.fun/coin/${mint}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-[#00FF41] text-black font-bold px-6 py-3 rounded-xl hover:bg-[#00FF41]/90 transition-colors"
          >
            Trade on pump.fun
            <ArrowRight className="w-5 h-5" />
          </a>
          
          {siteData.github && (
            <a
              href={siteData.github}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-white/10 text-white font-semibold px-6 py-3 rounded-xl hover:bg-white/20 transition-colors border border-white/10"
            >
              <Github className="w-5 h-5" />
              View Repository
            </a>
          )}
        </div>
        
        {/* Social Links */}
        {(siteData.website || siteData.twitter || siteData.telegram) && (
          <div className="flex flex-wrap gap-3 mb-12">
            {siteData.website && (
              <a
                href={siteData.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white/70 hover:text-white hover:border-[#00FF41]/50 transition-all"
              >
                <Globe className="w-4 h-4" />
                Website
              </a>
            )}
            {siteData.twitter && (
              <a
                href={siteData.twitter.startsWith('http') ? siteData.twitter : `https://twitter.com/${siteData.twitter.replace('@', '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white/70 hover:text-white hover:border-[#00FF41]/50 transition-all"
              >
                <Twitter className="w-4 h-4" />
                Twitter
              </a>
            )}
            {siteData.telegram && (
              <a
                href={siteData.telegram.startsWith('http') ? siteData.telegram : `https://t.me/${siteData.telegram.replace('@', '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white/70 hover:text-white hover:border-[#00FF41]/50 transition-all"
              >
                <Send className="w-4 h-4" />
                Telegram
              </a>
            )}
          </div>
        )}
        
        {/* Repo Stats */}
        {siteData.repoName && (
          <div className="flex items-center gap-4 mb-8 text-white/50">
            <span className="font-mono text-sm">{siteData.repoOwner}/{siteData.repoName}</span>
            {siteData.repoStars !== undefined && (
              <span className="flex items-center gap-1 text-sm">
                <Star className="w-4 h-4" />
                {siteData.repoStars}
              </span>
            )}
            {siteData.repoForks !== undefined && (
              <span className="flex items-center gap-1 text-sm">
                <GitFork className="w-4 h-4" />
                {siteData.repoForks}
              </span>
            )}
          </div>
        )}
        
        {/* Screenshots Gallery - AI Analyzed from README */}
        {siteData.aiContent?.images?.screenshots && siteData.aiContent.images.screenshots.length > 0 && (
          <div className="mb-12">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <svg className="w-5 h-5 text-[#00FF41]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Screenshots
            </h2>
            <div className={`grid gap-4 ${
              siteData.aiContent.images.screenshots.length === 1 
                ? 'max-w-3xl' 
                : siteData.aiContent.images.screenshots.length === 2 
                  ? 'md:grid-cols-2' 
                  : 'md:grid-cols-2 lg:grid-cols-3'
            }`}>
              {siteData.aiContent.images.screenshots.map((screenshot, index) => (
                <div 
                  key={index}
                  className="relative group rounded-xl overflow-hidden border border-white/10 bg-white/[0.02] hover:border-[#00FF41]/30 transition-all"
                >
                  <img 
                    src={screenshot} 
                    alt={`Screenshot ${index + 1}`}
                    className="w-full h-auto object-cover"
                    onError={(e) => {
                      (e.target as HTMLElement).parentElement!.style.display = 'none';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* README Content */}
        {siteData.readme && (
          <div className="border border-white/10 rounded-2xl bg-white/[0.02] overflow-hidden">
            <div className="px-6 py-4 border-b border-white/10 bg-white/[0.02]">
              <h2 className="text-white font-bold flex items-center gap-2">
                <Image src="/logo3.png" alt="GitUp.fun" width={20} height={20} />
                README
              </h2>
            </div>
            <div className="p-6 prose prose-invert prose-sm max-w-none
              prose-headings:text-white prose-headings:font-bold
              prose-h1:text-2xl prose-h1:border-b prose-h1:border-white/10 prose-h1:pb-3
              prose-h2:text-xl prose-h2:mt-8
              prose-h3:text-lg
              prose-p:text-white/70 prose-p:leading-relaxed
              prose-a:text-[#00FF41] prose-a:no-underline hover:prose-a:underline
              prose-strong:text-white
              prose-code:text-[#00FF41] prose-code:bg-black/30 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm
              prose-pre:bg-black/50 prose-pre:border prose-pre:border-white/10 prose-pre:rounded-xl
              prose-ul:text-white/70 prose-ol:text-white/70
              prose-li:marker:text-[#00FF41]
              prose-blockquote:border-l-[#00FF41] prose-blockquote:text-white/60
              prose-img:rounded-xl prose-img:border prose-img:border-white/10
            ">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {siteData.readme}
              </ReactMarkdown>
            </div>
          </div>
        )}
      </main>
      
      {/* Footer */}
      <footer className="border-t border-white/10 py-8 relative z-10">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <a 
              href="https://gitup.fun" 
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-white/50 hover:text-[#00FF41] transition-colors"
            >
              <Image src="/logo3.png" alt="GitUp.fun" width={24} height={24} className="rounded-lg" />
              <span className="font-bold">Powered by GitUp.fun</span>
            </a>
            
            <p className="text-white/30 text-sm">
              Tokenize your GitHub repositories on Solana
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
