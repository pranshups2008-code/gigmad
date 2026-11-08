import type { Gig, GigCategory } from '../types';
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

// Helper to categorize based on keywords in title & content
function detectCategory(text: string): { category: GigCategory; label: string } {
  const t = text.toLowerCase();
  if (t.includes('video') || t.includes('editor') || t.includes('premiere') || t.includes('after effects') || t.includes('reels')) {
    return { category: 'video-editing', label: 'Video Editing & Reels' };
  }
  if (t.includes('react') || t.includes('next.js') || t.includes('nextjs') || t.includes('frontend') || t.includes('vue') || t.includes('tailwind')) {
    return { category: 'react-nextjs', label: 'React & Next.js' };
  }
  if (/\bai\b/.test(t) || t.includes('llm') || t.includes('langchain') || t.includes('openai') || t.includes('gpt') || t.includes('agent')) {
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

// Only display dollar amounts actually present in the source, without guessing units.
function extractBudget(text: string): { budget: string; budgetNumeric: number } {
  const match = text.match(/\$\s?([0-9]+(?:,\d{3})*(?:\.\d{1,2})?)(?:\s*(?:-|–|to)\s*\$?\s*[0-9,]+(?:\.\d{1,2})?)?(?:\s*(?:\/\s*(?:hr|hour|mo|month)|per\s+(?:hour|month)|fixed))?/i);
  if (!match) return { budget: 'Budget not stated', budgetNumeric: 0 };
  return { budget: match[0], budgetNumeric: Number(match[1].replace(/,/g, '')) };
}

// Fetch live hiring posts from Reddit
export async function fetchLiveRedditPosts(): Promise<Gig[]> {
  try {
    let host = 'https://www.reddit.com';
    const headers: Record<string, string> = { 'User-Agent': 'web:gigmad-platform:v1.0', Accept: 'application/json' };
    if (process.env.REDDIT_CLIENT_ID && process.env.REDDIT_CLIENT_SECRET) {
      const auth = await fetch('https://www.reddit.com/api/v1/access_token', {
        method: 'POST',
        headers: { 'User-Agent': headers['User-Agent'], Authorization: `Basic ${Buffer.from(`${process.env.REDDIT_CLIENT_ID}:${process.env.REDDIT_CLIENT_SECRET}`).toString('base64')}`, 'Content-Type': 'application/x-www-form-urlencoded' },
        body: 'grant_type=client_credentials', cache: 'no-store', signal: AbortSignal.timeout(8000),
      });
      if (!auth.ok) throw new Error('Reddit authentication unavailable');
      const token = await auth.json();
      if (typeof token.access_token !== 'string') throw new Error('Reddit authentication unavailable');
      headers.Authorization = `Bearer ${token.access_token}`;
      host = 'https://oauth.reddit.com';
    }
    const res = await fetch(
      `${host}/r/forhire/new${host.includes('oauth') ? '' : '.json'}?limit=100&raw_json=1`,
      {
        headers,
        cache: 'no-store',
        signal: AbortSignal.timeout(10000),
      }
    );

    if (!res.ok) throw new Error('Reddit feed unavailable');

    const json = await res.json();
    if (!Array.isArray(json?.data?.children)) throw new Error('Invalid source response');
    const children: RedditChild[] = json.data.children;

    const liveGigs: Gig[] = [];
    const now = Math.floor(Date.now() / 1000);

    for (const item of children) {
      const data = item.data;
      const title = data.title || '';
      const text = data.selftext || '';

      // Only pick [Hiring] posts, exclude [For Hire]
      if (!/^\[hiring\]/i.test(title) || !data.id || !data.author || data.author === '[deleted]' || !Number.isFinite(data.created_utc) || text === '[removed]' || text === '[deleted]') {
        continue;
      }

      const minutesAgo = Math.max(0, Math.floor((now - data.created_utc) / 60));
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
        budgetType: /(?:hr|hour)/i.test(budget) ? 'hourly' : /(?:mo|month)/i.test(budget) ? 'monthly' : /fixed/i.test(budget) ? 'fixed' : 'unknown',
        postedMinutesAgo: minutesAgo,
        postedAt: new Date(data.created_utc * 1000).toISOString(),
        originalUrl: exactPostUrl,
        dmUrl: `https://www.reddit.com/message/compose/?to=${data.author}&subject=${encodeURIComponent(title.slice(0, 50))}`,
        isVerifiedClient: false,
        requiredSkills: [],
        isLockedForFree: false,
      });
    }

    return liveGigs;
  } catch {
    throw new Error('Reddit feed unavailable');
  }
}

