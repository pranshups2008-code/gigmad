'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Settings, LogOut, Sparkles, ChevronDown, Shield } from 'lucide-react';
import { UserProfile } from '@/lib/types';

interface UserMenuProps {
  profile: UserProfile;
  onOpenAuth: () => void;
  onOpenProfile: () => void;
  onOpenUpgrade: () => void;
  onLogout: () => void;
}

export const UserMenu: React.FC<UserMenuProps> = ({
  profile,
  onOpenAuth,
  onOpenProfile,
  onOpenUpgrade,
  onLogout,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!profile.isLoggedIn) {
    return (
      <div className="flex items-center gap-2">
        <button
          onClick={onOpenAuth}
          className="px-3 py-1.5 rounded-lg text-xs font-semibold text-zinc-300 hover:text-white transition-colors"
        >
          Log In
        </button>
        <button
          onClick={onOpenAuth}
          className="px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs shadow-md shadow-emerald-500/20 transition-all hover:scale-105 flex items-center gap-1"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Sign Up</span>
        </button>
      </div>
    );
  }

  const initials = profile.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-all"
      >
        <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-emerald-500 to-teal-500 flex items-center justify-center text-zinc-950 font-black text-xs">
          {initials || 'U'}
        </div>
        <div className="hidden md:flex flex-col text-left">
          <span className="text-xs font-bold text-zinc-200 line-clamp-1 max-w-[100px]">
            {profile.name}
          </span>
          <span className="text-[10px] font-mono text-emerald-400 capitalize -mt-0.5">
            {profile.tier} Plan
          </span>
        </div>
        <ChevronDown className="w-3.5 h-3.5 text-zinc-500" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="px-3 py-2 border-b border-zinc-800/80 mb-1">
            <div className="text-xs font-bold text-white line-clamp-1">{profile.name}</div>
            <div className="text-[11px] font-mono text-zinc-400 line-clamp-1">{profile.email}</div>
          </div>

          <button
            onClick={() => {
              setIsOpen(false);
              onOpenProfile();
            }}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-zinc-300 hover:bg-zinc-850 hover:text-white rounded-lg transition-colors text-left"
          >
            <Settings className="w-4 h-4 text-zinc-400" />
            <span>Profile & AI Pitch Settings</span>
          </button>

          <button
            onClick={() => {
              setIsOpen(false);
              onOpenUpgrade();
            }}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-zinc-300 hover:bg-zinc-850 hover:text-white rounded-lg transition-colors text-left"
          >
            <Shield className="w-4 h-4 text-emerald-400" />
            <span>Membership & Billing</span>
          </button>

          <div className="border-t border-zinc-800 my-1" />

          <button
            onClick={() => {
              setIsOpen(false);
              onLogout();
            }}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-red-400 hover:bg-red-500/10 rounded-lg transition-colors text-left"
          >
            <LogOut className="w-4 h-4" />
            <span>Log Out</span>
          </button>
        </div>
      )}
    </div>
  );
};
