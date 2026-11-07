'use client';

import React, { useState } from 'react';
import { 
  Send, 
  MessageSquare, 
  Check, 
  Zap, 
  Sparkles, 
  Radio, 
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { SoundRadar } from '@/lib/audio';

export const TelegramAlertIntegration: React.FC = () => {
  const [telegramHandle, setTelegramHandle] = useState('');
  const [selectedRole, setSelectedRole] = useState('react-nextjs');
  const [minBudget, setMinBudget] = useState('2000');
  const [isLinked, setIsLinked] = useState(false);
  const [simulatedAlertReceived, setSimulatedAlertReceived] = useState(false);

  const handleLinkBot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!telegramHandle.trim()) return;
    SoundRadar.playSuccessChime();
    setIsLinked(true);

    // Simulate an immediate instant bot alert 3 seconds later
    setTimeout(() => {
      SoundRadar.playRadarPing();
      setSimulatedAlertReceived(true);
    }, 2800);
  };

  return (
    <div className="rounded-3xl bg-zinc-900/80 border border-zinc-800 p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden">
      
      {/* Background glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
            <Send className="w-5 h-5 -rotate-12" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-bold text-white">Instant Telegram Bot Radar</h3>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                Live Webhook
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              Receive 0-minute alerts straight to your phone so you can DM clients before competitors even see the tweet.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs font-mono text-zinc-400">
          <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
          <span>Bot Status: Active</span>
        </div>
      </div>

      {/* Main Bot Connect Controls */}
      {!isLinked ? (
        <form onSubmit={handleLinkBot} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-mono text-zinc-400 mb-1">Your Telegram Username</label>
              <input
                type="text"
                required
                value={telegramHandle}
                onChange={(e) => setTelegramHandle(e.target.value)}
                placeholder="@yourhandle"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono text-zinc-400 mb-1">Alert Focus Skill</label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-sky-500"
              >
                <option value="react-nextjs">React & Next.js ($2k-$5k)</option>
                <option value="video-editing">Video Editing ($1.5k-$3k)</option>
                <option value="ai-llm">AI & LangChain ($3k-$8k)</option>
                <option value="ui-ux">UI/UX & Figma ($2k-$6k)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-mono text-zinc-400 mb-1">Minimum Budget</label>
              <select
                value={minBudget}
                onChange={(e) => setMinBudget(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-sky-500"
              >
                <option value="1000">$1,000+ USD</option>
                <option value="2000">$2,000+ USD</option>
                <option value="3500">$3,500+ USD</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <div className="text-[11px] text-zinc-500 font-mono flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>We never spam. Only verified hiring tweets & posts meeting your budget.</span>
            </div>

            <button
              type="submit"
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-400 to-blue-500 hover:from-sky-300 hover:to-blue-400 text-zinc-950 font-bold text-xs shadow-lg shadow-sky-500/20 transition-all hover:scale-105 flex items-center justify-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Connect @GigMadRadarBot</span>
            </button>
          </div>
        </form>
      ) : (
        /* Connected Status & Simulated Incoming Notification */
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-emerald-500 text-zinc-950 flex items-center justify-center font-bold">
                <Check className="w-4 h-4 stroke-[3]" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-white">
                  Radar Connected to {telegramHandle || '@you'}
                </h4>
                <p className="text-[11px] text-emerald-400 font-mono">
                  Listening for: {selectedRole} • Min Budget: ${minBudget}+
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                setIsLinked(false);
                setSimulatedAlertReceived(false);
              }}
              className="text-xs text-zinc-400 hover:text-white underline font-mono"
            >
              Change
            </button>
          </div>

          {/* Simulated Telegram Message Screen Preview */}
          {simulatedAlertReceived && (
            <div className="p-4 rounded-2xl bg-zinc-950 border border-sky-500/40 space-y-2 animate-in slide-in-from-bottom-2 duration-300 shadow-xl">
              <div className="flex items-center justify-between text-[11px] font-mono text-sky-400">
                <span className="flex items-center gap-1">
                  <MessageSquare className="w-3.5 h-3.5" />
                  Telegram Push Notification: @GigMadRadarBot
                </span>
                <span>Just Now</span>
              </div>
              <div className="text-xs text-zinc-200 bg-zinc-900/80 p-3 rounded-xl border border-zinc-800 space-y-1.5">
                <p className="font-bold text-white flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 text-amber-400 fill-current" />
                  NEW CLIENT GIG DETECTED ($3,500 fixed)
                </p>
                <p className="text-zinc-300">
                  &quot;Looking for a Senior Next.js/Tailwind dev for 2-week MVP sprint. DM portfolio.&quot;
                </p>
                <div className="pt-1 flex items-center gap-2">
                  <span className="text-[10px] px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 font-mono">
                    Posted on X 42s ago
                  </span>
                  <span className="text-[10px] text-zinc-400 font-mono">
                    Client: @founder_steve (Verified)
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
};
