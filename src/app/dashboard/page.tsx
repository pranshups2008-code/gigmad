'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Radio, 
  Sparkles, 
  Zap, 
  Activity, 
  TrendingUp, 
  DollarSign, 
  RotateCw,
  BellRing
} from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { GigCard } from '@/components/GigCard';
import { GigFilters } from '@/components/GigFilters';
import { PitchModal } from '@/components/PitchModal';
import { UpgradeModal } from '@/components/UpgradeModal';
import { AuthModal } from '@/components/AuthModal';
import { ProfileModal } from '@/components/ProfileModal';
import { TelegramAlertIntegration } from '@/components/TelegramAlertIntegration';
import { INITIAL_GIGS, INCOMING_STREAM_GIGS } from '@/lib/mock-gigs';
import { Gig, GigCategory, GigSource, UserTier, UserProfile } from '@/lib/types';
import { SoundRadar } from '@/lib/audio';

export default function DashboardPage() {
  const [gigs, setGigs] = useState<Gig[]>(INITIAL_GIGS);
  const [userTier, setUserTier] = useState<UserTier>('free');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [savedGigIds, setSavedGigIds] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'all' | 'saved'>('all');

  // User Profile & Authentication state
  const [profile, setProfile] = useState<UserProfile>({
    name: 'Alex Builder',
    email: 'alex@gigmad.app',
    roleTitle: 'Full-Stack Developer',
    portfolioUrl: 'https://github.com/my-portfolio',
    telegramHandle: '@alex_builds',
    tier: 'free',
    isLoggedIn: false,
  });

  // Filters state
  const [category, setCategory] = useState<GigCategory>('all');
  const [source, setSource] = useState<GigSource | 'all'>('all');
  const [minBudget, setMinBudget] = useState(0);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [pitchModalGig, setPitchModalGig] = useState<Gig | null>(null);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [pitchesUsedToday, setPitchesUsedToday] = useState(0);

  // New incoming notification indicator
  const [newLeadBanner, setNewLeadBanner] = useState<string | null>(null);

  // Load profile from localStorage on client mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('gigmad_profile');
      if (saved) {
        const parsed = JSON.parse(saved);
        setProfile(parsed);
        setUserTier(parsed.tier || 'free');
      }
    } catch {}
  }, []);

  const handleUpdateProfile = (updated: UserProfile) => {
    setProfile(updated);
    setUserTier(updated.tier);
    try {
      localStorage.setItem('gigmad_profile', JSON.stringify(updated));
    } catch {}
  };

  const handleLogout = () => {
    const loggedOut: UserProfile = {
      ...profile,
      isLoggedIn: false,
      tier: 'free',
    };
    handleUpdateProfile(loggedOut);
  };

  // Check URL query parameters on mount for ?view=saved
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('view') === 'saved') {
        setViewMode('saved');
      }
    }
  }, []);

  // Fetch real-time live posts from /api/gigs on mount
  useEffect(() => {
    const fetchGigs = async () => {
      try {
        const res = await fetch('/api/gigs');
        if (res.ok) {
          const data = await res.json();
          if (data?.gigs && data.gigs.length > 0) {
            setGigs(data.gigs);
          }
        }
      } catch (err) {
        console.error('Failed to load live gigs:', err);
      }
    };
    fetchGigs();
  }, []);

  // Periodic simulated live drop: Drops a realistic fresh high-budget lead
  useEffect(() => {
    let incomingIndex = 0;
    const interval = setInterval(() => {
      if (incomingIndex < INCOMING_STREAM_GIGS.length) {
        const template = INCOMING_STREAM_GIGS[incomingIndex];
        incomingIndex = (incomingIndex + 1) % INCOMING_STREAM_GIGS.length;

        const newGig: Gig = {
          ...template,
          id: `stream-${Date.now()}`,
          postedMinutesAgo: 0,
        };

        setGigs((prev) => [newGig, ...prev]);
        setNewLeadBanner(newGig.title);

        if (soundEnabled) {
          SoundRadar.playRadarPing();
        }

        setTimeout(() => {
          setNewLeadBanner(null);
        }, 6000);
      }
    }, 38000); // New incoming lead every 38 seconds

    return () => clearInterval(interval);
  }, [soundEnabled]);

  // Toggle bookmark / save
  const handleToggleSave = useCallback((id: string) => {
    setSavedGigIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  }, []);

  // Filtered gigs calculation
  const filteredGigs = useMemo(() => {
    let list = gigs;

    if (viewMode === 'saved') {
      list = list.filter((g) => savedGigIds.includes(g.id));
    }

    if (category !== 'all') {
      list = list.filter((g) => g.category === category);
    }

    if (source !== 'all') {
      list = list.filter((g) => g.source === source);
    }

    if (minBudget > 0) {
      list = list.filter((g) => g.budgetNumeric >= minBudget);
    }

    if (verifiedOnly) {
      list = list.filter((g) => g.isVerifiedClient);
    }

    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (g) =>
          g.title.toLowerCase().includes(q) ||
          g.description.toLowerCase().includes(q) ||
          g.authorName.toLowerCase().includes(q) ||
          g.requiredSkills.some((s) => s.toLowerCase().includes(q))
      );
    }

    return list;
  }, [gigs, viewMode, savedGigIds, category, source, minBudget, verifiedOnly, searchQuery]);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-zinc-950">
      
      {/* Top Navbar */}
      <Navbar
        currentTier={userTier}
        onTierChange={(tier) => {
          setUserTier(tier);
          handleUpdateProfile({ ...profile, tier });
        }}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled((prev) => !prev)}
        savedCount={savedGigIds.length}
        onOpenUpgrade={() => setIsUpgradeModalOpen(true)}
        profile={profile}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onOpenProfile={() => setIsProfileModalOpen(true)}
        onLogout={handleLogout}
      />

      {/* Main Terminal Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Floating New Lead Alert Banner */}
        {newLeadBanner && (
          <div className="sticky top-20 z-30 p-3 rounded-2xl bg-gradient-to-r from-emerald-500/90 to-teal-600/90 text-zinc-950 font-bold text-xs sm:text-sm flex items-center justify-between shadow-2xl shadow-emerald-500/20 backdrop-blur-md animate-in slide-in-from-top-4 duration-300">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-full bg-zinc-950 text-emerald-400">
                <BellRing className="w-3.5 h-3.5" />
              </span>
              <span>⚡ LIVE LEAD DROPPED: {newLeadBanner}</span>
            </div>
            <button
              onClick={() => setNewLeadBanner(null)}
              className="text-xs bg-zinc-950/20 hover:bg-zinc-950/40 px-2 py-0.5 rounded-lg"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Radar Metric Stats Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          <div className="p-4 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Radio className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-mono text-zinc-400">Live Radar Status</div>
              <div className="text-base sm:text-lg font-bold text-white flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Active Feeds
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-mono text-zinc-400">Fresh Remote Leads</div>
              <div className="text-base sm:text-lg font-bold text-white">{gigs.length} Available</div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-mono text-zinc-400">Avg Lead Budget</div>
              <div className="text-base sm:text-lg font-bold text-white">$2,840 USD</div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-mono text-zinc-400">Your Membership</div>
              <div className="text-base sm:text-lg font-bold text-white capitalize flex items-center gap-1.5">
                {userTier}
                {userTier === 'free' && (
                  <button
                    onClick={() => setIsUpgradeModalOpen(true)}
                    className="text-[11px] text-emerald-400 underline font-normal"
                  >
                    Upgrade
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* View Switcher: Live Feed vs Saved Bookmarks */}
        <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setViewMode('all')}
              className={`text-sm font-bold flex items-center gap-2 pb-1 border-b-2 transition-all ${
                viewMode === 'all'
                  ? 'border-emerald-500 text-white'
                  : 'border-transparent text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Activity className="w-4 h-4 text-emerald-400" />
              <span>Real-Time Stream ({gigs.length})</span>
            </button>

            <button
              onClick={() => setViewMode('saved')}
              className={`text-sm font-bold flex items-center gap-2 pb-1 border-b-2 transition-all ${
                viewMode === 'saved'
                  ? 'border-emerald-500 text-white'
                  : 'border-transparent text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <span>Saved Gigs ({savedGigIds.length})</span>
            </button>
          </div>

          {/* Quick Refresh */}
          <button
            onClick={() => {
              SoundRadar.playRadarPing();
            }}
            className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition-colors flex items-center gap-1.5 text-xs font-mono"
            title="Scan social sources now"
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Scan Now</span>
          </button>
        </div>

        {/* Filters Section */}
        <GigFilters
          category={category}
          onSelectCategory={setCategory}
          source={source}
          onSelectSource={setSource}
          minBudget={minBudget}
          onSelectMinBudget={setMinBudget}
          verifiedOnly={verifiedOnly}
          onToggleVerifiedOnly={() => setVerifiedOnly((prev) => !prev)}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        {/* Telegram Instant Alert Radar Webhook */}
        <TelegramAlertIntegration />

        {/* Free Plan Live Delay Warning OR 3-Day Free Trial Activated Banner */}
        {userTier === 'free' ? (
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-500/15 via-zinc-900 to-emerald-500/15 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
                <Sparkles className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-white">🎁 New User Gift: Claim 3 Days of Free Pro Access</h4>
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-amber-400 text-zinc-950 font-black">
                    $0 No Card
                  </span>
                </div>
                <p className="text-xs text-zinc-400 mt-1">
                  Experience full 0-minute unblurred leads and unlimited AI pitches free for 3 days to land your first remote client.
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                SoundRadar.playSuccessChime();
                setUserTier('trial');
              }}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-emerald-400 hover:from-amber-300 hover:to-emerald-300 text-zinc-950 font-black text-xs whitespace-nowrap shadow-lg shadow-amber-500/20 transition-all hover:scale-105"
            >
              Activate 3-Day Free Trial
            </button>
          </div>
        ) : userTier === 'trial' ? (
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-amber-300 flex items-center gap-2">
                  <span>3-Day Free Trial Active</span>
                  <span className="text-[11px] font-mono font-normal text-zinc-300">(71 hours 58 minutes left)</span>
                </h4>
                <p className="text-xs text-zinc-400 mt-0.5">
                  You have full unblurred 0-minute leads & unlimited AI pitches. Land a client before your trial ends!
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsUpgradeModalOpen(true)}
              className="px-4 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-amber-300 border border-amber-500/40 text-xs font-semibold whitespace-nowrap transition-colors"
            >
              Lock in Annual Pro ($24/mo)
            </button>
          </div>
        ) : null}

        {/* Feed List Grid */}
        <div className="space-y-4">
          {filteredGigs.length === 0 ? (
            <div className="text-center py-16 rounded-2xl border border-zinc-800/80 bg-zinc-900/30">
              <p className="text-zinc-400 text-sm">No remote client leads match your active filters.</p>
              <button
                onClick={() => {
                  setCategory('all');
                  setSource('all');
                  setMinBudget(0);
                  setVerifiedOnly(false);
                  setSearchQuery('');
                }}
                className="mt-3 text-xs text-emerald-400 underline font-mono"
              >
                Reset all filters
              </button>
            </div>
          ) : (
            filteredGigs.map((gig) => (
              <GigCard
                key={gig.id}
                gig={gig}
                userTier={userTier}
                isSaved={savedGigIds.includes(gig.id)}
                onToggleSave={handleToggleSave}
                onOpenPitch={(g) => setPitchModalGig(g)}
                onOpenUpgrade={() => setIsUpgradeModalOpen(true)}
              />
            ))
          )}
        </div>

      </main>

      {/* AI Pitch Studio Modal */}
      <PitchModal
        gig={pitchModalGig}
        isOpen={Boolean(pitchModalGig)}
        onClose={() => setPitchModalGig(null)}
        userTier={userTier}
        pitchesRemaining={Math.max(0, 2 - pitchesUsedToday)}
        onUsePitch={() => setPitchesUsedToday((prev) => prev + 1)}
        onOpenUpgrade={() => {
          setPitchModalGig(null);
          setIsUpgradeModalOpen(true);
        }}
        profile={profile}
      />

      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
        onSuccessUpgrade={(tier) => {
          setUserTier(tier);
          handleUpdateProfile({ ...profile, tier });
        }}
      />

      {/* Login & Registration Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={(newProfile) => {
          handleUpdateProfile(newProfile);
        }}
      />

      {/* Freelancer Profile & Pitch Configuration Modal */}
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        profile={profile}
        onSaveProfile={handleUpdateProfile}
      />

    </div>
  );
}
