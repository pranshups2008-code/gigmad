export type GigCategory =
  | 'all'
  | 'react-nextjs'
  | 'video-editing'
  | 'ai-llm'
  | 'ui-ux'
  | 'python-backend'
  | 'copywriting'
  | 'virtual-assistant';

export type GigSource = 'twitter' | 'reddit' | 'hackernews' | 'discord';

export type UserTier = 'free' | 'trial' | 'pro' | 'agency';

export interface UserProfile {
  name: string;
  email: string;
  avatar?: string;
  roleTitle: string;
  portfolioUrl: string;
  telegramHandle?: string;
  tier: UserTier;
  isLoggedIn: boolean;
}

export interface Gig {
  id: string;
  title: string;
  description: string;
  category: GigCategory;
  categoryLabel: string;
  source: GigSource;
  authorName: string;
  authorHandle: string;
  authorAvatar?: string;
  budget: string;
  budgetNumeric: number; // for range filtering
  budgetType: 'fixed' | 'monthly' | 'hourly';
  postedMinutesAgo: number;
  originalUrl: string;
  dmUrl: string;
  isVerifiedClient: boolean;
  requiredSkills: string[];
  isLockedForFree: boolean; // leads under 60-120 mins locked or blurred for free tier
}

export interface PitchStyle {
  id: 'direct' | 'portfolio' | 'casual';
  label: string;
  tagline: string;
  content: string;
}

export interface UserSubscription {
  tier: UserTier;
  pitchesUsedToday: number;
  maxPitchesPerDay: number;
  savedGigIds: string[];
  soundEnabled: boolean;
}
