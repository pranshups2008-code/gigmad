'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { 
  Radio, 
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
import { Gig, GigCategory, GigSource, UserTier, UserProfile } from '@/lib/types';
import { SoundRadar } from '@/lib/audio';
import { getUser, logout, onAuthChange } from '@netlify/identity';
import { service } from '@/lib/api';

export default function DashboardPage() {
  const [gigs, setGigs] = useState<Gig[]>([]);
  const [userTier, setUserTier] = useState<UserTier>('free');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [savedGigIds, setSavedGigIds] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'all' | 'saved'>('all');

  // User Profile & Authentication state
  const [profile, setProfile] = useState<UserProfile>({
    name: '',
    email: '',
    roleTitle: '',
    portfolioUrl: '',
    telegramHandle: '',
    tier: 'free',
    isLoggedIn: false,
  });

  // Filters state
  const [category, setCategory] = useState<GigCategory>('all');
  const [source, setSource] = useState<GigSource | 'all'>('all');
  const [minBudget, setMinBudget] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [pitchModalGig, setPitchModalGig] = useState<Gig | null>(null);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [pitchesUsedToday, setPitchesUsedToday] = useState(0);

  // New incoming notification indicator
  const [newLeadBanner, setNewLeadBanner] = useState<string | null>(null);

  const [accountError, setAccountError] = useState<string | null>(null);
  const [savedGigs, setSavedGigs] = useState<Gig[]>([]);
  const [trialEndsAt, setTrialEndsAt] = useState<string | null>(null);
  const seenIds = useRef<Set<string> | null>(null);
  const soundRef = useRef(soundEnabled);
  useEffect(() => { soundRef.current = soundEnabled; }, [soundEnabled]);

  const loadAccount = useCallback(async () => {
    const user = await getUser();
    if (!user) {
      setProfile({ name: '', email: '', roleTitle: '', portfolioUrl: '', tier: 'free', isLoggedIn: false });
      setUserTier('free'); setSavedGigIds([]); setSavedGigs([]); setPitchesUsedToday(0); setTrialEndsAt(null);
      return;
    }
    const account = await service<{ profile: UserProfile; savedGigs: Gig[]; trialEndsAt: string | null; pitchesUsedToday: number }>('account');
    setProfile(account.profile); setUserTier(account.profile.tier);
    setSavedGigs(account.savedGigs); setSavedGigIds(account.savedGigs.map(g => g.id));
    setTrialEndsAt(account.trialEndsAt); setPitchesUsedToday(account.pitchesUsedToday); setAccountError(null);
  }, []);

  useEffect(() => {
    const refresh = () => { void loadAccount().catch(() => setAccountError('Unable to load your account. Please try again.')); };
    refresh();
    const unsubscribe = onAuthChange(refresh);
    const timer = setInterval(refresh, 60000);
    return () => { unsubscribe(); clearInterval(timer); };
  }, [loadAccount]);

  const handleUpdateProfile = async (updated: UserProfile) => {
    await service('profile', { name: updated.name, roleTitle: updated.roleTitle, portfolioUrl: updated.portfolioUrl });
    await loadAccount();
  };

  const handleLogout = async () => {
    try { await logout(); await loadAccount(); }
    catch { setAccountError('Unable to log out. Please try again.'); }
  };

  useEffect(() => {
    const sessionId = new URLSearchParams(window.location.search).get('checkout_session');
    if (!sessionId) return;
    service('confirm-checkout', { sessionId }).then(async () => {
      await loadAccount(); window.history.replaceState({}, '', '/dashboard');
    }).catch(() => setAccountError('Payment is not confirmed yet. Log in and refresh to check your membership.'));
  }, [loadAccount]);

  useEffect(() => {
    const updateView = () => setViewMode(new URLSearchParams(window.location.search).get('view') === 'saved' ? 'saved' : 'all');
    const initial = setTimeout(updateView, 0);
    window.addEventListener('popstate', updateView);
    return () => { clearTimeout(initial); window.removeEventListener('popstate', updateView); };
  }, []);

  const [isLoading, setIsLoading] = useState(true);
  const [feedError, setFeedError] = useState<string | null>(null);
  const [feedActive, setFeedActive] = useState(false);

  const fetchGigs = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/gigs', { cache: 'no-store' });
      const data = await res.json();
      if (!res.ok || !Array.isArray(data.gigs)) {
        throw new Error(data.error || 'Unable to load the source feed.');
      }
      const incoming: Gig[] = data.gigs;
      const fresh = seenIds.current ? incoming.filter(g => !seenIds.current!.has(g.id)) : [];
      seenIds.current = new Set(incoming.map(g => g.id));
      if (fresh.length) { setNewLeadBanner(fresh[0].title); if (soundRef.current) SoundRadar.playRadarPing(); }
      setGigs(incoming);
      setFeedActive(true);
      setFeedError(null);
    } catch (error) {
      setGigs([]);
      setFeedActive(false);
      setFeedError(error instanceof Error ? error.message : 'Unable to load the source feed.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const initial = setTimeout(() => void fetchGigs(), 0);
    const interval = setInterval(() => void fetchGigs(), 60000);
    return () => { clearTimeout(initial); clearInterval(interval); };
  }, [fetchGigs]);

  const handleToggleSave = async (id: string) => {
    if (!profile.isLoggedIn) { setIsAuthModalOpen(true); return; }
    try {
      await service('bookmark', { id, save: !savedGigIds.includes(id) });
      await loadAccount();
    } catch (error) { setAccountError(error instanceof Error ? error.message : 'Unable to save this post.'); }
  };

  // Filtered gigs calculation
  const filteredGigs = useMemo(() => {
    let list = viewMode === 'saved' ? savedGigs : gigs;

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
  }, [gigs, savedGigs, viewMode, savedGigIds, category, source, minBudget, searchQuery]);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-zinc-950">
      
      {/* Top Navbar */}
      <Navbar
        currentTier={userTier}
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
              <span>New source post: {newLeadBanner}</span>
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
                {isLoading ? 'Checking Reddit' : feedActive ? 'Reddit connected' : 'Feed unavailable'}
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-mono text-zinc-400">Posts returned</div>
              <div className="text-base sm:text-lg font-bold text-white">{gigs.length} Available</div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-mono text-zinc-400">Posts with a stated budget</div>
              <div className="text-base sm:text-lg font-bold text-white">{gigs.filter((gig) => gig.budgetNumeric > 0).length}</div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-mono text-zinc-400">Your membership</div>
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
              <span>Source posts ({gigs.length})</span>
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
            onClick={() => void fetchGigs()}
            disabled={isLoading}
            className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition-colors flex items-center gap-1.5 text-xs font-mono"
            title="Refresh Reddit posts"
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{isLoading ? 'Scanning…' : 'Scan Now'}</span>
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
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        {/* Telegram Instant Alert Radar Webhook */}
        <TelegramAlertIntegration key={profile.email} isLoggedIn={profile.isLoggedIn} />

        {accountError && <p role="alert" className="rounded-xl border border-amber-600 p-4 text-sm text-amber-300">{accountError}</p>}
        {userTier === 'trial' && trialEndsAt && <p className="rounded-xl border border-emerald-700 p-4 text-sm text-emerald-300">Your trial ends {new Date(trialEndsAt).toLocaleString()}. No automatic charge.</p>}
        {userTier === 'free' && <button onClick={() => profile.isLoggedIn ? setIsUpgradeModalOpen(true) : setIsAuthModalOpen(true)} className="rounded-xl border border-emerald-700 px-4 py-3 text-sm text-emerald-300">Explore Pro or start your three-day trial</button>}

        {/* Feed List Grid */}
        <div className="space-y-4">
          {filteredGigs.length === 0 ? (
            <div className="text-center py-16 rounded-2xl border border-zinc-800/80 bg-zinc-900/30">
              <p className="text-zinc-400 text-sm">{viewMode === 'saved' ? 'No saved posts match your filters. Bookmark a source post to keep it here.' : isLoading ? 'Loading posts from Reddit…' : feedError || (gigs.length === 0 ? 'No hiring posts returned by Reddit. No sample listings are shown.' : 'No posts match your active filters.')}</p>
              <button
                onClick={() => {
                  setCategory('all');
                  setSource('all');
                  setMinBudget(0);
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
                onOpenPitch={(g) => profile.isLoggedIn ? setPitchModalGig(g) : setIsAuthModalOpen(true)}
                onOpenUpgrade={() => setIsUpgradeModalOpen(true)}
              />
            ))
          )}
        </div>

      </main>

      {/* AI Pitch Studio Modal */}
      {pitchModalGig && <PitchModal
        key={pitchModalGig.id}
        gig={pitchModalGig}
        isOpen={Boolean(pitchModalGig)}
        onClose={() => setPitchModalGig(null)}
        userTier={userTier}
        pitchesRemaining={Math.max(0, 2 - pitchesUsedToday)}
        onUsePitch={loadAccount}
        onOpenUpgrade={() => {
          setPitchModalGig(null);
          setIsUpgradeModalOpen(true);
        }}
        profile={profile}
      />

      }

      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
        onSuccessUpgrade={() => { void loadAccount().catch(() => setAccountError('Unable to refresh membership.')); }}
      />

      {/* Login & Registration Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={() => { void loadAccount().catch(() => setAccountError('Unable to load your account.')); }}
      />

      {/* Freelancer Profile & Pitch Configuration Modal */}
      {isProfileModalOpen && <ProfileModal
        key={profile.email}
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        profile={profile}
        onSaveProfile={handleUpdateProfile}
      />}

    </div>
  );
}
