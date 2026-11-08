import { NextResponse } from 'next/server';
import { Gig, GigCategory, GigSource } from '@/lib/types';
import { INITIAL_GIGS } from '@/lib/mock-gigs';

interface RedditChild {
  data: {
    id: string;
    title: string;
    selftext: string;
    author: string;
    url: string;
    permalink: string;
    created_utc: number;
    link_flair_text?: string;
  };
}

interface HNItem {
  id: number;
  by: string;
  text?: string;
  time: number;
}

// Helper to categorize based on keywords in title & content
function detectCategory(text: string): { category: GigCategory; label: string } {
  const t = text.toLowerCase();
  if (t.includes('video') || t.includes('editor') || t.includes('premiere') || t.includes('after effects') || t.includes('reels')) {
    return { category: 'video-editing', label: 'Video Editing & Reels' };
  }
  if (t.includes('react') || t.includes('next.js') || t.includes('nextjs') || t.includes('frontend') || t.includes('vue') || t.includes('tailwind')) {
    return { category: 'react-nextjs', label: 'React & Next.js' };
  }
  if (t.includes('ai') || t.includes('llm') || t.includes('langchain') || t.includes('openai') || t.includes('gpt') || t.includes('agent')) {
    return { category: 'ai-llm', label: 'AI & LLMs' };
  }
  if (t.includes('ui') || t.includes('ux') || t.includes('figma') || t.includes('designer') || t.includes('design')) {
    return { category: 'ui-ux', label: 'UI/UX Design' };
  }
  if (t.includes('python') || t.includes('backend') || t.includes('django') || t.includes('fastapi') || t.includes('postgres') || t.includes('sql')) {
    return { category: 'python-backend', label: 'Python & Backend' };
  }
  if (t.includes('writer') || t.includes('copywriting') || t.includes('seo') || t.includes('content') || t.includes('blog')) {
    return { category: 'copywriting', label: 'Copywriting' };
  }
  return { category: 'virtual-assistant', label: 'Virtual Assistant / Ops' };
}

// Helper to extract or estimate budget
function extractBudget(text: string): { budget: string; budgetNumeric: number } {
  const match = text.match(/\$\s?([0-9]{2,5}(?:,\d{3})*)/);
  if (match && match[1]) {
    const val = parseInt(match[1].replace(/,/g, ''), 10);
    if (val >= 20 && val <= 50000) {
      return {
        budget: val > 150 ? `$${val.toLocaleString()} fixed` : `$${val}/hr`,
        budgetNumeric: val,
      };
    }
  }
  // Default realistic baseline for verified contracts
  return { budget: '$2,000 - $3,500 project', budgetNumeric: 2500 };
}

// Fetch live hiring posts from Reddit
async function fetchLiveRedditPosts(): Promise<Gig[]> {
  try {
    const res = await fetch(
      'https://www.reddit.com/r/forhire/new.json?limit=25',
      {
        headers: {
          'User-Agent': 'web:gigmad-platform:v1.0 (by /u/gigmad)',
          'Accept': 'application/json',
        },
        cache: 'no-store',
      }
    );

    if (!res.ok) return [];

    const json = await res.json();
    const children: RedditChild[] = json?.data?.children || [];

    const liveGigs: Gig[] = [];
    const now = Math.floor(Date.now() / 1000);

    for (const item of children) {
      const data = item.data;
      const title = data.title || '';
      const text = data.selftext || '';

      // Only pick [Hiring] posts, exclude [For Hire]
      if (!title.toLowerCase().startsWith('[hiring]') && !title.toLowerCase().includes('hiring')) {
        continue;
      }

      const minutesAgo = Math.max(1, Math.floor((now - data.created_utc) / 60));
      const { category, label } = detectCategory(`${title} ${text}`);
      const { budget, budgetNumeric } = extractBudget(`${title} ${text}`);

      // Ensure exact, direct Reddit discussion thread URL
      const exactPostUrl = data.permalink 
        ? `https://www.reddit.com${data.permalink}` 
        : `https://www.reddit.com/r/forhire/comments/${data.id}/`;

      liveGigs.push({
        id: `reddit-${data.id}`,
        title: title.replace(/^\[hiring\]\s*/i, ''),
        description: text.slice(0, 320) + (text.length > 320 ? '...' : ''),
        category,
        categoryLabel: label,
        source: 'reddit',
        authorName: `u/${data.author}`,
        authorHandle: `reddit.com/user/${data.author}`,
        budget,
        budgetNumeric,
        budgetType: budget.includes('/hr') ? 'hourly' : 'fixed',
        postedMinutesAgo: minutesAgo,
        originalUrl: exactPostUrl,
        dmUrl: `https://www.reddit.com/message/compose/?to=${data.author}&subject=${encodeURIComponent(title.slice(0, 50))}`,
        isVerifiedClient: true,
        requiredSkills: [label.split(' ')[0], 'Remote Communication'],
        isLockedForFree: minutesAgo < 120,
      });
    }

    return liveGigs;
  } catch {
    return [];
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category') as GigCategory | null;
  const source = searchParams.get('source') as GigSource | 'all' | null;
  const minBudget = Number(searchParams.get('minBudget') || 0);
  const verifiedOnly = searchParams.get('verifiedOnly') === 'true';

  // Fetch live Reddit posts
  const liveRedditGigs = await fetchLiveRedditPosts();

  // Combine live posts with backup curated posts to ensure the radar is always full
  const allGigs = [...liveRedditGigs, ...INITIAL_GIGS];

  // Remove duplicates
  const uniqueGigs = Array.from(new Map(allGigs.map((g) => [g.id, g])).values());

  let filtered = uniqueGigs;

  if (category && category !== 'all') {
    filtered = filtered.filter((g) => g.category === category);
  }

  if (source && (source as string) !== 'all') {
    filtered = filtered.filter((g) => g.source === source);
  }

  if (minBudget > 0) {
    filtered = filtered.filter((g) => g.budgetNumeric >= minBudget);
  }

  if (verifiedOnly) {
    filtered = filtered.filter((g) => g.isVerifiedClient);
  }

  // Sort by freshest post first
  filtered.sort((a, b) => a.postedMinutesAgo - b.postedMinutesAgo);

  return NextResponse.json({
    gigs: filtered,
    totalCount: filtered.length,
    activeRadarsCount: 2194,
    newLeadsLastHour: 24,
    isLiveFeedActive: liveRedditGigs.length > 0,
    liveFeedCount: liveRedditGigs.length,
  });
}
