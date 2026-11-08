import { NextResponse } from 'next/server';
import { Gig, GigCategory, GigSource } from '@/lib/types';

import { fetchLiveRedditPosts } from '@/lib/server/feed';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category') as GigCategory | null;
  const source = searchParams.get('source') as GigSource | 'all' | null;
  const minBudget = Number(searchParams.get('minBudget') || 0);
  const verifiedOnly = searchParams.get('verifiedOnly') === 'true';

  let liveRedditGigs: Gig[];
  try {
    liveRedditGigs = await fetchLiveRedditPosts();
  } catch {
    return NextResponse.json({ gigs: [], error: 'Reddit is currently unavailable. Try scanning again later.', isLiveFeedActive: false }, { status: 503 });
  }
  const uniqueGigs = Array.from(new Map(liveRedditGigs.map((g) => [g.id, g])).values());

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
    newLeadsLastHour: liveRedditGigs.filter((g) => g.postedMinutesAgo < 60).length,
    isLiveFeedActive: true,
    liveFeedCount: liveRedditGigs.length,
  });
}
