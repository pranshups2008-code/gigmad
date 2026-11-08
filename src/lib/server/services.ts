import Stripe from 'stripe';
import { eq } from 'drizzle-orm';
import { database } from '../../../db';
import { profiles } from '../../../db/schema';

export function stripeClient() {
  if (!process.env.STRIPE_SECRET_KEY) throw new Error('Billing is not configured yet.');
  return new Stripe(process.env.STRIPE_SECRET_KEY, { timeout: 10000, maxNetworkRetries: 1 });
}
export async function membership(profile: typeof profiles.$inferSelect) {
  if (profile.stripeCustomerId) {
    const subscriptions = await stripeClient().subscriptions.list({ customer: profile.stripeCustomerId, status: 'all', limit: 100 });
    const active = subscriptions.data.find(s => s.metadata.userId === profile.id && (s.status === 'active' || s.status === 'trialing'));
    if (active) return 'pro' as const;
  }
  return profile.trialEndsAt && profile.trialEndsAt > new Date() ? 'trial' as const : 'free' as const;
}
export async function ensureProfile(id: string, name = '') {
  const db = database();
  await db.insert(profiles).values({ id, name }).onConflictDoNothing();
  const [profile] = await db.select().from(profiles).where(eq(profiles.id, id));
  return profile;
}
export async function telegram<T>(method: string, body: object): Promise<T> {
  if (!process.env.TELEGRAM_BOT_TOKEN) throw new Error('Telegram is not configured yet.');
  const res = await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/${method}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body), signal: AbortSignal.timeout(8000),
  });
  const data = await res.json();
  if (!res.ok || !data.ok) throw new Error('Telegram could not complete the request.');
  return data.result as T;
}
