'use client';

import React from 'react';
import Link from 'next/link';
import { Radio, Volume2, VolumeX, Bookmark } from 'lucide-react';
import { UserTier, UserProfile } from '@/lib/types';
import { SoundRadar } from '@/lib/audio';
import { UserMenu } from './UserMenu';

interface NavbarProps {
  currentTier: UserTier;
  soundEnabled: boolean;
  onToggleSound: () => void;
  savedCount: number;
  onOpenUpgrade: () => void;
  profile?: UserProfile;
  onOpenAuth?: () => void;
  onOpenProfile?: () => void;
  onLogout?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTier,
  soundEnabled,
  onToggleSound,
  savedCount,
  onOpenUpgrade,
  profile,
  onOpenAuth,
  onOpenProfile,
  onLogout,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-800/80 bg-zinc-950/85 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand & Live Indicator */}
        <div className="flex items-center space-x-4">
          <Link href="/" className="flex items-center space-x-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <Radio className="w-5 h-5 text-zinc-950 stroke-[2.5]" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
                GigMad
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Global
                </span>
              </span>
              <span className="text-[11px] text-zinc-400 font-mono -mt-0.5">Social Bounty Terminal</span>
            </div>
          </Link>

          {/* Pulsing Live Badge */}
          <div className="hidden md:flex items-center space-x-2 px-2.5 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-xs font-mono text-zinc-300">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>Reddit hiring posts</span>
          </div>
        </div>

        {/* Navigation links & Controls */}
        <div className="flex items-center space-x-2.5 sm:space-x-3.5">
          
          <Link
            href="/dashboard"
            className="hidden sm:inline text-xs sm:text-sm font-medium text-zinc-300 hover:text-white transition-colors"
          >
            Terminal
          </Link>

          <Link
            href="/pricing"
            className="hidden sm:inline text-xs sm:text-sm font-medium text-zinc-400 hover:text-white transition-colors"
          >
            Membership
          </Link>

          {/* Sound Radar Ping Toggle */}
          <button
            onClick={() => {
              if (!soundEnabled) {
                SoundRadar.playRadarPing();
              }
              onToggleSound();
            }}
            title={soundEnabled ? 'Mute radar audio' : 'Enable live radar chimes'}
            className={`p-2 rounded-lg border text-xs flex items-center gap-1.5 transition-all ${
              soundEnabled
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
            }`}
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4" />
            ) : (
              <VolumeX className="w-4 h-4" />
            )}
          </button>

          {/* Saved bookmarks count */}
          <Link
            href="/dashboard?view=saved"
            className="relative p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200"
            title="Saved Opportunities"
          >
            <Bookmark className="w-4 h-4" />
            {savedCount > 0 && (
              <span className="absolute -top-1 -right-1 px-1.5 py-0.2 bg-emerald-500 text-zinc-950 font-bold text-[10px] rounded-full">
                {savedCount}
              </span>
            )}
          </Link>

          <span className="hidden lg:inline text-xs capitalize text-zinc-400">{currentTier} plan</span>

          {/* User Account Login / Profile Dropdown */}
          {profile && onOpenAuth && onOpenProfile && onLogout && (
            <UserMenu
              profile={profile}
              onOpenAuth={onOpenAuth}
              onOpenProfile={onOpenProfile}
              onOpenUpgrade={onOpenUpgrade}
              onLogout={onLogout}
            />
          )}

        </div>
      </div>
    </header>
  );
};
