'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { useParams } from 'next/navigation';
import { Camera, Pencil, Check, X, Twitter, Copy, ExternalLink, GitBranch } from 'lucide-react';

// Star particles background
function StarParticles() {
  const stars = useMemo(() => 
    [...Array(60)].map((_, i) => ({
      id: i,
      left: (i * 17 + 7) % 100,
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

export default function ProfilePage() {
  const params = useParams();
  const address = params.address as string;
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Profile state
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  
  // Edit mode states
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [tempUsername, setTempUsername] = useState('');
  const [tempBio, setTempBio] = useState('');
  
  const [copied, setCopied] = useState(false);

  // Load profile from localStorage on mount
  useEffect(() => {
    if (address) {
      const savedProfile = localStorage.getItem(`profile_${address}`);
      if (savedProfile) {
        const { username: savedUsername, bio: savedBio, image: savedImage } = JSON.parse(savedProfile);
        setUsername(savedUsername || '');
        setBio(savedBio || '');
        setProfileImage(savedImage || null);
      }
    }
  }, [address]);

  // Save profile to localStorage
  const saveProfile = (newUsername?: string, newBio?: string, newImage?: string | null) => {
    const profile = {
      username: newUsername ?? username,
      bio: newBio ?? bio,
      image: newImage !== undefined ? newImage : profileImage,
    };
    localStorage.setItem(`profile_${address}`, JSON.stringify(profile));
  };

  const shortenAddress = (addr: string) => `${addr.slice(0, 4)}...${addr.slice(-4)}`;
  
  const handleCopy = () => {
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setProfileImage(base64);
        saveProfile(undefined, undefined, base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveUsername = () => {
    setUsername(tempUsername);
    saveProfile(tempUsername, undefined, undefined);
    setIsEditingUsername(false);
  };

  const handleSaveBio = () => {
    setBio(tempBio);
    saveProfile(undefined, tempBio, undefined);
    setIsEditingBio(false);
  };

  const handleShareTwitter = () => {
    const displayName = username || shortenAddress(address);
    const text = `Check out my GitUp.fun profile! 🚀\n\n${bio ? bio + '\n\n' : ''}https://gitup.fun/profile/${address}`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] relative">
      <StarParticles />
      
      <main className="max-w-lg mx-auto px-4 pt-24 pb-12 relative z-10">
        
        {/* Profile Card */}
        <div className="border border-[#00FF41]/20 bg-[#0d0d0d] rounded-2xl p-8 relative overflow-hidden">
          
          {/* GitUp.fun badge */}
          <div className="flex items-center justify-center gap-2 mb-8">
            <div className="w-7 h-7 bg-[#00FF41] rounded-lg flex items-center justify-center">
              <GitBranch className="w-4 h-4 text-black" />
            </div>
            <span className="text-white font-bold text-lg tracking-wide">GITUP.FUN</span>
          </div>
          
          {/* Profile Picture */}
          <div className="relative w-32 h-32 mx-auto mb-6">
            <div 
              className="w-full h-full rounded-full border-2 border-[#00FF41]/50 overflow-hidden bg-black/50 flex items-center justify-center cursor-pointer group"
              onClick={() => fileInputRef.current?.click()}
            >
              {profileImage ? (
                <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <svg className="w-16 h-16 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              )}
              
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-full flex items-center justify-center">
                <Camera className="w-8 h-8 text-[#00FF41]" />
              </div>
            </div>
            
            {/* Upload button */}
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 w-10 h-10 bg-[#00FF41] rounded-full flex items-center justify-center hover:bg-[#00FF41]/80 transition-colors"
            >
              <Camera className="w-5 h-5 text-black" />
            </button>
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </div>
          
          {/* Username */}
          <div className="mb-4">
            {isEditingUsername ? (
              <div className="flex items-center justify-center gap-2">
                <input
                  type="text"
                  value={tempUsername}
                  onChange={(e) => setTempUsername(e.target.value)}
                  placeholder="Enter username"
                  className="bg-black/50 border border-white/20 rounded-lg px-4 py-2 text-white text-center focus:outline-none focus:border-[#00FF41] w-48"
                  autoFocus
                />
                <button onClick={handleSaveUsername} className="w-8 h-8 bg-[#00FF41] rounded-lg flex items-center justify-center">
                  <Check className="w-4 h-4 text-black" />
                </button>
                <button onClick={() => setIsEditingUsername(false)} className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <h1 className="text-white text-xl font-bold">
                  {username || shortenAddress(address)}
                </h1>
                <button 
                  onClick={() => { setTempUsername(username); setIsEditingUsername(true); }}
                  className="w-7 h-7 bg-white/10 rounded-lg flex items-center justify-center hover:bg-white/20 transition-colors"
                >
                  <Pencil className="w-3.5 h-3.5 text-white/60" />
                </button>
              </div>
            )}
          </div>
          
          {/* Wallet Address */}
          <button 
            onClick={handleCopy}
            className="mx-auto mb-6 flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-2 hover:bg-white/10 transition-colors"
          >
            <code className="text-white/60 text-sm font-mono">{shortenAddress(address)}</code>
            {copied ? (
              <Check className="w-4 h-4 text-[#00FF41]" />
            ) : (
              <Copy className="w-4 h-4 text-white/40" />
            )}
          </button>
          
          {/* Bio */}
          <div className="mb-8">
            {isEditingBio ? (
              <div className="space-y-2">
                <textarea
                  value={tempBio}
                  onChange={(e) => setTempBio(e.target.value)}
                  placeholder="Write a short bio..."
                  className="w-full bg-black/50 border border-white/20 rounded-lg px-4 py-3 text-white text-center focus:outline-none focus:border-[#00FF41] resize-none h-24"
                  autoFocus
                />
                <div className="flex justify-center gap-2">
                  <button onClick={handleSaveBio} className="px-4 py-2 bg-[#00FF41] rounded-lg text-black font-medium text-sm flex items-center gap-1">
                    <Check className="w-4 h-4" /> Save
                  </button>
                  <button onClick={() => setIsEditingBio(false)} className="px-4 py-2 bg-white/10 rounded-lg text-white font-medium text-sm flex items-center gap-1">
                    <X className="w-4 h-4" /> Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div 
                onClick={() => { setTempBio(bio); setIsEditingBio(true); }}
                className="text-center cursor-pointer group"
              >
                {bio ? (
                  <p className="text-white/60 text-sm leading-relaxed group-hover:text-white/80 transition-colors">
                    {bio}
                  </p>
                ) : (
                  <p className="text-white/30 text-sm italic group-hover:text-white/50 transition-colors">
                    Click to add a bio...
                  </p>
                )}
              </div>
            )}
          </div>
          
          {/* Social Links */}
          <div className="flex justify-center gap-3">
            <button 
              onClick={handleShareTwitter}
              className="w-11 h-11 rounded-full border border-white/20 bg-transparent flex items-center justify-center hover:border-[#00FF41] hover:bg-[#00FF41]/10 transition-all"
            >
              <Twitter className="w-5 h-5 text-white/70" />
            </button>
            <button 
              onClick={handleCopy}
              className="w-11 h-11 rounded-full border border-white/20 bg-transparent flex items-center justify-center hover:border-[#00FF41] hover:bg-[#00FF41]/10 transition-all"
            >
              <Copy className="w-5 h-5 text-white/70" />
            </button>
            <a
              href={`https://solscan.io/account/${address}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-11 h-11 rounded-full border border-white/20 bg-transparent flex items-center justify-center hover:border-[#00FF41] hover:bg-[#00FF41]/10 transition-all"
            >
              <ExternalLink className="w-5 h-5 text-white/70" />
            </a>
          </div>
          
        </div>
        
      </main>
    </div>
  );
}
