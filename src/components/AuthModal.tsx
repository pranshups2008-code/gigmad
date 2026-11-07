'use client';

import React, { useState } from 'react';
import { X, Mail, Lock, User, ArrowRight, ShieldCheck, Sparkles, AlertCircle } from 'lucide-react';
import { UserProfile } from '@/lib/types';
import { SoundRadar } from '@/lib/audio';
import { supabase } from '@/lib/supabase';
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
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      if (mode === 'signup') {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password: password,
          options: {
            data: {
              full_name: name.trim() || email.split('@')[0],
            },
          },
        });

        if (error) throw error;

        SoundRadar.playSuccessChime();
        confetti({
          particleCount: 90,
          spread: 70,
          origin: { y: 0.6 },
        });

        const profile: UserProfile = {
          name: name.trim() || email.split('@')[0],
          email: email.trim(),
          roleTitle: 'Full-Stack Freelancer',
          portfolioUrl: 'https://github.com',
          tier: 'trial',
          isLoggedIn: true,
        };

        onAuthSuccess(profile);
        onClose();
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password: password,
        });

        if (error) throw error;

        SoundRadar.playSuccessChime();

        const userMeta = data.user?.user_metadata;
        const profile: UserProfile = {
          name: userMeta?.full_name || email.split('@')[0],
          email: data.user?.email || email.trim(),
          roleTitle: 'Remote Specialist',
          portfolioUrl: 'https://github.com',
          tier: 'trial',
          isLoggedIn: true,
        };

        onAuthSuccess(profile);
        onClose();
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuth = async (provider: 'google' | 'apple') => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: provider,
        options: {
          redirectTo: typeof window !== 'undefined' ? `${window.location.origin}/dashboard` : undefined,
        },
      });

      if (error) throw error;
    } catch (err: any) {
      setErrorMessage(err?.message || `Failed to sign in with ${provider}.`);
      setIsLoading(false);
    }
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
            {mode === 'signup' ? 'Create Real Account' : 'Log In to GigMad'}
          </h2>
          <p className="text-xs text-zinc-400">
            {mode === 'signup'
              ? 'Real secure Supabase authentication with instant 0m leads.'
              : 'Access your saved gigs, radar feeds, and proposal studio.'}
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 bg-zinc-950 border border-zinc-800 rounded-xl p-1 mb-5 text-xs font-mono">
          <button
            onClick={() => {
              setMode('signup');
              setErrorMessage(null);
            }}
            className={`py-1.5 rounded-lg font-bold transition-all ${
              mode === 'signup'
                ? 'bg-emerald-500 text-zinc-950 shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Sign Up ($0 Trial)
          </button>
          <button
            onClick={() => {
              setMode('login');
              setErrorMessage(null);
            }}
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
            type="button"
            onClick={() => handleOAuth('google')}
            disabled={isLoading}
            className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border border-zinc-800 bg-zinc-950 hover:bg-zinc-900 hover:border-zinc-700 text-zinc-200 text-xs font-semibold transition-all disabled:opacity-50"
          >
            <span className="font-black text-base leading-none">G</span>
            <span>Google</span>
          </button>
          <button
            type="button"
            onClick={() => handleOAuth('apple')}
            disabled={isLoading}
            className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border border-zinc-800 bg-zinc-950 hover:bg-zinc-900 hover:border-zinc-700 text-zinc-200 text-xs font-semibold transition-all disabled:opacity-50"
          >
            <span className="text-base leading-none">🍎</span>
            <span>Apple</span>
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
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-9 pr-3 py-2 text-xs sm:text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-zinc-950 font-bold text-xs sm:text-sm shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.02] flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>{mode === 'signup' ? 'Create Real Account & Start Trial' : 'Log In to Terminal'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-4 text-center text-[11px] text-zinc-500 font-mono flex items-center justify-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>Real Supabase PostgreSQL Database Auth</span>
        </div>

      </div>
    </div>
  );
};
