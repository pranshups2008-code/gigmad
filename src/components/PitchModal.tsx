'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X, Sparkles, Copy, Check, Send, AlertCircle } from 'lucide-react';
import { Gig, PitchStyle, UserTier, UserProfile } from '@/lib/types';
import { SoundRadar } from '@/lib/audio';

interface PitchModalProps {
  gig: Gig | null;
  isOpen: boolean;
  onClose: () => void;
  userTier: UserTier;
  pitchesRemaining: number;
  onUsePitch: () => void;
  onOpenUpgrade: () => void;
  profile?: UserProfile;
}

export const PitchModal: React.FC<PitchModalProps> = ({
  gig,
  isOpen,
  onClose,
  userTier,
  pitchesRemaining,
  onUsePitch,
  onOpenUpgrade,
  profile,
}) => {
  const [pitches, setPitches] = useState<PitchStyle[]>([]);
  const [activeTab, setActiveTab] = useState<'direct' | 'portfolio' | 'casual'>('direct');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const usedRef = useRef(onUsePitch);
  useEffect(() => { usedRef.current = onUsePitch; }, [onUsePitch]);
  const [error, setError] = useState('');
  const [editedContent, setEditedContent] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!gig || !isOpen) return;

    const controller = new AbortController();

    fetch('/api/services/pitch', {
      method: 'POST',
      signal: controller.signal,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: gig.title,
        description: gig.description,
        authorName: gig.authorName,
        requiredSkills: gig.requiredSkills,
        budget: gig.budget,
        senderName: profile?.name,
        portfolioUrl: profile?.portfolioUrl,
      }),
    })
      .then(async (res) => { const data = await res.json(); if (!res.ok) throw new Error(data.error || 'Unable to generate a draft.'); return data; })
      .then((data) => {
        if (data.pitches) {
          setPitches(data.pitches);
          const initialMap: Record<string, string> = {};
          data.pitches.forEach((p: PitchStyle) => {
            initialMap[p.id] = p.content;
          });
          setEditedContent(initialMap);
          Promise.resolve(usedRef.current()).catch(() => {});
        }
      })
      .catch((error) => setError(error instanceof Error ? error.message : 'Unable to generate a draft.'))
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [gig, isOpen, profile?.name, profile?.portfolioUrl]);

  if (!isOpen || !gig) return null;

  const currentPitch = pitches.find((p) => p.id === activeTab);
  const contentToDisplay = editedContent[activeTab] || currentPitch?.content || '';

  const handleCopy = async () => {
    try { await navigator.clipboard.writeText(contentToDisplay); } catch { setError('Unable to copy. Select the text and copy it manually.'); return; }
    setCopied(true);
    SoundRadar.playSuccessChime();
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-5 border-b border-zinc-800 flex items-start justify-between bg-zinc-950/50">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Sparkles className="w-4 h-4" />
              </span>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                AI Pitch Studio
              </h2>
            </div>
            <p className="text-xs text-zinc-400 mt-1 line-clamp-1">
              Targeting: <strong className="text-zinc-200">{gig.title}</strong>
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free Tier Pitch Quota Notice */}
        {userTier === 'free' && (
          <div className="px-5 py-2.5 bg-amber-500/10 border-b border-amber-500/20 flex items-center justify-between text-xs text-amber-300">
            <span className="flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-amber-400" />
              Free Plan: {pitchesRemaining} AI pitches remaining today
            </span>
            <button
              onClick={onOpenUpgrade}
              className="underline font-semibold hover:text-white"
            >
              View Pro
            </button>
          </div>
        )}

        {/* Style Selection Tabs */}
        <div className="px-5 pt-3 border-b border-zinc-800 flex gap-2 bg-zinc-950/30 overflow-x-auto">
          {pitches.map((p) => (
            <button
              key={p.id}
              onClick={() => setActiveTab(p.id)}
              className={`pb-2.5 px-3 text-xs font-medium whitespace-nowrap border-b-2 transition-all ${
                activeTab === p.id
                  ? 'border-emerald-500 text-emerald-400 font-semibold'
                  : 'border-transparent text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Pitch Body & Editor */}
        <div className="p-5 flex-1 overflow-y-auto">
          {error && <p role="alert" className="mb-3 text-sm text-amber-300">{error}</p>}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 space-y-3">
              <div className="w-7 h-7 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs text-zinc-400 font-mono">Analyzing client brief & tailoring proposal...</p>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-[11px] font-mono text-zinc-400 italic">
                {currentPitch?.tagline}
              </p>

              <textarea
                value={contentToDisplay}
                onChange={(e) =>
                  setEditedContent((prev) => ({ ...prev, [activeTab]: e.target.value }))
                }
                rows={9}
                className="w-full bg-zinc-950/80 border border-zinc-800 rounded-xl p-4 text-xs sm:text-sm text-zinc-200 leading-relaxed focus:outline-none focus:border-emerald-500 font-sans transition-colors resize-none"
                placeholder="Drafting your pitch..."
              />
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-950/80 flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-zinc-400 font-mono">
            Client: {gig.authorHandle} ({gig.budget})
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              disabled={loading || !contentToDisplay}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
                copied
                  ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                  : 'bg-zinc-800 hover:bg-zinc-700 text-white border-zinc-700'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Copied to Clipboard!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy Pitch</span>
                </>
              )}
            </button>

            <a
              href={gig.dmUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-bold shadow-lg shadow-emerald-500/20 transition-all hover:scale-105"
            >
              <Send className="w-4 h-4" />
              <span>Copy & Open DM</span>
            </a>
          </div>
        </div>

      </div>
    </div>
  );
};
