'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Check, 
  Sparkles, 
  ShieldCheck, 
  HelpCircle, 
  Zap, 
  ArrowLeft 
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { SoundRadar } from '@/lib/audio';

const CURRENCIES: Record<string, { symbol: string; rate: number }> = {
  USD: { symbol: '$', rate: 1.0 },
  EUR: { symbol: '€', rate: 0.92 },
  GBP: { symbol: '£', rate: 0.78 },
  CAD: { symbol: 'CA$', rate: 1.36 },
  AUD: { symbol: 'AU$', rate: 1.52 },
};

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [currency, setCurrency] = useState('USD');
  const [checkoutSuccessTier, setCheckoutSuccessTier] = useState<string | null>(null);

  const cur = CURRENCIES[currency];

  const formatPrice = (usdAmount: number) => {
    const converted = Math.round(usdAmount * cur.rate);
    return `${cur.symbol}${converted}`;
  };

  const handleCheckout = (tierName: string) => {
    SoundRadar.playSuccessChime();
    confetti({
      particleCount: 100,
      spread: 80,
      origin: { y: 0.5 },
    });
    setCheckoutSuccessTier(tierName);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-zinc-950">
      
      {/* Header Bar */}
      <header className="border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-xs font-mono text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Live Terminal
          </Link>

          {/* Worldwide Currency Switcher */}
          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="text-zinc-500 hidden sm:inline">Currency:</span>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1 text-zinc-200 focus:outline-none focus:border-emerald-500 font-mono text-xs cursor-pointer"
            >
              {Object.keys(CURRENCIES).map((c) => (
                <option key={c} value={c}>
                  {c} ({CURRENCIES[c].symbol})
                </option>
              ))}
            </select>
          </div>
        </div>
      </header>

      {/* Main Pricing Hero */}
      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        
        {checkoutSuccessTier && (
          <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-center animate-in zoom-in-95 duration-200">
            <h3 className="text-base font-bold text-emerald-400">
              🎉 Congratulations! Your {checkoutSuccessTier} Plan is Now Active.
            </h3>
            <p className="text-xs text-zinc-300 mt-1">
              Your 0-minute unblurred leads and unlimited AI pitches have been unlocked.
            </p>
            <Link
              href="/dashboard"
              className="mt-3 inline-block px-4 py-1.5 rounded-lg bg-emerald-500 text-zinc-950 font-bold text-xs"
            >
              Go to Terminal
            </Link>
          </div>
        )}

        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-mono">
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span>Worldwide Membership Plans</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            One Remote Client Pays for <span className="text-emerald-400">Years of Access</span>
          </h1>

          <p className="text-sm sm:text-base text-zinc-400 max-w-xl mx-auto">
            Choose the radar speed that fits your freelance ambitions. Cancel anytime with a 14-day money-back guarantee.
          </p>

          {/* Monthly / Annual toggle */}
          <div className="pt-4 flex justify-center">
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-1 flex items-center text-xs">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  billingCycle === 'monthly'
                    ? 'bg-zinc-800 text-white font-bold shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Monthly Billing
              </button>
              <button
                onClick={() => setBillingCycle('annual')}
                className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
                  billingCycle === 'annual'
                    ? 'bg-emerald-500 text-zinc-950 font-bold shadow-sm'
                    : 'text-emerald-400 hover:text-emerald-300'
                }`}
              >
                <span>Annual Billing</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-950/60 text-emerald-300 font-mono">
                  Save 20%
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          
          {/* Free Tier */}
          <div className="rounded-3xl border border-zinc-800/80 bg-zinc-900/40 p-6 flex flex-col justify-between backdrop-blur-sm">
            <div>
              <div className="font-mono text-xs text-zinc-400 uppercase tracking-wider">Casual Explorer</div>
              <h3 className="text-xl font-bold text-white mt-1">Free Tier</h3>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-extrabold text-white">{cur.symbol}0</span>
                <span className="text-xs text-zinc-500 font-mono">/ forever</span>
              </div>
              <p className="text-xs text-zinc-400 mt-2">
                For freelancers exploring the platform at a casual pace.
              </p>

              <div className="mt-6 space-y-2.5 text-xs text-zinc-300">
                {[
                  'Social leads delayed by 2 hours',
                  '2 AI pitches per day',
                  'Standard category filters',
                  'Community support forum',
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <Link
              href="/dashboard"
              className="mt-8 w-full py-2.5 rounded-xl border border-zinc-800 bg-zinc-950 text-zinc-300 text-xs font-semibold text-center hover:bg-zinc-850 hover:text-white transition-colors"
            >
              Continue Free
            </Link>
          </div>

          {/* Pro Tier (Featured / High Conversion) */}
          <div className="relative rounded-3xl border-2 border-emerald-500 bg-zinc-900/90 p-6 sm:p-7 flex flex-col justify-between shadow-2xl shadow-emerald-500/15">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-emerald-500 text-zinc-950 font-bold text-[11px] font-mono tracking-wide uppercase shadow-lg">
              Most Popular
            </div>

            <div>
              <div className="font-mono text-xs text-emerald-400 uppercase tracking-wider">Freelancer / Pro</div>
              <h3 className="text-xl font-bold text-white mt-1">Radar Pro</h3>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl sm:text-5xl font-black text-white">
                  {billingCycle === 'monthly' ? formatPrice(29) : formatPrice(24)}
                </span>
                <span className="text-xs text-zinc-400 font-mono">/ month</span>
              </div>
              <p className="text-xs text-emerald-400 font-mono mt-1">
                {billingCycle === 'annual' ? `Billed ${formatPrice(288)} annually` : 'Billed monthly. Cancel anytime.'}
              </p>

              <div className="mt-6 space-y-2.5 text-xs sm:text-sm text-zinc-200">
                {[
                  'Instant 0-Second Live Feed (Unlocks all blurred leads)',
                  'Unlimited 1-Click AI Proposals',
                  'Direct 1-Click DM Links to Client Inboxes',
                  'Live Audio Radar Chimes & Sound Alerts',
                  'Bookmark & Track Client Pipelines',
                  'Verified Poster Quality Filter',
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => handleCheckout('Radar Pro (3-Day Free Trial)')}
              className="mt-8 w-full py-3 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-emerald-400 hover:from-amber-300 hover:to-emerald-300 text-zinc-950 font-black text-sm shadow-lg shadow-amber-500/25 transition-all hover:scale-[1.02] active:scale-[0.99] flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 stroke-[2.5]" />
              <span>Start 3-Day Free Trial ($0 Today)</span>
            </button>
            <p className="text-[11px] text-zinc-400 text-center mt-2 font-mono">
              No charge for 3 days. Then {billingCycle === 'monthly' ? formatPrice(29) : formatPrice(24)}/mo. Cancel anytime.
            </p>
          </div>

          {/* Agency / Studio Tier */}
          <div className="rounded-3xl border border-zinc-800/80 bg-zinc-900/40 p-6 flex flex-col justify-between backdrop-blur-sm">
            <div>
              <div className="font-mono text-xs text-purple-400 uppercase tracking-wider">Agencies & Studios</div>
              <h3 className="text-xl font-bold text-white mt-1">Agency Suite</h3>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-extrabold text-white">
                  {billingCycle === 'monthly' ? formatPrice(59) : formatPrice(49)}
                </span>
                <span className="text-xs text-zinc-500 font-mono">/ month</span>
              </div>
              <p className="text-xs text-zinc-400 mt-2">
                For boutique development, design, and video agencies scaling client intake.
              </p>

              <div className="mt-6 space-y-2.5 text-xs text-zinc-300">
                {[
                  'Everything in Radar Pro',
                  'Telegram & Discord Instant Webhook Alerts',
                  'Multi-Seat Team Access (up to 3 members)',
                  'Custom Keyword Regex Filters',
                  'CSV Export for CRM Integration',
                  'Priority Dedicated Support',
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => handleCheckout('Agency Suite')}
              className="mt-8 w-full py-2.5 rounded-xl border border-purple-500/30 bg-purple-500/10 text-purple-300 text-xs font-semibold hover:bg-purple-500/20 transition-colors"
            >
              Get Agency Access
            </button>
          </div>

        </div>

        {/* FAQ Section */}
        <div className="pt-8 space-y-6">
          <div className="text-center space-y-1">
            <h3 className="text-xl sm:text-2xl font-bold text-white">Frequently Asked Questions</h3>
            <p className="text-xs text-zinc-400">Everything you need to know about GigMad memberships.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
            <div className="p-4 rounded-2xl bg-zinc-900/40 border border-zinc-800">
              <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-emerald-400" />
                Where do these client leads come from?
              </h4>
              <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed">
                We monitor public hiring signals, tweets from startup founders, Reddit freelance subreddits, and developer discords that are usually buried under noise.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-900/40 border border-zinc-800">
              <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-emerald-400" />
                Why does speed matter so much?
              </h4>
              <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed">
                When a founder tweets for a freelancer, the first 3 to 5 people who send a competent portfolio and pitch get 85% of the replies. After 2 hours, their DM is closed.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-900/40 border border-zinc-800">
              <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-emerald-400" />
                Can I cancel anytime?
              </h4>
              <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed">
                Yes, you can cancel in one click with no questions asked. Plus, we offer a full 14-day money-back guarantee.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-900/40 border border-zinc-800">
              <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-emerald-400" />
                What payment methods are supported?
              </h4>
              <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed">
                We support Visa, Mastercard, American Express, Apple Pay, Google Pay, PayPal, and local bank methods in over 130 countries worldwide.
              </p>
            </div>
          </div>
        </div>

        {/* Trust Footer */}
        <div className="text-center pt-8 border-t border-zinc-800/80 text-xs text-zinc-500 font-mono">
          <ShieldCheck className="w-4 h-4 text-emerald-500 inline mr-1" />
          End-to-End Encrypted Worldwide Payments Powered by Stripe & Lemon Squeezy
        </div>

      </main>

    </div>
  );
}
