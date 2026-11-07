'use client';

import React from 'react';
import { 
  Sparkles, 
  Send, 
  Bookmark, 
  Lock, 
  Clock, 
  DollarSign, 
  CheckCircle2, 
  ExternalLink 
} from 'lucide-react';
import { Gig, UserTier } from '@/lib/types';

interface GigCardProps {
  gig: Gig;
  userTier: UserTier;
  isSaved: boolean;
  onToggleSave: (id: string) => void;
  onOpenPitch: (gig: Gig) => void;
  onOpenUpgrade: () => void;
}

export const GigCard: React.FC<GigCardProps> = ({
  gig,
  userTier,
  isSaved,
  onToggleSave,
  onOpenPitch,
  onOpenUpgrade,
}) => {
  const isBlurred = userTier === 'free' && gig.isLockedForFree;

  const getSourceBadge = (source: Gig['source']) => {
    switch (source) {
      case 'twitter':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-mono bg-sky-500/10 text-sky-400 border border-sky-500/20">
            𝕏 Twitter
          </span>
        );
      case 'reddit':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-mono bg-orange-500/10 text-orange-400 border border-orange-500/20">
            Reddit
          </span>
        );
      case 'hackernews':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-mono bg-amber-500/10 text-amber-400 border border-amber-500/20">
            HackerNews
          </span>
        );
      case 'discord':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-mono bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            Discord
          </span>
        );
    }
  };

  return (
    <div className="relative group rounded-2xl border border-zinc-800/90 bg-zinc-900/60 hover:bg-zinc-900/90 hover:border-zinc-700/80 transition-all p-5 shadow-sm hover:shadow-xl backdrop-blur-sm">
      
      {/* Top Header: Source, Category, Budget, Time */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          {getSourceBadge(gig.source)}
          <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-zinc-800/80 text-zinc-300">
            {gig.categoryLabel}
          </span>
          {gig.isVerifiedClient && (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Verified Poster
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono font-bold text-xs">
            <DollarSign className="w-3.5 h-3.5" />
            {gig.budget}
          </span>

          <span className="inline-flex items-center gap-1 text-[11px] font-mono text-zinc-400">
            <Clock className="w-3 h-3 text-zinc-500" />
            {gig.postedMinutesAgo === 0 ? 'Just now' : `${gig.postedMinutesAgo}m ago`}
          </span>

          <button
            onClick={() => onToggleSave(gig.id)}
            className={`p-1.5 rounded-lg border transition-colors ${
              isSaved
                ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                : 'border-zinc-800 text-zinc-500 hover:text-zinc-300 hover:border-zinc-700'
            }`}
            title="Bookmark this gig"
          >
            <Bookmark className="w-3.5 h-3.5 fill-current" />
          </button>
        </div>
      </div>

      {/* Main Content Title & Description (With Blur Overlay if Free Tier & Fresh Lead) */}
      <div className="relative">
        <h3 className="text-base sm:text-lg font-semibold text-white tracking-tight group-hover:text-emerald-300 transition-colors">
          {gig.title}
        </h3>

        <p className={`mt-2 text-sm text-zinc-300 leading-relaxed ${isBlurred ? 'select-none blur-sm opacity-60' : ''}`}>
          {gig.description}
        </p>

        {/* Skill Badges */}
        <div className={`mt-3 flex flex-wrap gap-1.5 ${isBlurred ? 'blur-[2px] select-none' : ''}`}>
          {gig.requiredSkills.map((skill) => (
            <span
              key={skill}
              className="text-[11px] font-mono px-2 py-0.5 rounded bg-zinc-800/80 text-zinc-400 border border-zinc-700/50"
            >
              {skill}
            </span>
          ))}
        </div>

        {/* Author info */}
        <div className="mt-3 text-xs text-zinc-400 font-mono flex items-center gap-2">
          <span>Posted by: <strong className="text-zinc-200">{gig.authorName}</strong> ({gig.authorHandle})</span>
        </div>

        {/* Paywall Overlay if Locked */}
        {isBlurred && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-zinc-950/80 rounded-xl p-4 text-center border border-emerald-500/30 shadow-2xl backdrop-blur-md">
            <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-2">
              <Lock className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-white">0-Minute High Value Lead Locked</h4>
            <p className="text-xs text-zinc-400 mt-1 max-w-sm">
              Pro members unlocked this lead {gig.postedMinutesAgo} mins ago to DM the client first before anyone else.
            </p>
            <button
              onClick={onOpenUpgrade}
              className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all hover:scale-105"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Unlock 0m Live Leads
            </button>
          </div>
        )}
      </div>

      {/* Action Footer */}
      {!isBlurred && (
        <div className="mt-4 pt-3 border-t border-zinc-800/80 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => onOpenPitch(gig)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold transition-all hover:scale-[1.02]"
            >
              <Sparkles className="w-3.5 h-3.5" />
              1-Click AI Pitch
            </button>

            <a
              href={gig.originalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 text-xs font-mono transition-colors"
            >
              <ExternalLink className="w-3 h-3" />
              Source Post
            </a>
          </div>

          <a
            href={gig.dmUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-bold shadow-md shadow-emerald-500/20 transition-all hover:scale-[1.02]"
          >
            <Send className="w-3.5 h-3.5" />
            DM Client Directly
          </a>
        </div>
      )}

    </div>
  );
};
