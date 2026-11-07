'use client';

import React, { useState } from 'react';
import { X, Mail, Lock, User, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { UserProfile } from '@/lib/types';
import { SoundRadar } from '@/lib/audio';
import confetti from 'canvas-confetti';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (profile: UserProfile) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onAuthSuccess }) => {
  const [mode, setMode] = useState<'login' | 'signup'>('signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      SoundRadar.playSuccessChime();

      if (mode === 'signup') {
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.6 },
        });
      }

      const profile: UserProfile = {
        name: name.trim() || (email.split('@')[0] || 'Freelancer'),
        email: email.trim() || 'user@gigmad.app',
        roleTitle: 'Full-Stack Freelancer',
        portfolioUrl: 'https://github.com',
        tier: mode === 'signup' ? 'trial' : 'pro',
        isLoggedIn: true,
      };

      onAuthSuccess(profile);
      onClose();
    }, 600);
  };

  const handleOAuth = (provider: 'Google' | 'Apple') => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      SoundRadar.playSuccessChime();
      const profile: UserProfile = {
        name: `${provider} Builder`,
        email: `builder@${provider.toLowerCase()}.com`,
        roleTitle: 'Remote Specialist',
        portfolioUrl: 'https://github.com',
        tier: 'trial',
        isLoggedIn: true,
      };
      onAuthSuccess(profile);
      onClose();
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl p-6 sm:p-7 overflow-hidden">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-1.5 mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-mono">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{mode === 'signup' ? '3-Day Free Trial Included' : 'Welcome Back'}</span>
          </div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">
            {mode === 'signup' ? 'Create Your GigMad Account' : 'Log In to GigMad'}
          </h2>
          <p className="text-xs text-zinc-400">
            {mode === 'signup'
              ? 'Get instant 0m client alerts and start landing remote contracts.'
              : 'Access your saved gigs, radar feeds, and proposal studio.'}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 bg-zinc-950 border border-zinc-800 rounded-xl p-1 mb-5 text-xs font-mono">
          <button
            onClick={() => setMode('signup')}
            className={`py-1.5 rounded-lg font-bold transition-all ${
              mode === 'signup'
                ? 'bg-emerald-500 text-zinc-950 shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Sign Up ($0 Trial)
          </button>
          <button
            onClick={() => setMode('login')}
            className={`py-1.5 rounded-lg font-bold transition-all ${
              mode === 'login'
                ? 'bg-zinc-800 text-white shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Log In
          </button>
        </div>

        {/* Fast Social Auth */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <button
            onClick={() => handleOAuth('Google')}
            className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border border-zinc-800 bg-zinc-950 hover:bg-zinc-900 hover:border-zinc-700 text-zinc-200 text-xs font-semibold transition-all"
          >
            <span className="font-black text-base leading-none">G</span>
            <span>Continue with Google</span>
          </button>
          <button
            onClick={() => handleOAuth('Apple')}
            className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border border-zinc-800 bg-zinc-950 hover:bg-zinc-900 hover:border-zinc-700 text-zinc-200 text-xs font-semibold transition-all"
          >
            <span className="text-base leading-none">🍎</span>
            <span>Continue with Apple</span>
          </button>
        </div>

        <div className="relative flex items-center justify-center mb-5">
          <div className="border-t border-zinc-800 w-full" />
          <span className="bg-zinc-900 px-3 text-[11px] font-mono text-zinc-500 uppercase">Or with email</span>
        </div>

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          {mode === 'signup' && (
            <div>
              <label className="block text-[11px] font-mono text-zinc-400 mb-1">Your Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Alex Morgan"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-9 pr-3 py-2 text-xs sm:text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-[11px] font-mono text-zinc-400 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-9 pr-3 py-2 text-xs sm:text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-mono text-zinc-400 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-9 pr-3 py-2 text-xs sm:text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-zinc-950 font-bold text-xs sm:text-sm shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.02] flex items-center justify-center gap-1.5"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>{mode === 'signup' ? 'Start 3-Day Free Trial' : 'Log In to Terminal'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-4 text-center text-[11px] text-zinc-500 font-mono flex items-center justify-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>Encrypted Session • Instant Access</span>
        </div>

      </div>
    </div>
  );
};
