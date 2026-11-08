'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Radio, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  Globe2, 
} from 'lucide-react';
import { PitchGraderSection } from '@/components/PitchGraderSection';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-zinc-950">
      
      {/* Navigation */}
      <header className="border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Radio className="w-5 h-5 text-zinc-950 stroke-[2.5]" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
                GigMad
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Global
                </span>
              </span>
            </div>
          </Link>

          <div className="flex items-center space-x-3 sm:space-x-5">
            <Link
              href="/pricing"
              className="text-xs sm:text-sm font-medium text-zinc-400 hover:text-white transition-colors"
            >
              Pricing
            </Link>
            <Link
              href="/dashboard"
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs sm:text-sm shadow-md shadow-emerald-500/20 transition-all hover:scale-105 flex items-center gap-1.5"
            >
              <span>Launch Radar</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-16 pb-20 sm:pt-24 sm:pb-32 overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 left-1/3 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-6">
          
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-mono">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>Source-linked hiring posts for freelancers</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white tracking-tight leading-[1.1]">
            Catch <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">USD Client Gigs</span> From Real Hiring Posts
          </h1>

          <p className="text-base sm:text-xl text-zinc-300 max-w-2xl mx-auto leading-relaxed">
            Browse hiring posts fetched from Reddit, open the original discussion, and draft an outreach message using your own profile. No invented clients or sample listings.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/dashboard"
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-emerald-400 hover:from-amber-300 hover:to-emerald-300 text-zinc-950 font-black text-base shadow-xl shadow-amber-500/20 transition-all hover:scale-105 flex items-center justify-center gap-2"
            >
              <Sparkles className="w-5 h-5 stroke-[2.5]" />
              <span>Claim 3-Day Free Pro Access</span>
            </Link>

            <Link
              href="/pricing"
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-200 font-semibold text-sm transition-all"
            >
              View Membership Plans
            </Link>
          </div>
          <div className="text-xs text-zinc-400 font-mono">
            ✨ Free 3-Day All-Access Pass for all new users • No credit card required
          </div>

          {/* Social Proof Stats */}
          <div className="pt-12 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto text-left">
            <div className="p-4 rounded-2xl bg-zinc-900/40 border border-zinc-800/80">
              <div className="text-2xl font-black text-white">Reddit</div>
              <div className="text-xs text-zinc-400 font-mono mt-0.5">Current source</div>
            </div>
            <div className="p-4 rounded-2xl bg-zinc-900/40 border border-zinc-800/80">
              <div className="text-2xl font-black text-emerald-400">1 minute</div>
              <div className="text-xs text-zinc-400 font-mono mt-0.5">Dashboard refresh interval</div>
            </div>
            <div className="p-4 rounded-2xl bg-zinc-900/40 border border-zinc-800/80">
              <div className="text-2xl font-black text-white">0%</div>
              <div className="text-xs text-zinc-400 font-mono mt-0.5">Commission Taken</div>
            </div>
            <div className="p-4 rounded-2xl bg-zinc-900/40 border border-zinc-800/80">
              <div className="text-2xl font-black text-white">Source links</div>
              <div className="text-xs text-zinc-400 font-mono mt-0.5">Open the original post</div>
            </div>
          </div>

        </div>
      </section>

      {/* Feature Walkthrough: Upwork vs GigMad */}
      <section className="py-16 bg-zinc-900/40 border-y border-zinc-800/80">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white">
              Why Freelancers Are Ditching Traditional Job Boards
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400">
              Read the original request and decide whether the opportunity fits your work.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* The Old Way */}
            <div className="p-6 rounded-3xl bg-zinc-950/70 border border-red-500/20 space-y-4">
              <div className="text-xs font-mono uppercase text-red-400 tracking-wider font-bold">
                The Old Broken Way
              </div>
              <h3 className="text-lg font-bold text-white">Crowded Freelance Platforms</h3>
              <ul className="space-y-3 text-xs sm:text-sm text-zinc-400">
                <li className="flex items-start gap-2">
                  <span className="text-red-400 font-bold shrink-0">✕</span>
                  <span>Charges 15% to 20% commission on every dollar you earn</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400 font-bold shrink-0">✕</span>
                  <span>Forces you to pay for &quot;connects&quot; and bid tokens just to apply</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400 font-bold shrink-0">✕</span>
                  <span>Crowded applications can make it hard to stand out</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400 font-bold shrink-0">✕</span>
                  <span>Middleman holds your payouts for 14 days</span>
                </li>
              </ul>
            </div>

            {/* The GigMad Way */}
            <div className="p-6 rounded-3xl bg-gradient-to-b from-emerald-950/30 to-zinc-950 border border-emerald-500/40 space-y-4 shadow-xl shadow-emerald-500/10">
              <div className="text-xs font-mono uppercase text-emerald-400 tracking-wider font-bold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                The GigMad Advantage
              </div>
              <h3 className="text-lg font-bold text-white">Direct Founder Radar</h3>
              <ul className="space-y-3 text-xs sm:text-sm text-zinc-300">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>0% Commission:</strong> You keep 100% of whatever client pays you</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Original discussions:</strong> Read the post and contact the Reddit author</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>1-Click AI Proposals:</strong> Generates tailored pitches ready to send</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Direct Relationships:</strong> Build long-term retainers with no middleman</span>
                </li>
              </ul>
            </div>

          </div>

        </div>
      </section>

      {/* Viral Free AI Pitch Grader Tool */}
      <PitchGraderSection />

      {/* Global Audience Banner */}
      <section className="py-20 text-center space-y-6">
        <div className="max-w-3xl mx-auto px-4 space-y-4">
          <Globe2 className="w-10 h-10 text-emerald-400 mx-auto" />
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            Built for Freelancers in Every Country
          </h2>
          <p className="text-sm text-zinc-400 leading-relaxed">
            Whether you are coding in India, editing video in Latin America, designing in the UK, or writing in Southeast Asia—earn in USD and build a sustainable international career.
          </p>

          <div className="pt-4">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-sm shadow-xl shadow-emerald-500/20 transition-all hover:scale-105"
            >
              <span>Start Tracking Live Clients Now</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800/80 bg-zinc-950 py-8 text-center text-xs text-zinc-500 font-mono">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            © 2026 GigMad Technologies. All rights reserved.
          </div>
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="hover:text-zinc-300">Terminal</Link>
            <Link href="/pricing" className="hover:text-zinc-300">Pricing</Link>
            <a href="https://x.com" target="_blank" rel="noreferrer" className="hover:text-zinc-300">Twitter / X</a>
          </div>
        </div>
      </footer>

    </div>
  );
}
