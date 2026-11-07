'use client';

import React, { useState } from 'react';
import { X, Check, Sparkles, Zap, ShieldCheck } from 'lucide-react';
import confetti from 'canvas-confetti';
import { SoundRadar } from '@/lib/audio';
import { UserTier } from '@/lib/types';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessUpgrade: (tier: UserTier) => void;
}

export const UpgradeModal: React.FC<UpgradeModalProps> = ({
  isOpen,
  onClose,
  onSuccessUpgrade,
}) => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handleSubscribe = () => {
    setIsProcessing(true);
    SoundRadar.playSuccessChime();

    // Trigger celebratory confetti
    confetti({
      particleCount: 90,
      spread: 70,
      origin: { y: 0.6 },
    });

    setTimeout(() => {
      setIsProcessing(false);
      onSuccessUpgrade('pro');
      onClose();
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-gradient-to-b from-zinc-900 via-zinc-900 to-zinc-950 border border-emerald-500/30 rounded-3xl shadow-2xl p-6 sm:p-8 overflow-hidden">
        
        {/* Glow ambient background */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-32 bg-emerald-500/15 blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-mono">
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span>Worldwide Client Radar Pro • GigMad</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Be the <span className="text-emerald-400">First to DM</span> Founders
          </h2>

          <p className="text-xs sm:text-sm text-zinc-400 max-w-md mx-auto">
            Winning one \$2,000 contract pays for years of subscription. Don&apos;t let your competitors see leads 2 hours before you.
          </p>
        </div>

        {/* Billing cycle toggle */}
        <div className="mt-6 flex justify-center">
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-1 flex items-center text-xs">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-4 py-1.5 rounded-lg font-medium transition-all ${
                billingCycle === 'monthly'
                  ? 'bg-zinc-800 text-white font-bold'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('annual')}
              className={`px-4 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
                billingCycle === 'annual'
                  ? 'bg-emerald-500 text-zinc-950 font-bold'
                  : 'text-emerald-400 hover:text-emerald-300'
              }`}
            >
              <span>Annual</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-950/60 text-emerald-300 font-mono">
                Save 20%
              </span>
            </button>
          </div>
        </div>

        {/* Price Card */}
        <div className="mt-6 p-5 rounded-2xl bg-zinc-950/70 border border-zinc-800/80 text-center">
          <div className="flex items-baseline justify-center gap-1.5">
            <span className="text-4xl sm:text-5xl font-black text-white">
              {billingCycle === 'monthly' ? '$29' : '$24'}
            </span>
            <span className="text-zinc-400 text-sm font-mono">/ month</span>
          </div>
          <p className="text-xs text-zinc-400 font-mono mt-1">
            {billingCycle === 'annual' ? 'Billed $290 annually (Save $58/yr)' : 'Cancel anytime. No lock-in.'}
          </p>

          {/* Feature list */}
          <div className="mt-6 space-y-2.5 text-left text-xs sm:text-sm">
            {[
              'Instant 0-Second Live Stream (Unlocks blurred high-budget leads)',
              'Unlimited 1-Click AI Proposals tailored to client briefs',
              'Direct 1-Click DM links to founder inboxes on Twitter, Reddit & Discord',
              'Live Audio Radar Chimes & Instant Desktop Alerts',
              'Unlimited Bookmarking & Pipeline Tracker',
              'Global Card, Apple Pay, Google Pay & PayPal accepted',
            ].map((feat, idx) => (
              <div key={idx} className="flex items-start gap-2.5 text-zinc-300">
                <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>{feat}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Button */}
        <div className="mt-6 space-y-2.5">
          <button
            onClick={() => {
              setIsProcessing(true);
              SoundRadar.playSuccessChime();
              confetti({
                particleCount: 110,
                spread: 85,
                origin: { y: 0.6 },
              });
              setTimeout(() => {
                setIsProcessing(false);
                onSuccessUpgrade('trial');
                onClose();
              }, 600);
            }}
            disabled={isProcessing}
            className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-emerald-400 hover:from-amber-300 hover:to-emerald-300 text-zinc-950 font-black text-sm sm:text-base shadow-xl shadow-amber-500/20 transition-all hover:scale-[1.02] active:scale-[0.99] flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4 stroke-[2.5]" />
            <span>Start 3-Day Free Premium Trial ($0 Today)</span>
          </button>

          <button
            onClick={handleSubscribe}
            disabled={isProcessing}
            className="w-full py-2.5 px-4 rounded-xl bg-zinc-950 border border-zinc-800 hover:border-zinc-700 text-zinc-300 font-semibold text-xs transition-all flex items-center justify-center gap-2"
          >
            <span>Or Subscribe Directly ({billingCycle === 'monthly' ? '$29/mo' : '$24/mo'})</span>
          </button>
        </div>

        {/* Trust Badges */}
        <div className="mt-4 flex items-center justify-center gap-4 text-[11px] text-zinc-400 font-mono">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            No Credit Card Needed for 3-Day Trial
          </span>
          <span>•</span>
          <span>Instant Full Access</span>
        </div>

      </div>
    </div>
  );
};
