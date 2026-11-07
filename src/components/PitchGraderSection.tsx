'use client';

import React, { useState } from 'react';
import { 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  Copy, 
  Check, 
  TrendingUp, 
  Zap,
  Target
} from 'lucide-react';
import { SoundRadar } from '@/lib/audio';

export const PitchGraderSection: React.FC = () => {
  const [pitchText, setPitchText] = useState('');
  const [targetRole, setTargetRole] = useState('Full-Stack React Developer');
  const [isGrading, setIsGrading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [result, setResult] = useState<{
    score: number;
    rating: string;
    strengths: string[];
    weaknesses: string[];
    suggestions: string[];
    optimizedRewrite: string;
  } | null>(null);

  const samplePitch = `Hey! I saw your post. I am a hardworking and passionate developer with 4 years of experience. I can do whatever you need, please trust me and give me a chance. Let me know if you want to hire me.`;

  const handleGrade = async () => {
    if (!pitchText.trim()) return;
    setIsGrading(true);

    try {
      const res = await fetch('/api/grade-pitch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pitchText, targetRole }),
      });
      const data = await res.json();
      if (res.ok) {
        setResult(data);
        SoundRadar.playSuccessChime();
      }
    } catch {
      // Error handling
    } finally {
      setIsGrading(false);
    }
  };

  const handleCopyRewrite = () => {
    if (!result?.optimizedRewrite) return;
    navigator.clipboard.writeText(result.optimizedRewrite);
    setCopied(true);
    SoundRadar.playSuccessChime();
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="py-16 bg-gradient-to-b from-zinc-950 via-zinc-900/60 to-zinc-950 border-t border-zinc-800/80 relative overflow-hidden">
      
      {/* Glow accent */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-8">
        
        {/* Section Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-mono">
            <Target className="w-3.5 h-3.5" />
            <span>Free Viral Tool • 100% Free Forever</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            AI Pitch & DM <span className="text-emerald-400">Conversion Grader</span>
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-xl mx-auto">
            Test your cold pitch before sending it to a founder. Our AI simulates real founder reading habits and gives you a score with instant fixes.
          </p>
        </div>

        {/* Interactive Analyzer Box */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Input Panel */}
          <div className="lg:col-span-6 bg-zinc-900/90 border border-zinc-800 rounded-3xl p-5 sm:p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono text-zinc-300 font-semibold">Your Outreach Message / DM</label>
              <button
                type="button"
                onClick={() => setPitchText(samplePitch)}
                className="text-[11px] font-mono text-emerald-400 hover:text-emerald-300 underline"
              >
                Load Bad Pitch Example
              </button>
            </div>

            <textarea
              rows={6}
              value={pitchText}
              onChange={(e) => setPitchText(e.target.value)}
              placeholder="Paste your cold DM, proposal, or cover letter here to test its response rate..."
              className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl p-3.5 text-xs sm:text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-emerald-500 resize-none transition-colors"
            />

            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <label className="block text-[11px] font-mono text-zinc-400 mb-1">Target Niche</label>
                <input
                  type="text"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  placeholder="e.g. Next.js Developer, Video Editor"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <button
                onClick={handleGrade}
                disabled={isGrading || !pitchText.trim()}
                className="self-end sm:self-auto px-6 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-zinc-950 font-bold text-xs sm:text-sm shadow-md shadow-emerald-500/20 transition-all hover:scale-[1.02] flex items-center justify-center gap-1.5 h-[38px] disabled:opacity-50"
              >
                {isGrading ? (
                  <div className="w-4 h-4 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    <span>Grade Pitch</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Results Panel */}
          <div className="lg:col-span-6 bg-zinc-900/90 border border-zinc-800 rounded-3xl p-5 sm:p-6 space-y-5 shadow-xl min-h-[320px]">
            {result ? (
              <div className="space-y-4 animate-in fade-in duration-300">
                {/* Score Header */}
                <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                  <div>
                    <div className="text-[11px] font-mono text-zinc-400 uppercase">Estimated Response Score</div>
                    <div className="text-xs font-semibold text-zinc-200 mt-0.5">{result.rating}</div>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className={`text-4xl font-black ${
                      result.score >= 80 ? 'text-emerald-400' : result.score >= 60 ? 'text-amber-400' : 'text-red-400'
                    }`}>
                      {result.score}
                    </span>
                    <span className="text-zinc-500 text-xs font-mono">/ 100</span>
                  </div>
                </div>

                {/* Strengths & Weaknesses */}
                <div className="space-y-2 text-xs">
                  {result.strengths.map((s, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-emerald-300">
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5 text-emerald-400" />
                      <span>{s}</span>
                    </div>
                  ))}
                  {result.weaknesses.map((w, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-amber-300">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-400" />
                      <span>{w}</span>
                    </div>
                  ))}
                </div>

                {/* AI Optimized Rewrite */}
                <div className="pt-2">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-mono text-emerald-400 font-bold flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      Optimized 85+ Score Rewrite:
                    </span>
                    <button
                      onClick={handleCopyRewrite}
                      className="text-[11px] font-mono text-zinc-400 hover:text-white flex items-center gap-1"
                    >
                      {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copied ? 'Copied!' : 'Copy'}</span>
                    </button>
                  </div>
                  <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-200 font-sans leading-relaxed whitespace-pre-wrap select-all">
                    {result.optimizedRewrite}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-center text-zinc-500">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">No Pitch Analyzed Yet</h4>
                  <p className="text-xs text-zinc-500 max-w-xs mt-1">
                    Enter your proposal on the left or click &quot;Load Bad Pitch Example&quot; to see how founders evaluate your outreach.
                  </p>
                </div>
              </div>
            )}
          </div>

        </div>

      </div>
    </section>
  );
};
